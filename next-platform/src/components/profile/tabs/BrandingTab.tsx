'use client';

import React, { useState, useEffect } from 'react';
import { Store, Phone, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { updateAgencyInfoAction } from '@/actions/user-actions';
import { useToast } from '@/components/ui/toast-context';

interface BrandingTabProps {
    session: any;
    updateSession: (data?: any) => Promise<any>;
}

export function BrandingTab({ session, updateSession }: BrandingTabProps) {
    const { showToast } = useToast();
    const [agencyName, setAgencyName] = useState('');
    const [agencyPhone, setAgencyPhone] = useState('');
    const [agencyLogoUrl, setAgencyLogoUrl] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (session?.user) {
            setAgencyName((session.user as any)?.agencyName || '');
            setAgencyPhone((session.user as any)?.agencyPhone || '');
            setAgencyLogoUrl((session.user as any)?.agencyLogoUrl || '');
        }
    }, [session]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsUpdating(true);
        const res = await updateAgencyInfoAction(agencyName, agencyPhone, agencyLogoUrl);
        if (res.success && res.user) {
            showToast("Identidad Marca Blanca actualizada exitosamente", "success");
            await updateSession({
                user: {
                    agencyName: res.user.agencyName,
                    agencyPhone: res.user.agencyPhone,
                    agencyLogoUrl: res.user.agencyLogoUrl
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
                    Identidad Marca Blanca
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                    Personaliza los reportes PDF con el nombre, teléfono y logotipo de tu despacho.
                </p>
            </div>

            {/* Live Preview */}
            {agencyName && (
                <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-5">
                    {agencyLogoUrl ? (
                        <Image src={agencyLogoUrl} alt="Logo" width={56} height={56} className="w-14 h-14 rounded-xl object-contain border border-slate-200 dark:border-slate-700 bg-white p-1" unoptimized />
                    ) : (
                        <div className="w-14 h-14 rounded-xl bg-indigo-100 dark:bg-indigo-950/30 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                            <Store size={24} className="text-indigo-500" />
                        </div>
                    )}
                    <div>
                        <p className="font-bold text-slate-800 dark:text-white">{agencyName}</p>
                        {agencyPhone && <p className="text-xs text-slate-500 font-mono">{agencyPhone}</p>}
                        <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1">Vista Previa</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">Nombre del Despacho</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Store size={16} />
                            </div>
                            <input
                                type="text"
                                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-200"
                                placeholder="Ej. Asesores Patrimoniales"
                                value={agencyName}
                                onChange={(e) => setAgencyName(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">Teléfono de Contacto</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Phone size={16} />
                            </div>
                            <input
                                type="tel"
                                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-200 font-mono"
                                placeholder="55-1234-5678"
                                value={agencyPhone}
                                onChange={(e) => setAgencyPhone(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">URL del Logotipo (PNG/JPG)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <ImageIcon size={16} />
                        </div>
                        <input
                            type="url"
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-200 font-mono"
                            placeholder="https://tu-dominio.com/logo.png"
                            value={agencyLogoUrl}
                            onChange={(e) => setAgencyLogoUrl(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isUpdating ? 'Guardando...' : 'Aplicar Marca Blanca'}
                </button>
            </form>
        </div>
    );
}
