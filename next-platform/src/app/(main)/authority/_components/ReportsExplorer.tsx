'use client';

import React, { useMemo } from 'react';
import { FileText, Download, ShieldCheck, HelpCircle, Lock, TrendingUp } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Card, LockedOverlay } from './shared';

// Dynamic imports of PDF buttons to prevent SSR issues
const InercialBriefPDFButton = dynamic(
    () => import('@/components/reports/PDFDownloadButtons').then(mod => mod.InercialBriefPDFButton),
    { ssr: false }
);

const InercialComprehensivePDFButton = dynamic(
    () => import('@/components/reports/PDFDownloadButtons').then(mod => mod.InercialComprehensivePDFButton),
    { ssr: false }
);

const AuthorityRetirementPDFButton = dynamic(
    () => import('@/components/reports/PDFDownloadButtons').then(mod => mod.AuthorityRetirementPDFButton),
    { ssr: false }
);

interface ReportsExplorerProps {
    isLocked: boolean;
    isB2C: boolean;
    dossiers: any[];
    selectedDossierId: string | null;
    setSelectedDossierId: (id: string) => void;
    projectionForPdf: any[];
    userProfile: any;
    session: any;
    showToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}

export const ReportsExplorer: React.FC<ReportsExplorerProps> = ({
    isLocked,
    isB2C,
    dossiers,
    selectedDossierId,
    setSelectedDossierId,
    projectionForPdf,
    userProfile,
    session,
    showToast
}) => {
    const activeDossier = useMemo(() => {
        return dossiers.find(d => d.id === selectedDossierId) || dossiers[0] || null;
    }, [dossiers, selectedDossierId]);

    const activeResult = useMemo(() => {
        if (!activeDossier) return null;
        return {
            pensionMensual: activeDossier.result.netPension || activeDossier.result.net_pension || activeDossier.result.pensionMensual || 0,
            totalInversion: activeDossier.result.investment || activeDossier.result.totalInversion || 0,
            roiMeses: activeDossier.result.roiMonths || activeDossier.result.roiMeses || 0
        };
    }, [activeDossier]);

    const activeBundle = useMemo(() => {
        if (!activeDossier) return null;
        return {
            integrity_hash: activeDossier.hash,
            generated_at: new Date(activeDossier.createdAt).toISOString(),
            version: "1.0.0"
        };
    }, [activeDossier]);

    if (dossiers.length === 0) {
        return (
            <Card className="border-t-4 border-t-indigo-600 hover:shadow-xl transition-shadow flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[100px] pointer-events-none" />
                <div className="mb-6 relative z-10">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 mb-2">
                        <FileText className="text-indigo-600" size={28} />
                        Estudios y Reportes Actuariales
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                        Aquí aparecerán tus estudios de pensión personalizados una vez realices proyecciones en el simulador.
                    </p>
                </div>
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex-1 flex flex-col justify-center items-center p-6">
                    <FileText size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Sin Reportes Disponibles</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 max-w-xs leading-relaxed">
                        Completa una proyección en el simulador interactivo para calcular tu estrategia de Modalidad 40 o Inercial y habilitar las descargas oficiales.
                    </p>
                    <a 
                        href="/dashboard" 
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20 text-xs"
                    >
                        Ir al Simulador de Retiro
                    </a>
                </div>
            </Card>
        );
    }

    return (
        <Card className="border-t-4 border-t-indigo-600 hover:shadow-xl transition-shadow flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[100px] pointer-events-none" />
            
            {/* Header */}
            <div className="mb-6 relative z-10">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 mb-2">
                    <FileText className="text-indigo-600" size={28} />
                    Estudios y Reportes Actuariales
                </h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                    Accede a los estudios técnicos y proyecciones financieras calculadas para tus diferentes escenarios de jubilación.
                </p>
            </div>

            {/* Strategy Selection Tabs / Menu */}
            <div className="mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Selecciona la Estrategia a Consultar</label>
                <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {dossiers.map((d) => {
                        const isSelected = selectedDossierId === d.id;
                        return (
                            <button
                                key={d.id}
                                onClick={() => setSelectedDossierId(d.id)}
                                className={`text-left p-3 rounded-xl border transition-all text-xs flex justify-between items-center ${
                                    isSelected 
                                        ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-md shadow-indigo-600/10' 
                                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900'
                                }`}
                            >
                                <span className="truncate pr-2 font-bold">{d.name}</span>
                                <span className={`text-[10px] shrink-0 font-medium ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                                    {new Date(d.createdAt).toLocaleDateString()}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected Strategy Summary */}
            {activeDossier && activeResult && (
                <div className="mb-6 p-4 bg-indigo-50/40 border border-indigo-100 dark:bg-indigo-950/10 dark:border-indigo-900/20 rounded-2xl flex flex-wrap gap-4 items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Folio de Auditoría</span>
                        <code className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                            RM-{new Date(activeDossier.createdAt).getFullYear()}-{activeDossier.hash?.substring(0, 4).toUpperCase()}
                        </code>
                    </div>
                    <div className="flex gap-4">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pensión Estimada</span>
                            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                ${activeResult.pensionMensual.toLocaleString('es-MX', { maximumFractionDigits: 0 })}/mes
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Retorno (ROI)</span>
                            <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                                {activeResult.roiMeses > 0 ? `${activeResult.roiMeses} meses` : 'Inmediato'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* PDF Report Downloads Grid */}
            <LockedOverlay isLocked={isLocked} isB2C={isB2C}>
                <div className="space-y-4 flex-1">
                    {activeDossier && activeResult && activeBundle && (
                        <>
                            {/* Card 1: Comprehensive Study */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <ShieldCheck className="text-amber-500 shrink-0" size={16} />
                                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Estudio Actuarial Completo</p>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal max-w-sm">
                                        Desglose completo de costo-beneficio anual, proyecciones financieras e impacto inflacionario.
                                    </p>
                                </div>
                                <div className="sm:w-[150px] shrink-0">
                                    <InercialComprehensivePDFButton
                                        clientName={userProfile?.name || 'Cliente'}
                                        input={activeDossier.input}
                                        strategyName={activeDossier.name}
                                        strategyResult={activeResult}
                                        projectionData={projectionForPdf}
                                        bundle={activeBundle}
                                        certifiedDossier={activeDossier}
                                        aforeSaldos={activeDossier.result.aforeSaldos || null}
                                    />
                                </div>
                            </div>

                            {/* Card 2: Projections Brief */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <FileText className="text-blue-500 shrink-0" size={16} />
                                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Resumen de Proyección</p>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal max-w-sm">
                                        Síntesis gráfica de tu plan con la estimación de pensión, inversión total y tiempo de retorno.
                                    </p>
                                </div>
                                <div className="sm:w-[150px] shrink-0">
                                    <InercialBriefPDFButton
                                        clientName={userProfile?.name || 'Cliente'}
                                        input={activeDossier.input}
                                        strategyName={activeDossier.name}
                                        strategyResult={activeResult}
                                        projectionData={projectionForPdf}
                                        bundle={activeBundle}
                                        certifiedDossier={activeDossier}
                                    />
                                </div>
                            </div>

                            {/* Card 3: Integrity Certificate */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <TrendingUp className="text-indigo-500 shrink-0" size={16} />
                                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Certificado de Integridad Legal</p>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal max-w-sm">
                                        Constancia sellada electrónicamente con el folio de auditoría y hash criptográfico único.
                                    </p>
                                </div>
                                <div className="sm:w-[150px] shrink-0">
                                    <AuthorityRetirementPDFButton
                                        clientName={userProfile?.name || 'Cliente'}
                                        input={activeDossier.input}
                                        strategyName={activeDossier.name}
                                        strategyResult={activeResult}
                                        projectionData={projectionForPdf}
                                        bundle={activeBundle}
                                        agencyProfile={session?.user}
                                        fileName={`Certificado_${activeDossier.name.replace(/\s+/g, '_')}.pdf`}
                                        onClick={() => showToast("Descargando certificado de integridad...", "info")}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </LockedOverlay>
        </Card>
    );
};
