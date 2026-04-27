'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { TierBadge } from '@/components/ui/TierBadge';
import { PricingInterface } from '@/components/profile/PricingInterface';
import { CreditCard, ArrowUpRight, Heart, Briefcase } from 'lucide-react';

export function SubscriptionTab() {
    const { data: session } = useSession();
    const currentTier = (session?.user as any)?.tier || 'FREE';
    const role = session?.user?.role || 'USER';
    const isUser = role === 'USER';

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                    {isUser ? 'Mi Acceso al Motor de Pensiones' : 'Suscripción y Facturación'}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                    {isUser 
                        ? 'Revisa tu nivel actual y desbloquea funciones que te ayudan a tomar mejores decisiones sobre tu jubilación.' 
                        : 'Gestiona tu licencia institucional y nivel de acceso al motor actuarial.'}
                </p>
            </div>

            {/* Current Plan Summary */}
            <div className={`bg-gradient-to-br ${isUser ? 'from-emerald-900 to-slate-900' : 'from-slate-900 to-slate-800'} rounded-2xl p-8 text-white relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-64 h-64 ${isUser ? 'bg-emerald-500/10' : 'bg-indigo-500/10'} rounded-full blur-[80px] pointer-events-none`}></div>
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            {isUser ? <Heart size={18} className="text-emerald-400" /> : <Briefcase size={18} className="text-indigo-400" />}
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isUser ? 'text-emerald-300' : 'text-indigo-300'}`}>
                                {isUser ? 'Tu Nivel de Acceso' : 'Plan Actual'}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <TierBadge tier={currentTier} className="scale-125 origin-left" />
                            <span className="text-lg font-bold text-white/80">
                                {isUser 
                                    ? (currentTier === 'FREE' 
                                        ? 'Acceso básico a tu simulación de pensión' 
                                        : 'Acceso activo al motor de pensiones')
                                    : 'Licencia Institucional B2B'}
                            </span>
                        </div>
                    </div>
                    <div className={`flex items-center gap-3 bg-white/5 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/10`}>
                        <ArrowUpRight size={16} className="text-emerald-400" />
                        <span className="text-xs font-bold text-slate-300">
                            {currentTier === 'FREE' 
                                ? (isUser 
                                    ? 'Conoce lo que puedes desbloquear' 
                                    : 'Desbloquea funciones avanzadas abajo')
                                : (isUser 
                                    ? 'Ya tienes acceso — gracias por confiar en nosotros' 
                                    : 'Tu suscripción está activa')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Pricing Grid */}
            <PricingInterface />
        </div>
    );
}
