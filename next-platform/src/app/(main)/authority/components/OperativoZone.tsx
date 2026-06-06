'use client';

import React from 'react';
import { FileSignature, CalendarDays, ArrowRight, ShieldCheck } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Card, Badge, LockedOverlay } from './ui';
import { M40MonthlyPayment } from '@/lib/engine/m40-calculator';

const OfficialDocumentPDFButton = dynamic(
    () => import('@/components/reports/PDFDownloadButtons').then(mod => mod.OfficialDocumentPDFButton),
    { ssr: false }
);

interface OperativoZoneProps {
    isLocked: boolean;
    isB2C: boolean;
    userProfile: { name: string; nss: string; [key: string]: any };
    calendarData: M40MonthlyPayment[];
}

export function OperativoZone({ isLocked, isB2C, userProfile, calendarData }: OperativoZoneProps) {
    return (
        <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-6 flex items-center gap-2">
                <div className="w-8 h-px bg-slate-300"></div>
                Trámites y Documentación Oficial
                <div className="flex-1 h-px bg-slate-200"></div>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Generador de Escritos */}
                <LockedOverlay isLocked={isLocked} isB2C={isB2C}>
                    <Card className="border-t-4 border-t-blue-600 flex flex-col h-full hover:shadow-xl transition-shadow">
                        <div className="mb-6">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-2">
                                <FileSignature className="text-blue-600" size={28} />
                                Generador de Escritos
                            </h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                Documentos con la estructura legal exacta listos para presentar ante ventanilla del IMSS. Evita rechazos por formatos incorrectos.
                            </p>
                        </div>

                        <div className="space-y-4 flex-1">
                            {/* Document 1 */}
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-slate-800 text-lg">Inscripción a Mod. 40</p>
                                        <p className="text-sm text-slate-500">Escrito de continuación voluntaria.</p>
                                    </div>
                                    <Badge type="neutral">No Generado</Badge>
                                </div>
                                <OfficialDocumentPDFButton
                                    docType="m40"
                                    clientName={userProfile?.name || 'Cliente'}
                                    nss={userProfile?.nss || 'N/A'}
                                    fileName="Alta_Modalidad_40.pdf"
                                    className="w-full flex justify-center items-center gap-2 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 mt-2"
                                    btnText="Descargar Documento"
                                />
                            </div>

                            {/* Document 2 */}
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-slate-800 text-lg">Aviso de Baja Laboral</p>
                                        <p className="text-sm text-slate-500">Escrito para terminación de relación.</p>
                                    </div>
                                    <Badge type="neutral">No Generado</Badge>
                                </div>
                                <OfficialDocumentPDFButton
                                    docType="renuncia"
                                    clientName={userProfile?.name || 'Cliente'}
                                    nss={userProfile?.nss || 'N/A'}
                                    fileName="Baja_Voluntaria.pdf"
                                    className="w-full flex justify-center items-center gap-2 py-3 bg-white text-blue-600 border-2 border-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors mt-2"
                                    btnText="Descargar Documento"
                                />
                            </div>
                        </div>
                    </Card>
                </LockedOverlay>

                {/* Calendario de Pagos */}
                <LockedOverlay isLocked={isLocked} isB2C={isB2C}>
                    <Card className="border-t-4 border-t-emerald-500 flex flex-col h-full hover:shadow-xl transition-shadow relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] pointer-events-none" />
                        <div className="mb-6 relative z-10">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-2">
                                <CalendarDays className="text-emerald-600" size={28} />
                                Calendario de Aportaciones
                            </h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                Tu plan exacto de aportaciones para M40. Fechas límite e importes calculados al día natural.
                            </p>
                        </div>

                        <div className="flex-1 flex flex-col relative z-10">
                            {calendarData.length > 0 ? (
                                <div className="space-y-3 flex-1 h-full overflow-y-auto pr-2">
                                    {calendarData.map((item, idx) => (
                                        <div key={`${item.year}-${item.monthNumber}`} className={`flex items-center gap-4 p-4 rounded-xl border ${idx === 0 ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-slate-200'}`}>
                                            <div className="flex flex-col items-center justify-center min-w-[50px]">
                                                <span className="text-[10px] font-bold uppercase text-slate-400">{item.monthName.substring(0, 3)}</span>
                                                <span className={`text-2xl font-black ${idx === 0 ? 'text-emerald-700' : 'text-slate-800'}`}>17</span>
                                            </div>
                                            <div className="flex-1 border-l pl-4 border-slate-200">
                                                <p className="font-bold text-slate-800">Mensualidad {item.monthName}</p>
                                                <p className="text-xs text-slate-500">Tasa: {(item.rateApplied * 100).toFixed(3)}%</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-black text-xl ${idx === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                    ${item.paymentMxn.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                                                </p>
                                                {idx === 0 && <Badge type="emerald">Pagar Pronto</Badge>}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="mt-4 p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-sm flex gap-3 items-start shadow-inner">
                                        <ShieldCheck className="shrink-0 mt-0.5 text-amber-600" size={18} />
                                        <span className="leading-relaxed">
                                            <b>Aviso de Control:</b> Pagos extemporáneos activarán recargos irreversibles de actualización INPC.
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                                        <CalendarDays className="text-slate-300" size={32} />
                                    </div>
                                    <p className="font-bold text-slate-800 text-lg mb-2">Calendario Inactivo</p>
                                    <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                                        No se ha detectado una estrategia guardada con inversión bajo Ley 73 vigente.
                                    </p>
                                    <a href="/dashboard" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                                        Generar Plan para Activar Calendario <ArrowRight size={16} />
                                    </a>
                                </div>
                            )}
                        </div>
                    </Card>
                </LockedOverlay>
            </div>
        </div>
    );
}
