'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, ShieldCheck } from 'lucide-react';
import { updateUserActuarialAction } from '@/actions/user-actions';
import { useToast } from '@/components/ui/toast-context';

interface DossierTabProps {
    session: any;
    updateSession: (data?: any) => Promise<any>;
}

export function DossierTab({ session, updateSession }: DossierTabProps) {
    const { showToast } = useToast();
    const [age, setAge] = useState<number>(60);
    const [currentWeeks, setCurrentWeeks] = useState<number>(500);
    const [avgSalary, setAvgSalary] = useState<number>(0);
    const [lastBajaDate, setLastBajaDate] = useState<string>('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (session?.user) {
            setAge((session.user as any)?.age || 60);
            setCurrentWeeks((session.user as any)?.currentWeeks || 500);
            setAvgSalary((session.user as any)?.avgSalary || 0);
            const rawBaja = (session.user as any)?.lastBajaDate;
            if (rawBaja) {
                setLastBajaDate(new Date(rawBaja).toISOString().split('T')[0]);
            }
        }
    }, [session]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsUpdating(true);
        const res = await updateUserActuarialAction(age, currentWeeks, avgSalary, lastBajaDate || null);
        if (res.success && res.user) {
            showToast("Dossier Actuarial sincronizado y verificado", "success");
            await updateSession({ user: res.user });
        } else {
            showToast(res.error || "Error desconocido", "error");
        }
        setIsUpdating(false);
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                    Dossier Actuarial
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                    Tu perfil de pensión IMSS Ley 73. Estos datos alimentan todas las simulaciones y reportes.
                </p>
            </div>

            {/* Current Values Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Edad', value: `${age} años`, color: 'indigo' },
                    { label: 'Semanas', value: currentWeeks.toLocaleString(), color: 'emerald' },
                    { label: 'Salario Prom.', value: `$${avgSalary.toLocaleString()}`, color: 'amber' },
                    { label: 'Fecha Baja', value: lastBajaDate || 'Sin registro', color: 'slate' },
                ].map((item, idx) => (
                    <div key={idx} className={`bg-${item.color}-50 dark:bg-${item.color}-950/20 border border-${item.color}-200 dark:border-${item.color}-800 rounded-xl p-4`}>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                        <p className="text-lg font-bold text-slate-800 dark:text-white mt-1">{item.value}</p>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">Edad Actual</label>
                        <input
                            type="number"
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-200"
                            placeholder="Edad en años"
                            value={age}
                            onChange={(e) => setAge(parseInt(e.target.value))}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">Semanas Cotizadas (Art. 150)</label>
                        <input
                            type="number"
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-200"
                            placeholder="Semanas totales"
                            value={currentWeeks}
                            onChange={(e) => setCurrentWeeks(parseInt(e.target.value))}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">Salario Promedio (Últ. 5 años)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-200"
                            placeholder="$ MXN diarios"
                            value={avgSalary}
                            onChange={(e) => setAvgSalary(parseFloat(e.target.value))}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">Fecha de Baja</label>
                        <input
                            type="date"
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-200"
                            value={lastBajaDate}
                            onChange={(e) => setLastBajaDate(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-indigo-600 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <ShieldCheck size={18} />
                    {isUpdating ? 'Sincronizando...' : 'Validar y Sincronizar Dossier'}
                </button>
            </form>
        </div>
    );
}
