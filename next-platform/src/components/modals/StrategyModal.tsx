'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { X, TrendingUp, ShieldCheck, History, Info, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { PensionEngine, PensionInput } from '../../lib/engine/pension-engine';
import { TaxEngine } from '../../lib/engine/fiscal/tax-engine';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { RetirementReport } from '../reports/RetirementReport';
import { ComprehensiveReport } from '../reports/ComprehensiveReport';
import { DossierBuilder, ForensicBundle } from '../../lib/engine/audit/dossier-builder';

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

const engine = new PensionEngine();

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
    const [strategyProjection, setStrategyProjection] = useState<any[]>([]);
    const [baselineProjection, setBaselineProjection] = useState<any[]>([]);

    const projectionData = useMemo(() => {
        if (!isOpen) return []; // Pre-optimization
        return engine.calculateProjection(
            input,
            null, // Multi-year based on retirement_age
            strategyMode,
            monthlyInvestment,
            targetDailySalary,
            targetDailyHigh,
            splitYear
        );
    }, [input, strategyMode, monthlyInvestment, targetDailySalary, targetDailyHigh, splitYear, isOpen]);

    // Calculate baseline to find delta and lifetime impact
    const basePensionData = useMemo(() => {
        if (!isOpen) return 0;
        const yearsLeft = Math.max(0, (input.retirement_age || 65) - input.age);
        const inercialWeeks = input.weeks + (input.is_ongoing_work !== false ? yearsLeft * 52 : 0);
        const inercialResult = engine.calculate({
            ...input,
            weeks: inercialWeeks,
            age: input.retirement_age || 65
        });
        return TaxEngine.calculateISR(inercialResult.with_decree_111).netPension;
    }, [input, isOpen]);

    useEffect(() => {
        if (projectionData.length > 0 && isOpen) {
            DossierBuilder.buildAdHocBundle({
                strategy: strategyName,
                mode: strategyMode,
                data: projectionData[projectionData.length - 1]
            }).then(setBundle);

            // Calculate Baseline Projection for "AS-IS" contrast
            const yearsLeft = Math.max(0, (input.retirement_age || 65) - input.age);
            const baseline = engine.calculateProjection(
                input,
                yearsLeft,
                'inercial',
                0,
                undefined,
                undefined,
                undefined
            );
            setBaselineProjection(baseline);
        }
    }, [projectionData, strategyName, strategyMode, isOpen, input]);

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
                                    <motion.div key="resumen" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="p-8">

                                        {/* Main KPIs */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                            {/* Final Pension Card */}
                                            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-center text-center items-center relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-100/50 to-transparent rounded-bl-full -mr-10 -mt-10" />
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Pensión Final Estimada</p>
                                                <p className="text-6xl font-black text-slate-800 tracking-tighter mb-4 relative z-10">
                                                    <span className="text-3xl text-slate-400 mr-1">$</span>
                                                    {finalResult.pension.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                                                </p>
                                                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl flex items-center justify-center gap-2 font-bold w-full max-w-xs relative z-10">
                                                    <TrendingUp size={18} />
                                                    <span>+${deltaMensual.toLocaleString('es-MX', { maximumFractionDigits: 0 })} mensuales</span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-3 relative z-10">Representa un <b className="text-emerald-600">+{porcentajeIncremento.toFixed(0)}%</b> de incremento.</p>
                                            </div>

                                            {/* Supporting KPIs */}
                                            <div className="flex flex-col gap-4">
                                                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex-1 flex flex-col justify-center relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full -mr-5 -mt-5" />
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 relative z-10">Inversión Lograda</p>
                                                    <p className="text-3xl font-bold text-slate-800 tracking-tight relative z-10">
                                                        ${finalResult.investment.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1 relative z-10">
                                                        Costo total de Modalidad 40 durante la estrategia.
                                                    </p>
                                                </div>
                                                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex-1 flex flex-col justify-center relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-100 to-transparent rounded-bl-full -mr-5 -mt-5" />
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 relative z-10">Retorno de Inversión (ROI)</p>
                                                    <p className="text-3xl font-bold text-slate-800 tracking-tight relative z-10">
                                                        {Math.ceil(finalResult.roi)} meses
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1 relative z-10">
                                                        Recuperas tu inversión en aproximadamente <b className="text-indigo-600">{Math.ceil(finalResult.roi / 12)} años</b> de pensión.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* "Next Step" Context Box */}
                                        <div className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-600/20 overflow-hidden relative">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl" />
                                            <div className="absolute bottom-[-10px] left-[-10px] w-32 h-32 bg-indigo-900 opacity-20 rounded-full blur-2xl" />

                                            <div className="flex-1 relative z-10">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CheckCircle2 size={24} className="text-indigo-300" />
                                                    <h3 className="font-bold text-2xl">Próximo Paso</h3>
                                                </div>
                                                <p className="text-indigo-100 text-base leading-relaxed max-w-lg">
                                                    Para ejecutar esta estrategia de manera estructurada, requieres iniciar aportaciones de <b>${monthlyInvestment.toLocaleString('es-MX', { maximumFractionDigits: 0 })} mensuales</b> durante el periodo sugerido.
                                                </p>
                                            </div>
                                            <div className="w-full md:w-auto bg-indigo-800/50 backdrop-blur-md rounded-2xl p-6 text-center border border-indigo-500/30 relative z-10">
                                                <p className="text-[10px] uppercase tracking-widest text-indigo-200 font-bold mb-1">Impacto Acumulado Neto</p>
                                                <p className="text-3xl font-bold text-emerald-400 tabular-nums">
                                                    +${lifetimeImpact.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                                                </p>
                                                <p className="text-xs text-indigo-200 mt-1">Generados adicionales en 20 años</p>
                                            </div>
                                        </div>

                                    </motion.div>
                                )}

                                {activeTab === 'proyeccion' && (
                                    <motion.div key="proyeccion" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="p-8 h-full flex flex-col">
                                        <div className="flex-1 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col h-[600px]">
                                            <div className="flex items-center justify-between mb-6 shrink-0">
                                                <h3 className="font-bold text-slate-800 tracking-tighter text-xl flex items-center gap-2">
                                                    Curva de Crecimiento Patrimonial
                                                </h3>
                                                <div className="flex gap-4">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div> PENSIÓN Mensual
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div> INVERSIÓN ACUMULADA
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 min-h-[400px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="colorPension" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                            </linearGradient>
                                                            <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
                                                        <XAxis
                                                            dataKey="year"
                                                            fontSize={11}
                                                            fontWeight="600"
                                                            tickLine={false}
                                                            axisLine={false}
                                                            tick={{ fill: '#64748B' }}
                                                        />
                                                        <YAxis
                                                            yAxisId="left"
                                                            fontSize={11}
                                                            fontWeight="600"
                                                            tickLine={false}
                                                            axisLine={false}
                                                            tick={{ fill: '#6366f1' }}
                                                            tickFormatter={(val) => `$${(val / 1000)}k`}
                                                        />
                                                        <YAxis
                                                            yAxisId="right"
                                                            orientation="right"
                                                            fontSize={11}
                                                            fontWeight="600"
                                                            tickLine={false}
                                                            axisLine={false}
                                                            tick={{ fill: '#10b981' }}
                                                            tickFormatter={(val) => `$${(val / 1000)}k`}
                                                        />
                                                        <Tooltip
                                                            formatter={(value: number | undefined, name: string | undefined) => [`$${Number(value || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`, name ?? '']}
                                                            labelFormatter={(label, payload) => {
                                                                const data = payload[0]?.payload;
                                                                if (data) return `Año ${label} (Edad: ${data.age} años)`;
                                                                return label;
                                                            }}
                                                            contentStyle={{
                                                                borderRadius: '16px',
                                                                border: '1px solid #E2E8F0',
                                                                background: '#ffffff',
                                                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                                                fontSize: '12px',
                                                                color: '#0f172a'
                                                            }}
                                                            itemStyle={{ fontWeight: '700' }}
                                                            labelStyle={{ fontWeight: '800', color: '#1E293B', marginBottom: '8px' }}
                                                        />
                                                        <Area yAxisId="left" type="monotone" dataKey="pension" name="Pensión Mensual Neta" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPension)" />
                                                        <Area yAxisId="right" type="monotone" dataKey="investment" name="Inversión Acumulada" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorInv)" />

                                                        {breakevenRow && (
                                                            <Tooltip cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4' }} />
                                                        )}
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>

                                            <div className="shrink-0 mt-6 bg-slate-50 text-slate-600 text-sm px-5 py-4 rounded-2xl border border-slate-200 flex items-center justify-center gap-3">
                                                <Info size={18} className="text-slate-400" />
                                                <span>En el año <b className="text-slate-800">{breakevenYear}</b> alcanzas el punto de equilibrio financiero, donde el acumulado de pensión supera toda tu inversión inicial.</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'desglose' && (
                                    <motion.div key="desglose" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="p-8 h-full">
                                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[550px] flex flex-col">
                                            {/* Table container with independent vertical scrolling */}
                                            <div className="overflow-y-auto flex-1 relative scrollbar-thin">
                                                <table className="w-full text-left text-sm whitespace-nowrap">
                                                    <thead className="bg-slate-50 text-slate-500 font-bold tracking-wider text-[10px] uppercase sticky top-0 z-20 shadow-[0_1px_0_0_#e2e8f0]">
                                                        <tr>
                                                            <th className="px-6 py-4 sticky left-0 bg-slate-50 z-30 shadow-[1px_0_0_0_#e2e8f0]">Año / Edad</th>
                                                            <th className="px-6 py-4">Semanas Totales</th>
                                                            <th className="px-6 py-4">Salario Prom. (SBC)</th>
                                                            <th className="px-6 py-4 text-emerald-700">Inversión Acum.</th>
                                                            <th className="px-6 py-4 text-indigo-700">Pensión Mensual Neta</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {projectionData.map((row, idx) => {
                                                            const isFinal = idx === projectionData.length - 1;
                                                            const isBreakeven = row.year === breakevenYear;

                                                            return (
                                                                <tr key={row.year} className={`group hover:bg-slate-50 transition-colors ${isFinal ? 'bg-indigo-50/50 hover:bg-indigo-50' : ''}`}>
                                                                    <td className={`px-6 py-4 font-bold ${isFinal ? 'text-indigo-900 bg-indigo-50' : 'text-slate-800 bg-white'} sticky left-0 group-hover:bg-slate-50 transition-colors shadow-[1px_0_0_0_#f1f5f9] z-10 flex items-center gap-2`}>
                                                                        {row.year} <span className="text-slate-400 text-xs font-semibold">({row.age}a)</span>
                                                                        {isBreakeven && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md uppercase tracking-widest ml-1 shadow-sm">Punto de Equilibrio</span>}
                                                                        {isFinal && <span className="text-[9px] bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-md uppercase tracking-widest ml-1 shadow-sm">Pensión Final</span>}
                                                                    </td>
                                                                    <td className={`px-6 py-4 ${isFinal ? 'font-bold' : 'font-medium'} text-slate-600 tabular-nums`}>{row.weeks}</td>
                                                                    <td className={`px-6 py-4 ${isFinal ? 'font-bold' : 'font-medium'} text-slate-600 tabular-nums`}>${row.registeredSalary.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</td>
                                                                    <td className={`px-6 py-4 font-bold text-emerald-600 tabular-nums`}>${row.investment.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</td>
                                                                    <td className={`px-6 py-4 font-bold text-indigo-600 tabular-nums ${isFinal ? 'text-xl' : 'text-base'}`}>${row.pension.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </motion.div>
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
                                <PDFDownloadLink
                                    document={
                                        <RetirementReport
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
                                    }
                                    fileName={`Reporte_${strategyName.replace(/\s+/g, '_')}.pdf`}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-slate-700 font-bold rounded-xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm"
                                >
                                    {({ loading }) => (
                                        <>
                                            <FileText size={18} />
                                            {loading ? 'Generando...' : 'Resumen Breve'}
                                        </>
                                    )}
                                </PDFDownloadLink>

                                <PDFDownloadLink
                                    document={
                                        <ComprehensiveReport
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
                                        />
                                    }
                                    fileName={`Dossier_Completo_${strategyName.replace(/\s+/g, '_')}.pdf`}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 text-sm border-2 border-indigo-600 hover:border-indigo-700"
                                >
                                    {({ loading }) => (
                                        <>
                                            {loading ? 'Generando PDF...' : 'Desbloquear Plan Detallado'}
                                        </>
                                    )}
                                </PDFDownloadLink>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
