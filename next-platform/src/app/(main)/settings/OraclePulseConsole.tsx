'use client';

import { useState } from 'react';
import { updateManualAnchorAction } from '@/actions/oracle-actions';
import { Database, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    activeUma: number;
    activeInpc: number;
}

export function OraclePulseConsole({ activeUma, activeInpc }: Props) {
    const [uma, setUma] = useState(activeUma.toString());
    const [inpc, setInpc] = useState(activeInpc.toString());
    const [pending, setPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPending(true);

        const parsedUma = parseFloat(uma);
        const parsedInpc = parseFloat(inpc);

        if (isNaN(parsedUma) || isNaN(parsedInpc) || parsedUma <= 0 || parsedInpc <= 0) {
            toast.error("Veto Adversarial", { description: "Los valores inyectados deben ser numéricos y positivos." });
            setPending(false);
            return;
        }

        const res = await updateManualAnchorAction(parsedUma, parsedInpc);

        if (res.success) {
            toast.success("Oráculo Sobrescrito", {
                description: "La nueva UMA ha sido sellada en la base de datos maestra.",
            });
        } else {
            toast.error("Intercepción", {
                description: res.error || "Falla criptográfica al inyectar el oráculo.",
            });
        }

        setPending(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden relative">
            <h3 className="text-xl font-medium text-slate-800 dark:text-slate-100 flex items-center space-x-2 mb-6">
                <Database className="w-5 h-5 text-indigo-500" />
                <span>Inyección Manual (DOF)</span>
            </h3>

            <div className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                        <span>UMA (Diaria)</span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <input
                            type="number"
                            step="0.01"
                            value={uma}
                            onChange={e => setUma(e.target.value)}
                            disabled={pending}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-9 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                        <span>INPC (Tópico)</span>
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={inpc}
                        onChange={e => setInpc(e.target.value)}
                        disabled={pending}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
                    />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-6">
                    <button
                        type="submit"
                        disabled={pending}
                        className={`w-full group relative overflow-hidden rounded-xl border font-medium tracking-wide transition-all
                            ${pending
                                ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed'
                                : 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-600 dark:text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:shadow-[0_0_25px_rgba(239,68,68,0.2)]'
                            }
                            px-4 py-3.5
                        `}
                    >
                        <div className="relative z-10 flex items-center justify-center space-x-2">
                            {pending ? (
                                <span className="animate-pulse">NEGOCIANDO FIRMA SQL...</span>
                            ) : (
                                <>
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>SELLAR ORÃCULO</span>
                                </>
                            )}
                        </div>
                    </button>
                    <p className="text-center text-[10px] text-slate-400 mt-3 tracking-widest">
                        Acción Irreversible â€¢ Alteración Global
                    </p>
                </div>
            </div>
        </form>
    );
}
