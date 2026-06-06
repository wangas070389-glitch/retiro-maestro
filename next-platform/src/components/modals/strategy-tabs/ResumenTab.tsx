import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle2 } from 'lucide-react';

interface ResumenTabProps {
    tabVariants: any;
    finalResult: {
        pension: number;
        investment: number;
        roi: number;
    };
    deltaMensual: number;
    porcentajeIncremento: number;
    lifetimeImpact: number;
    monthlyInvestment: number;
}

export const ResumenTab: React.FC<ResumenTabProps> = ({
    tabVariants,
    finalResult,
    deltaMensual,
    porcentajeIncremento,
    lifetimeImpact,
    monthlyInvestment
}) => {
    return (
        <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="p-8">
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
    );
};
