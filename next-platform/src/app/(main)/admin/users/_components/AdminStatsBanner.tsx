import { Users, UserCheck, ShieldCheck, Clock, UserX } from 'lucide-react';

export interface AdminStatsBannerProps {
    stats: {
        total: number;
        advisors: number;
        citizens: number;
        blocked: number;
        pending: number;
    };
}

export function AdminStatsBanner({ stats }: AdminStatsBannerProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
                { label: 'Total', value: stats.total, icon: Users, color: 'slate', bg: 'bg-slate-50 dark:bg-slate-900' },
                { label: 'Ciudadanos', value: stats.citizens, icon: UserCheck, color: 'indigo', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
                { label: 'Asesores', value: stats.advisors, icon: ShieldCheck, color: 'emerald', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
                { label: 'Pendientes', value: stats.pending, icon: Clock, color: 'amber', bg: 'bg-amber-50 dark:bg-amber-950/20' },
                { label: 'Bloqueados', value: stats.blocked, icon: UserX, color: 'red', bg: 'bg-red-50 dark:bg-red-950/20' },
            ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                    <div key={idx} className={`${stat.bg} border border-slate-200 dark:border-slate-800 rounded-2xl p-5 transition-all hover:shadow-md`}>
                        <div className="flex items-center justify-between mb-3">
                            <Icon size={18} className={`text-${stat.color}-500`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest text-${stat.color}-500`}>{stat.label}</span>
                        </div>
                        <p className="text-3xl font-black text-slate-800 dark:text-white font-mono">{stat.value}</p>
                    </div>
                );
            })}
        </div>
    );
}
