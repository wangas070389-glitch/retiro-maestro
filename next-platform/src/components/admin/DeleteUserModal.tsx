'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { deleteUserAction } from '@/actions/admin-actions';
import { useToast } from '@/components/ui/toast-context';

interface DeleteUserModalProps {
    user: { id: string; email: string | null; name: string | null };
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function DeleteUserModal({ user, isOpen, onClose, onSuccess }: DeleteUserModalProps) {
    const { showToast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmEmail, setConfirmEmail] = useState('');

    if (!isOpen) return null;

    async function handleDelete() {
        if (confirmEmail !== user.email) {
            showToast("El email no coincide. Para borrar, debe escribir el email exacto.", "error");
            return;
        }

        setIsDeleting(true);
        try {
            const res = await deleteUserAction(user.id);
            if (res.success) {
                showToast("Identidad purgada exitosamente del ecosistema.", "success");
                onSuccess();
                onClose();
            } else {
                showToast(res.error || "Error al eliminar el usuario", "error");
            }
        } catch (error) {
            showToast("Error fatal en la comunicación con el servidor.", "error");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 fade-in duration-300 border border-red-100">
                {/* Header */}
                <div className="p-6 bg-red-50 border-b border-red-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-600 rounded-lg text-white">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-red-900 uppercase tracking-tighter text-xl">Confirmar Purga Total</h3>
                            <p className="text-red-700/70 text-xs font-bold">ACCIÓN DESTRUCTIVA IRREVERSIBLE</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-red-300 hover:text-red-600 transition-colors p-2 hover:bg-red-100 rounded-full"
                        aria-label="Cerrar modal"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 text-center">
                        <p className="text-slate-500 text-sm mb-2 font-medium">Estás a punto de borrar permanentemente a:</p>
                        <p className="text-slate-900 font-black text-lg mb-1">{user.name || 'Usuario Sin Nombre'}</p>
                        <code className="text-indigo-600 font-bold text-sm bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                            {user.email}
                        </code>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-xs font-black text-slate-800 uppercase tracking-widest text-center">
                            Para confirmar, escribe el email abajo:
                        </label>
                        <input
                            type="text"
                            className="w-full bg-white border-2 border-slate-200 rounded-xl p-4 outline-none focus:border-red-500 font-mono text-center text-slate-800 transition-all placeholder:text-slate-300 shadow-inner"
                            placeholder={user.email || 'email@ejemplo.com'}
                            value={confirmEmail}
                            onChange={(e) => setConfirmEmail(e.target.value)}
                            disabled={isDeleting}
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 px-6 py-4 rounded-xl font-bold text-slate-500 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                    >
                        Abortar
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting || confirmEmail !== user.email}
                        className={`flex-2 px-10 py-4 rounded-xl font-black text-white shadow-lg shadow-red-500/20 flex items-center justify-center gap-3 transition-all ${
                            isDeleting || confirmEmail !== user.email 
                                ? 'bg-slate-300 cursor-not-allowed opacity-50 grayscale'
                                : 'bg-red-600 hover:bg-red-700 active:scale-95'
                        }`}
                    >
                        {isDeleting ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Purgando...
                            </span>
                        ) : (
                            <>
                                <Trash2 size={20} />
                                CONFIRMAR ELIMINACIÓN
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
