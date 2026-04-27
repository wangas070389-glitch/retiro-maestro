'use client';

import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { updateGeoConfigAction } from '@/actions/user-actions';
import { useToast } from '@/components/ui/toast-context';

interface OperationTabProps {
    session: any;
    updateSession: (data?: any) => Promise<any>;
}

export function OperationTab({ session, updateSession }: OperationTabProps) {
    const { showToast } = useToast();
    const [operationState, setOperationState] = useState('');
    const [remoteReady, setRemoteReady] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (session?.user) {
            setOperationState((session.user as any)?.operationState || '');
            setRemoteReady((session.user as any)?.remoteReady || false);
        }
    }, [session]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsUpdating(true);
        const res = await updateGeoConfigAction(operationState, remoteReady);
        if (res.success && res.user) {
            showToast("Matriz Geográfica actualizada exitosamente", "success");
            await updateSession();
        } else {
            showToast(res.error || "Error desconocido", "error");
        }
        setIsUpdating(false);
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                    Enrutamiento Geográfico
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                    Define tu zona de operación para que el sistema de leads pueda conectarte con ciudadanos cercanos.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">Estado de Operación</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <MapPin size={16} />
                        </div>
                        <select
                            aria-label="Estado de Operación"
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-slate-200"
                            value={operationState}
                            onChange={(e) => setOperationState(e.target.value)}
                            required
                        >
                            <option value="" disabled>Seleccione un Estado</option>
                            <option value="CDMX">Ciudad de México</option>
                            <option value="Jalisco">Jalisco</option>
                            <option value="Nuevo Leon">Nuevo León</option>
                            <option value="Puebla">Puebla</option>
                            <option value="Queretaro">Querétaro</option>
                            <option value="Estado de Mexico">Estado de México</option>
                            <option value="Otro">Otro Estado (Nacional)</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/30 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <input
                        type="checkbox"
                        id="remoteReady"
                        className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                        checked={remoteReady}
                        onChange={(e) => setRemoteReady(e.target.checked)}
                    />
                    <div>
                        <label htmlFor="remoteReady" className="text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                            Disponible para Casos Remotos
                        </label>
                        <p className="text-[10px] text-slate-400 mt-0.5">Recibirás leads de clientes fuera de tu zona si no hay asesores disponibles.</p>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isUpdating ? 'Configurando...' : 'Actualizar Matriz Geográfica'}
                </button>
            </form>
        </div>
    );
}
