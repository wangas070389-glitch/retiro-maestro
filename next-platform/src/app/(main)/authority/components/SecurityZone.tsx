'use client';

import React from 'react';
import { Lock, Scale, Download, Activity } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Card, LockedOverlay } from './ui';
import legalData from '@/lib/data/legal-anchors.json';

const AuthorityRetirementPDFButton = dynamic(
    () => import('@/components/reports/PDFDownloadButtons').then(mod => mod.AuthorityRetirementPDFButton),
    { ssr: false }
);

interface SecurityZoneProps {
    isLocked: boolean;
    isB2C: boolean;
    dossiers: any[];
    selectedDossierId: string | null;
    setSelectedDossierId: (id: string) => void;
    handleVerify: (id: string) => void;
    verifying: string | null;
    userProfile: { name: string; nss: string; [key: string]: any };
    projectionForPdf: any[];
    sessionUser: any;
    showToast: (message: string, type: "success" | "error" | "warning" | "info") => void;
}

export function SecurityZone({
    isLocked,
    isB2C,
    dossiers,
    selectedDossierId,
    setSelectedDossierId,
    handleVerify,
    verifying,
    userProfile,
    projectionForPdf,
    sessionUser,
    showToast
}: SecurityZoneProps) {
    return (
        <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-6 flex items-center gap-2">
                <div className="w-8 h-px bg-slate-300"></div>
                Certificaciones y Respaldo de Datos
                <div className="flex-1 h-px bg-slate-200"></div>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

                {/* Dossier Soberano */}
                <LockedOverlay isLocked={isLocked} isB2C={isB2C}>
                    <Card className="border-t-4 border-t-indigo-600 hover:shadow-xl transition-shadow relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-bl-[200px] pointer-events-none" />
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 flex items-center gap-3 mb-2">
                                    <Lock className="text-indigo-600" size={32} />
                                    Expediente Legal Validado
                                </h3>
                                <p className="text-indigo-600 font-bold text-sm bg-indigo-50 inline-block px-3 py-1 rounded-full mb-3">
                                    Certificación de Integridad Activa
                                </p>
                                <p className="text-slate-500 leading-relaxed text-sm max-w-xl">
                                    Cada cálculo generado cuenta con un folio electrónico único que garantiza que los datos no han sido alterados y cumplen con la normativa vigente.
                                </p>
                            </div>
                            <Image src="https://cdn-icons-png.flaticon.com/512/6124/6124997.png" alt="Sello de Integridad" width={64} height={64} className="w-16 h-16 opacity-30 mix-blend-multiply" unoptimized />
                        </div>

                        <div className="relative z-10">
                            {dossiers.length > 0 ? (
                                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                            <tr>
                                                <th className="py-4 px-6">Descripción del Cálculo</th>
                                                <th className="py-4 px-6 text-center">Folio de Auditoría</th>
                                                <th className="py-4 px-6 text-center">Fecha de Emisión</th>
                                                <th className="py-4 px-6 text-right">Validación Legal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {dossiers.map((d) => (
                                                <tr
                                                    key={d.id}
                                                    onClick={() => setSelectedDossierId(d.id)}
                                                    className={`group transition-all cursor-pointer border-l-4 ${selectedDossierId === d.id ? 'bg-indigo-50/50 border-indigo-600' : 'hover:bg-slate-50 border-transparent'}`}
                                                >
                                                    <td className="py-5 px-6 font-bold text-slate-800 flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full shadow-inner ${selectedDossierId === d.id ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                                        {d.name}
                                                    </td>
                                                    <td className="py-5 px-6 text-center">
                                                        <code className="text-xs text-indigo-500 bg-indigo-100/50 border border-indigo-100 px-2 py-1 rounded-md font-mono" title={d.hash}>
                                                            RM-{new Date(d.createdAt).getFullYear()}-{d.hash?.substring(0, 4).toUpperCase()}
                                                        </code>
                                                    </td>
                                                    <td className="py-5 px-6 text-center text-slate-500 text-xs">
                                                        {new Date(d.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-5 px-6 text-right">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleVerify(d.id); }}
                                                                disabled={verifying === d.id}
                                                                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                                                            >
                                                                <Scale size={14} className={verifying === d.id ? "animate-spin" : ""} />
                                                                Validar
                                                            </button>
                                                            {selectedDossierId === d.id ? (
                                                                <AuthorityRetirementPDFButton
                                                                    clientName={userProfile?.name || 'Cliente'}
                                                                    input={d.input}
                                                                    strategyName={d.name}
                                                                    strategyResult={{
                                                                        pensionMensual: d.result.netPension || d.result.net_pension || d.result.pensionMensual || 0,
                                                                        totalInversion: d.result.investment || d.result.totalInversion || 0,
                                                                        roiMeses: d.result.roiMonths || d.result.roiMeses || 0
                                                                    }}
                                                                    projectionData={projectionForPdf}
                                                                    bundle={{
                                                                        integrity_hash: d.hash,
                                                                        generated_at: new Date(d.createdAt).toISOString(),
                                                                        version: "1.0.0"
                                                                    }}
                                                                    agencyProfile={sessionUser}
                                                                    fileName={`Certificado_${d.name.replace(/\s+/g, '_')}.pdf`}
                                                                    onClick={(e: any) => e.stopPropagation()}
                                                                />
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedDossierId(d.id);
                                                                        showToast("Extrayendo llaves y armando PDF...", "info");
                                                                    }}
                                                                    className="px-3 py-1.5 text-xs font-bold text-slate-400 bg-transparent hover:text-indigo-600 transition-colors flex items-center gap-1.5"
                                                                >
                                                                    <Download size={14} /> Seleccionar
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <Lock size={48} className="text-slate-300 mx-auto mb-4" />
                                    <h4 className="text-xl font-bold text-slate-800 mb-2">{isB2C ? 'Sin Documentos Aún' : 'Dossier Vacío'}</h4>
                                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">{isB2C ? 'Aún no has generado documentos certificados. Realiza tu primera simulación para activar tu expediente.' : 'No existen registros certificados asociados a este perfil.'}</p>
                                    <a href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-colors">
                                        Genera tu primera proyección para activar el Dossier
                                    </a>
                                </div>
                            )}
                        </div>
                    </Card>
                </LockedOverlay>

                {/* Oracle Pulse */}
                <LockedOverlay isLocked={isLocked} isB2C={isB2C}>
                    <Card className="bg-slate-900 border-none text-white relative overflow-hidden flex flex-col hover:shadow-2xl transition-all shadow-xl shadow-slate-900/10 h-full">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[50px] pointer-events-none" />

                        <div className="mb-8 relative z-10 flex-1">
                            <h3 className="text-2xl font-black flex items-center gap-3 mb-2">
                                <Activity className="text-emerald-400" size={28} />
                                Monitor de Leyes y Salarios
                            </h3>
                            <div className="flex items-center gap-2 mb-4 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-max">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">Datos Sincronizados con DOF e INEGI</span>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                El sistema se actualiza automáticamente con los valores vigentes de la UMA e inflación para garantizar cálculos con validez oficial.
                            </p>

                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <div className="bg-[#11172A] p-4 rounded-xl border border-slate-800">
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">UMA 2026 Vigente</p>
                                    <p className="text-xl font-black text-white">${legalData.uma_2026.toFixed(2)}</p>
                                </div>
                                <div className="bg-[#11172A] p-4 rounded-xl border border-slate-800">
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Inflación Base INPC</p>
                                    <p className="text-xl font-black text-emerald-400">4.82%</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={async () => {
                                const { syncEconomicAnchorsAction } = await import('@/actions/oracle-actions');
                                const res = await syncEconomicAnchorsAction();
                                if (res.success) showToast("Anchors Synced with DOF!", "success");
                                else showToast("Oracle Sync Failed.", "error");
                            }}
                            className="w-full relative z-10 px-6 py-4 bg-[#11172A] border border-slate-800 hover:border-emerald-500/50 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group hover:bg-[#1A223B]"
                        >
                            FORZAR SINCRONIZACIÓN MANUAL
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-emerald-400 group-hover:shadow-[0_0_5px_rgba(52,211,153,0.8)] transition-all"></div>
                        </button>
                    </Card>
                </LockedOverlay>
            </div>
        </div>
    );
}
