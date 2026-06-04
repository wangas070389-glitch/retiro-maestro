'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSimulationsAction, deleteSimulationAction } from '@/actions/simulation-actions';
import { History, FileText, ChevronRight, Trash2, Calendar, DollarSign } from 'lucide-react';
import { useSimulationStore } from '@/store';
import { useToast } from './ui/toast-context';

export function SavedSimulations({ 
    clientId,
    onSelect
}: { 
    clientId?: string | null;
    onSelect?: (sim: any) => void;
}) {
    const [simulations, setSimulations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { updateScenarioA } = useSimulationStore();
    const { showToast } = useToast();

    const loadSimulations = useCallback(async () => {
        setLoading(true);
        const res = await getSimulationsAction(clientId);
        if (res.success && res.simulations) {
            setSimulations(res.simulations);
        }
        setLoading(false);
    }, [clientId]);

    useEffect(() => {
        loadSimulations();
    }, [loadSimulations]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('¿Estás seguro de que deseas borrar esta simulación?')) return;

        const res = await deleteSimulationAction(id, clientId);
        if (res.success) {
            showToast("Simulación eliminada", "success");
            setSimulations(sims => sims.filter(s => s.id !== id));
        } else {
            showToast("Error al eliminar", "error");
        }
    };

    if (loading && simulations.length === 0) return (
        <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="h-48 bg-slate-100 rounded"></div>
        </div>
    );

    if (simulations.length === 0) return null;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-600 font-bold text-xs tracking-wider border-b border-slate-100 pb-1.5">
                <History size={14} className="text-indigo-500" />
                <span>Mis Estudios</span>
                <span className="ml-auto text-slate-400 font-normal normal-case text-[10px]">{simulations.length} registros</span>
            </div>

            <div className="overflow-y-auto max-h-[160px] bg-white rounded-xl border border-slate-200 shadow-sm relative">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                        <tr className="border-b border-slate-200 shadow-sm">
                            <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">Nombre</th>
                            <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Semanas</th>
                            <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Pensión</th>
                            <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Fecha</th>
                            <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase text-right opacity-0">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {simulations.map((sim) => (
                            <tr
                                key={sim.id}
                                className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                                onClick={() => {
                                    updateScenarioA(sim.input);
                                    if (onSelect) {
                                        onSelect(sim);
                                    }
                                }}
                            >
                                <td className="px-4 py-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md group-hover:bg-indigo-100 transition-colors shrink-0">
                                            <FileText size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-slate-800 text-xs truncate max-w-[150px] group-hover:text-indigo-600 transition-colors">{sim.name}</div>
                                            <div className="text-[9px] text-slate-400 font-mono leading-none">ID: {sim.id.split('-')[0]}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-3 py-2">
                                    <div className="text-xs text-slate-600 font-medium">
                                        {sim.input.weeks} <span className="text-[9px] text-slate-400">sem</span>
                                    </div>
                                </td>
                                <td className="px-3 py-2">
                                    <div className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                                        <DollarSign size={10} strokeWidth={3} />
                                        {sim.result?.with_decree_111?.toLocaleString('es-MX', { maximumFractionDigits: 0 }) || sim.result?.netPension?.toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-3 py-2">
                                    <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                                        <Calendar size={10} />
                                        {new Date(sim.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-3 py-2 text-right">
                                    <button
                                        onClick={(e) => handleDelete(e, sim.id)}
                                        className="p-1.5 text-slate-305 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
