'use client';

import React, { useState, useMemo } from 'react';
import { 
    TrendingUp, 
    AlertCircle, 
    CheckCircle2, 
    Calendar, 
    DollarSign, 
    MessageCircle, 
    Clock, 
    ChevronRight,
    Save,
    ClipboardList,
    Smartphone,
    UserCheck,
    Briefcase,
    FileText,
    Target,
    BarChart3,
    CheckSquare,
    Zap
} from 'lucide-react';
import { M40MultiScenarioEngine, ScenarioResult } from '@/lib/engine/m40-multi-scenario';
import { updateClientCRMAction, selectClientStrategyAction, updateActuarialDataAction } from '@/actions/advisor-actions';
import { useToast } from '@/components/ui/toast-context';
import { motion, AnimatePresence } from 'framer-motion';
import { DossierGeneratorPanel } from '@/components/workspace/DossierGeneratorPanel';

interface ClosingTerminalProps {
    clientId: string;
    isLead: boolean;
    initialData: {
        name: string;
        age: number;
        currentWeeks: number;
        avgSalary: number;
        lastBajaDate: string;
        currentStage: string;
        notes: string;
        selectedStrategyId?: string;
    };
    agency: any;
}

export function ClosingTerminal({ clientId, isLead, initialData, agency }: ClosingTerminalProps) {
    const { showToast } = useToast();
    
    // --- 1. CORE STATE ---
    const [age, setAge] = useState(initialData.age);
    const [weeks, setWeeks] = useState(initialData.currentWeeks);
    const [salary, setSalary] = useState(initialData.avgSalary);
    
    // --- 2. CRM & TABS STATE ---
    const [activeTab, setActiveTab] = useState<'decision' | 'simulation' | 'execution' | 'crm' | 'dictamen'>('decision');
    const [stage, setStage] = useState(initialData.currentStage);
    const [notes, setNotes] = useState(initialData.notes || '');
    const [isSavingCRM, setIsSavingCRM] = useState(false);
    const [selectedId, setSelectedId] = useState(initialData.selectedStrategyId);

    // --- 3. REACTIVE CALCULATIONS ---
    const scenarios = useMemo(() => {
        const engine = new M40MultiScenarioEngine();
        return engine.runParallel({
            weeks,
            salary_prom: salary,
            age,
            has_wife: true,
            children_count: 0,
            dependent_parents_count: 0,
            is_ongoing_work: false
        });
    }, [age, weeks, salary]);

    const baseScenario = scenarios.find(s => s.type === 'BASE')!;
    const bestScenario = scenarios.reduce((prev, current) => 
        (current.result.net_pension > prev.result.net_pension) ? current : prev
    );

    const monthlyLoss = bestScenario.result.net_pension - baseScenario.result.net_pension;
    const lifetimeLoss = monthlyLoss * 12 * 20;

    // --- 4. SHARED ACTIONS ---
    async function handleUpdateCRM() {
        setIsSavingCRM(true);
        const res = await updateClientCRMAction(clientId, isLead, {
            currentStage: stage,
            notes: notes
        });
        if (res.success) {
            showToast("Gestión de cliente actualizada", "success");
        }
        setIsSavingCRM(false);
    }

    async function handleSelectStrategy(strat: ScenarioResult) {
        const res = await selectClientStrategyAction(clientId, isLead, strat.type, "Seleccionado via Terminal de Cierre.");
        if (res.success) {
            setSelectedId(strat.type);
            showToast(`Estrategia "${strat.name}" seleccionada`, "success");
        }
    }

    async function handleUpdateProfile() {
        setIsSavingCRM(true);
        const res = await updateActuarialDataAction(clientId, isLead, {
            age,
            currentWeeks: weeks,
            avgSalary: salary,
            // Keep existing lastBajaDate if possible or null (page refresh will reload from DB anyway)
            lastBajaDate: initialData.lastBajaDate
        });
        if (res.success) {
            showToast("Perfil de cliente actualizado con valores de simulación", "success");
        } else {
            showToast("Error al sincronizar con el perfil", "error");
        }
        setIsSavingCRM(false);
    }

    const tabs = [
        { id: 'decision', label: 'Decisión', icon: <Target size={18} />, color: 'text-rose-600', activeBg: 'bg-rose-50 dark:bg-rose-950/30' },
        { id: 'simulation', label: 'Simulación', icon: <TrendingUp size={18} />, color: 'text-indigo-600', activeBg: 'bg-indigo-50 dark:bg-indigo-950/30' },
        { id: 'execution', label: 'Ejecución', icon: <Zap size={18} />, color: 'text-emerald-600', activeBg: 'bg-emerald-50 dark:bg-emerald-950/30' },
        { id: 'crm', label: 'CRM / Gestión', icon: <Briefcase size={18} />, color: 'text-amber-600', activeBg: 'bg-amber-50 dark:bg-amber-950/30' },
        { id: 'dictamen', label: 'Dictamen', icon: <FileText size={18} />, color: 'text-slate-600', activeBg: 'bg-slate-50 dark:bg-slate-800' },
    ];

    return (
        <div className="space-y-8 min-h-screen pb-20">
            
            {/* 🧭 TAB NAVIGATION */}
            <nav className="flex flex-wrap items-center gap-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl sticky top-4 z-50 transition-all duration-500">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300
                                ${isActive 
                                    ? `${tab.activeBg} ${tab.color} shadow-inner scale-[1.02]` 
                                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}
                            `}
                        >
                            {tab.icon}
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* 🖼️ CONTENT AREA */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'decision' && (
                        <div className="max-w-6xl mx-auto space-y-8">
                            {/* Insight Block */}
                            <div className="bg-gradient-to-br from-rose-600 to-rose-700 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                                    <div className="space-y-4">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-xs font-black tracking-widest uppercase mb-2">
                                            <AlertCircle size={14} /> Insight Crítico
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-black leading-tight">
                                            Este cliente está perdiendo <br />
                                            <span className="text-amber-300">${monthlyLoss.toLocaleString('es-MX')} MXN</span> mensualmente.
                                        </h2>
                                        <p className="text-rose-100 text-lg max-w-xl leading-relaxed">
                                            Sin la estrategia <span className="font-bold text-white underline decoration-amber-300">{bestScenario.name}</span>, el impacto total en su vida de retiro será de <span className="text-white font-black">${lifetimeLoss.toLocaleString('es-MX')} MXN</span>.
                                        </p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/20 text-center shadow-inner">
                                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-rose-200 mb-2">Punto de Equilibrio</div>
                                        <div className="text-6xl font-black text-amber-300">
                                            {bestScenario.delta?.roiMonths.toFixed(1)}
                                        </div>
                                        <div className="text-sm font-bold uppercase tracking-widest opacity-60 mt-2">Meses de ROI</div>
                                    </div>
                                </div>
                            </div>

                            {/* Comparison Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {scenarios.map((sc) => (
                                    <div 
                                        key={sc.type}
                                        className={`p-8 rounded-[2.5rem] border transition-all duration-500 ${selectedId === sc.type ? 'bg-indigo-600 border-transparent text-white shadow-2xl scale-[1.02]' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}
                                    >
                                        <h3 className="text-xl font-black mb-6">{sc.name} {sc.type === 'OPTIMO_3Y' && '⭐'}</h3>
                                        <div className="space-y-4 mb-8">
                                            <div className="flex justify-between items-center py-2 border-b border-white/10">
                                                <span className="text-xs uppercase opacity-60 font-bold">Pensión</span>
                                                <span className="text-lg font-black">${sc.result.net_pension.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-white/10">
                                                <span className="text-xs uppercase opacity-60 font-bold">Incremento</span>
                                                <span className="font-bold text-emerald-400">+${sc.delta?.monthlyIncrement.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleSelectStrategy(sc)}
                                            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${selectedId === sc.type ? 'bg-white/20 text-white cursor-default' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-indigo-600 hover:text-white'}`}
                                        >
                                            {selectedId === sc.type ? 'Seleccionada' : 'Seleccionar'}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Script & CTA */}
                            <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-[2.5rem] p-10 border border-indigo-100 dark:border-indigo-900/40">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                                    <div className="space-y-4">
                                        <div className="text-xs font-black text-indigo-600 dark:text-indigo-400 tracking-widest uppercase">Argumentario Comercial</div>
                                        <blockquote className="text-xl italic text-slate-700 dark:text-slate-300 leading-relaxed">
                                            "Sr. {initialData.name.split(' ')[0]}, hoy su pensión es de ${baseScenario.result.net_pension.toLocaleString()}, pero activando {bestScenario.name} la subimos a ${bestScenario.result.net_pension.toLocaleString()}. Estamos hablando de asegurar ${lifetimeLoss.toLocaleString()} más para su familia."
                                        </blockquote>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button className="flex-1 bg-emerald-500 text-white p-6 rounded-3xl font-black flex items-center justify-center gap-3 hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 transition-all">
                                            <MessageCircle size={24} /> WhatsApp
                                        </button>
                                        <button className="flex-1 bg-blue-600 text-white p-6 rounded-3xl font-black flex items-center justify-center gap-3 hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all">
                                            <Smartphone size={24} /> Llamar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'simulation' && (
                        <div className="max-w-5xl mx-auto space-y-12">
                            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 shadow-2xl">
                                <h3 className="text-2xl font-black mb-10 flex items-center gap-3">
                                    <BarChart3 className="text-indigo-600" /> Taller de Simulación
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-10">
                                        <div className="space-y-6">
                                            <label className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">Edad Retirement: <span className="text-indigo-600 text-lg">{age}a</span></label>
                                            <input type="range" min="60" max="65" value={age} onChange={(e) => setAge(parseInt(e.target.value))} className="w-full h-3 bg-slate-100 rounded-full appearance-none accent-indigo-600" aria-label="Ajustar edad" />
                                        </div>
                                        <div className="space-y-6">
                                            <label className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">Semanas Totales: <span className="text-indigo-600 text-lg">{weeks} SS</span></label>
                                            <input type="number" value={weeks} onChange={(e) => setWeeks(parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800 border-none p-5 rounded-2xl text-xl font-black outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Semanas" />
                                        </div>
                                        <div className="space-y-6">
                                            <label className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">Salario Promedio: <span className="text-indigo-600 text-lg">${salary}</span></label>
                                            <input type="number" value={salary} onChange={(e) => setSalary(parseFloat(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800 border-none p-5 rounded-2xl text-xl font-black outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Salario" />
                                        </div>

                                        <div className="pt-4">
                                            <button 
                                                onClick={handleUpdateProfile}
                                                disabled={isSavingCRM}
                                                className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all"
                                            >
                                                {isSavingCRM ? <Clock className="animate-spin" /> : <Save />}
                                                Sincronizar con Perfil
                                            </button>
                                            <p className="text-[10px] text-slate-400 mt-3 text-center uppercase tracking-widest">
                                                Esto actualizará permanentemente los datos oficiales del cliente.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col justify-center gap-8">
                                        <div className="space-y-1">
                                            <div className="text-indigo-400 text-xs font-black uppercase tracking-widest uppercase">Nueva Pensión Estimativa</div>
                                            <div className="text-6xl font-black text-white">${bestScenario.result.net_pension.toLocaleString()}</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-white/5 rounded-2xl">
                                                <div className="text-[10px] uppercase font-bold opacity-40">ROI</div>
                                                <div className="text-xl font-black text-amber-300">{bestScenario.delta?.roiMonths.toFixed(1)}m</div>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-2xl">
                                                <div className="text-[10px] uppercase font-bold opacity-40">Incremento</div>
                                                <div className="text-xl font-black text-emerald-400">+${bestScenario.delta?.monthlyIncrement.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'execution' && (
                        <div className="max-w-4xl mx-auto space-y-8">
                            <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
                                <h3 className="text-2xl font-black mb-12 flex items-center gap-3"><Zap className="text-emerald-400" /> Hoja de Ruta Ejecutiva</h3>
                                
                                <div className="space-y-12">
                                    {[
                                        { step: 1, title: 'Baja Patronal', desc: 'Desconexión del régimen obligatorio para habilitar procesos especiales.', date: 'Hoy' },
                                        { step: 2, title: 'Inscripción Modalidad 40', desc: 'Alta proyectada con salario topado de 25 UMAs.', date: '+30 días' },
                                        { step: 3, title: 'Periodo de Aportación', desc: `Mantenimiento de salario por los meses requeridos.`, date: 'Siguiente fase' },
                                        { step: 4, title: 'Solicitud de Pensión', desc: `Tramitología ante el IMSS cumpliendo los ${age} años.`, date: 'Meta Final' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex gap-8 group">
                                            <div className="flex flex-col items-center">
                                                <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 flex items-center justify-center font-black text-lg bg-slate-800 transition-all group-hover:bg-emerald-500 group-hover:border-emerald-500">
                                                    {item.step}
                                                </div>
                                                {idx < 3 && <div className="w-0.5 flex-1 bg-slate-800 my-2" />}
                                            </div>
                                            <div className="pb-8">
                                                <div className="flex items-center gap-4 mb-2">
                                                    <h4 className="text-xl font-black">{item.title}</h4>
                                                    <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">{item.date}</span>
                                                </div>
                                                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'crm' && (
                        <div className="max-w-4xl mx-auto space-y-8">
                            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-200 dark:border-slate-800 shadow-2xl">
                                <h3 className="text-2xl font-black mb-10 flex items-center gap-3"><CheckSquare className="text-amber-500" /> Gestión del Proceso</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Etapa en el Pipeline</label>
                                            <div className="flex flex-col gap-2">
                                                {[
                                                    { id: 'PROSPECT', label: 'Prospecto Initial' },
                                                    { id: 'ANALYZING', label: 'En Diseño' },
                                                    { id: 'PROPOSAL_SENT', label: 'Propuesta Presentada' },
                                                    { id: 'CLOSED_WIN', label: 'Cierre Ganado' },
                                                    { id: 'CLOSED_LOSS', label: 'Cierre Perdido' },
                                                ].map((s) => (
                                                    <button 
                                                        key={s.id} 
                                                        onClick={() => setStage(s.id)}
                                                        className={`p-4 rounded-2xl text-left font-bold text-sm transition-all border-2 ${stage === s.id ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300' : 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-500'}`}
                                                    >
                                                        {s.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Bitácora de Sesión</label>
                                            <textarea 
                                                value={notes} onChange={(e) => setNotes(e.target.value)}
                                                className="w-full min-h-[300px] bg-slate-50 dark:bg-slate-800 rounded-[2rem] p-8 outline-none focus:ring-2 focus:ring-amber-500 text-slate-700 dark:text-slate-300"
                                                placeholder="Registra hitos, miedos o acuerdos con el cliente..."
                                            />
                                        </div>
                                        <button 
                                            onClick={handleUpdateCRM}
                                            disabled={isSavingCRM}
                                            className="w-full bg-slate-900 border-none dark:bg-white text-white dark:text-slate-900 py-6 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl"
                                        >
                                            {isSavingCRM ? <Clock className="animate-spin" /> : <Save />}
                                            Guardar Gestión
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'dictamen' && (
                        <div className="max-w-5xl mx-auto space-y-8">
                            <DossierGeneratorPanel 
                                agency={agency}
                                client={{ name: initialData.name, id: clientId }}
                                vigenciaStatus={true}
                                scenarios={scenarios}
                            />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
