import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';

export const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-8 ${className}`}>
        {children}
    </div>
);

export const Badge = ({ children, type = "success" }: { children: React.ReactNode, type?: "success" | "warning" | "danger" | "neutral" | "emerald" | "indigo" | "amber" }) => {
    const colors = {
        success: "bg-emerald-100 text-emerald-700 border border-emerald-200",
        emerald: "bg-emerald-100 text-emerald-700 border border-emerald-200",
        warning: "bg-amber-100 text-amber-700 border border-amber-200",
        amber: "bg-amber-100 text-amber-700 border border-amber-200",
        danger: "bg-red-100 text-red-700 border border-red-200",
        neutral: "bg-slate-100 text-slate-700 border border-slate-200",
        indigo: "bg-indigo-100 text-indigo-700 border border-indigo-200",
    };
    return (
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest shadow-sm ${colors[type]}`}>
            {children}
        </span>
    );
};

export const LockedOverlay = ({ children, isLocked, isB2C = false }: { children: React.ReactNode, isLocked: boolean, isB2C?: boolean }) => {
    if (!isLocked) return <>{children}</>;
    return (
        <div className="relative group">
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50/60 backdrop-blur-[2px] rounded-2xl border-2 border-dashed border-slate-300 shadow-inner p-6 text-center transition-all group-hover:bg-slate-50/40">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-100 mb-4 text-slate-400">
                    <Lock size={24} />
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-1">
                    {isB2C ? 'Función Disponible con Plan Activo' : 'Función Profesional'}
                </h4>
                <p className="text-slate-500 text-xs mb-6 max-w-[220px]">
                    {isB2C
                        ? 'Desbloquea esta herramienta con el plan "Mi Mejor Pensión" o "Expediente Completo".'
                        : 'Esta herramienta requiere una licencia Starter, Growth o Pro activa.'}
                </p>
                <a
                    href="/profile"
                    className={`px-6 py-2.5 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 ${isB2C ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'}`}
                >
                    {isB2C ? 'Ver Planes Disponibles' : 'Desbloquear en Mi Perfil'} <ArrowRight size={14} />
                </a>
            </div>
            <div className="pointer-events-none opacity-40 grayscale blur-[1px]">
                {children}
            </div>
        </div>
    );
};
