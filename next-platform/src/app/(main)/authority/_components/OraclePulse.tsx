import { Activity } from 'lucide-react';
import React from 'react';
import { Card, LockedOverlay } from './shared';

interface OraclePulseProps {
    isLocked: boolean;
    isB2C: boolean;
    legalData: any;
    showToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}

export const OraclePulse: React.FC<OraclePulseProps> = ({ isLocked, isB2C, legalData, showToast }) => {
    return (
        <LockedOverlay isLocked={isLocked} isB2C={isB2C}>
            <Card className="bg-slate-900 border-none text-white relative overflow-hidden flex flex-col hover:shadow-2xl transition-all shadow-xl shadow-slate-900/10 h-full">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[50px] pointer-events-none" />

                <div className="mb-8 relative z-10 flex-1">
                    <h3 className="text-2xl font-black flex items-center gap-3 mb-2">
                        <Activity className="text-emerald-400" size={28} />
                        Monitor de Leyes y Salarios
                    </h3>
                    <div className="flex items-center gap-2 mb-4 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-max">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">Datos Sincronizados con DOF e INEGI</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        El sistema se actualiza automáticamente con los valores vigentes de la UMA e inflación para garantizar cálculos con validez oficial.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="bg-[#11172A] p-4 rounded-xl border border-slate-800">
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">UMA 2026 Vigente</p>
                            <p className="text-xl font-black text-white">${legalData.uma_2026.toFixed(2)}</p>
                        </div>
                        <div className="bg-[#11172A] p-4 rounded-xl border border-slate-800">
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Inflación Base INPC</p>
                            <p className="text-xl font-black text-emerald-400">4.82%</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={async () => {
                        const { syncEconomicAnchorsAction } = await import('../../../../actions/oracle-actions');
                        const res = await syncEconomicAnchorsAction();
                        if (res.success) showToast("Anchors Synced with DOF!", "success");
                        else showToast("Oracle Sync Failed.", "error");
                    }}
                    className="w-full relative z-10 px-6 py-4 bg-[#11172A] border border-slate-800 hover:border-emerald-500/50 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group hover:bg-[#1A223B]"
                >
                    FORZAR SINCRONIZACIÓN MANUAL
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-emerald-400 group-hover:shadow-[0_0_5px_rgba(52,211,153,0.8)] transition-all"></div>
                </button>
            </Card>
        </LockedOverlay>
    );
};
