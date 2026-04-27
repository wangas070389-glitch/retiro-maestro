'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

const font = Plus_Jakarta_Sans({ subsets: ['latin'] });

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service in production
        console.error('Retiro Maestro Global Error:', error);
    }, [error]);

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 px-4 ${font.className}`}>
            {/* Soft background grid */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#slate-200_1px,transparent_1px),linear-gradient(to_bottom,#slate-200_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-[0.03] pointer-events-none"></div>

            <div className="relative z-10 max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-[0_20px_40px_rgba(0,0,0,0.04)] text-center animate-in zoom-in-95 duration-500">
                <div className="w-16 h-16 mx-auto bg-rose-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-rose-200">
                    <AlertTriangle className="w-8 h-8 text-rose-600" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-4">
                    Complicación Inesperada
                </h2>

                <p className="text-slate-600 mb-8 leading-relaxed">
                    Hemos encontrado un error procesando tu solicitud. Nuestro equipo técnico ha sido notificado y el suceso ha quedado registrado en el Ledger.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => reset()}
                        className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group"
                    >
                        <RotateCcw className="w-4 h-4 group-hover:-rotate-90 transition-transform duration-300" />
                        Reintentar
                    </button>
                    <Link
                        href="/"
                        className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Ir al Inicio
                    </Link>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-slate-100 rounded-lg text-left overflow-auto max-h-40 border border-slate-200">
                        <p className="text-xs font-mono text-rose-600 break-all">
                            {error.message || 'Error occurred'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
