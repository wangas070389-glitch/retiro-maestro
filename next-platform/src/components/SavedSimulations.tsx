'use client';

import { useEffect, useState } from 'react';
import { getSimulationsAction, deleteSimulationAction } from '@/actions/simulation-actions';
import { History, FileText, ChevronRight, Trash2, Calendar, DollarSign } from 'lucide-react';
import { useSimulationStore } from '@/store';
import { useToast } from './ui/toast-context';

export function SavedSimulations({ clientId }: { clientId?: string | null }) {
    const [simulations, setSimulations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { updateScenarioA } = useSimulationStore();
    const { showToast } = useToast();

    async function loadSimulations() {
        setLoading(true);
        const res = await getSimulationsAction(clientId);
        if (res.success && res.simulations) {
            setSimulations(res.simulations);
        }
        setLoading(false);
    }

    useEffect(() => {
        loadSimulations();
    }, []);

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
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-slate-600 font-bold text-xs tracking-wider border-b border-slate-100 pb-2">
                <History size={16} className="text-indigo-500" />
                <span>Mis Estudios</span>
                <span className="ml-auto text-slate-400 font-normal normal-case">{simulations.length} registros</span>
            </div>

            <div className="overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-3 text-xs font-bold text-slate-500">Estrategia / Nombre</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500">Semanas</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500">Pensión Estimada</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500">Fecha</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 text-right opacity-0">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {simulations.map((sim) => (
                            <tr
                                key={sim.id}
                                className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                                onClick={() => updateScenarioA(sim.input)}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                            <FileText size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{sim.name}</div>
                                            <div className="text-[10px] text-slate-400 font-mono">ID: {sim.id.split('-')[0]}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-slate-600 font-medium">
                                        {sim.input.weeks} <span className="text-[10px] text-slate-400">wks</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                                        <DollarSign size={12} strokeWidth={3} />
                                        {sim.result?.with_decree_111?.toLocaleString('es-MX', { maximumFractionDigits: 0 }) || sim.result?.netPension?.toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                                        <Calendar size={12} />
                                        {new Date(sim.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={(e) => handleDelete(e, sim.id)}
                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={16} />
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
