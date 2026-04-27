'use client';

import React from 'react';
import { Tier } from '@/lib/config/pricing';

interface TierBadgeProps {
    tier: string | Tier;
    className?: string;
}

export function TierBadge({ tier, className = "" }: TierBadgeProps) {
    const config: Record<string, { label: string, styles: string }> = {
        FREE: { 
            label: 'Básico', 
            styles: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' 
        },
        STRATEGY: { 
            label: 'Mi Pensión', 
            styles: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' 
        },
        DOSSIER: { 
            label: 'Expediente', 
            styles: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800' 
        },
        STARTER: { 
            label: 'Starter', 
            styles: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800' 
        },
        GROWTH: { 
            label: 'Growth', 
            styles: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' 
        },
        PRO: { 
            label: 'Pro', 
            styles: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 shadow-sm shadow-amber-500/10' 
        },
        ADMIN: { 
            label: 'Admin', 
            styles: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800' 
        }
    };

    const current = config[tier as string] || config.FREE;

    return (
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${current.styles} ${className}`}>
            {current.label}
        </span>
    );
}
