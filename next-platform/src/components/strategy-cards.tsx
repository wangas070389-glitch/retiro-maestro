'use client';

import React, { useMemo } from 'react';
import { useSimulationStore } from '../store';
import { PensionEngine } from '../lib/engine/pension-engine';
import { TaxEngine } from '../lib/engine/fiscal/tax-engine';
import { TrendingUp, ArrowRight, Info } from 'lucide-react';
import legalData from '../lib/data/legal-anchors.json';
import { StrategyModal } from './modals/StrategyModal';

const engine = new PensionEngine();

// Investment Helper based on Prototype Logic
const calculateInvestment = (monthlySalary: number, years: number, startYearOffset: number = 0) => {
    let total = 0;
    // Modalidad 40 Rate 2026: 14.438%
    const m40Rate2026 = 0.14438;

    for (let i = 0; i < years; i++) {
        let currentRate = m40Rate2026;
        const inflationFactor = Math.pow(1.04, i + startYearOffset);
        const adjustedSalary = monthlySalary * inflationFactor;
        const yearlyCost = adjustedSalary * currentRate * 12;
        total += yearlyCost;
    }
    return total;
};

export const StrategyCards: React.FC = () => {
    const { scenarioA } = useSimulationStore();

    const calculateBlendedSalary = (currentDaily: number, targetDaily: number, investYears: number) => {
        const investWeeks = Math.min(250, investYears * 52);
        const histWeeks = 250 - investWeeks;
        return ((targetDaily * investWeeks) + (currentDaily * histWeeks)) / 250;
    };

    const strategies = useMemo(() => {
        const baseInput = scenarioA.input;
        const yearsLeft = Math.max(0, (baseInput.retirement_age || 65) - baseInput.age);
        const monthsLeft = yearsLeft * 12;

        // Baseline (Inercial)
        const inercialWeeks = baseInput.weeks + (baseInput.is_ongoing_work !== false ? yearsLeft * 52 : 0);
        const inercialResult = engine.calculate({
            ...baseInput,
            weeks: inercialWeeks,
            age: baseInput.retirement_age || 65
        });
        const baseNet = TaxEngine.calculateISR(inercialResult.with_decree_111).netPension;

        if (yearsLeft === 0) return []; // No strategy to calculate if already at retirement age

        const UMA_MONTHLY = legalData.uma_2026 * 30.416;
        const TOP_SALARY = UMA_MONTHLY * 25;
        const LOW_SALARY = Math.max(UMA_MONTHLY * 1.5, baseInput.salary_prom * 30.416); // Cannot drop below current

        // --- OPTIMIZER ENGINE ---
        // We will sweep the investment duration from 1 year to max years
        // The goal of the Optimal is to find the best Bang FOR Buck (Highest Delta per $1 invested)

        let bestEfficiency = 0;
        let optimalStrategyData: any = null;

        let absoluteMaxPension = 0;
        let absoluteMaxStrategyData: any = null;

        const viableStrategies: any[] = [];

        // Sweep from 1 year of M40 up to yearsLeft
        for (let targetYears = 1; targetYears <= yearsLeft; targetYears++) {

            // MATH-015: If targetYears < 5, we might still have historical salary diluting the average.
            // But ANY time beyond 4.8 years (250 weeks) invested AT THE END will solely govern the salary_prom.

            const lowYears = Math.max(0, yearsLeft - targetYears);
            const highYears = targetYears;

            // 250 weeks = ~4.8 years.
            // If highYears >= 5, the shifting 250-week window is perfectly covered by TOP_SALARY.
            // If highYears < 5, the window is a blend of TOP_SALARY and whatever was before it.
            let projectedBlendedSalary = baseInput.salary_prom;

            const highWeeks = Math.min(250, highYears * 52);
            // The remainder of the 250 weeks might be covered by LOW_SALARY (if any) or Historical Salary
            const remainingRequiredWeeks = 250 - highWeeks;
            const lowWeeks = Math.min(remainingRequiredWeeks, lowYears * 52);
            const historicalWeeks = Math.max(0, remainingRequiredWeeks - lowWeeks);

            const topDaily = TOP_SALARY / 30.416;
            const lowDaily = LOW_SALARY / 30.416;

            projectedBlendedSalary = ((topDaily * highWeeks) + (lowDaily * lowWeeks) + (baseInput.salary_prom * historicalWeeks)) / 250;

            const projectedWeeks = baseInput.weeks + (yearsLeft * 52); // M40 continuously buys weeks

            const result = engine.calculate({
                ...baseInput,
                weeks: projectedWeeks,
                salary_prom: projectedBlendedSalary,
                age: baseInput.retirement_age || 65
            });

            const netResult = TaxEngine.calculateISR(result.with_decree_111).netPension;

            const invLowTotal = calculateInvestment(LOW_SALARY, lowYears, 0);
            const invHighTotal = calculateInvestment(TOP_SALARY, highYears, lowYears);
            const totalInv = invLowTotal + invHighTotal;

            const deltaPension = netResult - baseNet;
            const efficiencyRatio = totalInv > 0 ? deltaPension / totalInv : 0; // Growth per $1
            const roiMonths = deltaPension > 0 ? (totalInv / deltaPension) : 999;

            const iterationData = {
                highYears,
                lowYears,
                netPension: netResult,
                totalInvestment: totalInv,
                avgMonthlyInvestment: monthsLeft > 0 ? totalInv / monthsLeft : 0,
                targetSalary: projectedBlendedSalary,
                rawTargetDaily: topDaily,
                delta: deltaPension,
                roiMonths: roiMonths,
            };

            // Capture Absolute Max
            if (netResult > absoluteMaxPension) {
                absoluteMaxPension = netResult;
                absoluteMaxStrategyData = iterationData;
            }

            // Capture Optimal (We favor efficiency, but with a minimum threshold so it's a meaningful change)
            // e.g. Don't pick 1 year just because it's cheap if the pension is still low. We look for the sweetspot.
            // We penalize if the ROI is too long (> 60 months)
            const penalizedEfficiency = roiMonths > 60 ? efficiencyRatio * (60 / roiMonths) : efficiencyRatio;

            if (penalizedEfficiency > bestEfficiency) {
                bestEfficiency = penalizedEfficiency;
                optimalStrategyData = iterationData;
            }

            if (deltaPension > 0) {
                viableStrategies.push(iterationData);
            }
        }

        let conservativeStrategyData: any = null;
        if (viableStrategies.length > 0) {
            viableStrategies.sort((a, b) => a.totalInvestment - b.totalInvestment);
            conservativeStrategyData = viableStrategies[0];
        }

        const buildCard = (id: string, name: string, description: string, data: any, color: 'indigo' | 'amber' | 'emerald') => ({
            id,
            name,
            description,
            ...data,
            color,
            percentageIncrease: ((data.netPension - baseNet) / baseNet) * 100,
            lifetimeImpact: data.delta * 12 * 20
        });

        const cards = [];

        const isOptEqMax = optimalStrategyData?.highYears === absoluteMaxStrategyData?.highYears;
        const isConsEqOpt = conservativeStrategyData?.highYears === optimalStrategyData?.highYears;

        if (conservativeStrategyData && (!isConsEqOpt || viableStrategies.length === 1)) {
            const hasRampa = conservativeStrategyData.lowYears > 0;
            cards.push(buildCard('conservador',
                `Ruta Conservadora`,
                `Menor barrera de entrada. Inversión mínima requerida (${hasRampa ? `${conservativeStrategyData.lowYears}+${conservativeStrategyData.highYears}` : `${conservativeStrategyData.highYears} años`}).`,
                conservativeStrategyData, 'emerald'
            ));
        }

        if (optimalStrategyData) {
            const hasRampa = optimalStrategyData.lowYears > 0;
            cards.push(buildCard('optimo',
                `Estrategia Recomendada`,
                `Mayor equilibrio costo-beneficio. Modelo matemático ${hasRampa ? `${optimalStrategyData.lowYears}+${optimalStrategyData.highYears}` : `${optimalStrategyData.highYears} años`}.`,
                optimalStrategyData, 'amber'
            ));
        }

        if (absoluteMaxStrategyData && !isOptEqMax) {
            cards.push(buildCard('maximo', `Techo Legal Máximo (${absoluteMaxStrategyData.highYears} Años)`,
                `Estrategia de cotización al tope de 25 UMAs para alcanzar el máximo beneficio de ley.`,
                absoluteMaxStrategyData, 'indigo'
            ));
        }

        return cards;
    }, [scenarioA.input]);

    const [selectedStrat, setSelectedStrat] = React.useState<string | null>(null);

    const getModalParams = () => {
        if (!selectedStrat) return null;
        const stratData = strategies.find(s => s.id === selectedStrat);
        if (!stratData) return null;

        // Discrete parameters for Rampa
        const UMA_MONTHLY = legalData.uma_2026 * 30.416;
        const TOP_SALARY = UMA_MONTHLY * 25;
        const RAMPA_LOW_SALARY = Math.max(UMA_MONTHLY * 1.5, scenarioA.input.salary_prom * 30.416);

        const lowYears = stratData.lowYears || 0;

        return {
            strategyName: stratData.name,
            monthlyInvestment: stratData.avgMonthlyInvestment,
            targetDailySalary: lowYears > 0 ? (RAMPA_LOW_SALARY / 30.416) : stratData.rawTargetDaily,
            targetDailyHigh: lowYears > 0 ? (TOP_SALARY / 30.416) : undefined,
            splitYear: lowYears > 0 ? lowYears : undefined,
            input: {
                ...scenarioA.input,
                salary_prom: scenarioA.input.salary_prom, // Start from CURRENT salary in modal
            },
            strategyMode: 'modalidad40' as const
        };
    };

    const modalParams = getModalParams();
    const [showComparison, setShowComparison] = React.useState(false);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {strategies.map((strat) => (
                    <div key={strat.id} className={`bg-white rounded-2xl p-6 border transition-all relative overflow-hidden flex flex-col ${strat.color === 'indigo' ? 'border-indigo-100 hover:border-indigo-300 shadow-sm' : strat.color === 'emerald' ? 'border-emerald-100 hover:border-emerald-300 shadow-sm' : 'border-amber-400 shadow-xl scale-[1.02]'}`}>
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl opacity-10 rounded-bl-full -mr-10 -mt-10 transition-transform ${strat.color === 'indigo' ? 'from-indigo-600 to-transparent' : 'from-amber-600 to-transparent'}`}></div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full mb-3 inline-block shadow-sm ${strat.color === 'indigo' ? 'bg-slate-100 text-slate-500' : strat.color === 'emerald' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                    {strat.id === 'maximo' ? (
                                        <span className="flex items-center gap-1 group/tooltip relative cursor-help">
                                            Tope Legal (25 UMAs) <Info size={12} />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl opacity-0 translate-y-2 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 transition-all pointer-events-none z-50 normal-case tracking-normal">
                                                Unidad de Medida y Actualización utilizada por el IMSS. Es el máximo legal permitido para cotizar.
                                            </div>
                                        </span>
                                    ) : '🏆 Mejor Elección'}
                                </span>
                                <h3 className="text-xl font-bold text-slate-800 leading-tight">{strat.name}</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">{strat.description}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6 relative z-10 flex-grow">
                            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex flex-col justify-center">
                                <p className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase mb-1">Costo Mensual de Estrategia</p>
                                <p className="text-3xl font-black text-indigo-900">
                                    ${strat.avgMonthlyInvestment.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                                </p>
                                <p className="text-[9px] text-indigo-500 font-bold mt-1 uppercase">
                                    Durante {strat.lowYears + strat.highYears} años
                                </p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                                    <p className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">Pensión Mensual Neta</p>
                                    <p className="text-2xl font-black text-emerald-900">
                                        ${strat.netPension.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <TrendingUp size={10} className="text-emerald-600" />
                                        <span className="text-[10px] font-bold text-emerald-600">+${strat.delta.toLocaleString('es-MX', { maximumFractionDigits: 0 })}/mes extra</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Inversión Total Proyectada</p>
                                <p className="text-sm font-bold text-slate-700">${strat.totalInvestment.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Tiempo de Recuperación</p>
                                <p className="text-sm font-bold text-slate-700">{Math.ceil(strat.roiMonths)} meses ({Math.ceil(strat.roiMonths / 12)} años)</p>
                            </div>
                        </div>

                        <div className="relative z-10 mt-auto pt-4 border-t border-slate-100 mb-4">
                            <p className="text-xs font-medium text-slate-600 text-center">
                                En 20 años de pensión, esta estrategia generaría <b className="text-emerald-700">${strat.lifetimeImpact.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</b> adicionales.
                            </p>
                        </div>

                        <button
                            onClick={() => setSelectedStrat(strat.id)}
                            className={`w-full py-4 rounded-xl font-bold transition-transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg flex items-center justify-center gap-2 ${strat.color === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-600/30' : strat.color === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-600/30' : 'bg-amber-500 hover:bg-amber-400 text-amber-950 hover:shadow-amber-500/30'}`}
                        >
                            Ver desglose completo
                            <ArrowRight size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex-1">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                        <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Motor Actuarial</span>
                        Conclusión del Sistema
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Con base en tus datos actuales, la <b>Estrategia Recomendada</b> maximiza tu pensión sin requerir el gasto del tope legal completo. Ambas opciones superan ampliamente la inflación, pero la recomendada protege tu liquidez a corto plazo.
                    </p>
                </div>
                <div className="shrink-0 w-full md:w-auto text-center flex flex-col md:flex-row gap-3">
                    <button
                        onClick={() => setShowComparison(!showComparison)}
                        className="w-full md:w-auto px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm text-sm"
                    >
                        {showComparison ? 'Ocultar Comparativa' : 'Vista Comparativa'}
                    </button>
                    <button className="w-full md:w-auto px-6 py-3 bg-indigo-600 border-2 border-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:border-indigo-700 transition-colors shadow-sm text-sm">
                        Exportar PDF
                    </button>
                </div>
            </div>
            {showComparison && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-12 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Análisis Comparativo Directo</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                    <th className="p-4 rounded-tl-lg">Escenario</th>
                                    <th className="p-4">Pensión Neta</th>
                                    <th className="p-4">Inversión</th>
                                    <th className="p-4">ROI</th>
                                    <th className="p-4 rounded-tr-lg">Aumento Mensual</th>
                                </tr>
                            </thead>
                            <tbody>
                                {strategies.map((strat, i) => (
                                    <tr key={strat.id} className={`border-b border-slate-100 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-indigo-50/50`}>
                                        <td className="p-4 font-bold text-slate-800 text-sm">{strat.name}</td>
                                        <td className="p-4 font-bold text-indigo-600 text-sm">${strat.netPension.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</td>
                                        <td className="p-4 text-slate-600 text-sm">${strat.totalInvestment.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</td>
                                        <td className="p-4 text-slate-600 text-sm">{Math.ceil(strat.roiMonths)} meses</td>
                                        <td className="p-4 font-bold text-emerald-600 text-sm">+${strat.delta.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {modalParams && (
                <StrategyModal
                    isOpen={!!selectedStrat}
                    onClose={() => setSelectedStrat(null)}
                    strategyName={modalParams.strategyName}
                    input={modalParams.input}
                    strategyMode={modalParams.strategyMode}
                    monthlyInvestment={modalParams.monthlyInvestment}
                    targetDailySalary={modalParams.targetDailySalary}
                    targetDailyHigh={modalParams.targetDailyHigh}
                    splitYear={modalParams.splitYear}
                />
            )}
        </>
    );
};
