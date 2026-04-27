'use client';

import React from 'react';
import { Clock, BarChart3, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface TrialBadgeProps {
    daysRemaining: number;
    simulationsUsed: number;
    simulationsMax: number;
    isLocked: boolean;
}

export const TrialBadge: React.FC<TrialBadgeProps> = ({
    daysRemaining,
    simulationsUsed,
    simulationsMax,
    isLocked
}) => {
    if (isLocked) return null; // Don't show badge when locked — the lockout overlay handles it

    const urgency = daysRemaining <= 2 ? 'urgent' : daysRemaining <= 4 ? 'warning' : 'normal';
    const studyUrgency = simulationsUsed >= simulationsMax ? 'urgent' : simulationsUsed >= 1 ? 'warning' : 'normal';

    const colors = {
        normal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        warning: 'bg-amber-50 text-amber-700 border-amber-200',
        urgent: 'bg-red-50 text-red-700 border-red-200',
    };

    const iconColors = {
        normal: 'text-emerald-500',
        warning: 'text-amber-500',
        urgent: 'text-red-500',
    };

    return (
        <div className="flex items-center gap-3 animate-in slide-in-from-top-2 duration-500">
            {/* Days Counter */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${colors[urgency]}`}>
                <Clock size={13} className={iconColors[urgency]} />
                <span>{daysRemaining} {daysRemaining === 1 ? 'día' : 'días'}</span>
            </div>

            {/* Studies Counter */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${colors[studyUrgency]}`}>
                <BarChart3 size={13} className={iconColors[studyUrgency]} />
                <span>{simulationsUsed}/{simulationsMax} estudios</span>
            </div>

            {/* Trial Label */}
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                Prueba Gratuita
            </span>
        </div>
    );
};
