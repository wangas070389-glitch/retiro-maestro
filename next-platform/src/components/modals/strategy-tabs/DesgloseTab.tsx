import React from 'react';
import { motion } from 'framer-motion';

interface DesgloseTabProps {
    tabVariants: any;
    projectionData: any[];
    breakevenYear: number;
}

export const DesgloseTab: React.FC<DesgloseTabProps> = ({
    tabVariants,
    projectionData,
    breakevenYear
}) => {
    return (
        <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="p-8 h-full">
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
    );
};
