'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { History, FileText, Trash2, Calendar, DollarSign, Eye, Search, X, Loader2, ShieldCheck, ShieldAlert, Calculator } from 'lucide-react';
import { getSimulationsAction, deleteSimulationAction } from '@/actions/simulation-actions';
import { calculatePensionAction, calculateProjectionAction } from '@/actions/calculate-pension';
import { DossierBuilder } from '@/lib/engine/audit/dossier-builder';
import { useToast } from '@/components/ui/toast-context';
import { getPlan, Role, Tier } from '@/lib/config/pricing';
import dynamic from 'next/dynamic';

const InercialBriefPDFButton = dynamic(
    () => import('@/components/reports/PDFDownloadButtons').then(mod => mod.InercialBriefPDFButton),
    { ssr: false }
);

const InercialComprehensivePDFButton = dynamic(
    () => import('@/components/reports/PDFDownloadButtons').then(mod => mod.InercialComprehensivePDFButton),
    { ssr: false }
);

export default function SimulationsPage() {
    const { data: session } = useSession();
    const { showToast } = useToast();
    const searchParams = useSearchParams();
    const clientId = searchParams.get('clientId');

    const [simulations, setSimulations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSim, setSelectedSim] = useState<any | null>(null);
    
    // Modal Calculation state
    const [modalLoading, setModalLoading] = useState(false);
    const [calcResult, setCalcResult] = useState<any | null>(null);
    const [projectionData, setProjectionData] = useState<any[]>([]);
    const [bundle, setBundle] = useState<any | null>(null);
    const [vigenciaAlert, setVigenciaAlert] = useState<string | null>(null);

    const userRole = (session?.user as any)?.role as Role || 'USER';
    const userTier = (session?.user as any)?.tier as Tier || 'FREE';
    const currentPlan = getPlan(userRole, userTier);

    const loadSimulations = async () => {
        setLoading(true);
        const res = await getSimulationsAction(clientId);
        if (res.success && res.simulations) {
            setSimulations(res.simulations);
        } else {
            showToast("Error al cargar simulaciones", "error");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (session) {
            loadSimulations();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, clientId]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('¿Estás seguro de que deseas eliminar esta simulación permanentemente?')) return;

        const res = await deleteSimulationAction(id, clientId);
        if (res.success) {
            showToast("Estudio eliminado con éxito", "success");
            setSimulations(sims => sims.filter(s => s.id !== id));
            if (selectedSim?.id === id) setSelectedSim(null);
        } else {
            showToast("Error al eliminar el estudio: " + res.error, "error");
        }
    };

    const handleSelectSim = async (sim: any) => {
        setSelectedSim(sim);
        setModalLoading(true);
        setCalcResult(null);
        setProjectionData([]);
        setBundle(null);
        setVigenciaAlert(null);

        try {
            // Recalculate results for PDF outputs and audit bundle validation
            const response = await calculatePensionAction(sim.input);
            if (response.success) {
                setCalcResult(response.data);
                if (response.vigenciaAlert) setVigenciaAlert(response.vigenciaAlert);

                // Fetch projections
                const projRes = await calculateProjectionAction(sim.input, 'inercial', 0);
                setProjectionData(projRes.projection);

                // Build forensic bundle
                if (projRes.projection && projRes.projection.length > 0) {
                    const adhocBundle = await DossierBuilder.buildAdHocBundle({
                        strategy: "Situación Inercial Basal",
                        mode: 'inercial',
                        data: projRes.projection[projRes.projection.length - 1]
                    });
                    setBundle(adhocBundle);
                }
            } else {
                showToast("Error al recalcular resultados: " + response.error, "error");
            }
        } catch (err) {
            console.error("Calculation load error:", err);
            showToast("Falla de cálculo en el servidor", "error");
        } finally {
            setModalLoading(false);
        }
    };

    const filteredSimulations = simulations.filter(sim =>
        sim.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-3xl font-light tracking-tight text-slate-800 flex items-center gap-3">
                        <History className="text-indigo-600 w-8 h-8" />
                        Estudios Guardados
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Historial de simulaciones y reportes oficiales listos para descarga y auditoría.
                    </p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                    <p className="text-slate-400 text-sm">Consultando registros en base de datos...</p>
                </div>
            ) : filteredSimulations.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 p-8 text-center">
                    <FileText className="w-16 h-16 text-slate-300 mb-4" />
                    <h3 className="text-slate-700 font-bold text-lg mb-1">Sin registros encontrados</h3>
                    <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                        {searchQuery ? "No hay estudios que coincidan con la búsqueda." : "No tienes estudios guardados todavía. Ve al Simulador para calcular y guardar tu primer reporte."}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre del Estudio</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Semanas</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Salario Diario Prom.</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pensión Neta</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha de Creación</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredSimulations.map((sim) => (
                                    <tr key={sim.id} className="hover:bg-slate-50/70 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-100 transition-colors shrink-0">
                                                    <FileText size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-slate-800 text-sm truncate max-w-[300px]">{sim.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-mono">ID: {sim.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-slate-700">{sim.input.weeks}</span>
                                            <span className="text-xs text-slate-400 ml-1">semanas</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-slate-700">${sim.input.salary_prom.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-emerald-600 flex items-center gap-0.5">
                                                <DollarSign size={13} strokeWidth={3} />
                                                {sim.result?.with_decree_111?.toLocaleString('es-MX', { maximumFractionDigits: 0 }) || sim.result?.netPension?.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={13} />
                                                {new Date(sim.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleSelectSim(sim)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                    title="Ver Detalles y Descargar PDF"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(e, sim.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal: Read-only Details & PDFs */}
            {selectedSim && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-100 shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold tracking-tight">{selectedSim.name}</h3>
                                <p className="text-[10px] text-slate-400 font-mono mt-1">ID: {selectedSim.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedSim(null)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                                title="Cerrar"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {modalLoading ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                                    <p className="text-slate-400 text-xs">Calculando proyección actuarial e integrity hash...</p>
                                </div>
                            ) : calcResult ? (
                                <div className="space-y-6">
                                    {/* Warnings */}
                                    {vigenciaAlert && (
                                        <div className="p-4 rounded-xl border bg-amber-50 border-amber-200 text-amber-900 flex items-start gap-3">
                                            <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-bold text-xs">Alerta de Conservación de Derechos</h4>
                                                <p className="text-[11px] leading-relaxed opacity-95 mt-0.5">{vigenciaAlert}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Hero Pension Card */}
                                    <div className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl text-white shadow-md relative overflow-hidden">
                                        <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                                            <ShieldCheck size={200} />
                                        </div>
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">Pensión Estimada Sin Cambios (Basal)</p>
                                        <div className="flex items-baseline gap-1 mt-2">
                                            <span className="text-3xl font-black">${calcResult.with_decree_111.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</span>
                                            <span className="text-xs text-indigo-300 font-bold">MXN / mes netos</span>
                                        </div>
                                        <p className="text-[9px] text-indigo-200/80 mt-2 font-mono">Generado bajo los parámetros del estudio guardado.</p>
                                    </div>

                                    {/* Results 2x2 Grid */}
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Desglose de cálculo:</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
                                                <p className="text-[9px] text-slate-400 font-bold uppercase">Pensión Bruta (Anualizada)</p>
                                                <p className="text-sm font-black text-slate-800">${calcResult.with_decree_111.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
                                                <p className="text-[9px] text-slate-400 font-bold uppercase">ISR Estimado Retenido</p>
                                                <p className="text-sm font-black text-red-500">-${calcResult.tax_retained.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
                                                <p className="text-[9px] text-slate-400 font-bold uppercase">Asignación por Edad</p>
                                                <p className="text-sm font-black text-amber-600">{calcResult.age_penalty}%</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
                                                <p className="text-[9px] text-slate-400 font-bold uppercase">SBC Topado</p>
                                                <p className="text-sm font-black text-slate-800">${calcResult.capped_salary.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Parameters overview */}
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
                                        <h4 className="text-xs font-bold text-slate-600 uppercase">Parámetros del Estudio</h4>
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                                <p className="text-[9px] text-slate-400 font-bold">EDAD DE RETIRO</p>
                                                <p className="text-xs font-extrabold text-slate-700">{selectedSim.input.retirement_age || selectedSim.input.age} Años</p>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                                <p className="text-[9px] text-slate-400 font-bold">SEMANAS</p>
                                                <p className="text-xs font-extrabold text-slate-700">{selectedSim.input.weeks} Sem</p>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                                <p className="text-[9px] text-slate-400 font-bold">SALARIO DIARIO</p>
                                                <p className="text-xs font-extrabold text-slate-700">${selectedSim.input.salary_prom}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Row - PDFs */}
                                    <div className="space-y-2.5 pt-4 border-t border-slate-100">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Exportar Reportes Oficiales</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <InercialBriefPDFButton
                                                clientName={session?.user?.name || 'Cliente'}
                                                input={selectedSim.input}
                                                strategyName="Situación Inercial Basal"
                                                strategyResult={{
                                                    pensionMensual: calcResult.with_decree_111,
                                                    totalInversion: 0,
                                                    roiMeses: 0
                                                }}
                                                projectionData={projectionData}
                                                bundle={bundle ? {
                                                    integrity_hash: bundle.integrity_hash,
                                                    generated_at: bundle.generated_at,
                                                    version: bundle.version
                                                } : undefined}
                                            />

                                            {currentPlan.allowedFeatures.pdfExport ? (
                                                <InercialComprehensivePDFButton
                                                    clientName={session?.user?.name || 'Cliente'}
                                                    input={selectedSim.input}
                                                    strategyName="Situación Inercial Basal"
                                                    strategyResult={{
                                                        pensionMensual: calcResult.with_decree_111,
                                                        totalInversion: 0,
                                                        roiMeses: 0
                                                    }}
                                                    projectionData={projectionData}
                                                    bundle={bundle && currentPlan.allowedFeatures.integrityBundle ? {
                                                        integrity_hash: bundle.integrity_hash,
                                                        generated_at: bundle.generated_at,
                                                        version: bundle.version
                                                    } : undefined}
                                                    aforeSaldos={selectedSim.input.aforeSaldos}
                                                />
                                            ) : (
                                                <button 
                                                    onClick={() => {
                                                        setSelectedSim(null);
                                                        showToast("Desbloquea el plan activo para descargar reportes completos", "warning");
                                                    }}
                                                    className="w-full flex items-center justify-center gap-1.5 bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed font-bold py-2.5 rounded-xl text-xs"
                                                >
                                                    <ShieldAlert size={14} /> Reporte Completo Cerrado
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[9px] text-slate-400 text-center mt-2">
                                            * El Estudio Completo con Sello Forense requiere un plan activo en tu perfil.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-400 text-xs">
                                    No se pudieron obtener los datos de la simulación.
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setSelectedSim(null)}
                                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
