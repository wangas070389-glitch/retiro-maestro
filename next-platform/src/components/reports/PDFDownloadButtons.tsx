'use client';

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FileText, ShieldCheck, Download, Scale } from 'lucide-react';
import { RetirementReport } from './RetirementReport';
import { ComprehensiveReport } from './ComprehensiveReport';
import { OfficialDocument } from './OfficialDocument';

// 1. Inercial/Strategy brief report button (RetirementReport) for Dashboard
export function InercialBriefPDFButton({
    clientName,
    input,
    strategyName,
    strategyResult,
    projectionData,
    bundle,
    certifiedDossier
}: any) {
    return (
        <PDFDownloadLink
            document={
                <RetirementReport
                    clientName={clientName}
                    input={input}
                    strategyName={strategyName}
                    strategyResult={strategyResult}
                    projectionData={projectionData}
                    bundle={bundle}
                    certifiedDossier={certifiedDossier}
                />
            }
            fileName="Resumen_Inercial_Soberano.pdf"
            className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg transition-colors text-[10px]"
        >
            {({ loading }) => (
                <>
                    <FileText size={14} />
                    {loading ? '...' : 'Descargar Resumen'}
                </>
            )}
        </PDFDownloadLink>
    );
}

// 2. Comprehensive report button (ComprehensiveReport) for Dashboard
export function InercialComprehensivePDFButton({
    clientName,
    input,
    strategyName,
    strategyResult,
    projectionData,
    bundle,
    certifiedDossier,
    aforeSaldos
}: any) {
    return (
        <PDFDownloadLink
            document={
                <ComprehensiveReport
                    clientName={clientName}
                    input={input}
                    strategyName={strategyName}
                    strategyResult={strategyResult}
                    projectionData={projectionData}
                    bundle={bundle}
                    certifiedDossier={certifiedDossier}
                    aforeSaldos={aforeSaldos}
                />
            }
            fileName="Estudio_Completo_Inercial.pdf"
            className="relative w-full flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold py-2.5 rounded-lg transition-all text-[10px] shadow-sm overflow-hidden group"
        >
            {({ loading }) => (
                <>
                    <ShieldCheck size={14} className="opacity-70 group-hover:opacity-100" />
                    {loading ? '...' : 'Estudio Completo'}
                </>
            )}
        </PDFDownloadLink>
    );
}

// 3. StrategyModal brief report button
export function StrategyModalBriefPDFButton({
    clientName,
    input,
    strategyName,
    strategyResult,
    baselineResult,
    baselineProjectionData,
    projectionData,
    bundle,
    certifiedDossier,
    agencyProfile
}: any) {
    return (
        <PDFDownloadLink
            document={
                <RetirementReport
                    clientName={clientName}
                    input={input}
                    strategyName={strategyName}
                    strategyResult={strategyResult}
                    baselineResult={baselineResult}
                    baselineProjectionData={baselineProjectionData}
                    projectionData={projectionData}
                    bundle={bundle}
                    certifiedDossier={certifiedDossier}
                    agencyProfile={agencyProfile}
                />
            }
            fileName={`Reporte_${strategyName.replace(/\s+/g, '_')}.pdf`}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-slate-700 font-bold rounded-xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm"
        >
            {({ loading }) => (
                <>
                    <FileText size={18} />
                    {loading ? 'Generando...' : 'Resumen Breve'}
                </>
            )}
        </PDFDownloadLink>
    );
}

// 4. StrategyModal detailed report button
export function StrategyModalDetailedPDFButton({
    clientName,
    input,
    strategyName,
    strategyResult,
    baselineResult,
    baselineProjectionData,
    projectionData,
    bundle,
    aforeSaldos,
    honorarios
}: any) {
    return (
        <PDFDownloadLink
            document={
                <ComprehensiveReport
                    clientName={clientName}
                    input={input}
                    strategyName={strategyName}
                    strategyResult={strategyResult}
                    baselineResult={baselineResult}
                    baselineProjectionData={baselineProjectionData}
                    projectionData={projectionData}
                    bundle={bundle}
                    aforeSaldos={aforeSaldos}
                    honorarios={honorarios}
                />
            }
            fileName={`Dossier_Completo_${strategyName.replace(/\s+/g, '_')}.pdf`}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 text-sm border-2 border-indigo-600 hover:border-indigo-700"
        >
            {({ loading }) => (
                <>
                    {loading ? 'Generando PDF...' : 'Desbloquear Plan Detallado'}
                </>
            )}
        </PDFDownloadLink>
    );
}

// 5. Official Document PDF Button for Authority Page
export function OfficialDocumentPDFButton({
    docType,
    clientName,
    nss,
    fileName,
    className,
    btnText
}: any) {
    return (
        <PDFDownloadLink
            document={<OfficialDocument docType={docType} clientName={clientName} nss={nss} />}
            fileName={fileName}
            className={className}
        >
            {({ loading }) => (
                loading ? 'Generando Documento...' : <><FileText size={18} /> {btnText}</>
            )}
        </PDFDownloadLink>
    );
}

// 6. Authority page retirement report PDF Button
export function AuthorityRetirementPDFButton({
    clientName,
    input,
    strategyName,
    strategyResult,
    projectionData,
    bundle,
    agencyProfile,
    fileName,
    onClick
}: any) {
    return (
        <PDFDownloadLink
            document={
                <RetirementReport
                    clientName={clientName}
                    input={input}
                    strategyName={strategyName}
                    strategyResult={strategyResult}
                    projectionData={projectionData}
                    bundle={bundle}
                    certifiedDossier={null}
                    agencyProfile={agencyProfile}
                />
            }
            fileName={fileName}
            className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 border border-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            onClick={onClick}
        >
            {({ loading }) => (
                loading ? <Scale size={14} className="animate-spin" /> : <><Download size={14} /> PDF Listo</>
            )}
        </PDFDownloadLink>
    );
}
