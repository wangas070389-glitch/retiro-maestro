'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, UploadCloud, AlertCircle, CheckCircle, Search, RefreshCw, X, FileSignature } from 'lucide-react';
import { PDFParser } from '@/lib/engine/ingestion/pdf-parser';
import { HeuristicParser, IngestedData, DocumentType } from '@/lib/engine/ingestion/heuristic-parser';
import { SentinelAuditor, AuditReport } from '@/lib/engine/ingestion/sentinel-auditor';
import { RetroCalculator } from '@/lib/engine/calculator/retro-calculator';
import { useSimulationStore } from '@/store';
import { updateUserActuarialAction } from '@/actions/user-actions';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/toast-context';

type UploaderState = 'IDLE' | 'PROCESSING' | 'REVIEW' | 'CONFIRMED';

export function DocumentUploader({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
    const [state, setState] = useState<UploaderState>('IDLE');
    const [filename, setFilename] = useState<string | null>(null);
    const [data, setData] = useState<Partial<IngestedData>>();
    const [audit, setAudit] = useState<AuditReport | null>(null);
    const [overrides, setOverrides] = useState<Partial<IngestedData>>({});
    const { updateScenarioA, setCertifiedDossier } = useSimulationStore();
    const { update: updateSession } = useSession();
    const { showToast } = useToast();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        setFilename(file.name);
        setState('PROCESSING');

        try {
            // 1. Edge extraction
            const rawText = await PDFParser.extractText(file);

            // 2. Heuristic extraction
            const parsedData = HeuristicParser.parse(rawText, file.name);
            
            // 3. Actuarial Retro-Calculation (SISEC only)
            if (parsedData.docType === DocumentType.SISEC && parsedData.movements) {
                const retro = RetroCalculator.calculate(parsedData.movements);
                parsedData.salary_prom = retro.averageSalary;
                // Add a recommendation if M40 is detected
                if (retro.isM40Active) {
                    console.log('Modalidad 40 detected in history');
                }
            }
            
            setData(parsedData);

            // 4. Sentinel Audit
            const auditResult = SentinelAuditor.audit(parsedData);
            setAudit(auditResult);

            // 5. Move to review
            setState('REVIEW');
        } catch (error: unknown) {
            console.error('Extraction failed:', error);
            alert(`Falla en lectura del PDF: ${error instanceof Error ? error.message : String(error)}`);
            // Revert state on hard fail
            setState('IDLE');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        maxSize: 5242880 // 5MB
    });

    const isFieldValid = (value?: string | number | null) => value !== null && value !== undefined && value !== '';

    const handleOverrideChange = (key: keyof IngestedData, value: string) => {
        setOverrides(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleConfirm = () => {
        const merged = { ...data, ...overrides } as IngestedData;

        const updatePayload: any = {};
        if (merged.weeks) updatePayload.weeks = Number(merged.weeks);
        if (merged.salary_prom) updatePayload.salary_prom = Number(merged.salary_prom);
        if (merged.age) updatePayload.age = Number(merged.age);

        updateScenarioA(updatePayload);

        // 2. Persist to Sovereign Profile (DB Sync)
        (async () => {
            const res = await updateUserActuarialAction(
                updatePayload.age || 60,
                updatePayload.weeks || 500,
                Number(merged.salary_prom) || 0,
                merged.lastBajaDate || null
            );
            if (res.success && res.user) {
                showToast("Dossier Actuarial sincronizado con SINDO", "success");
                await updateSession({ user: res.user });
            }
        })();

        setState('CONFIRMED');
    };

    const reset = () => {
        setState('IDLE');
        setData(undefined);
        setAudit(null);
        setOverrides({});
        setFilename(null);
    };

    return (
        <div className={`w-full mx-auto relative overflow-hidden transition-all ${variant === 'compact'
            ? 'p-4 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-lg'
            : 'max-w-3xl p-6 bg-white/50 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-2xl'
            }`}>
            {/* Narciso Background Gradients */}
            {variant === 'default' && (
                <>
                    <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 mix-blend-multiply pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 mix-blend-multiply pointer-events-none" />
                </>
            )}

            <div className="relative z-10">
                <AnimatePresence mode="wait">
                    {state === 'IDLE' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`
                                cursor-pointer border-2 border-dashed text-center transition-all duration-300
                                ${variant === 'compact' ? 'rounded-xl p-6' : 'rounded-[2rem] p-12'}
                                ${isDragActive
                                    ? (variant === 'compact' ? 'border-indigo-500 bg-indigo-500/10' : 'border-indigo-400 bg-indigo-50/50')
                                    : (variant === 'compact' ? 'border-slate-700 hover:border-indigo-500 hover:bg-slate-800' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50')}
                            `}
                        >
                            <div {...getRootProps()} className="w-full h-full outline-none">
                                <input {...getInputProps()} />
                                <div className={`flex items-center justify-center mx-auto mb-4 text-indigo-400 ${variant === 'compact' ? 'w-12 h-12 bg-indigo-500/20 rounded-xl' : 'w-20 h-20 bg-indigo-100 rounded-full text-indigo-600 mb-6'}`}>
                                    <UploadCloud size={variant === 'compact' ? 24 : 32} />
                                </div>
                                <h3 className={`font-bold tracking-tight mb-2 ${variant === 'compact' ? 'text-sm text-slate-200' : 'text-xl text-slate-900'}`}>
                                    Subir Constancia de Semanas Cotizadas
                                </h3>
                                <p className={`font-mono ${variant === 'compact' ? 'text-[10px] text-slate-400' : 'text-sm text-slate-500'}`}>
                                    Arrastra tu documento PDF aquí, o haz clic para buscar.
                                </p>
                                {variant === 'default' && (
                                    <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                                        <FileSignature size={14} />
                                        <span>Extracción Soberana (Local). Tus datos no se envían a ningún servidor en este paso.</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {state === 'PROCESSING' && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className={`text-center ${variant === 'compact' ? 'p-6' : 'p-12'}`}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className={`bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20 ${variant === 'compact' ? 'w-12 h-12' : 'w-20 h-20'}`}
                            >
                                <Search size={variant === 'compact' ? 20 : 32} className="text-white" />
                            </motion.div>
                            <h3 className={`font-bold mb-2 ${variant === 'compact' ? 'text-sm text-slate-200' : 'text-xl text-slate-900'}`}>Auditoría Forense en Progreso</h3>
                            <p className={variant === 'compact' ? 'text-xs text-slate-400' : 'text-slate-500'}>Analizando {filename} localmente...</p>
                        </motion.div>
                    )}

                    {state === 'REVIEW' && audit && data && (
                        <motion.div
                            key="review"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
                        >
                            {/* Review Header */}
                            <div className={`border-b flex items-start justify-between ${variant === 'compact' ? 'p-4' : 'p-6'} ${audit.is_valid ? (variant === 'compact' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100') : (variant === 'compact' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-100')}`}>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        {audit.is_valid ? (
                                            <CheckCircle className="text-emerald-500" size={variant === 'compact' ? 18 : 24} />
                                        ) : (
                                            <AlertCircle className="text-amber-500" size={variant === 'compact' ? 18 : 24} />
                                        )}
                                        <h3 className={`font-bold ${variant === 'compact' ? 'text-sm text-slate-100' : 'text-lg text-slate-900'}`}>
                                            {audit.is_valid ? 'Extracción Confiable' : 'Revisión Manual Requerida'}
                                        </h3>
                                    </div>
                                    <p className="text-slate-600 text-sm">
                                        Confianza algorítmica: <span className="font-mono font-bold">{(audit.score * 100).toFixed(0)}%</span>
                                    </p>
                                    <div className="mt-2 flex gap-2">
                                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${data.docType === DocumentType.SISEC ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                            {data.docType === DocumentType.SISEC ? 'Parser B (Historial)' : 'Parser A (Sindo)'}
                                        </span>
                                        {data.docType === DocumentType.SISEC && (
                                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-bold">
                                                Cálculo Actuarial (1750d)
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button aria-label="Cerrar y reiniciar uploader" onClick={reset} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Flags */}
                            {audit.flags.length > 0 && (
                                <div className={`border-b ${variant === 'compact' ? 'p-3 bg-red-500/10 border-red-500/20' : 'p-4 bg-red-50 border-red-100'}`}>
                                    <ul className="space-y-2">
                                        {audit.flags.map((flag, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-red-700">
                                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                                <span className="font-medium">{flag}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Recommendations */}
                            {audit.recommendations.length > 0 && (
                                <div className={`border-b ${variant === 'compact' ? 'p-3 bg-amber-500/10 border-amber-500/20' : 'p-4 bg-amber-50/50 border-amber-100'}`}>
                                    <ul className="space-y-1">
                                        {audit.recommendations.map((rec, idx) => (
                                            <li key={idx} className="text-sm text-amber-700 font-mono flex gap-2">
                                                <span className="opacity-50">â†’</span> {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Data Grid */}
                            <div className={`${variant === 'compact' ? 'p-4 flex flex-col gap-4' : 'p-6 grid grid-cols-2 gap-6'}`}>
                                {/* Component for each field */}
                                {[
                                    { label: 'Semanas Reconocidas', key: 'weeks', type: 'number', value: data.weeks },
                                    { label: 'Salario Base (MXN)', key: 'salary_prom', type: 'text', value: data.salary_prom },
                                    { label: 'N.S.S.', key: 'nss', type: 'text', value: data.nss },
                                    { label: 'C.U.R.P.', key: 'curp', type: 'text', value: data.curp },
                                    { label: 'Fecha de Nacimiento', key: 'dob', type: 'text', value: data.dob },
                                    { label: 'Edad Derivada', key: 'age', type: 'number', value: data.age },
                                ].map((field, idx) => {
                                    const valid = isFieldValid(field.value as string | number | null);


                                    return (
                                        <div key={idx} className="space-y-1.5">
                                            <label className={`text-[10px] font-bold tracking-wider ${variant === 'compact' ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {field.label}
                                            </label>
                                            <div className="relative">
                                                {valid && !overrides[field.key as keyof IngestedData] ? (
                                                    <div className={`w-full border rounded-xl font-mono flex items-center justify-between ${variant === 'compact' ? 'p-2 bg-slate-800 text-slate-200 border-slate-700 text-xs' : 'p-3 bg-slate-50 text-slate-800 border-slate-200'}`}>
                                                        <span>{field.value}</span>
                                                        <CheckCircle size={14} className="text-emerald-500 opacity-50" />
                                                    </div>
                                                ) : (
                                                    <input
                                                        type={field.type}
                                                        value={(overrides[field.key as keyof IngestedData] as string | number | undefined) || (field.value as string | number | undefined) || ''}
                                                        onChange={(e) => handleOverrideChange(field.key as keyof IngestedData, e.target.value)}
                                                        className={`w-full bg-white border-2 border-amber-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 rounded-xl font-mono text-slate-900 outline-none transition-all shadow-sm ${variant === 'compact' ? 'p-2 text-xs' : 'p-3'}`}
                                                        placeholder={valid ? String(field.value) : `Ingresar ${field.label}`}
                                                    />

                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Actions */}
                            <div className={`border-t flex flex-col gap-3 ${variant === 'compact' ? 'p-4 bg-slate-800/50 border-slate-700' : 'p-6 bg-slate-50 justify-end flex-row'}`}>
                                <button
                                    onClick={reset}
                                    className={`font-medium rounded-xl transition-colors ${variant === 'compact' ? 'w-full py-2 text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white text-xs' : 'px-6 py-2.5 text-slate-600 hover:bg-slate-200'}`}
                                >
                                    Reintentar Documento
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className={`
                                        font-bold text-white rounded-xl shadow-lg transition-all
                                        ${variant === 'compact' ? 'w-full py-2 text-xs' : 'px-6 py-2.5'}
                                        ${audit.is_valid
                                            ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                                            : Object.keys(overrides).length > 0
                                                ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
                                                : 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20'}
                                    `}
                                >
                                    {audit.is_valid ? 'Confirmar Datos' : Object.keys(overrides).length > 0 ? 'Confirmar Correcciones' : 'Aceptar con Advertencias'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {state === 'CONFIRMED' && (
                        <motion.div
                            key="confirmed"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`text-center rounded-2xl ${variant === 'compact' ? 'p-6 bg-emerald-500/10 border border-emerald-500/20' : 'p-12 bg-emerald-50 border border-emerald-100'}`}
                        >
                            <div className={`bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/20 ${variant === 'compact' ? 'w-12 h-12' : 'w-20 h-20 mb-6'}`}>
                                <CheckCircle size={variant === 'compact' ? 24 : 32} className="text-white" />
                            </div>
                            <h3 className={`font-bold mb-2 ${variant === 'compact' ? 'text-sm text-emerald-400' : 'text-xl text-slate-900'}`}>Dossier Inicializado</h3>
                            <p className={variant === 'compact' ? 'text-[10px] text-emerald-400/80' : 'text-slate-600'}>La extracción ha sido inyectada.</p>
                            <button
                                onClick={reset}
                                className={`mt-6 font-bold transition-all shadow-sm ${variant === 'compact' ? 'w-full py-2 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-xl text-xs rounded-lg' : 'px-6 py-2 bg-white text-emerald-600 border border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 rounded-xl'}`}
                            >
                                Subir otro
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
