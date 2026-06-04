'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Hash, Briefcase } from 'lucide-react';
import { updateProfileInfoAction } from '@/actions/user-actions';
import { useToast } from '@/components/ui/toast-context';

interface GeneralTabProps {
    session: any;
    updateSession: (data?: any) => Promise<any>;
}

function formatDateForInput(dateVal: any): string {
    if (!dateVal) return '';
    try {
        let d: Date;
        if (typeof dateVal === 'string') {
            if (/^\d{4}-\d{2}-\d{2}/.test(dateVal)) {
                return dateVal.substring(0, 10);
            }
            d = new Date(dateVal);
        } else if (dateVal instanceof Date) {
            d = dateVal;
        } else {
            return '';
        }
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    } catch {
        return '';
    }
}

export function GeneralTab({ session, updateSession }: GeneralTabProps) {
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [nss, setNss] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [isWorking, setIsWorking] = useState(true);
    const [lastBajaDate, setLastBajaDate] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const isUser = session?.user?.role === 'USER';

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || '');
            setEmail(session.user.email || '');
            setNss(session.user.nss || '');
            setBirthDate(formatDateForInput(session.user.birthDate));
            setIsWorking(session.user.isWorking !== false);
            setLastBajaDate(formatDateForInput(session.user.lastBajaDate));
        }
    }, [session]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsUpdating(true);
        const res = await updateProfileInfoAction(
            name,
            email,
            isUser ? nss : undefined,
            isUser ? birthDate : undefined,
            isUser ? isWorking : undefined,
            isUser && !isWorking ? lastBajaDate : undefined
        );
        if (res.success && res.user) {
            showToast("Perfil actualizado exitosamente", "success");
            await updateSession({
                user: {
                    name: res.user.name,
                    email: res.user.email,
                    nss: res.user.nss,
                    birthDate: res.user.birthDate,
                    isWorking: res.user.isWorking,
                    lastBajaDate: res.user.lastBajaDate
                }
            });
        } else {
            showToast(res.error || "Error desconocido", "error");
        }
        setIsUpdating(false);
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                    Datos Personales
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                    Tu identidad dentro de la plataforma. Solo tú puedes modificar estos datos.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">Nombre Completo</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <User size={16} />
                        </div>
                        <input
                            type="text"
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-200"
                            placeholder="Tu nombre real"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            minLength={2}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">Correo de Contacto</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Mail size={16} />
                        </div>
                        <input
                            type="email"
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-200 font-mono"
                            placeholder="tu-email@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {isUser && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">NSS (11 dígitos, Opcional)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Hash size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-200"
                                        placeholder="12345678901"
                                        pattern="\d{11}"
                                        title="El NSS debe tener exactamente 11 dígitos"
                                        value={nss}
                                        onChange={(e) => setNss(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">Fecha de Nacimiento</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Calendar size={16} />
                                    </div>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-200"
                                        value={birthDate}
                                        onChange={(e) => setBirthDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">Estatus Laboral IMSS</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Briefcase size={16} />
                                </div>
                                <select
                                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-200 appearance-none"
                                    value={isWorking ? 'true' : 'false'}
                                    onChange={(e) => setIsWorking(e.target.value === 'true')}
                                >
                                    <option value="true">Sí, cotizando actualmente en el IMSS</option>
                                    <option value="false">No, actualmente dado de baja</option>
                                </select>
                            </div>
                        </div>

                        {!isWorking && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">Fecha de Última Baja</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Calendar size={16} />
                                    </div>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-200"
                                        value={lastBajaDate}
                                        onChange={(e) => setLastBajaDate(e.target.value)}
                                        required={!isWorking}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Requerido para calcular tu conservación de derechos (Vigencia).</p>
                            </div>
                        )}
                    </>
                )}

                <button
                    type="submit"
                    disabled={isUpdating || !session?.user}
                    className="bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isUpdating ? 'Actualizando...' : 'Guardar Información'}
                </button>
            </form>
        </div>
    );
}

