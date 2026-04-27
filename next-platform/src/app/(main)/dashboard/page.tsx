'use client';

import { useState, useEffect } from 'react';
import { Download, Plus, LayoutDashboard, History, DownloadCloud, ShieldCheck, FileText, Info, ArrowRight, Calculator, ShieldAlert } from 'lucide-react';
import { calculatePensionAction } from '@/actions/calculate-pension';
import { saveSimulationAction } from '@/actions/simulation-actions';
import { useSession } from "next-auth/react";
import { useToast } from '../../../components/ui/toast-context';
import { Skeleton } from '../../../components/ui/skeleton';
import { useSearchParams } from 'next/navigation';

import { useSimulationStore } from '../../../store';
import { InverseDesign } from '../../../components/inverse-design';
import { StrategyCards } from '../../../components/strategy-cards';
import { SavedSimulations } from '../../../components/SavedSimulations';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { PRICING_CONFIG, Role, Tier, getPlan } from '@/lib/config/pricing';
import { ProductPaywall } from '../../../components/monetization/ProductPaywall';
import { ExecutiveRecommendationComponent } from '../../../components/monetization/ExecutiveRecommendation';
import { ExecutiveRecommendation } from '@/lib/engine/roi-optimizer';
import { RetirementReport } from '../../../components/reports/RetirementReport';
import { ComprehensiveReport } from '../../../components/reports/ComprehensiveReport';
import { PensionEngine, PensionResult } from '../../../lib/engine/pension-engine';
import { DossierBuilder, ForensicBundle } from '../../../lib/engine/audit/dossier-builder';

import { TrialStatus } from '../../../lib/trial-guard';
import { checkTrialStatusAction } from '@/actions/check-trial-status';
import { TrialBadge } from '../../../components/trial/TrialBadge';
import { TrialLockout } from '../../../components/trial/TrialLockout';

const engine = new PensionEngine();

export default function Dashboard() {
    const { data: session } = useSession();
    const { showToast } = useToast();
    const searchParams = useSearchParams();
    const clientId = searchParams.get('clientId');

    const { scenarioA, updateScenarioA, userProfile, certified_dossier, setCertifiedDossier } = useSimulationStore();
    const [result, setResult] = useState<PensionResult | null>(null);
    const [recommendations, setRecommendations] = useState<ExecutiveRecommendation[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [bundle, setBundle] = useState<ForensicBundle | null>(null);
    const [activeTab, setActiveTab] = useState<'simulacion' | 'estrategias' | 'medida'>('simulacion');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
    const [vigenciaAlert, setVigenciaAlert] = useState<{ message: string, type: 'warning' | 'error' } | null>(null);
    const [leadStatusObj, setLeadStatusObj] = useState<{status: string, state: string, advisorName: string | null} | null>(null);

    const userRole = (session?.user as any)?.role as Role || 'USER';
    const userTier = (session?.user as any)?.tier as Tier || 'FREE';
    const currentPlan = getPlan(userRole, userTier);

    // Epic 18: B2C Matchmaking Long-Poller
    useEffect(() => {
        if (session?.user?.role === 'USER') {
            const checkStatus = async () => {
                const { checkLeadStatusAction } = await import('@/actions/routing-actions');
                const res = await checkLeadStatusAction();
                if (res.success && res.status) {
                    setLeadStatusObj({
                        status: res.status,
                        state: res.state || 'Nacional',
                        advisorName: res.advisorName || null
                    });
                }
            };
            
            checkStatus();
            
            const interval = setInterval(async () => {
                const { checkLeadStatusAction } = await import('@/actions/routing-actions');
                const res = await checkLeadStatusAction();
                if (res.success && res.status) {
                    setLeadStatusObj({
                        status: res.status,
                        state: res.state || 'Nacional',
                        advisorName: res.advisorName || null
                    });
                    if (res.status === 'CLAIMED' || res.status === 'NONE') {
                        clearInterval(interval);
                    }
                }
            }, 8000); 
            
            return () => clearInterval(interval);
        }
    }, [session]);

    // Fetch trial status on mount
    useEffect(() => {
        checkTrialStatusAction().then(res => {
            if (res.success && res.status) {
                setTrialStatus(res.status);
            }
        });
    }, []);

    const handleInputMutation = (field: string, newValue: number) => {
        updateScenarioA({ [field]: newValue });

        if (certified_dossier) {
            showToast("Precisión Forense Rota: Se modificaron parámetros manualmente.", "warning");
            setCertifiedDossier(null);
        }
    };

    const inercialProjection = result ? engine.calculateProjection(
        scenarioA.input,
        Math.max(0, (scenarioA.input.retirement_age || 65) - scenarioA.input.age),
        'inercial',
        0,
        undefined,
        undefined,
        undefined
    ) : [];

    useEffect(() => {
        if (result && inercialProjection.length > 0) {
            DossierBuilder.buildAdHocBundle({
                strategy: "Situación Inercial Basal",
                mode: 'inercial',
                data: inercialProjection[inercialProjection.length - 1]
            }).then(setBundle);
        } else {
            setBundle(null);
        }
    }, [result]);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setVigenciaAlert(null); // Reset
        const response = await calculatePensionAction(formData);

        setLoading(false);

        if (response.success) {
            setResult(response.data);
            if (response.recommendations) {
                setRecommendations(response.recommendations);
            }
            if (response.vigenciaAlert) {
                setVigenciaAlert({ message: response.vigenciaAlert, type: 'warning' });
                showToast("Cálculo exitoso con advertencia de Vigencia", "warning");
            } else {
                showToast("Pensión calculada exitosamente", "success");
            }
        } else {
            if (response.needsRecovery) {
                setVigenciaAlert({ message: response.error, type: 'error' });
                setResult(null); // Block results
                showToast("Derechos Vencidos (Art. 150)", "error");
            } else {
                showToast("Error: " + response.error, "error");
            }
        }
    }


    const isAuctioning = leadStatusObj?.status === 'PENDING_INTERNAL' || 
                         leadStatusObj?.status === 'PENDING_LOCAL' || 
                         leadStatusObj?.status === 'PENDING_NATIONAL';

    if (isAuctioning) {
        return (
            <div className="w-full min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-2xl shadow-xl relative overflow-hidden w-full">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-indigo-500 animate-pulse"></div>
                    <div className="mb-8 relative mx-auto w-24 h-24 flex items-center justify-center">
                        <div className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/30 rounded-full animate-ping opacity-75"></div>
                        <ShieldAlert className="w-12 h-12 text-emerald-600 dark:text-emerald-400 relative z-10" />
                    </div>
                    <h2 className="text-3xl font-light tracking-tight text-slate-800 dark:text-slate-100 mb-4">
                        Analizando perfiles de expertos...
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                        Buscando el mejor perfil en tu zona geográfica (<strong className="text-emerald-600 dark:text-emerald-400">{leadStatusObj?.state}</strong>)
                    </p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-6 font-mono opacity-60">
                        {userRole === 'USER' ? 'Buscando al mejor experto para ti...' : `${leadStatusObj?.status} ROUTING ENGINE ACTIVE`}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">

            {/* Trial Lockout Overlay */}
            {trialStatus?.isLocked && trialStatus.reason && (
                <TrialLockout
                    reason={trialStatus.reason}
                    daysRemaining={trialStatus.daysRemaining}
                    simulationsUsed={trialStatus.simulationsUsed}
                    simulationsMax={2}
                />
            )}

            {/* Trial Badge (shown when trial is active, not when locked) */}
            {trialStatus && !trialStatus.isLocked && (
                <div className="flex justify-end">
                    <TrialBadge
                        daysRemaining={trialStatus.daysRemaining}
                        simulationsUsed={trialStatus.simulationsUsed}
                        simulationsMax={2}
                        isLocked={trialStatus.isLocked}
                    />
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex space-x-2 md:space-x-8 mb-8 border-b border-slate-200 overflow-x-auto pb-2">
                <button
                    onClick={() => setActiveTab('simulacion')}
                    className={`pb-4 px-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'simulacion' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    1. {userRole === 'USER' ? 'Tu Pensión' : 'Simulación Básica'}
                </button>
                <button
                    onClick={() => setActiveTab('estrategias')}
                    className={`pb-4 px-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'estrategias' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'} ${!result ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!result}
                >
                    2. {userRole === 'USER' ? '¿Cómo Mejorarla?' : 'Estrategias Recomendadas'}
                </button>
                <button
                    onClick={() => setActiveTab('medida')}
                    className={`pb-4 px-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'medida' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    3. {userRole === 'USER' ? 'Diseña Tu Meta' : 'Diseño a Medida'}
                </button>
            </div>

            {activeTab === 'simulacion' && (
                <>
                    {/* Hero Result Block for Immediate Clarity */}
                    {result && (
                        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 md:p-10 rounded-[2rem] shadow-2xl text-white relative overflow-hidden mb-8 ring-1 ring-indigo-500/20">
                            <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck size={180} /></div>
                            <h2 className="text-xs md:text-sm font-bold tracking-[0.2em] text-indigo-400 mb-4 animate-in fade-in">{userRole === 'USER' ? 'Tu pensión estimada sin cambios' : 'Pensión Inercial Proyectada'} (A los {scenarioA.input.retirement_age || 65} años)</h2>
                            <div className="flex items-baseline gap-2 mb-3">
                                <span className="text-3xl font-bold text-indigo-300">$</span>
                                <p className="text-5xl md:text-7xl font-bold tracking-tighter">
                                    {result.net_pension.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                                </p>
                                <span className="text-lg md:text-xl text-indigo-300 font-bold ml-2">MXN / mes</span>
                            </div>
                            <p className="text-indigo-200 text-sm md:text-base max-w-xl">
                                Si te retiras a los {scenarioA.input.retirement_age || 65} años bajo estas condiciones, recibirías aproximadamente esta cantidad mensual.
                            </p>
                            <div className="mt-8 flex flex-col md:flex-row items-start md:items-center gap-4">
                                <button
                                    onClick={() => setActiveTab('estrategias')}
                                    className="bg-white text-indigo-900 font-bold px-6 py-3 rounded-xl shadow-[0_10px_20px_rgba(255,255,255,0.1)] hover:bg-slate-50 transition-all flex items-center gap-2 group transform hover:-translate-y-0.5"
                                >
                                    Ver cómo aumentarla con Estrategias <ArrowRight size={16} className="text-indigo-600 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <div className="flex flex-wrap gap-2">
                                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase">
                                        <ShieldCheck size={12} /> Validado
                                    </div>
                                    <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase tooltip" title="Impacto Inercial">
                                        Impacto Base
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-indigo-500/30 flex justify-between items-center text-xs text-indigo-200">
                                <span>Techo Legal Máximo Estimado (25 UMAs): <strong className="text-white">${Math.round(engine.maxPossiblePension(scenarioA.input)).toLocaleString('es-MX')} MXN</strong></span>
                                <button onClick={() => setActiveTab('estrategias')} className="underline hover:text-white transition-colors">Descubrir cómo</button>
                            </div>
                        </div>
                    )}

                    {vigenciaAlert && (
                        <div className={`mb-8 p-6 rounded-2xl border flex items-start gap-4 animate-in slide-in-from-top-4 ${vigenciaAlert.type === 'error' ? 'bg-red-50 border-red-200 text-red-900 shadow-red-100' : 'bg-amber-50 border-amber-200 text-amber-900 shadow-amber-100'} shadow-lg`}>
                            <div className={`p-3 rounded-full ${vigenciaAlert.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                <ShieldAlert size={24} />
                            </div>
                            <div>
                                <h3 className={`font-bold text-lg mb-1 ${vigenciaAlert.type === 'error' ? 'text-red-700' : 'text-amber-700'}`}>
                                    {vigenciaAlert.type === 'error' ? 'Suspensión por Vigencia de Derechos' : 'Alerta de Conservación de Derechos'}
                                </h3>
                                <p className="text-sm font-medium leading-relaxed opacity-90">{vigenciaAlert.message}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Input Form */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                            {certified_dossier && (
                                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3 animate-in fade-in">
                                    <div className="mt-0.5 text-emerald-600">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-emerald-800">Cálculo Validado</h3>
                                        <p className="text-xs text-emerald-600 font-mono mt-1">
                                            Cargado desde: {certified_dossier.source_filename} ({(certified_dossier.confidence * 100).toFixed(0)}% verificado)
                                        </p>
                                    </div>
                                </div>
                            )}
                            <h2 className="text-xl font-semibold mb-4 text-indigo-600">Parámetros de Entrada</h2>
                            <form action={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="age" className="block text-sm text-slate-600 mb-1">Edad Actual</label>
                                    <input
                                        id="age"
                                        name="age"
                                        type="number"
                                        value={scenarioA.input.age}
                                        onChange={(e) => handleInputMutation('age', Number(e.target.value))}
                                        className={`w-full border rounded p-2 outline-none transition-colors ${certified_dossier ? 'bg-emerald-50/50 border-emerald-300 text-emerald-900 focus:ring-2 focus:ring-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500'}`}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="retirement_age" className="block text-sm text-slate-600 mb-1 font-bold text-indigo-600">Edad de Retiro Objetivo</label>
                                    <input
                                        id="retirement_age"
                                        name="retirement_age"
                                        type="number"
                                        value={scenarioA.input.retirement_age}
                                        onChange={(e) => updateScenarioA({ retirement_age: Number(e.target.value) })}
                                        className="w-full bg-indigo-50 border border-indigo-200 rounded p-2 text-indigo-900 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="weeks" className="flex items-center gap-1 text-sm text-slate-600 mb-1">
                                        Semanas Cotizadas
                                        <div className="group relative flex items-center">
                                            <Info size={14} className="text-slate-400 cursor-help" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-slate-800 text-white text-[10px] rounded p-2 text-center shadow-lg z-50">
                                                Total de semanas reconocidas por el IMSS. {certified_dossier ? 'Protegido por documento oficial.' : 'Fundamental para el cálculo de cuantía básica.'}
                                            </div>
                                        </div>
                                    </label>
                                    <input
                                        id="weeks"
                                        name="weeks"
                                        type="number"
                                        value={scenarioA.input.weeks}
                                        readOnly={!!certified_dossier}
                                        onChange={(e) => handleInputMutation('weeks', Number(e.target.value))}
                                        className={`w-full border rounded p-2 outline-none transition-colors ${certified_dossier ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed select-none' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500'}`}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="salary_prom" className="flex items-center gap-1 text-sm text-slate-600 mb-1">
                                        Tu salario promedio diario ante el IMSS
                                        <div className="group relative flex items-center">
                                            <Info size={14} className="text-slate-400 cursor-help" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-52 bg-slate-800 text-white text-[10px] rounded p-2 text-center shadow-lg z-50">
                                                SBC promedio de las últimas 250 semanas. {certified_dossier ? 'Cálculo actuarial verificado.' : 'Topado a 25 UMAS de la fecha de alta.'}
                                            </div>
                                        </div>
                                    </label>
                                    <input
                                        id="salary_prom"
                                        name="salary_prom"
                                        type="number"
                                        step="0.01"
                                        value={scenarioA.input.salary_prom}
                                        readOnly={!!certified_dossier}
                                        onChange={(e) => handleInputMutation('salary_prom', Number(e.target.value))}
                                        className={`w-full border rounded p-2 outline-none transition-colors ${certified_dossier ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed select-none' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500'}`}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="last_termination_date" className={`flex items-center gap-1 text-sm font-bold mb-1 transition-colors ${scenarioA.input.is_ongoing_work ? 'text-slate-400' : 'text-slate-900'}`}>
                                        Fecha de Baja {scenarioA.input.is_ongoing_work ? '(No requerida)' : '(Obligatoria)'}
                                        <div className="group relative flex items-center">
                                            <Info size={14} className={`${scenarioA.input.is_ongoing_work ? 'text-slate-300' : 'text-blue-500'} cursor-help`} />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 bg-slate-800 text-white text-[10px] rounded p-2 text-center shadow-lg z-50">
                                                {scenarioA.input.is_ongoing_work 
                                                    ? "Al estar cotizando actualmente, no es necesario este dato." 
                                                    : "Este dato es VITAL para el Art. 150 (Vigencia de Derechos). Si no la conoces, consulta tu Constancia."}
                                            </div>
                                        </div>
                                    </label>
                                    <input
                                        id="last_termination_date"
                                        name="last_termination_date"
                                        type="date"
                                        required={!scenarioA.input.is_ongoing_work}
                                        disabled={scenarioA.input.is_ongoing_work}
                                        value={scenarioA.input.last_termination_date || ''}
                                        onChange={(e) => updateScenarioA({ last_termination_date: e.target.value })}
                                        className={`w-full border-2 rounded-xl p-3 outline-none transition-all ${scenarioA.input.is_ongoing_work 
                                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60' 
                                            : 'bg-blue-50 border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-500'}`}
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                        className="text-xs text-slate-500 hover:text-indigo-600 font-bold tracking-widest flex items-center transition-colors pb-1"
                                    >
                                        <svg className={`w-4 h-4 mr-1 transform transition-transform ${showAdvanced ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                        Opciones Avanzadas
                                    </button>
                                    <p className="text-[10px] text-slate-400 mb-2 pl-5">Ajustes opcionales para simulaciones más detalladas.</p>

                                    {showAdvanced && (
                                        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg animate-in fade-in slide-in-from-top-2">
                                            <label htmlFor="inflation" className="flex items-center gap-2 text-sm text-indigo-600 mb-2 font-medium">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                                Ajuste por Inflación (%)
                                            </label>
                                            <input
                                                id="inflation"
                                                name="inflation_percentage"
                                                type="number"
                                                step="0.01"
                                                defaultValue={0}
                                                className="w-full bg-white border border-indigo-200 rounded p-2 text-indigo-900 placeholder-indigo-300 focus:ring-1 focus:ring-indigo-500 outline-none font-bold"
                                                placeholder="e.g. 10.22"
                                            />
                                            <p className="text-[10px] text-indigo-500 mt-1">Recomendado: 10.22% (Feb 2026)</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold text-slate-500 tracking-widest">Estatus Laboral & Continuidad</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="flex items-center space-x-2 p-2 bg-slate-50 border border-slate-200 rounded cursor-pointer hover:bg-slate-100 transition-colors">
                                            <input
                                                name="has_wife"
                                                type="checkbox"
                                                checked={scenarioA.input.has_wife}
                                                onChange={(e) => updateScenarioA({ has_wife: e.target.checked })}
                                                className="accent-indigo-500 h-4 w-4"
                                            />
                                            <span className="text-xs text-slate-700">Beneficio adicional por tu edad</span>
                                        </label>

                                        <label className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${scenarioA.input.is_ongoing_work ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
                                            <input
                                                type="checkbox"
                                                name="is_ongoing_work"
                                                checked={scenarioA.input.is_ongoing_work || false}
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    updateScenarioA({ 
                                                        is_ongoing_work: isChecked,
                                                        ...(isChecked ? { last_termination_date: undefined } : {})
                                                    });
                                                }}
                                                className="accent-indigo-500 h-5 w-5"
                                            />
                                            <div className="flex flex-col">
                                                <span className={`text-[11px] font-bold ${scenarioA.input.is_ongoing_work ? 'text-indigo-700' : 'text-slate-600'}`}>
                                                    {scenarioA.input.is_ongoing_work ? "🟢 Actualmente cotizando" : "⚪ Semanas congeladas"}
                                                </span>
                                                <span className="text-[9px] text-slate-400 leading-none mt-0.5">
                                                    {scenarioA.input.is_ongoing_work ? "Estado: Activo" : "Estado: Inactivo"}
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                           <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-4">
                                    <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">Cargas Familiares (Asignaciones)</p>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">¿Cuántos hijos tienes?</label>
                                            <div className="flex items-center gap-4">
                                                <button type="button" onClick={() => {
                                                    const newCount = Math.max(0, scenarioA.input.children_count - 1);
                                                    updateScenarioA({ 
                                                        children_count: newCount,
                                                        children_data: scenarioA.input.children_data?.slice(0, newCount) || []
                                                    });
                                                }} className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all font-black">-</button>
                                                <span className="text-xl font-black text-slate-900 w-6 text-center">{scenarioA.input.children_count}</span>
                                                <button type="button" onClick={() => {
                                                    const newCount = Math.min(5, scenarioA.input.children_count + 1);
                                                    const newData = [...(scenarioA.input.children_data || [])];
                                                    if (newData.length < newCount) newData.push({ age: 0, is_studying: false });
                                                    updateScenarioA({ 
                                                        children_count: newCount,
                                                        children_data: newData
                                                    });
                                                }} className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all font-black">+</button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Padres Dependientes</label>
                                            <div className="flex items-center gap-4">
                                                <button type="button" onClick={() => updateScenarioA({ dependent_parents_count: Math.max(0, scenarioA.input.dependent_parents_count - 1) })} className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all font-black">-</button>
                                                <span className="text-xl font-black text-slate-900 w-6 text-center">{scenarioA.input.dependent_parents_count}</span>
                                                <button type="button" onClick={() => updateScenarioA({ dependent_parents_count: Math.min(2, scenarioA.input.dependent_parents_count + 1) })} className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all font-black">+</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Granular Child Validation */}
                                    {scenarioA.input.children_count > 0 && (
                                        <div className="space-y-3 mt-4 pt-4 border-t border-slate-200 animate-in slide-in-from-top-2">
                                            {Array.from({ length: scenarioA.input.children_count }).map((_, i) => (
                                                <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                    <div className="w-6 h-6 bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center rounded-lg">#{i+1}</div>
                                                    <div className="flex-1">
                                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Edad</label>
                                                        <input 
                                                            type="number" 
                                                            title="Edad del hijo"
                                                            placeholder="0"
                                                            className="w-full text-sm font-bold bg-transparent outline-none text-slate-800"
                                                            value={scenarioA.input.children_data?.[i]?.age || 0}
                                                            onChange={(e) => {
                                                                const newData = [...(scenarioA.input.children_data || [])];
                                                                newData[i] = { ...newData[i], age: Number(e.target.value) };
                                                                updateScenarioA({ children_data: newData });
                                                            }}
                                                        />
                                                    </div>
                                                    {(scenarioA.input.children_data?.[i]?.age || 0) >= 16 && (scenarioA.input.children_data?.[i]?.age || 0) <= 25 && (
                                                        <div className="flex items-center gap-2 pr-2">
                                                            <input 
                                                                type="checkbox" 
                                                                id={`studying-${i}`}
                                                                className="accent-emerald-500 w-4 h-4"
                                                                checked={scenarioA.input.children_data?.[i]?.is_studying || false}
                                                                onChange={(e) => {
                                                                    const newData = [...(scenarioA.input.children_data || [])];
                                                                    newData[i] = { ...newData[i], is_studying: e.target.checked };
                                                                    updateScenarioA({ children_data: newData });
                                                                }}
                                                            />
                                                            <label htmlFor={`studying-${i}`} className="text-[10px] font-bold text-emerald-600 uppercase">¿Estudia?</label>
                                                        </div>
                                                    )}
                                                    {(scenarioA.input.children_data?.[i]?.age || 0) > 25 && (
                                                        <div className="px-2 py-1 bg-red-50 text-red-600 text-[9px] font-bold rounded-lg border border-red-100 uppercase">
                                                            No asignable (+25)
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                       </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors mt-4 disabled:opacity-50"
                                >
                                    {loading ? 'Calculando en Servidor...' : 'Calcular Pensión'}
                                </button>
                            </form>
                        </div>

                        {/* Results Panel */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h2 className="text-xl font-semibold mb-4 text-emerald-600">Así se compone tu pensión estimada:</h2>

                            {loading ? (
                                <div className="space-y-4 animate-pulse">
                                    <Skeleton className="h-32 w-full bg-slate-200" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Skeleton className="h-20 w-full bg-slate-200" />
                                        <Skeleton className="h-20 w-full bg-slate-200" />
                                    </div>
                                    <Skeleton className="h-12 w-full bg-slate-100" />
                                </div>
                            ) : result ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                            <span className="text-xs text-slate-500 font-medium">Pensión Bruta (Anualizada)</span>
                                            <span className="text-sm font-bold text-slate-800">${result.with_decree_111.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                            <span className="text-xs text-slate-500 font-medium">ISR Estimado Retenido</span>
                                            <span className="text-sm font-bold text-red-500">-${result.tax_retained.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                            <span className="text-xs text-slate-500 font-medium">Asignación por Edad ({scenarioA.input.retirement_age || 65} años)</span>
                                            <span className="text-sm font-bold text-amber-600">{result.age_penalty}%</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                            <span className="text-xs text-slate-500 font-medium">Salario Base de Cotización Topado</span>
                                            <span className="text-sm font-bold text-slate-800">${result.capped_salary.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-700">

                                        <form action={async (formData) => {
                                            const name = `Estrategia INERCIAL - ${new Date().toLocaleDateString()}`;
                                            const input = scenarioA.input;
                                            const resData = {
                                                ...result,
                                                strategyType: "INERCIAL",
                                                investment: 0,
                                                netPension: result.net_pension,
                                                roiMonths: 0
                                            };
                                            const res = await saveSimulationAction(name, input, resData, bundle?.integrity_hash, clientId);
                                            if (res.success) showToast("Estrategia guardada! ID: " + res.id, "success");
                                            else showToast("Error: " + res.error, "error");
                                        }}>
                                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors text-sm shadow-md mb-2">
                                                Guardar en Mis Estudios
                                            </button>
                                        </form>

                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <PDFDownloadLink
                                                document={
                                                    <RetirementReport
                                                        clientName={userProfile.name}
                                                        input={scenarioA.input}
                                                        strategyName="Situación Inercial Basal"
                                                        strategyResult={{
                                                            pensionMensual: result.with_decree_111,
                                                            totalInversion: 0,
                                                            roiMeses: 0
                                                        }}
                                                        projectionData={inercialProjection}
                                                        bundle={bundle ? {
                                                            integrity_hash: bundle.integrity_hash,
                                                            generated_at: bundle.generated_at,
                                                            version: bundle.version
                                                        } : undefined}
                                                        certifiedDossier={certified_dossier}
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

                                            {currentPlan.allowedFeatures.pdfExport ? (
                                                <PDFDownloadLink
                                                    document={
                                                        <ComprehensiveReport
                                                            clientName={userProfile.name}
                                                            input={scenarioA.input}
                                                            strategyName="Situación Inercial Basal"
                                                            strategyResult={{
                                                                pensionMensual: result.with_decree_111,
                                                                totalInversion: 0,
                                                                roiMeses: 0
                                                            }}
                                                            projectionData={inercialProjection}
                                                            bundle={bundle && currentPlan.allowedFeatures.integrityBundle ? {
                                                                integrity_hash: bundle.integrity_hash,
                                                                generated_at: bundle.generated_at,
                                                                version: bundle.version
                                                            } : undefined}
                                                            certifiedDossier={certified_dossier}
                                                            aforeSaldos={scenarioA.input.aforeSaldos}
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
                                            ) : (
                                                <button 
                                                    onClick={() => setActiveTab('estrategias')}
                                                    className="w-full flex items-center justify-center gap-1.5 bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed font-bold py-2.5 rounded-lg text-[10px]"
                                                >
                                                    <ShieldAlert size={14} /> Desbloquear PDF
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[9px] text-slate-400 text-center mt-3 px-4">
                                            * El Estudio Completo requiere plan activo.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500 min-h-[250px] bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                    <div className="text-center px-6">
                                        <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <p className="font-bold text-slate-700 mb-2">Simulador Listo</p>
                                        <p className="text-sm text-slate-500 leading-relaxed">Completa tus datos en el formulario y presiona <strong>&quot;Calcular Pensión&quot;</strong> para ver cuánto recibirías del IMSS.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <SavedSimulations />

                    <div className="mt-8 pt-6 border-t border-slate-200 text-center space-y-2 pb-8">
                        <p className="text-xs text-slate-500 font-medium">Motor Actuarial calibrado estrictamente bajo la <span className="font-bold text-slate-700">Ley del Seguro Social 1973</span>.</p>
                        <p className="text-[10px] text-slate-400 max-w-2xl mx-auto md:px-0 px-4">Tablas UMA actualizadas a Enero 2024. Estas proyecciones matemáticas son herramientas estratégicas y no constituyen una resolución vinculante oficial.</p>
                    </div>
                </>
            )}

            {activeTab === 'estrategias' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold tracking-tighter text-slate-900 mb-2">{userRole === 'USER' ? '¿Cómo Puedes Mejorar tu Pensión?' : 'Alternativas de Maximización'}</h2>
                        <p className="text-slate-600 mb-8">{userRole === 'USER' ? 'Estas son las opciones que tienes para recibir más dinero cada mes al jubilarte. Compara y decide.' : 'Simulaciones automatizadas para comparar el retorno de inversión bajo diferentes esquemas de Modalidad 40.'}</p>
                        
                        {!currentPlan.allowedFeatures.roiOptimizer ? (
                            <ProductPaywall />
                        ) : recommendations ? (
                            <ExecutiveRecommendationComponent recommendations={recommendations} />
                        ) : (
                            <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-500 font-medium whitespace-pre-wrap">Calcula primero tu pensión inercial para generar tus recomendaciones personalizadas.</p>
                                <button 
                                    onClick={() => setActiveTab('simulacion')}
                                    className="mt-4 text-indigo-600 font-bold hover:underline"
                                >
                                    Ir a Simulación
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'medida' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 shadow-sm">
                        <h2 className="text-2xl font-bold tracking-tighter text-amber-900 mb-2">{userRole === 'USER' ? '¿A Cuánto Quieres Llegar?' : 'Simulador Avanzado: ¿A dónde quieres llegar?'}</h2>
                        <p className="text-amber-800/80">
                            {userRole === 'USER' 
                                ? 'Tú decides la pensión mensual que quieres recibir y nosotros te decimos exactamente cuánto necesitas invertir para lograrlo.'
                                : 'Especifica la pensión mensual objetivo y el motor calculará exactamente cuánto necesita invertir el cliente para lograrlo.'}
                        </p>
                    </div>
                    {!currentPlan.allowedFeatures.inverseDesign ? (
                        <div className="max-w-4xl mx-auto">
                            <ProductPaywall />
                        </div>
                    ) : (
                        <InverseDesign />
                    )}
                </div>
            )}

        </div>
    );
}
