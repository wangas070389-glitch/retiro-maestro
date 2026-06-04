'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function MainLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-6 text-center animate-in fade-in duration-500">
            {/* Ambient background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative flex flex-col items-center z-10">
                {/* Visual Loader Track */}
                <div className="relative w-16 h-16 mb-6">
                    {/* Ring track */}
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
                    {/* Spin spinner */}
                    <Loader2 className="absolute inset-0 w-16 h-16 text-indigo-600 dark:text-indigo-400 animate-spin stroke-[2.5]" />
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-2">
                    Procesando Proyección Actuarial
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                    Sincronizando con el oráculo de legal-anchors y actualizando tablas de Modalidad 40...
                </p>
                
                {/* Micro skeleton dots */}
                <div className="flex gap-1.5 mt-6 justify-center">
                    <span className="w-2 h-2 rounded-full bg-indigo-600/30 animate-bounce duration-1000"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-600/50 animate-bounce duration-1000 delay-150"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-600/30 animate-bounce duration-1000 delay-300"></span>
                </div>
            </div>
        </div>
    );
}
