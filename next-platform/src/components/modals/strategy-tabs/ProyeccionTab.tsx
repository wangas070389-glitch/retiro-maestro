import React from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';

interface ProyeccionTabProps {
    tabVariants: any;
    projectionData: any[];
    breakevenRow: any;
    breakevenYear: number;
}

export const ProyeccionTab: React.FC<ProyeccionTabProps> = ({
    tabVariants,
    projectionData,
    breakevenRow,
    breakevenYear
}) => {
    return (
        <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="p-8 h-full flex flex-col">
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
    );
};
