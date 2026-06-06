import { UserPlus, Activity, ShieldCheck } from 'lucide-react';
import React from 'react';

interface AdvisorBridgeProps {
    isB2C: boolean;
    hasAdvisor: boolean;
    leadStatus: string;
    residencyStateInput: string;
    setResidencyStateInput: (state: string) => void;
    requestingAdvisor: boolean;
    handleRequestAdvisor: () => void;
    advisorName: string | null;
    advisorPhone: string | null;
    advisorEmail: string | null;
}

export const AdvisorBridge: React.FC<AdvisorBridgeProps> = ({
    isB2C,
    hasAdvisor,
    leadStatus,
    residencyStateInput,
    setResidencyStateInput,
    requestingAdvisor,
    handleRequestAdvisor,
    advisorName,
    advisorPhone,
    advisorEmail
}) => {
    if (!isB2C) return null;

    if (!hasAdvisor) {
        return (
            <div className={`p-8 rounded-3xl border-2 transition-all shadow-lg ${leadStatus === 'NONE' ? 'bg-indigo-900 border-indigo-500 text-white' : 'bg-emerald-900 border-emerald-500 text-white'}`}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-2xl ${leadStatus === 'NONE' ? 'bg-indigo-500/20' : 'bg-emerald-500/20'}`}>
                                {leadStatus === 'NONE' ? <UserPlus size={32} /> : <Activity className="animate-pulse" size={32} />}
                            </div>
                            <h2 className="text-3xl font-black tracking-tight">
                                {leadStatus === 'NONE' ? '¿Necesitas un Asesor Actuarial?' : 'Búsqueda de Asesor Activa'}
                            </h2>
                        </div>
                        <p className="text-indigo-100 text-lg opacity-80 leading-relaxed max-w-2xl">
                            {leadStatus === 'NONE'
                                ? 'No realices tu trámite sin asesoría. Solicita un experto certificado para validar tus documentos y asegurar que tu estrategia cumpla con todos los requisitos del IMSS.'
                                : 'Nuestro sistema de asignación está localizando al asesor certificado más cercano a tu ubicación para brindarte atención personalizada.'}
                        </p>
                    </div>

                    <div className="w-full md:w-auto min-w-[320px] bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                        {leadStatus === 'NONE' ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Estado de Residencia</label>
                                    <select
                                        className="w-full bg-slate-900/50 border border-white/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none text-white"
                                        value={residencyStateInput}
                                        onChange={(e) => setResidencyStateInput(e.target.value)}
                                        title="Selecciona tu Estado de Residencia"
                                    >
                                        <option value="" disabled>Selecciona tu Estado</option>
                                        <option value="CDMX">Ciudad de México</option>
                                        <option value="Jalisco">Jalisco</option>
                                        <option value="Nuevo Leon">Nuevo León</option>
                                        <option value="Edomex">Estado de México</option>
                                        <option value="Puebla">Puebla</option>
                                        <option value="Queretaro">Querétaro</option>
                                        <option value="Guanajuato">Guanajuato</option>
                                        <option value="Veracruz">Veracruz</option>
                                        <option value="Sonora">Sonora</option>
                                        <option value="Chihuahua">Chihuahua</option>
                                        <option value="Otro">Otro Estado</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleRequestAdvisor}
                                    disabled={requestingAdvisor}
                                    className="w-full py-4 bg-white text-indigo-900 font-black tracking-tighter rounded-xl shadow-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {requestingAdvisor ? 'Conectando...' : 'SOLICITAR ASIGNACIÓN AHORA'}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center space-y-4 py-4">
                                <div className="flex justify-center flex-col items-center">
                                    <div className="text-emerald-400 font-bold text-xs tracking-widest uppercase mb-1 flex items-center gap-2">
                                        Búsqueda Activa <ShieldCheck size={14} />
                                    </div>
                                    <p className="text-sm font-medium text-emerald-100 italic">&quot;Esperando primer reclamo de talento certificado...&quot;</p>
                                </div>
                                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="w-1/3 h-full bg-emerald-400 animate-[loading_2s_infinite]"></div>
                                </div>
                                <p className="text-[10px] text-indigo-200 opacity-60">Tiempo estimado de respuesta: 4-12 horas.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 rounded-3xl border-2 bg-gradient-to-br from-slate-900 to-indigo-950 border-indigo-500 text-white shadow-xl animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-indigo-500/20">
                            <ShieldCheck size={32} className="text-indigo-400 animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-white">
                            Asesor Actuarial Asignado
                        </h2>
                    </div>
                    <p className="text-indigo-100 text-lg opacity-90 leading-relaxed max-w-2xl">
                        Tu expediente legal y estrategia de pensiones están siendo validados por tu asesor certificado: <strong className="text-white font-bold">{advisorName || "Experto Certificado"}</strong>.
                    </p>
                    {(advisorPhone || advisorEmail) && (
                        <div className="flex flex-wrap gap-4 pt-2 text-sm text-indigo-200">
                            {advisorPhone && (
                                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                                    <span className="font-bold text-[10px] uppercase tracking-widest text-indigo-300">Teléfono:</span>
                                    <span className="font-semibold text-white">{advisorPhone}</span>
                                </div>
                            )}
                            {advisorEmail && (
                                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                                    <span className="font-bold text-[10px] uppercase tracking-widest text-indigo-300">Email:</span>
                                    <span className="font-semibold text-white">{advisorEmail}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
