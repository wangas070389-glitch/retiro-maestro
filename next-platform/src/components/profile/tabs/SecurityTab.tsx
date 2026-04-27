'use client';

import React, { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { updatePasswordAction } from '@/actions/user-actions';
import { useToast } from '@/components/ui/toast-context';

export function SecurityTab() {
    const { showToast } = useToast();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsUpdating(true);
        const res = await updatePasswordAction(currentPassword, newPassword);
        if (res.success) {
            showToast("Contraseña actualizada exitosamente.", "success");
            setCurrentPassword('');
            setNewPassword('');
        } else {
            showToast(res.error || "Error desconocido", "error");
        }
        setIsUpdating(false);
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                    Seguridad y Acceso
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                    Rota tus credenciales de acceso. Recomendamos hacerlo periódicamente.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">Contraseña Actual</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Lock size={16} />
                        </div>
                        <input
                            type="password"
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all dark:text-slate-200 font-mono tracking-widest"
                            placeholder="••••••••"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">Requerido como comprobación de identidad.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">Nueva Contraseña</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <ShieldCheck size={16} />
                        </div>
                        <input
                            type="password"
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-slate-200 font-mono tracking-widest"
                            placeholder="Mín. 6 caracteres"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            autoComplete="new-password"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isUpdating || currentPassword === '' || newPassword.length < 6}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-3 px-6 rounded-xl transition-all border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isUpdating ? 'Encriptando...' : 'Rotar Contraseña Segura'}
                </button>
            </form>
        </div>
    );
}
