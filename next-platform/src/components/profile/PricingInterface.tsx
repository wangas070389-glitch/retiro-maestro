'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { PRICING_CONFIG, Tier, PricingPlan } from '@/lib/config/pricing';
import { CheckCircle2, ShieldCheck, ShieldAlert, Lock, ArrowRight, Heart, Briefcase } from 'lucide-react';

export function PricingInterface() {
    const { data: session } = useSession();
    const role = session?.user?.role || 'USER';
    const currentTier = (session?.user as any)?.tier || 'FREE';
    
    const roleConfig = PRICING_CONFIG[role as keyof typeof PRICING_CONFIG] || PRICING_CONFIG.USER;
    const plans = Object.values(roleConfig) as PricingPlan[];

    const isUser = role === 'USER';

    // Role-specific content
    const content = isUser ? {
        badge: 'Tu Pensión, Tu Decisión',
        badgeIcon: <Heart size={14} />,
        title: <>Entiende Tu Pensión <span className="text-emerald-600">Sin Depender de Nadie</span></>,
        subtitle: 'Cada nivel te da más claridad sobre cuánto puedes recibir del IMSS bajo la Ley 73 — sin intermediarios, sin letra pequeña.',
        billingLabel: 'Pago Único',
        ctaPrefix: 'Quiero',
        proofItems: [
            { icon: <ShieldAlert size={16} className="text-amber-500" />, text: 'Cálculos basados en la Ley del Seguro Social' },
            { icon: <Lock size={16} className="text-emerald-500" />, text: 'Tu información nunca se comparte' },
        ]
    } : {
        badge: 'Licencia Institucional B2B',
        badgeIcon: <Briefcase size={14} />,
        title: <>Escala tu Despacho con el <span className="text-indigo-600">Motor Actuarial</span></>,
        subtitle: 'Automatiza proyecciones Modalidad 40, genera reportes con tu marca y gestiona múltiples clientes desde una sola plataforma.',
        billingLabel: 'Mensual',
        ctaPrefix: 'Activar',
        proofItems: [
            { icon: <ShieldAlert size={16} className="text-amber-500" />, text: 'Auditoría Criptográfica Certificada' },
            { icon: <Lock size={16} className="text-emerald-500" />, text: 'Pagos Seguros vía Stripe' },
        ]
    };

    // Role-specific card accent colors
    const accentColor = isUser ? 'emerald' : 'indigo';

    return (
        <div className="w-full space-y-12 py-10">
            {/* Header */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 bg-${accentColor}-50 dark:bg-${accentColor}-950/30 text-${accentColor}-600 dark:text-${accentColor}-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-${accentColor}-100 dark:border-${accentColor}-900/40`}>
                    {content.badgeIcon} {content.badge}
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight">
                    {content.title}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
                    {content.subtitle}
                </p>
            </div>

            {/* Pricing Grid */}
            <div className={`grid grid-cols-1 ${plans.length <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 xl:grid-cols-3'} gap-6 max-w-5xl mx-auto`}>
                {plans.map((plan, idx) => {
                    const isCurrent = currentTier === plan.id;
                    // For USER: recommend STRATEGY (middle). For ADVISOR: recommend GROWTH (middle)
                    const isBestValue = isUser 
                        ? plan.id === 'STRATEGY' 
                        : plan.id === 'GROWTH';
                    
                    return (
                        <div 
                            key={plan.id}
                            className={`
                                relative p-7 rounded-3xl border transition-all duration-500 flex flex-col h-full
                                ${isCurrent 
                                    ? `bg-slate-900 border-${accentColor}-500 text-white shadow-2xl scale-[1.02]` 
                                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-lg hover:shadow-xl'
                                }
                            `}
                        >
                            {/* Best Value Ribbon */}
                            {isBestValue && !isCurrent && (
                                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 bg-${accentColor}-500 text-white text-[10px] font-black px-5 py-1.5 rounded-full shadow-lg uppercase tracking-widest z-20`}>
                                    {isUser ? 'Más Popular' : 'Recomendado'}
                                </div>
                            )}

                            {/* Plan Actual Badge */}
                            {isCurrent && (
                                <div className="absolute top-5 right-5 bg-white/10 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest z-20 flex items-center gap-1.5 border border-white/20">
                                    <ShieldCheck size={11} /> Tu Plan
                                </div>
                            )}

                            {/* Tier Name & Price */}
                            <div className="mb-6">
                                <h3 className={`text-xl font-black mb-4 ${isCurrent ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                    {plan.name}
                                </h3>
                                <div className="flex items-baseline gap-1">
                                    {plan.price === 0 ? (
                                        <span className={`text-4xl font-black ${isCurrent ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                            Gratis
                                        </span>
                                    ) : (
                                        <>
                                            <span className={`text-lg font-bold ${isCurrent ? 'text-white/50' : 'text-slate-400'}`}>$</span>
                                            <span className={`text-5xl font-black tracking-tighter ${isCurrent ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                                {plan.price.toLocaleString()}
                                            </span>
                                            <span className={`text-xs font-bold ml-1.5 uppercase tracking-widest ${isCurrent ? 'text-white/50' : 'text-slate-400'}`}>
                                                {plan.billing === 'monthly' ? '/mes' : 'MXN'}
                                            </span>
                                        </>
                                    )}
                                </div>
                                {isUser && plan.price > 0 && (
                                    <p className={`text-[11px] mt-2 font-medium ${isCurrent ? 'text-emerald-300' : 'text-emerald-600'}`}>
                                        Pago único — sin suscripción ni renovación
                                    </p>
                                )}
                            </div>

                            {/* Features */}
                            <div className="space-y-4 flex-1 mb-8">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-white/40' : 'text-slate-400'}`}>
                                    {isUser ? 'Qué incluye' : 'Características'}
                                </p>
                                <ul className="space-y-3">
                                    {plan.features.map((feature, fidx) => (
                                        <li key={fidx} className="flex items-start gap-2.5">
                                            <div className={`p-0.5 rounded-full mt-0.5 shrink-0 ${isCurrent ? `bg-${accentColor}-500/20 text-${accentColor}-400` : `bg-${accentColor}-50 dark:bg-${accentColor}-950/20 text-${accentColor}-600`}`}>
                                                <CheckCircle2 size={14} />
                                            </div>
                                            <span className={`text-sm leading-snug ${isCurrent ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA Button */}
                            <button
                                disabled={isCurrent}
                                className={`
                                    w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2
                                    ${isCurrent 
                                        ? 'bg-white/10 text-white/60 cursor-default border border-white/10' 
                                        : isBestValue
                                            ? `bg-${accentColor}-600 hover:bg-${accentColor}-500 text-white shadow-lg shadow-${accentColor}-600/20`
                                            : 'bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-md'
                                    }
                                `}
                            >
                                {isCurrent ? 'Ya lo tienes' : (
                                    <>
                                        {content.ctaPrefix} {plan.name} <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Social Proof Footer */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-4 opacity-50">
                {content.proofItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                        {item.icon} {item.text}
                    </div>
                ))}
            </div>
        </div>
    );
}
