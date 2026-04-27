import React from 'react';
import { Lock, Clock, BarChart3, LogOut, ShieldCheck, AlertCircle, TrendingDown, Hourglass, Heart, Landmark } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { ProductPaywall } from '../monetization/ProductPaywall';

interface TrialLockoutProps {
    reason: string;
    daysRemaining: number;
    simulationsUsed: number;
    simulationsMax: number;
}

export const TrialLockout: React.FC<TrialLockoutProps> = ({
    reason,
    daysRemaining,
    simulationsUsed,
    simulationsMax,
}) => {
    const { data: session } = useSession();
    const isAdvisor = session?.user?.role === 'ADVISOR' || session?.user?.role === 'ADMIN';
    const isTimeExpired = daysRemaining <= 0;
    const isLimitReached = simulationsUsed >= simulationsMax;

    // ═══ Role-Specific COI (Cost of Inaction) Content ═══
    const coiContent = isAdvisor ? {
        badge: 'Riesgo de Inacción',
        badgeColor: 'red',
        title: <>Coste de<br/>Demora</>,
        narrative: <>Cada mes sin optimizar representa una <span className="text-red-600 underline decoration-red-500/20 underline-offset-4">pérdida de ingresos</span> real por falta de capacidad instalada.</>,
        metrics: [
            {
                icon: <TrendingDown size={18} className="text-red-500 mb-2" />,
                label: 'Pérdida de Ingresos / Mes',
                value: '+$12,500',
                unit: 'MXN',
                detail: 'Basado en 3 clientes activos promedio',
                alertText: 'CAPACIDAD NO UTILIZADA',
                alertColor: 'red',
                borderColor: 'red',
            },
            {
                icon: <Hourglass size={18} className="text-amber-500 mb-2" />,
                label: 'Tiempo Crítico Restante',
                value: '13 Días',
                unit: '',
                detail: '',
                alertText: 'Para ventana crítica M40',
                alertColor: 'amber',
                borderColor: 'amber',
            },
        ],
        footer: 'Retiro Seguro Actuarial',
    } : {
        badge: 'Tu Pensión Puede Ser Más Alta',
        badgeColor: 'emerald',
        title: <>Lo que Podrías<br/>Estar Recibiendo</>,
        narrative: <>Cada mes sin evaluar tu situación es dinero que <span className="text-emerald-600 underline decoration-emerald-500/20 underline-offset-4">dejas en la mesa</span>. Miles de personas ya descubrieron cómo mejorar su pensión.</>,
        metrics: [
            {
                icon: <Landmark size={18} className="text-emerald-500 mb-2" />,
                label: 'Diferencia Mensual Posible',
                value: '+$6,800',
                unit: 'MXN',
                detail: 'Promedio con estrategia Modalidad 40',
                alertText: 'PENSIÓN SIN OPTIMIZAR',
                alertColor: 'emerald',
                borderColor: 'emerald',
            },
            {
                icon: <Hourglass size={18} className="text-amber-500 mb-2" />,
                label: 'Tiempo Para Decidir',
                value: 'Ahora',
                unit: '',
                detail: '',
                alertText: 'Tu ventana de oportunidad se cierra',
                alertColor: 'amber',
                borderColor: 'amber',
            },
        ],
        footer: 'Calculadora Certificada Ley 73',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md overflow-y-auto p-4">
            <div className="w-full max-w-7xl mx-auto animate-in zoom-in-95 duration-500 my-8">
                <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 relative">
                    {/* Header gradient */}
                    <div className={`h-2 bg-gradient-to-r ${isAdvisor ? 'from-red-500 via-amber-500 to-indigo-600' : 'from-emerald-500 via-teal-500 to-indigo-500'}`} />
                    
                    {/* Logout Button */}
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="absolute top-8 right-12 inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all z-30 bg-slate-900/20 hover:bg-red-500/20 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/5 shadow-xl group/logout"
                        title="Cerrar sesión"
                    >
                        <span className="opacity-60 group-hover/logout:opacity-100">Cerrar sesión</span>
                        <LogOut size={16} className="text-red-500/50 group-hover/logout:text-red-500 transition-colors" />
                    </button>

                    <div className="flex flex-col lg:flex-row min-h-[500px] border-t border-slate-100">
                        {/* LEFT COLUMN - COI DASHBOARD */}
                        <div className="p-6 lg:w-[32%] border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col items-center justify-center text-center bg-slate-50/50">
                            {/* Urgency Badge */}
                            <div className={`inline-flex items-center gap-2 bg-${coiContent.badgeColor}-500/10 text-${coiContent.badgeColor}-600 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase mb-4 shadow-sm border border-${coiContent.badgeColor}-500/20`}>
                                {isAdvisor ? <AlertCircle size={10} className="animate-pulse" /> : <Heart size={10} className="animate-pulse" />} {coiContent.badge}
                            </div>

                            {/* Header */}
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-3 leading-none">
                                {coiContent.title}
                            </h2>

                            {/* Narrative */}
                            <p className="text-slate-500 mb-6 max-w-xs leading-relaxed text-[10px] font-bold px-4 italic">
                                {coiContent.narrative}
                            </p>

                            {/* Metric Grid */}
                            <div className="grid grid-cols-1 gap-4 w-full px-6">
                                {coiContent.metrics.map((metric, idx) => (
                                    <div key={idx} className={`bg-white p-3.5 rounded-xl border border-${metric.borderColor}-100 shadow-sm flex flex-col items-center group hover:border-${metric.borderColor}-500/50 transition-colors`}>
                                        {metric.icon}
                                        <div className="text-center">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none">{metric.label}</p>
                                            <div className="flex flex-col items-center gap-1">
                                                <p className="text-xl font-black text-slate-900 tracking-tighter">
                                                    {metric.value} {metric.unit && <span className="text-[10px] text-slate-400">{metric.unit}</span>}
                                                </p>
                                                {metric.detail && (
                                                    <p className="text-[7px] font-bold text-slate-400 opacity-60 leading-none">{metric.detail}</p>
                                                )}
                                            </div>
                                            <p className={`text-[7px] font-bold text-${metric.alertColor}-500 mt-2 bg-${metric.alertColor}-50 px-2 py-0.5 rounded-full inline-block uppercase animate-pulse`}>
                                                {metric.alertText}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-200/60 w-full">
                                <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">{coiContent.footer}</p>
                            </div>
                        </div>

                        {/* RIGHT COLUMN - PAYWALL */}
                        <div className="lg:w-[68%] bg-[#0B1221] flex flex-col justify-center relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-[800px] h-[800px] bg-${isAdvisor ? 'indigo' : 'emerald'}-500/5 rounded-full blur-[160px] pointer-events-none`}></div>
                            
                            <div className="relative z-10 w-full max-h-[90vh] flex items-center justify-center px-6 lg:px-8 py-6 dark">
                                <div className="w-full">
                                    <ProductPaywall isLockout={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
