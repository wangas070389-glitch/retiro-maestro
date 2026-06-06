import { auth } from '@/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { ShieldAlert, ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Art150LegalGuard } from '@/lib/engine/art150-legal-guard';
import { DossierGeneratorPanel } from '@/components/workspace/DossierGeneratorPanel';
import { ActuarialHeader } from '@/components/workspace/ActuarialHeader';
import { ClosingTerminal } from '@/components/workspace/ClosingTerminal';

export default async function WorkstationPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'ADVISOR' && session.user.role !== 'ADMIN')) {
        redirect('/dashboard');
    }

    const { id: clientId } = params;

    const userRole = (session?.user as any)?.role;
    
    const fetchStart = performance.now();

    // 1. Parallel Fetch (Primary Lead Model + Advisor Profile)
    const [userClient, advisor] = await Promise.all([
        db.user.findFirst({
            where: userRole === 'ADMIN' ? { id: clientId } : { id: clientId, advisorId: session.user.id }
        }),
        db.user.findUnique({
            where: { id: session.user.id },
            select: { agencyName: true, agencyPhone: true, agencyLogoUrl: true }
        })
    ]);

    // 1.5 Fallback to Manual Client model if primary not found
    let client = userClient as any;
    if (!client) {
        client = await db.client.findFirst({
            where: userRole === 'ADMIN' ? { id: clientId } : { id: clientId, advisorId: session.user.id }
        });
    }

    const fetchEnd = performance.now();
    console.log(`[WORKSPACE_PERF_AUDIT] Execution time: ${(fetchEnd - fetchStart).toFixed(2)}ms`);

    if (!client) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4 text-center">
                <ShieldAlert className="w-16 h-16 text-rose-500" />
                <h2 className="text-2xl font-bold text-slate-800">Acceso Denegado</h2>
                <p className="text-slate-500">El cliente no pertenece a tu cartera, o el enlace ha caducado.</p>
                <Link href="/portfolio" className="text-indigo-600 hover:underline">Regresar al Portafolio</Link>
            </div>
        );
    }

    // 2. Data Sourced from Profile (Sovereign CRM Sink)
    const displayName = client.name || 'Cliente sin nombre';
    const weeksCount = client.currentWeeks || 650; 
    const avgSalary = client.avgSalary || 450;
    const age = client.age || 60;
    const lastTermination = client.lastBajaDate ? new Date(client.lastBajaDate).toISOString().split('T')[0] : '2023-01-15';

    const isLead = (client as any).role === 'USER'; 

    // 3. Vigencia Guard
    const legalStatus = Art150LegalGuard.validateConservation(weeksCount, lastTermination);

    const agencyState = {
        name: (advisor as any)?.agencyName || 'Despacho de Pensiones (GOLD)',
        phone: (advisor as any)?.agencyPhone || '',
        logoUrl: (advisor as any)?.agencyLogoUrl || undefined
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8">
            <header className="mb-6 space-y-4">
                <div className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <Link href="/portfolio" className="text-sm font-medium">Volver a Cartera</Link>
                </div>

                <ActuarialHeader 
                    clientId={client.id}
                    isLead={isLead}
                    clientName={displayName}
                    clientEmail={client.email || ''}
                    initialData={{
                        age,
                        currentWeeks: weeksCount,
                        avgSalary,
                        lastBajaDate: lastTermination
                    }}
                />
            </header>

            {/* ERROR BOUNDARY: Art 150 Trigger */}
            {!legalStatus.isVigente && (
                <div className="mb-12 p-6 rounded-3xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/40 flex items-start space-x-4 shadow-sm">
                    <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="text-rose-800 dark:text-rose-300 font-black text-lg">Riesgo Crítico Detectado: Derechos Vencidos</h4>
                        <p className="text-rose-600 dark:text-rose-400 text-sm mt-1 leading-relaxed">{legalStatus.mensaje}</p>
                        {legalStatus.fechaVencimientoGracia && (
                             <p className="text-rose-600 dark:text-rose-400 text-xs mt-2 font-mono bg-rose-100 dark:bg-rose-900/40 inline-block px-2 py-1 rounded-md">Expiró el {legalStatus.fechaVencimientoGracia.toLocaleDateString()} (Gracia: {legalStatus.semanasGracia} SS).</p>
                        )}
                    </div>
                </div>
            )}

            {legalStatus.isVigente && legalStatus.diasRestantesGracia && (
                <div className="mb-12 p-6 rounded-3xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/40 flex items-start space-x-4 shadow-sm">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="text-emerald-800 dark:text-emerald-300 font-black text-lg">Vigencia Validada</h4>
                        <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-1 leading-relaxed">{legalStatus.mensaje}</p>
                    </div>
                </div>
            )}

            <main>
                {!legalStatus.isVigente ? (
                    <div className="min-h-[500px] flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900/50 rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-800">
                        <ShieldAlert className="w-16 h-16 text-slate-400 mb-4" />
                        <h3 className="text-slate-600 dark:text-slate-400 font-bold text-xl uppercase tracking-widest">Protocolo de Cierre Bloqueado</h3>
                        <p className="text-slate-500 text-sm mt-2 max-w-md text-center leading-relaxed">
                            No es posible simular estrategias de inversión cuando los derechos legales están vencidos. Reactiva la vigencia del cliente para desbloquear el terminal.
                        </p>
                    </div>
                ) : (
                    <ClosingTerminal 
                        clientId={client.id}
                        isLead={isLead}
                        initialData={{
                            name: displayName,
                            age,
                            currentWeeks: weeksCount,
                            avgSalary,
                            lastBajaDate: lastTermination,
                            isWorking: client.isWorking || false,
                            activeStrategy: client.activeStrategy || null,
                            m40PaymentsState: client.m40PaymentsState || null,
                            currentStage: client.currentStage || 'PROSPECT',
                            notes: client.notes || '',
                            selectedStrategyId: client.selectedStrategyId
                        }}
                        agency={agencyState}
                    />
                )}
            </main>
        </div>
    );
}
