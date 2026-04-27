'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto dismiss
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={twMerge(
                            "pointer-events-auto min-w-[300px] max-w-md p-4 rounded-xl shadow-2xl backdrop-blur-md border animate-in slide-in-from-right-full fade-in duration-300",
                            toast.type === 'success' && "bg-emerald-900/80 border-emerald-500/30 text-emerald-100",
                            toast.type === 'error' && "bg-rose-900/80 border-rose-500/30 text-rose-100",
                            toast.type === 'warning' && "bg-amber-900/80 border-amber-500/30 text-amber-100",
                            toast.type === 'info' && "bg-slate-900/80 border-slate-500/30 text-slate-100"
                        )}
                    >
                        <div className="flex items-start gap-3">
                            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
                            {toast.type === 'error' && <X className="w-5 h-5 text-rose-400 shrink-0" />}
                            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
                            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}

                            <div className="flex-1 text-sm font-medium">{toast.message}</div>

                            <button onClick={() => removeToast(toast.id)} className="text-white/50 hover:text-white">
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
