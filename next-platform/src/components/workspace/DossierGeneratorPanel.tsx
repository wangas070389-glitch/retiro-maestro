'use client';

import { useState } from 'react';
import { FileText, AlignLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

const PDFDownloadTrigger = dynamic(
    () => import('./PDFDownloadTrigger').then(mod => mod.PDFDownloadTrigger),
    { ssr: false }
);

interface DossierGeneratorPanelProps {
    agency: { name: string; phone: string; logoUrl?: string };
    client: { name: string; id: string };
    vigenciaStatus: boolean;
    scenarios: any[];
}

export function DossierGeneratorPanel({ agency, client, vigenciaStatus, scenarios }: DossierGeneratorPanelProps) {
    const [dictamen, setDictamen] = useState('');

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm mt-8">
            <div className="flex items-center space-x-3 mb-6">
                <FileText className="w-6 h-6 text-indigo-500" />
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Generar Dictamen Institucional</h3>
            </div>
            
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <AlignLeft className="w-4 h-4" />
                        <span>Dictamen del Asesor (Opcional)</span>
                    </label>
                    <textarea 
                        value={dictamen}
                        onChange={(e) => setDictamen(e.target.value)}
                        placeholder="Escribe la conclusión ejecutiva o recomendación estratégica para este cliente..."
                        className="w-full min-h-[120px] p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    />
                    <p className="text-xs text-slate-500">Este texto se inyectará en la sección final del PDF (Sección 3).</p>
                </div>

                <div className="pt-4 flex justify-end">
                    <PDFDownloadTrigger 
                        agency={agency}
                        client={client}
                        vigenciaStatus={vigenciaStatus}
                        scenarios={scenarios}
                        dictamenHtml={dictamen}
                    />
                </div>
            </div>
        </div>
    );
}
