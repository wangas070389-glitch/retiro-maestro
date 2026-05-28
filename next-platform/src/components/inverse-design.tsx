'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSimulationStore } from '../store';
import { Calculator, DollarSign, AlertTriangle, CheckCircle2, TrendingUp, Info, Search } from 'lucide-react';
import legalData from '../lib/data/legal-anchors.json';
import { saveStrategyAction } from '../actions/save-strategy';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useToast } from './ui/toast-context';
import { StrategyModal } from './modals/StrategyModal';
import { calculateInverseDesignAction } from '../actions/calculate-pension';

interface InverseDesignResult {
    requiredDailySalary: number;
    cappedDailySalary: number;
    monthlyInvestment: number;
    totalInvestment: number;
    isPossible: boolean;
    maxPension: number;
    maxPensionGross: number;
    weeks: number;
    months: number;
}

export const InverseDesign: React.FC = () => {
    const { scenarioA } = useSimulationStore();
    const { showToast } = useToast();
    const [targetPension, setTargetPension] = useState<number>(32000);
    const [result, setResult] = useState<InverseDesignResult | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const baseInput = scenarioA.input;
    const currentAge = baseInput.age;
    const targetAge = baseInput.retirement_age || 65;
    const yearsToProject = Math.max(0, targetAge - currentAge);
    const monthsEstimates = yearsToProject * 12;

    const [maxLegalPension, setMaxLegalPension] = useState<number>(0);
    const [basePensionData, setBasePensionData] = useState<number>(0);

    const calculateRequiredSalary = useCallback(() => {
        calculateInverseDesignAction(baseInput, targetPension).then((res) => {
            setMaxLegalPension(res.maxLegalPension);
            setBasePensionData(res.basePensionData);
            setResult(res.solve);
        }).catch((err) => {
            console.error("Failed to calculate inverse design:", err);
        });
    }, [baseInput, targetPension]);


    useEffect(() => {
        calculateRequiredSalary();
    }, [calculateRequiredSalary]);

    const handleSave = async () => {
        if (!result) return;
        setIsSaving(true);

        const formData = new FormData();
        formData.append('weeks', result.weeks.toString());
        formData.append('salary_prom', result.cappedDailySalary.toFixed(2));
        formData.append('age', targetAge.toString());
        formData.append('has_wife', baseInput.has_wife.toString());
        formData.append('strategyType', 'CUSTOM');
        formData.append('investment', result.monthlyInvestment.toString());
        formData.append('netPension', targetPension.toString());
        formData.append('roiMonths', '0');

        const res = await saveStrategyAction(formData);
        setIsSaving(false);

        if (res.success) {
            showToast(`¡Estrategia Optimizada Guardada!`, "success");
        } else {
            showToast("Error: " + res.error, "error");
        }
    };

    const pensionDifference = targetPension - basePensionData;

    return (
        <section className="bg-[#0b0f1a] rounded-3xl p-10 mb-12 text-white border border-slate-800/80 relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-start">
                {/* Left Panel: Inputs & Context */}
                <div className="flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                            <Calculator className="text-indigo-400" size={28} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black tracking-tight text-white mb-1">Diseño a Medida</h3>
                            <p className="text-indigo-200 text-sm font-medium">Calculadora Inversa de Modalidad 40</p>
                        </div>
                    </div>

                    <p className="text-slate-300 text-lg leading-relaxed mb-10 max-w-xl">
                        Define tu meta y descubre exactamente cuánto necesitas invertir para lograrla legalmente bajo Modalidad 40.
                    </p>

                    <div className="flex-1 space-y-8">
                        {/* Target Pension Input Group */}
                        <div className="bg-[#12182b] p-8 rounded-3xl border border-slate-800/80 shadow-inner relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none" />

                            <label className="block text-sm font-bold tracking-widest text-indigo-400 uppercase mb-6 flex items-center gap-2">
                                🎯 Tu pensión objetivo
                            </label>

                            <div className="relative group mb-8">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-4xl font-bold group-focus-within:text-indigo-400 transition-colors">
                                    $
                                </div>
                                <input
                                    type="number"
                                    aria-label="Target Pension Amount"
                                    title="Target Pension Amount"
                                    value={targetPension}
                                    onChange={(e) => setTargetPension(Number(e.target.value))}
                                    className="w-full bg-[#0b0f1a] border-2 border-slate-800 rounded-2xl py-8 pl-16 pr-8 text-5xl font-black text-center text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                />
                            </div>

                            {/* Range Slider */}
                            <div className="mb-6 px-2">
                                <input
                                    type="range"
                                    min={5000}
                                    max={maxLegalPension + 5000}
                                    step={500}
                                    title="Ajuste de pensión objetivo"
                                    value={targetPension}
                                    onChange={(e) => setTargetPension(Math.min(maxLegalPension, Number(e.target.value)))}
                                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all font-bold placeholder:text-slate-600"
                                    placeholder="Desplaza para ajustar"
                                />
                                <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                    <span>Base</span>
                                    <span className="text-red-400">Límite Legal: ${maxLegalPension.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Quick Select Buttons */}
                            <div className="flex flex-wrap gap-2 mb-8">
                                {[20000, 30000, 40000].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setTargetPension(val)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors border ${targetPension === val ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'}`}
                                    >
                                        ${val.toLocaleString()}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setTargetPension(maxLegalPension)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold transition-colors border bg-indigo-900/40 border-indigo-500/50 text-indigo-300 hover:bg-indigo-500 hover:text-white"
                                >
                                    Tope Legal (25 UMAs)
                                </button>
                            </div>

                            {/* Automatic Comparison */}
                            <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Actualmente recibirías</p>
                                    <p className="text-xl font-bold text-slate-300">${basePensionData.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Diferencia para alcanzar meta</p>
                                    <p className="text-xl font-black text-emerald-400 flex items-center justify-end gap-1">
                                        <TrendingUp size={18} />
                                        +${Math.max(0, pensionDifference).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Viability Indicator */}
                        {result && (
                            <div className={twMerge(
                                "flex items-start gap-4 p-5 rounded-2xl border bg-opacity-10",
                                result.isPossible
                                    ? "bg-emerald-500 border-emerald-500/20 text-emerald-400"
                                    : "bg-red-500 border-red-500/20 text-red-400"
                            )}>
                                {result.isPossible ? (
                                    <CheckCircle2 className="shrink-0 mt-0.5" size={22} />
                                ) : (
                                    <AlertTriangle className="shrink-0 mt-0.5" size={22} />
                                )}
                                <div>
                                    <p className="font-bold text-sm tracking-wide">
                                        {result.isPossible ? 'Meta alineada con la Ley del Seguro Social' : 'Pensión superior al límite legal permitido'}
                                    </p>
                                    {!result.isPossible && (
                                        <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                                            El IMSS restringe la base de cálculo a 25 UMAs. Para tu perfil, lo máximo que puedes recibir son <strong className="text-white underline decoration-red-500/50">${maxLegalPension.toLocaleString('es-MX', { maximumFractionDigits: 0 })} netos mensuales.</strong>
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: The Plan */}
                <div className="bg-[#111625] rounded-3xl p-8 border border-slate-800 shadow-2xl relative h-full flex flex-col">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-3xl pointer-events-none"></div>

                    <p className="text-[10px] font-bold tracking-[0.3em] text-slate-500 mb-2 text-center uppercase">Plan Requerido</p>
                    <p className="text-xs text-slate-400 text-center mb-10 pb-6 border-b border-slate-800/60 leading-relaxed px-4">
                        Este es el esquema con el que deberías cotizar en Modalidad 40 para alcanzar tu pensión objetivo.
                    </p>

                    <div className="flex-1 space-y-10 relative z-10 flex flex-col justify-center">
                        {/* 1. Inversión Mensual (Biggest) */}
                        <div className="text-center">
                            <p className="text-indigo-400 text-[10px] font-bold tracking-widest mb-2 uppercase">1. Inversión Mensual (M40)</p>
                            <p className="text-6xl font-black text-emerald-400 tracking-tighter drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                                ${result?.monthlyInvestment.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                            </p>
                        </div>

                        {/* 2. Duración Estimada */}
                        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800/80 text-center">
                            <p className="text-slate-500 text-[10px] font-bold tracking-widest mb-1 uppercase">2. Duración Estimada</p>
                            <p className="text-2xl font-bold text-white mb-1">{result?.months} Meses</p>
                            <p className="text-xs text-slate-400">
                                Necesitarías cotizar {result?.months} meses bajo este esquema.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* 3. Salario Diario */}
                            <div className="bg-[#161b2c] rounded-2xl p-4 border border-slate-800 text-center">
                                <p className="text-slate-500 text-[9px] font-bold tracking-widest mb-2 uppercase">3. Salario Diario</p>
                                <p className="text-xl font-bold text-white tracking-tight">
                                    ${result?.cappedDailySalary.toLocaleString('es-MX', { maximumFractionDigits: 1 }).replace('.', ',')}
                                </p>
                            </div>

                            {/* 4. UMAs */}
                            <div className="bg-[#161b2c] rounded-2xl p-4 border border-slate-800 text-center flex flex-col items-center justify-center">
                                <p className="text-slate-500 text-[9px] font-bold tracking-widest mb-2 uppercase">4. Nivel en UMAs</p>
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                                    <span className="text-xs text-indigo-400 font-bold tracking-wider">
                                        {( (result?.cappedDailySalary || 0) / legalData.uma_2026).toFixed(1)} UMAs
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Total Investment */}
                        <div className="text-center pt-4 border-t border-slate-800/60">
                            <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">Inversión Total Estimada</p>
                            <p className="text-2xl font-bold text-slate-200">${result?.totalInvestment.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 mt-10 shrink-0">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full flex items-center justify-center gap-2 font-bold py-4 rounded-xl transition-all text-sm bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 active:scale-[0.98] border border-indigo-500/50"
                        >
                            <Search size={18} />
                            Ver plan detallado
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={twMerge(
                                "w-full font-bold py-4 rounded-xl transition-all text-sm shadow-sm border",
                                isSaving
                                    ? "bg-slate-800 text-slate-500 border-slate-700 cursor-wait"
                                    : "bg-[#161b2c] border-slate-700 text-slate-300 hover:bg-[#1a2035] hover:text-white hover:border-slate-500 active:scale-[0.98]"
                            )}
                        >
                            {isSaving ? 'Guardando...' : 'Guardar y optimizar meta'}
                        </button>
                    </div>
                </div>
            </div>

            {result && (
                <StrategyModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    strategyName={`Diseño para Meta: $${targetPension.toLocaleString('es-MX')}`}
                    input={scenarioA.input}
                    strategyMode="modalidad40"
                    monthlyInvestment={result.totalInvestment > 0 ? (result.totalInvestment / (Math.max(0, (scenarioA.input.retirement_age || 65) - scenarioA.input.age) * 12)) : 0}
                    targetDailySalary={result.cappedDailySalary}
                />
            )}
        </section>
    );
};
