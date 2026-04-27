'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { DossierPDFDocument } from './DossierPDFDocument';

interface PDFTriggerProps {
    agency: { name: string; phone: string; logoUrl?: string };
    client: { name: string; id: string };
    vigenciaStatus: boolean;
    scenarios: any[];
    dictamenHtml: string;
}

export function PDFDownloadTrigger({ agency, client, vigenciaStatus, scenarios, dictamenHtml }: PDFTriggerProps) {
    return (
        <PDFDownloadLink
            document={
                <DossierPDFDocument 
                    agency={agency} 
                    client={client} 
                    vigenciaStatus={vigenciaStatus} 
                    scenarios={scenarios} 
                    dictamenHtml={dictamenHtml} 
                />
            }
            fileName={`Dossier_Soberano_${client.name.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`}
        >
            {({ blob, url, loading, error }) => (
                <button 
                    disabled={loading || !vigenciaStatus}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-sm rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Download size={16} />
                    {loading ? 'Generando PDF...' : 'Descargar Reporte (PDF)'}
                </button>
            )}
        </PDFDownloadLink>
    );
}
