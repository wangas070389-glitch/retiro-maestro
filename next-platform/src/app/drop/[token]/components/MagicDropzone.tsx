'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, CheckCircle, AlertOctagon, Loader2 } from 'lucide-react';
import { PDFParser } from '@/lib/engine/ingestion/pdf-parser';
import { HeuristicParser } from '@/lib/engine/ingestion/heuristic-parser';
import { ingestDecentralizedConstancia } from '@/actions/magic-link-ingest';
import { useParams } from 'next/navigation';

interface MagicDropzoneProps {
    clientId: string;
}

export function MagicDropzone({ clientId }: MagicDropzoneProps) {
    const params = useParams();
    const token = params.token as string;

    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'IDLE' | 'PARSING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [errorMessage, setErrorMessage] = useState('');

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        const uploadedFile = acceptedFiles[0];
        setFile(uploadedFile);
        setStatus('PARSING');

        try {
            // 1. Extract Text cleanly using RAM
            const rawText = await PDFParser.extractText(uploadedFile);
            
            // 2. Parse telemetry via Heuristics
            const extracted = HeuristicParser.parse(rawText, uploadedFile.name);

            if (extracted.confidence < 0.5 || !extracted.weeks || !extracted.salary_prom || !extracted.age) {
                setStatus('ERROR');
                setErrorMessage('El PDF no parece ser una Constancia de Semanas válida. O los datos son ilegibles.');
                return;
            }

            // 3. Map to standard payload
            const pensionInputPayload = {
                weeks: extracted.weeks,
                salary_prom: extracted.salary_prom,
                age: extracted.age,
                has_wife: true, // Default heuristic mappings (Advisor can amend later)
                children_count: 0,
                dependent_parents_count: 0,
                is_ongoing_work: false
            };

            // 4. Send to Decentralized Intake Gateway
            const response = await ingestDecentralizedConstancia(token, clientId, pensionInputPayload);

            if (response.success) {
                setStatus('SUCCESS');
            } else {
                setStatus('ERROR');
                setErrorMessage(response.error || 'Fallo de inyección segura.');
            }

        } catch (error) {
            console.error(error);
            setStatus('ERROR');
            setErrorMessage('Ocurrió un error leyendo el documento PDF. Intente nuevamente.');
        }

    }, [token, clientId]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        disabled: status === 'PARSING' || status === 'SUCCESS'
    });

    if (status === 'SUCCESS') {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">¡Transmisión Exitosa!</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                    Su Constancia IMSS ha sido procesada de forma segura por el Algoritmo Maestro. 
                    Su archivo ha sido destruido en RAM y su Asesor ha recibido los datos estratificados automáticamente.
                </p>
                <p className="text-xs text-slate-400 mt-8">Este enlace criptográfico de un solo uso ahora ha sido permanentemente destruido.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div 
                {...getRootProps()} 
                className={`
                    border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[300px]
                    ${isDragActive ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                    ${status === 'PARSING' ? 'opacity-50 pointer-events-none' : ''}
                `}
            >
                <input {...getInputProps()} />
                
                {status === 'PARSING' ? (
                    <div className="flex flex-col items-center text-indigo-600 dark:text-indigo-400">
                        <Loader2 className="w-12 h-12 animate-spin mb-4" />
                        <p className="font-semibold">Decodificando Firmas IMSS en RAM...</p>
                        <p className="text-xs text-indigo-400 dark:text-indigo-500 mt-2">Bypass de Intermediarios Activo</p>
                    </div>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 mb-6 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-600">
                            <UploadCloud size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 text-center">
                            {isDragActive ? "Suelte el PDF aquí..." : "Seleccione su Constancia de Semanas Cotizadas"}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 text-center max-w-xs">
                            Soporta únicamente documentos oficiales en formato PDF generados por el portal del IMSS.
                        </p>
                    </>
                )}
            </div>

            {status === 'ERROR' && (
                <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl p-4 flex items-start gap-3">
                    <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-rose-800 dark:text-rose-300 font-bold text-sm">Validación Fallida</h4>
                        <p className="text-rose-600 dark:text-rose-400 text-xs mt-1">{errorMessage}</p>
                    </div>
                </div>
            )}

            {file && status !== 'PARSING' && (
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <FileText className="w-5 h-5 text-slate-500" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                </div>
            )}
        </div>
    );
}
