import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { ShieldAlert, Server, Activity, ArrowRight, ShieldCheck } from "lucide-react";
import { OracleService } from "@/lib/engine/oracle/oracle-service";
import { OraclePulseConsole } from "./OraclePulseConsole";

export const metadata = {
    title: 'World Settings | Retiro Maestro',
    description: 'Sovereign Administrator Module',
};

export default async function SettingsPage() {
    const session = await auth();

    // ADR-029: Absolute Server Component Restriction
    // If not admin, the route mathematically does not exist to the requester.
    if (session?.user?.role !== "ADMIN") {
        notFound();
    }

    const currentAnchors = await OracleService.fetchLatestAnchors();

    return (
        <div className="flex-1 w-full space-y-6 pt-6">
            <header className="px-6 md:px-8 max-w-7xl mx-auto space-y-2">
                <div className="flex items-center space-x-3 text-red-500/80 mb-1">
                    <ShieldAlert className="w-5 h-5" />
                    <span className="text-xs tracking-[0.2em] font-medium">Protocolo de Bóveda: ADMIN</span>
                </div>
                <h1 className="text-3xl font-light tracking-tight text-slate-800 dark:text-slate-100">
                    Configuración <span className="font-semibold">Mundial</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
                    Panel de control cinético de la simulación. Los parámetros inyectados aquí sobreescriben la base de verdad matemática del Oráculo Económico para todo el ecosistema SaaS.
                </p>
            </header>

            <main className="px-6 md:px-8 max-w-7xl mx-auto pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Diagnostic */}
                    <div className="space-y-6">
                        <section className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl shadow-sm">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <Activity className="w-32 h-32" />
                            </div>

                            <h2 className="text-lg font-medium text-slate-800 dark:text-slate-100 flex items-center space-x-2 mb-6">
                                <Server className="w-5 h-5 text-indigo-500" />
                                <span>Diagnóstico Actual</span>
                            </h2>

                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-800">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Motor de Origen</span>
                                    <span className="font-mono text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded">
                                        {currentAnchors.source}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-800">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Verificación</span>
                                    <span className="font-mono flex items-center space-x-1 text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
                                        <ShieldCheck className="w-3 h-3" />
                                        <span>FIRMA INTRODUCIDA</span>
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-800">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Ãšltima Refacción</span>
                                    <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                                        {new Date(currentAnchors.lastUpdated).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Kinetic Override */}
                    <div className="space-y-6">
                        <OraclePulseConsole activeUma={currentAnchors.uma} activeInpc={currentAnchors.inpc} />
                    </div>
                </div>
            </main>
        </div>
    );
}
