'use client';

import { useState } from 'react';
import { CheckCircle2, TrendingUp, AlertTriangle, ArrowRight, ChevronDown, DollarSign, Clock, PiggyBank, X } from 'lucide-react';
import { ExecutiveRecommendation } from '@/lib/engine/roi-optimizer';
import { useSession } from 'next-auth/react';

interface Props {
    recommendations: ExecutiveRecommendation[];
    onSelect?: (rec: ExecutiveRecommendation) => void;
}

export function ExecutiveRecommendationComponent({ recommendations, onSelect }: Props) {
    const { data: session } = useSession();
    const isUser = session?.user?.role === 'USER';
    const [selectedIndex, setSelectedIndex] = useState<number | null>(() => {
        // Default to the optimal strategy
        const optIdx = recommendations.findIndex(r => r.isOptimal);
        return optIdx >= 0 ? optIdx : null;
    });

    const optimal = recommendations.find(r => r.isOptimal) || recommendations[0];
    const selected = selectedIndex !== null ? recommendations[selectedIndex] : null;

    const handleCardClick = (index: number) => {
        setSelectedIndex(index);
        onSelect?.(recommendations[index]);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Main Authority Card — shows the currently selected or optimal strategy */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl border border-indigo-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                    <TrendingUp size={240} />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {selected && !selected.isOptimal 
                                ? `Comparando: ${selected.strategyName}`
                                : (isUser ? 'Tu Mejor Opción Detectada' : 'Configuración Óptima Detectada')}
                        </div>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-light tracking-tight mb-8">
                        {isUser 
                            ? <>Tu Estrategia de <span className="font-bold text-emerald-400">Mayor Beneficio</span></>
                            : <>Tu Estrategia de <span className="font-bold text-indigo-400">Máximo Retorno</span></>}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                            <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-2">
                                {isUser ? 'Pensión Que Recibirías' : 'Pensión Proyectada'}
                            </p>
                            <p className="text-4xl font-bold">
                                ${(selected || optimal).monthlyPension.toLocaleString('es-MX', { maximumFractionDigits: 0 })} 
                                <span className="text-sm font-medium opacity-60">MXN/mes</span>
                            </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">
                                {isUser ? 'Aumento vs Tu Pensión Actual' : 'Incremento Neto'}
                            </p>
                            <p className="text-4xl font-bold text-emerald-400">
                                +${(selected || optimal).pensionGain.toLocaleString('es-MX', { maximumFractionDigits: 0 })} 
                                <span className="text-sm font-medium opacity-60">MXN/mes</span>
                            </p>
                        </div>
                         <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                            <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-2">
                                {isUser ? '¿En Cuánto Tiempo Recupero?' : 'Recuperación (ROI)'}
                            </p>
                            <p className="text-4xl font-bold text-orange-400">
                                {(selected || optimal).paybackMonths.toFixed(1)} 
                                <span className="text-sm font-medium opacity-60">meses</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-center border-t border-white/10 pt-8">
                        <div className="flex items-center gap-4">
                            <div className="bg-orange-500/20 p-3 rounded-2xl">
                                <AlertTriangle className="text-orange-400 w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                    {isUser ? 'Lo Que Pierdes Cada Mes Sin Actuar' : 'Costo de Inacción'}
                                </p>
                                <p className="text-lg font-medium text-orange-200">
                                    {isUser 
                                        ? `Dejarías de recibir $${(selected || optimal).costOfInaction.toLocaleString('es-MX', { maximumFractionDigits: 0 })} cada mes`
                                        : `Perderías $${(selected || optimal).costOfInaction.toLocaleString('es-MX', { maximumFractionDigits: 0 })} por cada mes de demora`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comparison Grid — clickable cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {recommendations.map((rec, i) => {
                    const isSelected = selectedIndex === i;
                    return (
                        <div 
                            key={i}
                            onClick={() => handleCardClick(i)}
                            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer group relative ${
                                isSelected 
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10 scale-[1.02]' 
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{rec.strategyName}</span>
                                {isSelected && <CheckCircle2 className="text-indigo-500 w-5 h-5" />}
                                {rec.isOptimal && !isSelected && (
                                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                                        {isUser ? 'Mejor' : 'Óptimo'}
                                    </span>
                                )}
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                                ${rec.monthlyPension.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                                ROI: <span className="font-bold text-emerald-500">{rec.roiPercentage.toFixed(1)}%</span>
                            </p>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCardClick(i);
                                }}
                                className={`text-[10px] font-bold flex items-center gap-1 group/btn transition-colors ${
                                    isSelected 
                                        ? 'text-indigo-600 dark:text-indigo-400' 
                                        : 'text-slate-400 group-hover:text-indigo-600'
                                }`}
                            >
                                {isSelected ? 'SELECCIONADO' : 'VER DETALLES'} 
                                <ArrowRight size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Expanded Detail Panel — shows when a card is selected */}
            {selected && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300 relative">
                    <button 
                        onClick={() => setSelectedIndex(null)}
                        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-2.5 rounded-xl">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                {isUser ? `Detalle: ${selected.strategyName}` : `Análisis: ${selected.strategyName}`}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {isUser ? 'Todo lo que necesitas saber sobre esta opción' : 'Desglose financiero completo de esta estrategia'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2 mb-3">
                                <Clock size={14} className="text-indigo-500" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {isUser ? 'Tiempo de Inversión' : 'Ventana de Inversión'}
                                </p>
                            </div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{selected.investmentMonths} <span className="text-sm text-slate-400 font-bold">meses</span></p>
                            <p className="text-[10px] text-slate-400 mt-1">{(selected.investmentMonths / 12).toFixed(1)} años cotizando bajo Modalidad 40</p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2 mb-3">
                                <DollarSign size={14} className="text-amber-500" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {isUser ? '¿Cuánto Invertirías?' : 'Inversión Total'}
                                </p>
                            </div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">${selected.totalInvestment.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</p>
                            <p className="text-[10px] text-slate-400 mt-1">≈ ${(selected.totalInvestment / selected.investmentMonths).toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN/mes</p>
                        </div>

                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp size={14} className="text-emerald-500" />
                                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                                    {isUser ? 'Tu Pensión Mejorada' : 'Pensión Resultante'}
                                </p>
                            </div>
                            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">${selected.monthlyPension.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</p>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-1">+${selected.pensionGain.toLocaleString('es-MX', { maximumFractionDigits: 0 })} vs sin invertir</p>
                        </div>

                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                            <div className="flex items-center gap-2 mb-3">
                                <PiggyBank size={14} className="text-indigo-500" />
                                <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                                    {isUser ? '¿Cuándo Recupero Mi Dinero?' : 'Payback Period'}
                                </p>
                            </div>
                            <p className="text-2xl font-black text-indigo-700 dark:text-indigo-400">{selected.paybackMonths.toFixed(1)} <span className="text-sm text-indigo-400 font-bold">meses</span></p>
                            <p className="text-[10px] text-indigo-500 mt-1">ROI anualizado: {selected.roiPercentage.toFixed(1)}%</p>
                        </div>
                    </div>

                    {/* Contextual explanation for citizens */}
                    {isUser && (
                        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl">
                            <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                                <strong>¿Qué significa esto?</strong> Si inviertes ${(selected.totalInvestment / selected.investmentMonths).toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN al mes durante {(selected.investmentMonths / 12).toFixed(0)} año(s), 
                                tu pensión mensual subiría de lo que recibirías sin cambios a <strong>${selected.monthlyPension.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN al mes</strong>. 
                                Recuperarías toda tu inversión en aproximadamente <strong>{selected.paybackMonths.toFixed(0)} meses</strong> de cobrar tu pensión.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
