import { Lock, Scale, Download } from 'lucide-react';
import React from 'react';
import Image from 'next/image';
import { Card, LockedOverlay } from './shared';
import dynamic from 'next/dynamic';

const AuthorityRetirementPDFButton = dynamic(
    () => import('@/components/reports/PDFDownloadButtons').then(mod => mod.AuthorityRetirementPDFButton),
    { ssr: false }
);

interface AuditDossierProps {
    isLocked: boolean;
    isB2C: boolean;
    dossiers: any[];
    selectedDossierId: string | null;
    setSelectedDossierId: (id: string) => void;
    verifying: string | null;
    handleVerify: (id: string) => void;
    projectionForPdf: any[];
    userProfile: any;
    session: any;
    showToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}

export const AuditDossier: React.FC<AuditDossierProps> = ({
    isLocked,
    isB2C,
    dossiers,
    selectedDossierId,
    setSelectedDossierId,
    verifying,
    handleVerify,
    projectionForPdf,
    userProfile,
    session,
    showToast
}) => {
    return (
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
                                                            agencyProfile={session?.user}
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
    );
};
