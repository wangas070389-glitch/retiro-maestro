'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ShieldCheck, Zap, ChevronRight, Check, Sparkles, Building2, Gavel, Heart, FileCheck, TrendingUp } from 'lucide-react';
import { upgradeTierAction } from '@/actions/monetization-actions';
import { useToast } from '../ui/toast-context';
import { PRICING_CONFIG, Role, Tier, PricingPlan } from '../../lib/config/pricing';

export function ProductPaywall({ isLockout = false }: { isLockout?: boolean }) {
    const { data: session } = useSession();
    const { showToast } = useToast();
    const [loading, setLoading] = useState<string | null>(null);

    const userRole = (session?.user as any)?.role as Role || 'USER';
    const userTier = (session?.user as any)?.tier as Tier || 'FREE';
    const isAdvisor = userRole === 'ADVISOR' || userRole === 'ADMIN';

    const handleUpgrade = async (tier: Tier) => {
        setLoading(tier);
        const res = await upgradeTierAction(tier);
        setLoading(null);
        if (res.success) {
            showToast(`¡Bienvenido al nivel ${tier}!`, "success");
            window.location.reload();
        } else {
            showToast(res.error || "Error al actualizar suscripción", "error");
        }
    };

    const plans: PricingPlan[] = [];
    if (isAdvisor) {
        if (PRICING_CONFIG.ADVISOR.STARTER) plans.push(PRICING_CONFIG.ADVISOR.STARTER as PricingPlan);
        if (PRICING_CONFIG.ADVISOR.GROWTH) plans.push(PRICING_CONFIG.ADVISOR.GROWTH as PricingPlan);
        if (PRICING_CONFIG.ADVISOR.PRO) plans.push(PRICING_CONFIG.ADVISOR.PRO as PricingPlan);
    } else {
        if (PRICING_CONFIG.USER.STRATEGY) plans.push(PRICING_CONFIG.USER.STRATEGY as PricingPlan);
        if (PRICING_CONFIG.USER.DOSSIER) plans.push(PRICING_CONFIG.USER.DOSSIER as PricingPlan);
    }

    // ═══ Role-Specific Content Maps ═══
    const content = isAdvisor ? {
        badge: 'Licencia Profesional',
        headline: isLockout 
            ? <>Cada mes sin optimizar,<br/><span className="text-amber-500 underline decoration-amber-500/30 underline-offset-8">pierdes oportunidades de cierre</span></>
            : <>Escala tu <span className="text-indigo-500">despacho</span></>,
        subtitle: 'Nuestros asesores aumentan su tasa de cierre hasta +200% con reportes certificados.',
        accentColor: 'indigo',
        planDescriptions: {
            STARTER: { tagline: 'Valida tu Despacho', description: 'Hasta 5 clientes activos. Genera ingresos desde el primer cierre.' },
            GROWTH: { tagline: 'Cierra Más Negocios', description: 'Reportes certificados que cierran ventas. Branding personalizado.' },
            PRO: { tagline: 'Escala Sin Límites', description: 'Capacidad ilimitada con marca blanca y automatización total.' },
        } as Record<string, { tagline: string; description: string }>,
        ctas: {
            STARTER: 'ACTIVAR DESPACHO',
            GROWTH: 'CERRAR MÁS NEGOCIOS',
            PRO: 'ESCALAR MI DESPACHO',
        } as Record<string, string>,
        lockoutCtas: {
            STARTER: 'GENERAR INGRESOS',
            GROWTH: 'ACTIVAR Y CERRAR',
            PRO: 'ESCALAR MI DESPACHO',
        } as Record<string, string>,
        proofText: 'Procesamiento Seguro de Pagos',
    } : {
        badge: 'Tu Pensión, Tu Decisión',
        headline: isLockout 
            ? <>Cada mes sin evaluar tu situación,<br/><span className="text-emerald-500 underline decoration-emerald-500/30 underline-offset-8">dejas dinero en la mesa</span></>
            : <>Desbloquea tu <span className="text-emerald-500">mejor pensión</span></>,
        subtitle: 'Descubre cuánto podrías recibir del IMSS con la estrategia correcta — sin intermediarios.',
        accentColor: 'emerald',
        planDescriptions: {
            STRATEGY: { tagline: '¿Cuánto puedo recibir?', description: 'Compara escenarios y encuentra tu mejor camino hacia la jubilación.' },
            DOSSIER: { tagline: 'Mi Expediente Completo', description: 'Descarga tu reporte oficial con respaldo legal para tu trámite ante el IMSS.' },
        } as Record<string, { tagline: string; description: string }>,
        ctas: {
            STRATEGY: 'QUIERO MI MEJOR PENSIÓN',
            DOSSIER: 'OBTENER MI EXPEDIENTE',
        } as Record<string, string>,
        lockoutCtas: {
            STRATEGY: 'VER MI MEJOR PENSIÓN',
            DOSSIER: 'OBTENER EXPEDIENTE',
        } as Record<string, string>,
        proofText: 'Procesamiento Seguro de Pagos',
    };

    const accent = content.accentColor;

    return (
        <div className={`relative group overflow-hidden rounded-[3rem] ${isLockout ? 'bg-transparent border-none shadow-none backdrop-blur-none p-4 md:p-8 my-4' : 'bg-white/40 dark:bg-slate-950/40 backdrop-blur-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8 md:p-16 my-12'} text-center transition-all hover:bg-white/10 dark:hover:bg-slate-900/10 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000`}>
            {/* Background Ambient Effects */}
            {!isLockout && (
                <>
                    <div className={`absolute -top-32 -left-32 w-80 h-80 bg-${accent}-500/10 rounded-full blur-[120px] animate-pulse`}></div>
                    <div className={`absolute -bottom-32 -right-32 w-80 h-80 bg-${accent === 'indigo' ? 'emerald' : 'amber'}-500/10 rounded-full blur-[120px] animate-pulse delay-700`}></div>
                </>
            )}

            <div className="relative z-10">
                {!isLockout && (
                    <div className={`inline-flex items-center gap-2 bg-${accent}-50 dark:bg-${accent}-900/30 text-${accent}-600 dark:text-${accent}-400 px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase mb-8 shadow-sm border border-${accent}-100 dark:border-${accent}-800/50`}>
                        {isAdvisor ? <ShieldCheck size={14} className="animate-bounce" /> : <Heart size={14} className="animate-bounce" />} {content.badge}
                    </div>
                )}
                
                <h2 className={`${isLockout ? 'text-2xl md:text-3xl mb-1 text-white' : 'text-3xl md:text-5xl mb-4 text-slate-900 dark:text-slate-50'} font-black tracking-tighter transition-transform group-hover:scale-[1.01] duration-700 leading-tight`}>
                    {content.headline}
                </h2>
                
                <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10 font-bold opacity-80 italic">
                    {content.subtitle}
                </p>

                {isLockout ? (
                    /* ═══ LOCKOUT MODE: Compact Triptych ═══ */
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-stretch">
                        {plans.map((plan) => {
                            const isPopular = plan.id === 'STRATEGY' || plan.id === 'GROWTH';
                            const isHighEnd = plan.id === 'DOSSIER' || plan.id === 'PRO';
                            const desc = content.planDescriptions[plan.id] || { tagline: '', description: '' };
                            const cta = content.lockoutCtas[plan.id] || 'ACTIVAR';
                            
                            return (
                                <div key={plan.id} className={`group/tier relative bg-[#151D2E] border ${isPopular ? `border-${accent}-500 shadow-2xl shadow-${accent}-500/10 scale-[1.01] z-20` : 'border-slate-800/60 opacity-90'} rounded-[1.5rem] p-4 lg:p-5 transition-all hover:scale-[1.02] hover:z-30 hover:opacity-100 flex flex-col h-full overflow-hidden`}>
                                    {isPopular && (
                                        <div className={`absolute top-0 right-1/2 translate-x-1/2 bg-${accent}-500 text-white text-[7px] font-black px-3 py-1 rounded-b-md tracking-[0.2em] shadow-lg z-20 uppercase`}>
                                            {isAdvisor ? 'RECOMENDADO' : 'MÁS POPULAR'}
                                        </div>
                                    )}

                                    {/* Identity */}
                                    <div className="mb-3 flex flex-col items-center text-center">
                                        <div className={`p-2 rounded-lg mb-2 shadow-inner ${isPopular ? `bg-${accent}-500 text-white scale-105` : 'bg-slate-800 text-slate-400'}`}>
                                            {isAdvisor ? <Building2 size={18} /> : isHighEnd ? <FileCheck size={18} /> : <Heart size={18} />}
                                        </div>
                                        <div className="flex flex-col gap-0 border-b border-slate-800/50 pb-2 mb-2 w-full">
                                            <p className={`text-[8px] font-black text-${accent}-500/80 uppercase tracking-[0.2em]`}>
                                                {desc.tagline}
                                            </p>
                                            <h3 className="text-lg font-black text-white tracking-tight leading-none mb-0.5">{plan.name}</h3>
                                        </div>
                                    </div>
                                    
                                    <p className="text-[9px] text-slate-400 font-bold mb-3 italic leading-tight h-10 flex items-center justify-center px-2">
                                        {desc.description}
                                    </p>

                                    {/* Features */}
                                    <div className="flex-grow border-y border-slate-800/40 py-3 my-3">
                                        <ul className="flex flex-col gap-y-2 w-full h-full justify-center">
                                            {plan.features.slice(0, 4).map((feat, i) => (
                                                <li key={i} className="flex gap-2 text-[9px] text-slate-400 items-start font-bold tracking-tight text-left whitespace-nowrap">
                                                    <div className={`shrink-0 p-0.5 rounded-full mt-0.5 ${isPopular ? `bg-${accent}-500/10 text-${accent}-500` : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                        <Check size={8} strokeWidth={4} />
                                                    </div>
                                                    <span className="leading-tight opacity-90">{feat}</span>
                                                </li>
                                            ))}
                                            {isHighEnd && (
                                                <li className={`flex gap-2 text-[8px] text-${accent}-500/50 items-center font-black uppercase tracking-widest mt-1 border-t border-slate-800/50 pt-2`}>
                                                    <Sparkles size={8} />
                                                    {isAdvisor ? 'Incluye todo Starter' : 'Incluye todo de Mi Mejor Pensión'}
                                                </li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* Pricing & CTA */}
                                    <div className="flex flex-col items-center gap-1.5 mt-auto">
                                        <div className="text-center leading-none mb-1">
                                            <div className="flex items-baseline gap-1 justify-center">
                                                <span className={`${isPopular ? 'text-4xl' : 'text-2xl'} font-black text-white tracking-tighter`}>${plan.price.toLocaleString()}</span>
                                                <span className="text-[8px] font-black text-slate-600 tracking-[0.2em] uppercase text-right leading-none">MXN</span>
                                            </div>
                                            {!isAdvisor && plan.price > 0 && (
                                                <div className="text-[8px] font-bold text-emerald-400 mt-0.5 tracking-widest uppercase">
                                                    PAGO ÚNICO
                                                </div>
                                            )}
                                            {isAdvisor && isPopular && (
                                                <div className="text-[8px] font-bold text-emerald-400 mt-0.5 tracking-widest uppercase animate-pulse">
                                                    ROI Est. 7.5x
                                                </div>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => handleUpgrade(plan.id)}
                                            disabled={!!loading || userTier === plan.id}
                                            className={`w-full py-3.5 rounded-lg font-black transition-all shadow-xl active:scale-95 text-[9px] tracking-widest uppercase flex items-center justify-center gap-2 ${
                                                userTier === plan.id 
                                                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed shadow-none'
                                                    : isPopular 
                                                        ? `bg-${accent}-500 hover:bg-white text-white hover:text-slate-900 shadow-${accent}-500/20` 
                                                        : 'bg-white/5 hover:bg-white/10 hover:text-white text-slate-400 border border-slate-800'
                                            }`}
                                        >
                                            {loading === plan.id ? <Sparkles className="animate-spin w-3 h-3" /> : userTier === plan.id ? 'ACTIVO' : (
                                                <><span>{cta}</span> <ChevronRight size={12} /></>
                                            )}
                                        </button>
                                        
                                        {/* Trust Anchors */}
                                        <div className="mt-2 flex flex-col items-center gap-1.5 opacity-40">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1">
                                                    <Check size={8} className="text-emerald-500" />
                                                    <span className="text-[7px] font-bold text-slate-400 uppercase">Ley 73 IMSS</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Check size={8} className="text-emerald-500" />
                                                    <span className="text-[7px] font-bold text-slate-400 uppercase">{isAdvisor ? 'Sin Permanencia' : 'Sin Suscripción'}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 grayscale brightness-200">
                                                 <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-2.5" />
                                                 <div className="w-px h-2 bg-slate-500"></div>
                                                 <ShieldCheck size={8} className="text-white" />
                                                 <span className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter">Datos protegidos</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* ═══ STANDARD MODE: Dashboard Paywall Grid ═══ */
                    <div className={`grid grid-cols-1 ${plans.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-8 text-left`}>
                        {plans.map((plan) => {
                            const isPopular = plan.id === 'STRATEGY' || plan.id === 'GROWTH';
                            const isHighEnd = plan.id === 'DOSSIER' || plan.id === 'PRO';
                            const desc = content.planDescriptions[plan.id] || { tagline: '', description: '' };
                            const cta = content.ctas[plan.id] || 'DESBLOQUEAR';

                            return (
                                <div key={plan.id} className={`relative group/card bg-white/80 dark:bg-slate-900/80 border ${isPopular ? `border-${accent}-500 shadow-${accent}-500/10` : 'border-slate-200 dark:border-slate-800 shadow-sm'} rounded-[2.5rem] p-8 transition-all hover:shadow-2xl hover:-translate-y-2 flex flex-col`}>
                                    {isPopular && (
                                        <div className={`absolute top-0 right-10 -translate-y-1/2 bg-gradient-to-r from-${accent}-600 to-${accent}-500 text-white text-[10px] font-black px-4 py-2 rounded-full tracking-widest shadow-lg z-20`}>
                                            {isAdvisor ? 'POPULAR' : 'MÁS ELEGIDO'}
                                        </div>
                                    )}
                                    
                                    <div className="mb-8 flex justify-between items-start">
                                        <div className={`p-4 rounded-2xl ${isHighEnd ? 'bg-amber-50 dark:bg-amber-900/50 text-amber-600' : `bg-${accent}-50 dark:bg-${accent}-900/50 text-${accent}-600`}`}>
                                            {isAdvisor ? <Building2 size={24} /> : isHighEnd ? <FileCheck size={24} /> : <Heart size={24} />}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                {plan.billing === 'one-time' ? 'Pago Único' : 'Mensual'}
                                            </p>
                                            <div className="flex items-baseline justify-end gap-1">
                                                <span className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tighter">${plan.price.toLocaleString()}</span>
                                                <span className="text-sm font-bold text-slate-400">MXN</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-0.5">
                                        <p className={`text-[10px] font-black text-${accent}-600 dark:text-${accent}-400 uppercase tracking-[0.2em] mb-1`}>
                                            {desc.tagline}
                                        </p>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2 leading-tight">{plan.name}</h3>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-6 font-bold italic">
                                        {desc.description}
                                    </p>
                                    
                                    <ul className="space-y-4 mb-12 flex-grow">
                                        {plan.features.map((feat, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400 items-start">
                                                <div className={`mt-1 p-0.5 rounded-full ${isPopular ? `bg-${accent}-100 dark:bg-${accent}-900/50 text-${accent}-600` : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600'}`}>
                                                    <Check size={12} strokeWidth={4} />
                                                </div>
                                                <span className="leading-tight">{feat}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button 
                                        onClick={() => handleUpgrade(plan.id)}
                                        disabled={!!loading || userTier === plan.id}
                                        className={`w-full py-5 rounded-3xl font-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                                            userTier === plan.id 
                                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                                                : isPopular 
                                                    ? `bg-${accent}-600 hover:bg-${accent}-500 text-white shadow-${accent}-600/20` 
                                                    : 'bg-slate-950 hover:bg-slate-900 text-white dark:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {loading === plan.id ? (
                                            <Sparkles className="w-5 h-5 animate-spin" />
                                        ) : userTier === plan.id ? 'Ya lo tienes' : (
                                            <><span>{cta}</span> <ChevronRight size={18} /></>
                                        )}
                                    </button>
                                    
                                    <div className="mt-4 flex items-center justify-center gap-3 opacity-30 grayscale scale-90">
                                         <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
                                         <div className="w-px h-3 bg-slate-400"></div>
                                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">{content.proofText}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!isLockout && (
                    <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6 opacity-40 grayscale transition-all hover:grayscale-0 hover:opacity-100 cursor-help">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-6" />
                            <div className="w-px h-6 bg-slate-300"></div>
                            <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">{content.proofText}</span>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm text-center md:text-right leading-relaxed font-medium">
                            {isAdvisor 
                                ? 'Retiro Maestro cumple con los estándares de seguridad bancaria. Sus datos financieros nunca se guardan en nuestros servidores.'
                                : 'Tu información personal está protegida. Nunca compartimos ni almacenamos datos financieros en nuestros servidores.'}
                        </p>
                    </div>
                )}

                {isLockout && (
                    <div className="mt-6 opacity-20 flex items-center justify-center gap-6">
                         <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.3em] max-w-[400px] leading-tight text-center">
                            {isAdvisor 
                                ? 'Seguridad Bancaria • Encriptación 256-bit • Datos nunca almacenados'
                                : 'Tu información protegida • Sin suscripción ni renovación • Pago único seguro'}
                         </p>
                    </div>
                )}
            </div>
        </div>
    );
}
