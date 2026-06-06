import { KeyRound, X } from 'lucide-react';
import { useState } from 'react';

export interface AdminUser {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    tier: string;
    isApproved: boolean;
    isBlocked: boolean;
    advisorId: string | null;
}

export interface PasswordResetModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: AdminUser;
    onResetPassword: (userId: string, newPassword: string) => Promise<void>;
}

export function PasswordResetModal({ isOpen, onClose, user, onResetPassword }: PasswordResetModalProps) {
    const [newPassword, setNewPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (newPassword.length < 6) return;
        setIsSubmitting(true);
        await onResetPassword(user.id, newPassword);
        setIsSubmitting(false);
        setNewPassword('');
    }

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/30">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <KeyRound size={18} className="text-indigo-600" />
                        Reset de Contraseña
                    </h3>
                    <button onClick={onClose} disabled={isSubmitting} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" title="Cerrar modal" aria-label="Cerrar modal">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <p className="text-sm text-slate-500 mb-6">
                        Vas a sobreescribir la contraseña de: <br />
                        <strong className="text-slate-800 dark:text-white font-mono text-xs">{user.email}</strong>
                    </p>

                    <div className="space-y-2 mb-6">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide">Nueva Contraseña Temporal</label>
                        <input
                            type="text"
                            className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm dark:text-slate-200"
                            placeholder="Mínimo 6 caracteres"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            disabled={isSubmitting}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                    >
                        {isSubmitting ? 'Procesando...' : 'Ejecutar Override de Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
}
