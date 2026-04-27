'use client';

import { useState } from 'react';
import { Pencil, Save, X, Calendar, Calculator, Clock } from 'lucide-react';
import { updateActuarialDataAction } from '@/actions/advisor-actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ActuarialHeaderProps {
    clientId: string;
    isLead: boolean;
    initialData: {
        age: number;
        currentWeeks: number;
        avgSalary: number;
        lastBajaDate: string | null;
    };
    clientName: string;
    clientEmail: string;
}

export function ActuarialHeader({ clientId, isLead, initialData, clientName, clientEmail }: ActuarialHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialData);
    const router = useRouter();

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await updateActuarialDataAction(clientId, isLead, formData);
            if (res.success) {
                toast.success("Perfil Actuarial Actualizado");
                setIsEditing(false);
                router.refresh();
            } else {
                toast.error(res.error || "Error al actualizar");
            }
        } catch (e) {
            toast.error("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    if (isEditing) {
        return (
            <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-3xl p-6 shadow-xl animate-in zoom-in-95 duration-200">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{clientName}</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-mono mt-1">{clientEmail}</p>
                    </div>

                    <div className="flex flex-wrap gap-4 lg:gap-8 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl w-full xl:w-auto">
                        <div className="flex flex-col min-w-[100px]">
                            <label className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Edad Actual</label>
                            <input 
                                type="number" 
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-lg font-bold"
                                value={formData.age}
                                onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                                title="Edad Actual del Cliente"
                            />
                        </div>
                        <div className="flex flex-col min-w-[120px]">
                            <label className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Semanas (Art.150)</label>
                            <input 
                                type="number" 
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-lg font-bold"
                                value={formData.currentWeeks}
                                onChange={(e) => setFormData({...formData, currentWeeks: parseInt(e.target.value)})}
                                title="Semanas Cotizadas"
                            />
                        </div>
                        <div className="flex flex-col min-w-[140px]">
                            <label className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Sal. Prom (Ult. 5)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-lg font-bold"
                                value={formData.avgSalary}
                                onChange={(e) => setFormData({...formData, avgSalary: parseFloat(e.target.value)})}
                                title="Salario Promedio"
                            />
                        </div>
                        <div className="flex flex-col min-w-[160px]">
                            <label className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Fecha Baja</label>
                            <input 
                                type="date" 
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm font-bold"
                                value={formData.lastBajaDate || ''}
                                onChange={(e) => setFormData({...formData, lastBajaDate: e.target.value})}
                                title="Fecha de Última Baja"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 w-full xl:w-auto">
                        <button 
                            onClick={handleSave}
                            disabled={loading}
                            className="flex-1 xl:flex-none bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                        >
                            <Save size={18} /> {loading ? 'Sincronizando...' : 'Guardar'}
                        </button>
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-slate-200"
                            title="Cancelar Edición"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            onClick={() => setIsEditing(true)}
            className="group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 hover:border-indigo-300 dark:hover:border-indigo-900 transition-all"
        >
            <div className="relative">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {clientName}
                    <Pencil size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-mono mt-1">{clientEmail}</p>
            </div>

            <div className="flex flex-wrap gap-4 lg:gap-8">
                <div className="flex flex-col group/item">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Clock size={10} /> Edad Actual
                    </span>
                    <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">{formData.age} Años</span>
                </div>
                <div className="flex flex-col border-l border-slate-200 dark:border-slate-700 pl-4 lg:pl-8">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Calculator size={10} /> Semanas (Art.150)
                    </span>
                    <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">{formData.currentWeeks} SS</span>
                </div>
                <div className="flex flex-col border-l border-slate-200 dark:border-slate-700 pl-4 lg:pl-8">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Save size={10} /> Sal. Prom (Ult. 5)
                    </span>
                    <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">${formData.avgSalary.toFixed(2)} MXN</span>
                </div>
                <div className="flex flex-col border-l border-slate-200 dark:border-slate-700 pl-4 lg:pl-8">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Calendar size={10} /> Fecha Baja
                    </span>
                    <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        {formData.lastBajaDate ? new Date(formData.lastBajaDate).toISOString().split('T')[0] : 'N/A'}
                    </span>
                </div>
            </div>
        </div>
    );
}
