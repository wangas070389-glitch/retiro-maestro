'use client';

import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { SearchX, ArrowLeft, Home } from 'lucide-react';

const font = Plus_Jakarta_Sans({ subsets: ['latin'] });

export default function NotFound() {
    return (
        <div className={`min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 px-4 ${font.className}`}>
            {/* Soft background grid gradient */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#slate-200_1px,transparent_1px),linear-gradient(to_bottom,#slate-200_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-[0.03] pointer-events-none"></div>

            <div className="relative z-10 max-w-lg w-full bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-[0_20px_40px_rgba(0,0,0,0.04)] text-center animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-8 shadow-sm">
                    <SearchX className="w-10 h-10 text-slate-500" />
                </div>

                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4 font-mono">
                    404
                </h1>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 mb-6">
                    Expediente no encontrado
                </h2>

                <p className="text-slate-600 mb-10 text-lg leading-relaxed max-w-md mx-auto">
                    La ruta que intentas consultar no existe en el Ledger Actuarial o ha sido reubicada por razones de estructura.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto px-6 py-3.5 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Regresar
                    </button>
                    <Link
                        href="/"
                        className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group"
                    >
                        <Home className="w-4 h-4" />
                        Portal Principal
                    </Link>
                </div>
            </div>

            {/* Minimal Footer */}
            <div className="mt-12 text-sm text-slate-500 relative z-10">
                Retiro Maestro Â© {new Date().getFullYear()}
            </div>
        </div>
    );
}
