'use server';

import { db } from '../lib/db';
import { auth } from '../auth';
import { revalidatePath } from 'next/cache';
import { getPlan, Role, Tier } from '../lib/config/pricing';
import { canCreateClient } from '../lib/auth/access-control';

/**
 * Creates a new client for a professional advisor.
 * Enforces Hybrid Plan limits for Active Clients (last 30 days).
 */
export async function createClientAction(data: { name: string, email?: string, phone?: string, notes?: string }) {
    const session = await auth();
    const userId = session?.user?.id;
    const userRole = (session?.user as any)?.role as Role;
    const userTier = (session?.user as any)?.tier as Tier;

    if (!userId || !['ADVISOR', 'ADMIN'].includes(userRole)) {
        return { success: false, error: "Debes ser un Asesor o Administrador para gestionar clientes." };
    }

    try {
        // Enforce Tier Limits (Phase 3 Refactor)
        const allowed = await canCreateClient(userId, userRole, userTier);
        if (!allowed) {
            const plan = getPlan(userRole, userTier);
            return { 
                success: false, 
                error: `Has alcanzado el límite de clientes activos (${plan.limits.activeClients}) para tu plan ${plan.name}.`,
                isLimitReached: true 
            };
        }

        const client = await db.client.create({
            data: {
                advisorId: userId,
                name: data.name,
                email: data.email,
                phone: data.phone,
                notes: data.notes,
                status: "PROSPECT"
            }
        });

        revalidatePath('/dashboard');
        return { success: true, id: client.id };
    } catch (error) {
        console.error("Create Client Error:", error);
        return { success: false, error: "Error al crear el cliente." };
    }
}

/**
 * Fetches all clients managed by the current logged-in advisor.
 * (Renamed from getAdvisorClientsAction to match Portfolio core imports)
 */
export async function fetchAssignedClientsAction() {
    const session = await auth();
    const userId = session?.user?.id;
    const userRole = (session?.user as any)?.role as Role;

    if (!userId || !['ADVISOR', 'ADMIN'].includes(userRole)) {
        return { success: false, error: "No autorizado." };
    }

    try {
        // Core Identity Aggregation (Phase 4 Sovereign Sync)
        const [manualClients, assignedLeads] = await Promise.all([
            db.client.findMany({
                where: userRole === 'ADMIN' ? {} : { advisorId: userId },
                include: { simulations: true },
                orderBy: { createdAt: 'desc' }
            }),
            db.user.findMany({
                where: userRole === 'ADMIN' ? { advisorId: { not: null } } : { advisorId: userId },
                include: { simulations: true },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        // Universal Index Normalization
        const unifiedClients = [
            ...manualClients.map(c => ({
                id: c.id,
                name: c.name,
                email: c.email,
                tier: (c as any).tier || "CLIENT", // B2B clients don't have systemic tiers yet
                createdAt: c.createdAt,
                isLead: false
            })),
            ...assignedLeads.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                tier: u.tier,
                createdAt: u.createdAt,
                isLead: true
            }))
        ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return { success: true, clients: unifiedClients };
    } catch (error) {
        console.error("Get Unified Portfolio Error:", error);
        return { success: false, error: "Error al sincronizar el portafolio universal." };
    }
}

/**
 * Epic 17: B2B Market Lead Auction Engine
 * Fetches available leads that are in the Local or National pools.
 */
export async function fetchMarketLeadsAction() {
    const session = await auth();
    const userId = session?.user?.id;
    const userRole = (session?.user as any)?.role as Role;

    if (!userId || !['ADVISOR', 'ADMIN'].includes(userRole)) {
        return { success: false, error: "No autorizado para ver el mercado." };
    }

    try {
        // Fetch users who are candidates for routing (PENDING_LOCAL or PENDING_NATIONAL)
        // and are not currently claimed.
        const leads = await db.user.findMany({
            where: {
                OR: [
                    { leadStatus: "PENDING_LOCAL" },
                    { leadStatus: "PENDING_NATIONAL" }
                ],
                advisorId: null,
                isBlocked: false
            } as any,
            select: {
                id: true,
                name: true,
                residencyState: true,
                leadStatus: true,
                createdAt: true
            } as any,
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, leads };
    } catch (error) {
        console.error("Fetch Market Error:", error);
        return { success: false, error: "Error al sincronizar con el mercado de leads." };
    }
}

/**
 * Updates the actuarial metadata for a client or user.
 * Supports both B2B manual clients and B2C leads.
 */
export async function updateActuarialDataAction(
    id: string, 
    isLead: boolean, 
    data: { age?: number, currentWeeks?: number, avgSalary?: number, lastBajaDate?: string | null }
) {
    const session = await auth();
    const userId = session?.user?.id;
    const userRole = (session?.user as any)?.role as Role;

    if (!userId) return { success: false, error: "No autorizado." };

    try {
        const updateData = {
            age: data.age,
            currentWeeks: data.currentWeeks,
            avgSalary: data.avgSalary,
            lastBajaDate: data.lastBajaDate ? new Date(data.lastBajaDate) : null,
        };

        if (userRole === "ADMIN") {
            if (isLead) {
                await (db.user as any).update({ where: { id }, data: updateData });
            } else {
                await (db.client as any).update({ where: { id }, data: updateData });
            }
        } else {
            let result;
            if (isLead) {
                result = await (db.user as any).updateMany({
                    where: { id, advisorId: userId },
                    data: updateData
                });
            } else {
                result = await (db.client as any).updateMany({
                    where: { id, advisorId: userId },
                    data: updateData
                });
            }

            if (result.count === 0) {
                console.warn(`[SECURITY_AUDIT_VIOLATION] Unauthorized mutation attempt on record ID: ${id} by advisor ID: ${userId}`);
                return { success: false, error: "Operation failed or record unauthorized." };
            }
        }

        revalidatePath('/portfolio');
        revalidatePath(`/portfolio/client/${id}/workspace`);
        return { success: true };
    } catch (error) {
        console.error("Update Actuarial Error:", error);
        return { success: false, error: "An unexpected system exception occurred." };
    }
}

/**
 * Updates CRM status, pipeline stage, and follow-up data.
 */
export async function updateClientCRMAction(
    id: string,
    isLead: boolean,
    data: { 
        currentStage?: string, 
        nextAction?: string, 
        nextActionAt?: string | null,
        notes?: string
    }
) {
    const session = await auth();
    const userId = session?.user?.id;
    const userRole = (session?.user as any)?.role as Role;

    if (!userId) return { success: false, error: "No autorizado." };

    try {
        const updateData: any = {
            currentStage: data.currentStage,
            nextAction: data.nextAction,
            nextActionAt: data.nextActionAt ? new Date(data.nextActionAt) : null,
            notes: data.notes
        };

        if (userRole === "ADMIN") {
            if (isLead) {
                await (db.user as any).update({ where: { id }, data: updateData });
            } else {
                await (db.client as any).update({ where: { id }, data: updateData });
            }
        } else {
            let result;
            if (isLead) {
                result = await (db.user as any).updateMany({
                    where: { id, advisorId: userId },
                    data: updateData
                });
            } else {
                result = await (db.client as any).updateMany({
                    where: { id, advisorId: userId },
                    data: updateData
                });
            }

            if (result.count === 0) {
                console.warn(`[SECURITY_AUDIT_VIOLATION] Unauthorized mutation attempt on record ID: ${id} by advisor ID: ${userId}`);
                return { success: false, error: "Operation failed or record unauthorized." };
            }
        }

        revalidatePath(`/portfolio/client/${id}/workspace`);
        return { success: true };
    } catch (error) {
        console.error("Update CRM Error:", error);
        return { success: false, error: "An unexpected system exception occurred." };
    }
}

/**
 * Selects a specific strategy as the "Chosen Strategy" for the client.
 */
export async function selectClientStrategyAction(
    id: string,
    isLead: boolean,
    strategyId: string,
    narrative?: string
) {
    const session = await auth();
    const userId = session?.user?.id;
    const userRole = (session?.user as any)?.role as Role;

    if (!userId) return { success: false, error: "No autorizado." };

    try {
        const updateData = {
            selectedStrategyId: strategyId,
            closingNarrative: narrative
        };

        if (userRole === "ADMIN") {
            if (isLead) {
                await (db.user as any).update({ where: { id }, data: updateData });
            } else {
                await (db.client as any).update({ where: { id }, data: updateData });
            }
        } else {
            let result;
            if (isLead) {
                result = await (db.user as any).updateMany({
                    where: { id, advisorId: userId },
                    data: updateData
                });
            } else {
                result = await (db.client as any).updateMany({
                    where: { id, advisorId: userId },
                    data: updateData
                });
            }

            if (result.count === 0) {
                console.warn(`[SECURITY_AUDIT_VIOLATION] Unauthorized mutation attempt on record ID: ${id} by advisor ID: ${userId}`);
                return { success: false, error: "Operation failed or record unauthorized." };
            }
        }

        revalidatePath(`/portfolio/client/${id}/workspace`);
        return { success: true };
    } catch (error) {
        console.error("Select Strategy Error:", error);
        return { success: false, error: "An unexpected system exception occurred." };
    }
}
