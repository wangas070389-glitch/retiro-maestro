'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { X, TrendingUp, ShieldCheck, History, Info, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { PensionInput } from '../../lib/engine/pension-engine';
import { TaxEngine } from '../../lib/engine/fiscal/tax-engine';
import { ResumenTab } from './tabs/ResumenTab';
import { ProyeccionTab } from './tabs/ProyeccionTab';
import { DesgloseTab } from './tabs/DesgloseTab';
import { DossierBuilder, ForensicBundle } from '../../lib/engine/audit/dossier-builder';
import { calculateProjectionAction } from '../../actions/calculate-pension';
import dynamic from 'next/dynamic';

const StrategyModalBriefPDFButton = dynamic(
    () => import('@/components/reports/PDFDownloadButtons').then(mod => mod.StrategyModalBriefPDFButton),
    { ssr: false }
);

const StrategyModalDetailedPDFButton = dynamic(
    () => import('@/components/reports/PDFDownloadButtons').then(mod => mod.StrategyModalDetailedPDFButton),
    { ssr: false }
);

interface StrategyModalProps {
    isOpen: boolean;
    onClose: () => void;
    strategyName: string;
    input: PensionInput & { name?: string };
    strategyMode: 'modalidad40' | 'inercial';
    monthlyInvestment: number;
    targetDailySalary: number;
    targetDailyHigh?: number;
    splitYear?: number;
}

const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1] as const,
        }
    },
    exit: {
        opacity: 0,
        scale: 0.98,
        y: -20,
        transition: {
            duration: 0.2
        }
    }
};

const tabVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 10, transition: { duration: 0.2 } }
};

type TabType = 'resumen' | 'proyeccion' | 'desglose';

export const StrategyModal: React.FC<StrategyModalProps> = ({
    isOpen,
    onClose,
    strategyName,
    input,
    strategyMode,
    monthlyInvestment,
    targetDailySalary,
    targetDailyHigh,
    splitYear
}) => {
    const { data: session } = useSession();
    const [bundle, setBundle] = useState<ForensicBundle | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('resumen');
    const [projectionData, setProjectionData] = useState<any[]>([]);
    const [basePensionData, setBasePensionData] = useState<number>(0);
    const [baselineProjection, setBaselineProjection] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        let active = true;
        setLoading(true);
        calculateProjectionAction(
            input,
            strategyMode,
            monthlyInvestment,
            targetDailySalary,
            targetDailyHigh,
            splitYear
        ).then((res) => {
            if (active) {
                setProjectionData(res.projection);
                setBasePensionData(res.basePensionData);
                setBaselineProjection(res.baselineProjection);
                setLoading(false);
            }
        }).catch((err) => {
            console.error("Failed to fetch projection:", err);
            if (active) setLoading(false);
        });
        return () => { active = false; };
    }, [input, strategyMode, monthlyInvestment, targetDailySalary, targetDailyHigh, splitYear, isOpen]);

    useEffect(() => {
        if (projectionData.length > 0 && isOpen) {
            DossierBuilder.buildAdHocBundle({
                strategy: strategyName,
                mode: strategyMode,
                data: projectionData[projectionData.length - 1]
            }).then(setBundle);
        }
    }, [projectionData, strategyName, strategyMode, isOpen]);

    // Reset tab on close
    useEffect(() => {
        if (!isOpen) setTimeout(() => setActiveTab('resumen'), 300);
    }, [isOpen]);

    if (!projectionData.length) return null;

    const finalResult = projectionData[projectionData.length - 1];

    // Find breakeven year
    const breakevenRow = projectionData.find(row => row.pension * 12 > row.investment);
    const breakevenYear = breakevenRow ? breakevenRow.year : finalResult.year;

    const deltaMensual = finalResult.pension - basePensionData;
    const porcentajeIncremento = basePensionData > 0 ? (deltaMensual / basePensionData) * 100 : 0;
    const lifetimeImpact = deltaMensual * 12 * 20; // 20 years projection

    const tabs = [
        { id: 'resumen', label: 'Resumen Ejecutivo' },
        { id: 'proyeccion', label: 'Proyección' },
        { id: 'desglose', label: 'Desglose Anual' }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    />

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="bg-white w-full max-w-5xl h-[90vh] rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col relative z-10"
                    >
                        {/* STICKY HEADER */}
                        <div className="sticky top-0 z-50 bg-white border-b border-slate-100 px-8 py-6 flex flex-col gap-4 shrink-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                            <ShieldCheck size={12} /> Análisis Forense
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                                        {strategyName}
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    aria-label="Cerrar modal"
                                    className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors group"
                                >
                                    <X size={20} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                                </button>
                            </div>

                            {/* TABS */}
                            <div className="flex gap-1 border-b border-slate-200">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as TabType)}
                                        className={`px-4 py-3 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {tab.label}
                                        {activeTab === tab.id && (
                                            <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-indigo-600" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* SCROLLABLE BODY */}
                        <div className="flex-1 overflow-y-auto bg-slate-50 relative">
                            <AnimatePresence mode="wait">
                                {activeTab === 'resumen' && (
                                    <ResumenTab
                                        key="resumen"
                                        finalResult={finalResult}
                                        deltaMensual={deltaMensual}
                                        porcentajeIncremento={porcentajeIncremento}
                                        lifetimeImpact={lifetimeImpact}
                                        monthlyInvestment={monthlyInvestment}
                                        tabVariants={tabVariants}
                                    />
                                )}

                                {activeTab === 'proyeccion' && (
                                    <ProyeccionTab
                                        key="proyeccion"
                                        projectionData={projectionData}
                                        breakevenRow={breakevenRow}
                                        breakevenYear={breakevenYear}
                                        tabVariants={tabVariants}
                                    />
                                )}

                                {activeTab === 'desglose' && (
                                    <DesgloseTab
                                        key="desglose"
                                        projectionData={projectionData}
                                        breakevenYear={breakevenYear}
                                        tabVariants={tabVariants}
                                    />
                                )}
                            </AnimatePresence>
                        </div>

                        {/* STICKY FOOTER */}
                        <div className="sticky bottom-0 z-50 bg-white border-t border-slate-200 p-6 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 border border-slate-100 text-slate-400 shadow-inner">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-sm font-bold text-slate-700">Cálculos respaldados por motor actuarial.</p>
                                    <p className="text-xs text-slate-500">Basado en normativa y UMA vigente de la Ley 73 del IMSS.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 w-full sm:w-auto">
                                {!mounted ? (
                                    <>
                                        <button
                                            disabled
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-slate-400 font-bold rounded-xl border-2 border-slate-200 transition-colors text-sm"
                                        >
                                            <FileText size={18} />
                                            Cargando...
                                        </button>
                                        <button
                                            disabled
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-50 text-indigo-400 font-bold rounded-xl transition-colors text-sm border-2 border-indigo-50"
                                        >
                                            Cargando PDF...
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <StrategyModalBriefPDFButton
                                            clientName={input.name || "Sovereign User"}
                                            input={input}
                                            strategyName={strategyName}
                                            strategyResult={{
                                                pensionMensual: finalResult.pension,
                                                totalInversion: finalResult.investment,
                                                roiMeses: finalResult.roi
                                            }}
                                            baselineResult={{
                                                pensionMensual: basePensionData,
                                                totalInversion: 0,
                                                roiMeses: 0
                                            }}
                                            baselineProjectionData={baselineProjection}
                                            projectionData={projectionData}
                                            bundle={bundle || undefined}
                                            certifiedDossier={null}
                                            agencyProfile={session?.user}
                                        />

                                        <StrategyModalDetailedPDFButton
                                            clientName={input.name || "Sovereign User"}
                                            input={input}
                                            strategyName={strategyName}
                                            strategyResult={{
                                                pensionMensual: finalResult.pension,
                                                totalInversion: finalResult.investment,
                                                roiMeses: finalResult.roi
                                            }}
                                            baselineResult={{
                                                pensionMensual: basePensionData,
                                                totalInversion: 0,
                                                roiMeses: 0
                                            }}
                                            baselineProjectionData={baselineProjection}
                                            projectionData={projectionData}
                                            bundle={bundle || undefined}
                                            aforeSaldos={input.aforeSaldos}
                                            honorarios={{
                                                estudio: 3000,
                                                gestionMensual: strategyMode === 'modalidad40' ? 1000 : undefined
                                            }}
                                            strategyMode={strategyMode}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
