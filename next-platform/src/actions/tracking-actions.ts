'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { generatePaymentCalendar } from '../lib/engine/m40-calculator.ts';
import { revalidatePath } from 'next/cache';

async function verifySelfOrAdvisor(clientId?: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("No estás autenticado.");
    }
    const userId = session.user.id;
    const role = (session.user as any).role || 'USER';

    if (clientId) {
        if (role !== 'ADVISOR' && role !== 'ADMIN') {
            throw new Error("Acceso no autorizado para carteras de clientes.");
        }
        // Verify ownership
        let client = await db.user.findFirst({
            where: role === 'ADMIN' ? { id: clientId } : { id: clientId, advisorId: userId }
        }) as any;

        if (!client) {
            client = await db.client.findFirst({
                where: role === 'ADMIN' ? { id: clientId } : { id: clientId, advisorId: userId }
            });
        }
        if (!client) {
            throw new Error("Cliente no encontrado en tu cartera.");
        }
        return { isAdvisor: true, id: clientId, isUserTable: client.role !== undefined };
    }

    return { isAdvisor: false, id: userId, isUserTable: true };
}

export async function selectStrategyAction(
    strategyName: string,
    dailySalaryMxn: number,
    monthsToProject: number,
    startYear: number,
    startMonth: number,
    clientId?: string
) {
    try {
        const target = await verifySelfOrAdvisor(clientId);
        
        // Generate the payment checklist
        const calendar = generatePaymentCalendar(dailySalaryMxn, startYear, startMonth, monthsToProject);
        const payments = calendar.map((item, index) => ({
            id: `${item.year}-${String(item.monthNumber).padStart(2, '0')}`,
            label: `${item.monthName} ${item.year}`,
            amount: Number(item.paymentMxn.toFixed(2)),
            days: item.daysInMonth,
            rate: item.rateApplied,
            status: 'PENDING'
        }));

        const m40PaymentsState = JSON.stringify({
            strategyName,
            dailySalaryMxn,
            monthsToProject,
            startYear,
            startMonth,
            payments
        });

        if (target.isUserTable) {
            await db.user.update({
                where: { id: target.id },
                data: {
                    activeStrategy: strategyName,
                    m40PaymentsState
                } as any
            });
        } else {
            await db.client.update({
                where: { id: target.id },
                data: {
                    activeStrategy: strategyName,
                    m40PaymentsState
                } as any
            });
        }

        // Automatically save the strategy simulation under "Mis Estudios"
        try {
            let profile: any;
            if (target.isUserTable) {
                profile = await db.user.findUnique({
                    where: { id: target.id }
                });
            } else {
                profile = await db.client.findUnique({
                    where: { id: target.id }
                });
            }

            if (profile) {
                const baseWeeks = profile.currentWeeks ?? 1250;
                const baseSalary = profile.avgSalary ?? 500;
                const baseAge = profile.age ?? 60;
                const isWorking = profile.isWorking !== false;
                const lastBaja = profile.lastBajaDate;

                // Project for M40 strategy
                const investWeeks = Math.floor((monthsToProject / 12) * 52);
                const histWeeks = 250 - Math.min(250, investWeeks);
                const projectedSalaryProm = ((dailySalaryMxn * Math.min(250, investWeeks)) + (baseSalary * histWeeks)) / 250;

                const retirementAge = baseAge + (monthsToProject / 12);
                const projectedWeeks = baseWeeks + investWeeks;

                const { OracleService } = await import('../lib/engine/oracle/oracle-service.ts');
                const anchors = await OracleService.fetchLatestAnchors();

                const pensionInput = {
                    weeks: projectedWeeks,
                    salary_prom: projectedSalaryProm,
                    age: retirementAge,
                    has_wife: true,
                    children_count: 0,
                    dependent_parents_count: 0,
                    retirement_age: retirementAge,
                    is_ongoing_work: false,
                    last_termination_date: lastBaja ? new Date(lastBaja).toISOString().split('T')[0] : undefined,
                    anchor_salary: anchors.uma
                };

                const { PensionEngine } = await import('../lib/engine/pension-engine.ts');
                const engine = new PensionEngine();
                const calcResult = engine.calculate(pensionInput);

                const resData = {
                    ...calcResult,
                    strategyType: "MODALIDAD_40",
                    investment: dailySalaryMxn * monthsToProject * 30.416 * 0.14438,
                    netPension: calcResult.net_pension,
                    roiMonths: 0
                };

                const { DossierBuilder } = await import('../lib/engine/audit/dossier-builder.ts');
                const { calculateProjectionAction } = await import('./calculate-pension.ts');
                
                let integrityHash = "";
                try {
                    const projRes = await calculateProjectionAction(pensionInput, 'modalidad40', 0);
                    const finalYearData = projRes.projection[projRes.projection.length - 1];
                    const bundle = await DossierBuilder.buildAdHocBundle({
                        strategy: `Estrategia - ${strategyName}`,
                        mode: 'modalidad40',
                        data: finalYearData
                    });
                    integrityHash = bundle?.integrity_hash || "";
                } catch (e) {
                    console.error("Failed to build ad-hoc bundle:", e);
                }

                await db.simulation.create({
                    data: {
                        userId: target.isUserTable ? target.id : null,
                        clientId: !target.isUserTable ? target.id : null,
                        name: `Estrategia ACTIVA: ${strategyName} - ${new Date().toLocaleDateString()}`,
                        input: JSON.stringify(pensionInput),
                        result: JSON.stringify(resData),
                        integrity_hash: integrityHash,
                    }
                });
            }
        } catch (e) {
            console.error("Failed to automatically save strategy simulation:", e);
        }

        if (clientId) {
            revalidatePath(`/portfolio/client/${clientId}/workspace`);
        } else {
            revalidatePath('/dashboard');
        }

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to select strategy" };
    }
}

export async function togglePaymentStatusAction(
    paymentId: string,
    status: 'PAID' | 'PENDING',
    clientId?: string
) {
    try {
        const target = await verifySelfOrAdvisor(clientId);
        
        let clientData: any;
        if (target.isUserTable) {
            clientData = await db.user.findUnique({
                where: { id: target.id },
                select: { m40PaymentsState: true } as any
            });
        } else {
            clientData = await db.client.findUnique({
                where: { id: target.id },
                select: { m40PaymentsState: true }
            });
        }

        if (!clientData || !clientData.m40PaymentsState) {
            throw new Error("No hay una estrategia de pagos activa.");
        }

        const state = JSON.parse(clientData.m40PaymentsState);
        state.payments = state.payments.map((p: any) => {
            if (p.id === paymentId) {
                return { ...p, status };
            }
            return p;
        });

        const updatedState = JSON.stringify(state);

        if (target.isUserTable) {
            await db.user.update({
                where: { id: target.id },
                data: { m40PaymentsState: updatedState } as any
            });
        } else {
            await db.client.update({
                where: { id: target.id },
                data: { m40PaymentsState: updatedState } as any
            });
        }

        if (clientId) {
            revalidatePath(`/portfolio/client/${clientId}/workspace`);
        } else {
            revalidatePath('/dashboard');
        }

        return { success: true, payments: state.payments };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to toggle payment status" };
    }
}

export async function clearStrategyAction(clientId?: string) {
    try {
        const target = await verifySelfOrAdvisor(clientId);

        if (target.isUserTable) {
            await db.user.update({
                where: { id: target.id },
                data: {
                    activeStrategy: null,
                    m40PaymentsState: null
                } as any
            });
        } else {
            await db.client.update({
                where: { id: target.id },
                data: {
                    activeStrategy: null,
                    m40PaymentsState: null
                } as any
            });
        }

        if (clientId) {
            revalidatePath(`/portfolio/client/${clientId}/workspace`);
        } else {
            revalidatePath('/dashboard');
        }

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to clear strategy" };
    }
}

export async function getClientTrackingAction(clientId?: string) {
    try {
        const target = await verifySelfOrAdvisor(clientId);
        let clientData: any;
        if (target.isUserTable) {
            clientData = await db.user.findUnique({
                where: { id: target.id },
                select: { activeStrategy: true, m40PaymentsState: true } as any
            });
        } else {
            clientData = await db.client.findUnique({
                where: { id: target.id },
                select: { activeStrategy: true, m40PaymentsState: true }
            });
        }
        return { 
            success: true, 
            activeStrategy: clientData?.activeStrategy || null, 
            m40PaymentsState: clientData?.m40PaymentsState || null 
        };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function activateSimulationAsStrategyAction(
    simulationId: string,
    clientId?: string
) {
    try {
        const target = await verifySelfOrAdvisor(clientId);
        
        // 1. Fetch simulation
        const sim = await db.simulation.findUnique({
            where: { id: simulationId }
        });
        
        if (!sim) {
            throw new Error("La simulación no existe.");
        }
        
        // Ensure simulation belongs to target user
        if (sim.userId !== target.id && sim.clientId !== target.id) {
            throw new Error("No tienes permiso para activar esta simulación.");
        }
        
        const input = JSON.parse(sim.input);
        
        // Extract parameters
        const strategyName = sim.name.replace("Estrategia ACTIVA: ", "").replace("Estrategia INERCIAL - ", "") || "Mi Estrategia";
        const dailySalaryMxn = input.salary_prom || 500;
        
        let monthsToProject = 12;
        if (input.retirement_age && input.age) {
            monthsToProject = Math.max(1, Math.round((input.retirement_age - input.age) * 12));
        }
        
        let startYear = new Date().getFullYear();
        let startMonth = new Date().getMonth() + 1;
        if (input.last_termination_date) {
            const d = new Date(input.last_termination_date);
            if (!isNaN(d.getTime())) {
                startYear = d.getFullYear();
                startMonth = d.getMonth() + 1;
            }
        }
        
        // Generate the payment checklist
        const calendar = generatePaymentCalendar(dailySalaryMxn, startYear, startMonth, monthsToProject);
        const payments = calendar.map((item) => ({
            id: `${item.year}-${String(item.monthNumber).padStart(2, '0')}`,
            label: `${item.monthName} ${item.year}`,
            amount: Number(item.paymentMxn.toFixed(2)),
            days: item.daysInMonth,
            rate: item.rateApplied,
            status: 'PENDING'
        }));
        
        const m40PaymentsState = JSON.stringify({
            strategyName,
            dailySalaryMxn,
            monthsToProject,
            startYear,
            startMonth,
            payments
        });
        
        if (target.isUserTable) {
            await db.user.update({
                where: { id: target.id },
                data: {
                    activeStrategy: strategyName,
                    m40PaymentsState
                } as any
            });
        } else {
            await db.client.update({
                where: { id: target.id },
                data: {
                    activeStrategy: strategyName,
                    m40PaymentsState
                } as any
            });
        }
        
        if (clientId) {
            revalidatePath(`/portfolio/client/${clientId}/workspace`);
        } else {
            revalidatePath('/dashboard');
        }
        
        return { success: true };
    } catch (err: any) {
        console.error("Failed to activate strategy:", err);
        return { success: false, error: err.message || "Failed to activate strategy" };
    }
}
