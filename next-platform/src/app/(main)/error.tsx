'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function MainError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Retiro Maestro Main Section Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full p-6 text-center animate-in fade-in duration-500 max-w-2xl mx-auto">
            {/* Ambient warning aura */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                <div className="w-14 h-14 mx-auto bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center mb-6 border border-rose-100 dark:border-rose-900/50">
                    <AlertCircle className="w-7 h-7 text-rose-600 dark:text-rose-400" />
                </div>

                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mb-3">
                    Falla en Procesamiento Local
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed max-w-md mx-auto">
                    Ha ocurrido un error inesperado al calcular los escenarios o renderizar la terminal de datos. Intente de nuevo o regrese al inicio de control.
                </p>

                {/* Developer Debug info if in development */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-left overflow-auto max-h-32 text-xs font-mono text-rose-600 dark:text-rose-400">
                        {error.message || 'Error desconocido'}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-indigo-600/20 flex items-center justify-center gap-2 group text-sm"
                    >
                        <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                        Reintentar Operación
                    </button>
                    <Link
                        href="/dashboard"
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <Home className="w-4 h-4" />
                        Volver al Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
