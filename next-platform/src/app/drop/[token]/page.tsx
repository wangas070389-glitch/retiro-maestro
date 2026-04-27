import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { MagicDropzone } from './components/MagicDropzone';
import { ShieldCheck } from 'lucide-react';

export default async function MagicLinkDropPage({ params }: { params: { token: string } }) {
    const { token } = params;

    const client = await db.user.findUnique({
        where: { magicLinkToken: token } as any,
        include: { advisor: true }
    }) as any;

    if (!client) {
        notFound();
    }

    // Validate Temporal Window (TTL Check)
    const now = new Date();
    if (!client.magicLinkExpires || new Date(client.magicLinkExpires) < now) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <ShieldCheck className="w-16 h-16 text-rose-500 mb-4" />
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Enlace Caducado</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                    Por seguridad estricta, este túnel de carga de documentos era válido por 72 horas. 
                    Solicite a su asesor institucional ({client.advisor?.name || 'su Asesor'}) la generación de un nuevo enlace.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 sm:p-12 font-sans">
            <div className="max-w-xl w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 mb-6 shadow-sm">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-3xl font-light tracking-tight text-slate-900 dark:text-white mb-3">
                        Recepción Segura de <span className="font-semibold">Expediente IMSS</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                        Sistema Institucional de carga B2B2C. Este túnel encriptado le permite enviar su Constancia de Semanas Cotizadas directamente al Portafolio Maestro de su asesor: 
                        <strong className="text-slate-700 dark:text-slate-300 ml-1 block mt-1">{client.advisor?.agencyName || client.advisor?.name || 'Asignado'}</strong>
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800/80">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Hola, {client.name}</h2>
                    <MagicDropzone clientId={client.id} />
                </div>
                
                <p className="text-center text-xs text-slate-400 mt-8">
                    Operación protegida bajo algoritmos de encriptación de identidad soberana. Ningún tercero almacena su PDF, 
                    los datos crudos ($) se extraen algoritmicamente en memoria RAM y el archivo se destruye en su propio dispositivo.
                </p>
            </div>
        </div>
    );
}
