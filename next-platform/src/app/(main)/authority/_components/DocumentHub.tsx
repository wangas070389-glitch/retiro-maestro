'use client';

import { FileSignature } from 'lucide-react';
import React from 'react';
import { Card, Badge, LockedOverlay } from './shared';
import dynamic from 'next/dynamic';

const OfficialDocumentPDFButton = dynamic(
    () => import('@/components/reports/PDFDownloadButtons').then(mod => mod.OfficialDocumentPDFButton),
    { ssr: false }
);

interface DocumentHubProps {
    isLocked: boolean;
    isB2C: boolean;
    userProfile: any;
}

export const DocumentHub: React.FC<DocumentHubProps> = ({ isLocked, isB2C, userProfile }) => {
    return (
        <LockedOverlay isLocked={isLocked} isB2C={isB2C}>
            <Card className="border-t-4 border-t-blue-600 flex flex-col h-full hover:shadow-xl transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[100px] pointer-events-none" />
                
                <div className="mb-6 relative z-10">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 mb-2">
                        <FileSignature className="text-blue-600" size={28} />
                        Generador de Escritos Oficiales
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                        Documentos con la estructura legal exacta listos para presentar ante ventanilla del IMSS. Evita rechazos por formatos incorrectos.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 flex-1">
                    {/* Document 1 */}
                    <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">Inscripción a Mod. 40</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Escrito de continuación voluntaria para vigencia de derechos.</p>
                            </div>
                            <Badge type="neutral">No Generado</Badge>
                        </div>
                        <OfficialDocumentPDFButton
                            docType="m40"
                            clientName={userProfile?.name || 'Cliente'}
                            nss={userProfile?.nss || 'N/A'}
                            fileName="Alta_Modalidad_40.pdf"
                            className="w-full flex justify-center items-center gap-2 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 mt-2 text-xs"
                            btnText="Descargar Documento"
                        />
                    </div>

                    {/* Document 2 */}
                    <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">Aviso de Baja Laboral</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Escrito formal para solicitar la terminación voluntaria de la relación de trabajo.</p>
                            </div>
                            <Badge type="neutral">No Generado</Badge>
                        </div>
                        <OfficialDocumentPDFButton
                            docType="renuncia"
                            clientName={userProfile?.name || 'Cliente'}
                            nss={userProfile?.nss || 'N/A'}
                            fileName="Baja_Voluntaria.pdf"
                            className="w-full flex justify-center items-center gap-2 py-3 bg-white text-blue-600 border-2 border-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors dark:bg-slate-950 dark:hover:bg-slate-900 mt-2 text-xs"
                            btnText="Descargar Documento"
                        />
                    </div>
                </div>
            </Card>
        </LockedOverlay>
    );
};
