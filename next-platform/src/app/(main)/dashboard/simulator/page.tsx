'use client';

import { useState, useEffect } from 'react';
import { Download, Plus, LayoutDashboard, History, DownloadCloud, ShieldCheck, FileText, Info, ArrowRight, Calculator, ShieldAlert, CheckSquare, CalendarDays, BarChart, RotateCcw } from 'lucide-react';
import { calculatePensionAction } from '@/actions/calculate-pension';
import { saveSimulationAction } from '@/actions/simulation-actions';
import { useSession } from "next-auth/react";
import { PersonaClassifier } from '@/lib/engine/persona-classifier';
import { getClientTrackingAction, togglePaymentStatusAction, clearStrategyAction } from '@/actions/tracking-actions';
import { useToast } from '@/components/ui/toast-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { useSimulationStore } from '@/store';
import { InverseDesign } from '@/components/inverse-design';
import { StrategyCards } from '@/components/strategy-cards';

import { PRICING_CONFIG, Role, Tier, getPlan } from '@/lib/config/pricing';
import { ProductPaywall } from '@/components/monetization/ProductPaywall';
import { ExecutiveRecommendationComponent } from '@/components/monetization/ExecutiveRecommendation';
import { ExecutiveRecommendation } from '@/lib/engine/roi-optimizer';
import { PensionResult } from '@/lib/engine/pension-engine';
import { DossierBuilder, ForensicBundle } from '@/lib/engine/audit/dossier-builder';
import dynamic from 'next/dynamic';

const InercialBriefPDFButton = dynamic(
    () => import('@/components/reports/PDFDownloadButtons').then(mod => mod.InercialBriefPDFButton),
    { ssr: false }
);

const InercialComprehensivePDFButton = dynamic(
    () => import('@/components/reports/PDFDownloadButtons').then(mod => mod.InercialComprehensivePDFButton),
    { ssr: false }
);

import { TrialStatus } from '@/lib/trial-guard';
import { checkTrialStatusAction } from '@/actions/check-trial-status';
import { TrialBadge } from '@/components/trial/TrialBadge';
import { TrialLockout } from '@/components/trial/TrialLockout';
import { calculateProjectionAction, getMaxPossiblePensionAction } from '@/actions/calculate-pension';

export default function SimulatorDashboard() {
    const { data: session } = useSession();
    const { showToast } = useToast();
    const searchParams = useSearchParams();
    const clientId = searchParams.get('clientId');

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const { scenarioA, updateScenarioA, userProfile, certified_dossier, setCertifiedDossier } = useSimulationStore();
    const [result, setResult] = useState<PensionResult | null>(null);
    const [recommendations, setRecommendations] = useState<ExecutiveRecommendation[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [bundle, setBundle] = useState<ForensicBundle | null>(null);
    const [activeTab, setActiveTab] = useState<'simulacion' | 'estrategias' | 'medida' | 'agenda'>('simulacion');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
    const [vigenciaAlert, setVigenciaAlert] = useState<{ message: string, type: 'warning' | 'error' } | null>(null);
    const [leadStatusObj, setLeadStatusObj] = useState<{status: string, state: string, advisorName: string | null} | null>(null);
    const [inercialProjection, setInercialProjection] = useState<any[]>([]);
    const [maxPossiblePension, setMaxPossiblePension] = useState<number>(0);
    const [personaGroup, setPersonaGroup] = useState<any>(null);
    const [trackingState, setTrackingState] = useState<any>(null);
    const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
    const [isPersonaGroupOpen, setIsPersonaGroupOpen] = useState(false);
    const [showAsignaciones, setShowAsignaciones] = useState(false);

    const loadTracking = async () => {
        const res = await getClientTrackingAction(clientId || undefined);
        if (res.success && res.m40PaymentsState) {
            setTrackingState(JSON.parse(res.m40PaymentsState));
        } else {
            setTrackingState(null);
        }
    };

    useEffect(() => {
        loadTracking();
    }, [clientId, session]);

    useEffect(() => {
        if (scenarioA.input) {
            const group = PersonaClassifier.classify(
                scenarioA.input.age,
                scenarioA.input.is_ongoing_work !== false,
                scenarioA.input.weeks,
                scenarioA.input.last_termination_date
            );
            setPersonaGroup(group);
        }
    }, [scenarioA.input.age, scenarioA.input.is_ongoing_work, scenarioA.input.weeks, scenarioA.input.last_termination_date]);

    const userRole = (session?.user as any)?.role as Role || 'USER';
    const userTier = (session?.user as any)?.tier as Tier || 'FREE';
    const currentPlan = getPlan(userRole, userTier);

    // Epic 18: B2C Matchmaking Long-Poller
    useEffect(() => {
        if (session?.user?.role === 'USER') {
            const u = session.user as any;
            if (u.leadStatus && u.leadStatus !== 'NONE' && !leadStatusObj) {
                setLeadStatusObj({
                    status: u.leadStatus,
                    state: u.residencyState || 'Nacional',
                    advisorName: u.advisorName || null
                });
            }

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

    // Fetch trial status on mount
    useEffect(() => {
        checkTrialStatusAction().then(res => {
            if (res.success && res.status) {
                setTrialStatus(res.status);
            }
        });
    }, []);

    // Fetch max possible pension reactively
    useEffect(() => {
        getMaxPossiblePensionAction(scenarioA.input)
            .then(setMaxPossiblePension)
            .catch(err => console.error("Failed to get max possible pension:", err));
    }, [scenarioA.input]);

    const handleInputMutation = (field: string, newValue: number) => {
        updateScenarioA({ [field]: newValue });

        if (certified_dossier) {
            showToast("Precisión Forense Rota: Se modificaron parámetros manualmente.", "warning");
            setCertifiedDossier(null);
        }
    };

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
    }, [result, inercialProjection]);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setVigenciaAlert(null); // Reset
        const response = await calculatePensionAction(formData);

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

            // Fetch projection from server
            try {
                const projRes = await calculateProjectionAction(
                    scenarioA.input,
                    'inercial',
                    0
                );
                setInercialProjection(projRes.projection);
            } catch (err) {
                console.error("Failed to calculate projection:", err);
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
        setLoading(false);
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
        <div className="w-full min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 p-4 md:p-8 max-w-7xl mx-auto">

            {/* Trial Lockout Overlay */}
            {trialStatus?.isLocked && trialStatus.reason && (
                <TrialLockout
                    reason={trialStatus.reason}
                    daysRemaining={trialStatus.daysRemaining}
                    simulationsUsed={trialStatus.simulationsUsed}
                    simulationsMax={2}
                />
            )}

            {/* Trial Badge */}
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
                <button
                    onClick={() => setActiveTab('agenda')}
                    className={`pb-4 px-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'agenda' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    4. {userRole === 'USER' ? 'Mi Agenda de Pagos' : 'Plan de Aportaciones'}
                </button>
            </div>

            {activeTab === 'simulacion' && (
                <>
                    {vigenciaAlert && (
                        <div className={`mb-4 p-4 rounded-xl border flex items-start gap-3 animate-in slide-in-from-top-4 ${vigenciaAlert.type === 'error' ? 'bg-red-50 border-red-200 text-red-900 shadow-red-100' : 'bg-amber-50 border-amber-200 text-amber-900 shadow-amber-100'} shadow-sm`}>
                            <div className={`p-2.5 rounded-full ${vigenciaAlert.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                <ShieldAlert size={18} />
                            </div>
                            <div>
                                <h3 className={`font-bold text-xs mb-0.5 ${vigenciaAlert.type === 'error' ? 'text-red-700' : 'text-amber-700'}`}>
                                    {vigenciaAlert.type === 'error' ? 'Suspensión por Vigencia de Derechos' : 'Alerta de Conservación de Derechos'}
                                </h3>
                                <p className="text-[11px] font-medium leading-relaxed opacity-90">{vigenciaAlert.message}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                        
                        {/* Col 1: Form (lg:col-span-5) */}
                        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                            {certified_dossier && (
                                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3 animate-in fade-in">
                                    <div className="mt-0.5 text-emerald-600">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-emerald-800">Cálculo Validado</h3>
                                        <p className="text-[10px] text-emerald-600 font-mono mt-0.5">
                                            Cargado desde: {certified_dossier.source_filename} ({(certified_dossier.confidence * 100).toFixed(0)}% verificado)
                                        </p>
                                    </div>
                                </div>
                            )}

                            <h2 className="text-lg font-bold mb-3 text-indigo-600">Parámetros de Entrada</h2>
                            <form action={handleSubmit} className="space-y-3">
                                {/* Grid Row 1: Age & Target Age */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor="age" className="block text-xs text-slate-500 mb-1">Edad Actual</label>
                                        <input
                                            id="age"
                                            name="age"
                                            type="number"
                                            value={scenarioA.input.age}
                                            onChange={(e) => handleInputMutation('age', Number(e.target.value))}
                                            className={`w-full border rounded-lg p-2 text-sm outline-none transition-colors h-[38px] ${certified_dossier ? 'bg-emerald-50/50 border-emerald-300 text-emerald-900 focus:ring-2 focus:ring-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500'}`}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="retirement_age" className="block text-xs font-bold text-indigo-600 mb-1">Edad de Retiro</label>
                                        <input
                                            id="retirement_age"
                                            name="retirement_age"
                                            type="number"
                                            value={scenarioA.input.retirement_age}
                                            onChange={(e) => updateScenarioA({ retirement_age: Number(e.target.value) })}
                                            className="w-full bg-indigo-50 border border-indigo-200 rounded-lg p-2 text-sm text-indigo-900 focus:ring-2 focus:ring-indigo-500 outline-none font-bold h-[38px]"
                                        />
                                    </div>
                                </div>

                                {/* Grid Row 2: Weeks & Average Salary */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor="weeks" className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                                            Semanas Cotizadas
                                            <div className="group relative flex items-center">
                                                <Info size={12} className="text-slate-400 cursor-help" />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-slate-800 text-white text-[10px] rounded p-2 text-center shadow-lg z-50">
                                                    Total de semanas IMSS. {certified_dossier ? 'Protegido por documento.' : 'Fundamental para cuantía.'}
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
                                            className={`w-full border rounded-lg p-2 text-sm outline-none transition-colors h-[38px] ${certified_dossier ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed select-none' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500'}`}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="salary_prom" className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                                            Salario Diario Prom.
                                            <div className="group relative flex items-center">
                                                <Info size={12} className="text-slate-400 cursor-help" />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-slate-800 text-white text-[10px] rounded p-2 text-center shadow-lg z-50">
                                                    SBC promedio de las últimas 250 semanas cotizadas.
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
                                            className={`w-full border rounded-lg p-2 text-sm outline-none transition-colors h-[38px] ${certified_dossier ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed select-none' : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500'}`}
                                        />
                                    </div>
                                </div>

                                {/* Grid Row 3: Baja Date & Employment Status */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor="last_termination_date" className={`flex items-center gap-1 text-xs font-bold mb-1 transition-colors ${scenarioA.input.is_ongoing_work ? 'text-slate-400' : 'text-slate-900'}`}>
                                            Fecha de Baja
                                            <div className="group relative flex items-center">
                                                <Info size={12} className={`${scenarioA.input.is_ongoing_work ? 'text-slate-300' : 'text-blue-500'} cursor-help`} />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-slate-800 text-white text-[10px] rounded p-2 text-center shadow-lg z-50">
                                                    Esencial para Vigencia (Art. 150) si no cotizas actualmente.
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
                                            className={`w-full border rounded-lg p-2 text-xs outline-none transition-all h-[38px] ${scenarioA.input.is_ongoing_work 
                                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60' 
                                                : 'bg-blue-50 border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-500'}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Estatus Laboral</label>
                                        <label className={`flex items-center gap-2 px-3 h-[38px] border rounded-lg cursor-pointer transition-all ${scenarioA.input.is_ongoing_work ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-slate-50 border-slate-300'}`}>
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
                                                className="accent-indigo-500 h-4 w-4 shrink-0"
                                            />
                                            <span className={`text-xs font-bold ${scenarioA.input.is_ongoing_work ? 'text-indigo-700' : 'text-slate-600'}`}>
                                                {scenarioA.input.is_ongoing_work ? "🟢 Cotizando" : "⚪ Baja"}
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* Advanced Options Toggle */}
                                <div className="pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                        className="text-xs text-slate-500 hover:text-indigo-600 font-bold tracking-widest flex items-center transition-colors pb-1"
                                    >
                                        <svg className={`w-3.5 h-3.5 mr-1 transform transition-transform ${showAdvanced ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                                        Opciones Avanzadas
                                    </button>
                                    {showAdvanced && (
                                        <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg animate-in fade-in slide-in-from-top-2">
                                            <label htmlFor="inflation" className="flex items-center gap-2 text-xs text-indigo-600 mb-1.5 font-medium">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                                Ajuste por Inflación (%)
                                            </label>
                                            <input
                                                id="inflation"
                                                name="inflation_percentage"
                                                type="number"
                                                step="0.01"
                                                defaultValue={0}
                                                className="w-full bg-white border border-indigo-200 rounded p-1.5 text-xs text-indigo-900 placeholder-indigo-300 focus:ring-1 focus:ring-indigo-500 outline-none font-bold"
                                                placeholder="e.g. 10.22"
                                            />
                                            <p className="text-[9px] text-indigo-500 mt-1">Recomendado: 10.22% (Feb 2026)</p>
                                        </div>
                                    )}
                                </div>

                                {/* Family Assignments Dropdown Toggle */}
                                <div className="pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowAsignaciones(!showAsignaciones)}
                                        className="text-xs text-slate-500 hover:text-indigo-600 font-bold tracking-widest flex items-center transition-colors pb-1"
                                    >
                                        <svg className={`w-3.5 h-3.5 mr-1 transform transition-transform ${showAsignaciones ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                                        Asignaciones Familiares
                                    </button>
                                    {showAsignaciones && (
                                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                                            <label className="flex items-center space-x-2 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                                <input
                                                    name="has_wife"
                                                    type="checkbox"
                                                    checked={scenarioA.input.has_wife}
                                                    onChange={(e) => updateScenarioA({ has_wife: e.target.checked })}
                                                    className="accent-indigo-500 h-4 w-4"
                                                />
                                                <span className="text-xs font-bold text-slate-700">Asignación por Esposa (+15%)</span>
                                            </label>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Hijos (+10% c/u)</label>
                                                    <div className="flex items-center gap-2">
                                                        <button type="button" onClick={() => {
                                                            const newCount = Math.max(0, scenarioA.input.children_count - 1);
                                                            updateScenarioA({ 
                                                                children_count: newCount,
                                                                children_data: scenarioA.input.children_data?.slice(0, newCount) || []
                                                            });
                                                        }} className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all font-black text-sm">-</button>
                                                        <span className="text-sm font-black text-slate-900 w-4 text-center">{scenarioA.input.children_count}</span>
                                                        <button type="button" onClick={() => {
                                                            const newCount = Math.min(5, scenarioA.input.children_count + 1);
                                                            const newData = [...(scenarioA.input.children_data || [])];
                                                            if (newData.length < newCount) newData.push({ age: 0, is_studying: false });
                                                            updateScenarioA({ 
                                                                children_count: newCount,
                                                                children_data: newData
                                                            });
                                                        }} className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all font-black text-sm">+</button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Padres Dep. (+10% c/u)</label>
                                                    <div className="flex items-center gap-2">
                                                        <button type="button" onClick={() => updateScenarioA({ dependent_parents_count: Math.max(0, scenarioA.input.dependent_parents_count - 1) })} className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all font-black text-sm">-</button>
                                                        <span className="text-sm font-black text-slate-900 w-4 text-center">{scenarioA.input.dependent_parents_count}</span>
                                                        <button type="button" onClick={() => updateScenarioA({ dependent_parents_count: Math.min(2, scenarioA.input.dependent_parents_count + 1) })} className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all font-black text-sm">+</button>
                                                    </div>
                                                </div>
                                            </div>

                                            {scenarioA.input.children_count > 0 && (
                                                <div className="space-y-2 mt-2 pt-2 border-t border-slate-200 animate-in slide-in-from-top-2">
                                                    {Array.from({ length: scenarioA.input.children_count }).map((_, i) => (
                                                        <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                                            <div className="w-5 h-5 bg-slate-900 text-white text-[9px] font-bold flex items-center justify-center rounded">#{i+1}</div>
                                                            <div className="flex-1">
                                                                <label className="text-[8px] font-bold text-slate-400 uppercase">Edad</label>
                                                                <input 
                                                                    type="number" 
                                                                    title="Edad del hijo"
                                                                    placeholder="0"
                                                                    className="w-full text-xs font-bold bg-transparent outline-none text-slate-800"
                                                                    value={scenarioA.input.children_data?.[i]?.age || 0}
                                                                    onChange={(e) => {
                                                                        const newData = [...(scenarioA.input.children_data || [])];
                                                                        newData[i] = { ...newData[i], age: Number(e.target.value) };
                                                                        updateScenarioA({ children_data: newData });
                                                                    }}
                                                                />
                                                            </div>
                                                            {(scenarioA.input.children_data?.[i]?.age || 0) >= 16 && (scenarioA.input.children_data?.[i]?.age || 0) <= 25 && (
                                                                <div className="flex items-center gap-1 pr-1">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        id={`studying-${i}`}
                                                                        className="accent-emerald-500 w-3.5 h-3.5"
                                                                        checked={scenarioA.input.children_data?.[i]?.is_studying || false}
                                                                        onChange={(e) => {
                                                                            const newData = [...(scenarioA.input.children_data || [])];
                                                                            newData[i] = { ...newData[i], is_studying: e.target.checked };
                                                                            updateScenarioA({ children_data: newData });
                                                                        }}
                                                                    />
                                                                    <label htmlFor={`studying-${i}`} className="text-[9px] font-bold text-emerald-600 uppercase">¿Estudia?</label>
                                                                </div>
                                                            )}
                                                            {(scenarioA.input.children_data?.[i]?.age || 0) > 25 && (
                                                                <div className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[8px] font-bold rounded border border-red-100 uppercase">
                                                                    No asignable (+25)
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-colors mt-3 disabled:opacity-50 text-sm shadow-md"
                                >
                                    {loading ? 'Calculando en Servidor...' : 'Calcular Pensión'}
                                </button>
                            </form>
                        </div>

                        {/* Col 2: Results & History (lg:col-span-7) */}
                        <div className="lg:col-span-7 space-y-4">
                            {/* Persona status card / Custom Route Alert */}
                            {result && personaGroup && (
                                <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                                    personaGroup.riskStatus === 'CRITICAL' 
                                        ? 'bg-rose-50/50 border-rose-200 text-rose-950 dark:bg-rose-950/20 dark:border-rose-900/30' 
                                        : 'bg-emerald-50/50 border-emerald-200 text-emerald-950 dark:bg-emerald-950/20 dark:border-emerald-900/30'
                                }`}>
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex gap-3">
                                            <div className={`p-2.5 rounded-full shrink-0 ${
                                                personaGroup.riskStatus === 'CRITICAL' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                                            }`}>
                                                {personaGroup.riskStatus === 'CRITICAL' ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Ruta Personalizada</span>
                                                <h3 className="text-sm font-black text-slate-800 dark:text-white leading-tight mt-0.5">
                                                    {personaGroup.groupName}: {personaGroup.shortDiagnostic}
                                                </h3>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setIsPersonaGroupOpen(!isPersonaGroupOpen)} 
                                            className="text-xs text-indigo-600 hover:underline shrink-0 font-bold"
                                        >
                                            {isPersonaGroupOpen ? 'Ver menos' : 'Ver Detalles'}
                                        </button>
                                    </div>
                                    
                                    {isPersonaGroupOpen && (
                                        <div className="mt-4 pt-4 border-t border-slate-200/60 text-xs space-y-3 leading-relaxed animate-in slide-in-from-top-2">
                                            <p className="text-slate-600 dark:text-slate-400">{personaGroup.fullActionPlan}</p>
                                            {personaGroup.alternativePath && (
                                                <div className="p-3 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                                                    <strong className="text-indigo-600 block mb-0.5">Ruta Alterna:</strong>
                                                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">{personaGroup.alternativePath}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {result && (
                                <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-5 rounded-2xl shadow-xl relative overflow-hidden">
                                    <div className="absolute right-0 bottom-0 opacity-10 translate-x-6 translate-y-6">
                                        <ShieldCheck size={260} />
                                    </div>
                                    
                                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold tracking-widest text-indigo-300 uppercase">Tu Pensión Estimada Sin Cambios (A los {scenarioA.input.retirement_age || scenarioA.input.age} Años)</span>
                                                {certified_dossier && <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-widest">Validado</span>}
                                            </div>
                                            <div className="flex items-baseline gap-1 mt-2">
                                                <span className="text-4xl font-black">${result.with_decree_111.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</span>
                                                <span className="text-xs text-indigo-200">MXN / mes netos</span>
                                            </div>
                                        </div>
                                        {certified_dossier && (
                                            <div className="bg-indigo-500/10 border border-indigo-400/20 p-2.5 rounded-xl text-center shrink-0 w-full md:w-auto">
                                                <span className="text-[9px] font-black text-indigo-300 block uppercase tracking-wider">Impacto Base</span>
                                                <span className="text-xs font-bold text-white block mt-0.5">Certificación Oficial</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-3 pt-2.5 border-t border-indigo-500/30 flex justify-between items-center text-[10px] text-indigo-200">
                                        <span>Techo Legal Máximo: <strong className="text-white">${Math.round(maxPossiblePension).toLocaleString('es-MX')} MXN</strong></span>
                                        <button onClick={() => setActiveTab('estrategias')} className="underline hover:text-white transition-colors">¿Cómo mejorarla? ➔</button>
                                    </div>
                                </div>
                            )}

                            {/* Breakdown and Actions Panel */}
                            {loading ? (
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-pulse">
                                    <Skeleton className="h-28 w-full bg-slate-200" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <Skeleton className="h-14 w-full bg-slate-200" />
                                        <Skeleton className="h-14 w-full bg-slate-200" />
                                    </div>
                                    <Skeleton className="h-10 w-full bg-slate-100" />
                                </div>
                            ) : result ? (
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Así se compone tu pensión estimada:</h3>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                                            <p className="text-[9px] text-slate-400 font-bold uppercase">Pensión Bruta (Anualizada)</p>
                                            <p className="text-sm font-black text-slate-800">${result.with_decree_111.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</p>
                                        </div>
                                        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                                            <p className="text-[9px] text-slate-400 font-bold uppercase">ISR Estimado Retenido</p>
                                            <p className="text-sm font-black text-red-500">-${result.tax_retained.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</p>
                                        </div>
                                        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                                            <p className="text-[9px] text-slate-400 font-bold uppercase">Asignación por Edad</p>
                                            <p className="text-sm font-black text-amber-600">{result.age_penalty}%</p>
                                        </div>
                                        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                                            <p className="text-[9px] text-slate-400 font-bold uppercase">SBC Topado</p>
                                            <p className="text-sm font-black text-slate-800">${result.capped_salary.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>

                                    {/* Action Row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100">
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
                                            if (res.success) showToast("Estrategia guardada!", "success");
                                            else showToast("Error: " + res.error, "error");
                                        }}>
                                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition-colors text-xs shadow-sm h-[38px] flex items-center justify-center">
                                                Guardar Estudio
                                            </button>
                                        </form>

                                        <div>
                                            {!mounted ? (
                                                <button disabled className="w-full bg-slate-100 text-slate-400 font-bold py-2 rounded-lg text-[10px] h-[38px]">
                                                    Cargando...
                                                </button>
                                            ) : (
                                                <InercialBriefPDFButton
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
                                            )}
                                        </div>

                                        <div>
                                            {!mounted ? (
                                                <button disabled className="w-full bg-slate-100 text-slate-400 font-bold py-2 rounded-lg text-[10px] h-[38px]">
                                                    Cargando...
                                                </button>
                                            ) : currentPlan.allowedFeatures.pdfExport ? (
                                                <InercialComprehensivePDFButton
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
                                            ) : (
                                                <button 
                                                    onClick={() => setActiveTab('estrategias')}
                                                    className="w-full flex items-center justify-center gap-1 bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed font-bold py-2 rounded-lg text-[10px] h-[38px]"
                                                >
                                                    <ShieldAlert size={12} /> Desbloquear
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-slate-400 text-center px-4">
                                        * El Estudio Completo requiere plan activo.
                                    </p>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500 min-h-[200px] bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6">
                                    <div className="text-center max-w-sm">
                                        <Calculator className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                        <p className="font-bold text-slate-700 mb-1 text-sm">Simulador Listo</p>
                                        <p className="text-xs text-slate-400 leading-relaxed">Completa tus datos en el formulario y presiona <strong>&quot;Calcular Pensión&quot;</strong> para ver cuánto recibirías del IMSS.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200 text-center space-y-1 pb-4">
                        <p className="text-[11px] text-slate-500 font-medium">Motor Actuarial calibrado estrictamente bajo la <span className="font-bold text-slate-700">Ley del Seguro Social 1973</span>.</p>
                        <p className="text-[9px] text-slate-400 max-w-2xl mx-auto px-4">Tablas UMA actualizadas a Enero 2024. Estas proyecciones matemáticas son herramientas estratégicas y no constituyen una resolución vinculante oficial.</p>
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
                            <ExecutiveRecommendationComponent recommendations={recommendations} clientId={clientId} />
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
            {activeTab === 'agenda' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <div className="p-6 bg-indigo-900 text-white rounded-3xl shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-10"><CalendarDays size={180} /></div>
                        <div className="relative z-10 space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full">Fase de Acompañamiento</span>
                            <h2 className="text-3xl font-bold tracking-tight">Agenda de Pagos de Modalidad 40</h2>
                            <p className="text-indigo-200 text-sm max-w-2xl">
                                Mantén el control mes con mes de tus aportaciones voluntarias al IMSS. Registra tus pagos para asegurar que tu promedio salarial proyectado se concrete con precisión actuarial.
                            </p>
                        </div>
                    </div>

                    {!trackingState ? (
                        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                            <CalendarDays className="w-16 h-16 text-slate-300 mb-4" />
                            {userRole !== 'USER' && !clientId ? (
                                <>
                                    <h3 className="text-slate-700 dark:text-slate-200 font-bold text-lg mb-2">Plan de Aportaciones de Clientes</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
                                        Como asesor o administrador, puedes gestionar las agendas de aportaciones directamente desde el expediente de cada cliente. Ve a tu cartera de clientes para seleccionar uno.
                                    </p>
                                    <Link
                                        href="/portfolio"
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md text-xs uppercase tracking-wider cursor-pointer"
                                    >
                                        Ir a Cartera de Clientes
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-slate-700 dark:text-slate-200 font-bold text-lg mb-2">Sin Estrategia de Pagos Activa</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
                                        Aún no has activado una estrategia para dar seguimiento. Realiza un cálculo en la pestaña <strong>&quot;Tu Pensión&quot;</strong>, ve a la pestaña <strong>&quot;¿Cómo Mejorarla?&quot;</strong>, compara las opciones y presiona <strong>&quot;Activar esta Estrategia&quot;</strong>.
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('simulacion')}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md text-xs uppercase tracking-wider"
                                    >
                                        Iniciar Simulación
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Summary Left Card */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan Seleccionado</span>
                                        <h3 className="text-xl font-black text-slate-800 dark:text-white mt-1 leading-tight">
                                            {trackingState.strategyName}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Cotización Proyectada a: <span className="font-bold text-indigo-600">${Number(trackingState.dailySalaryMxn).toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN diarios</span>
                                        </p>
                                    </div>

                                    {/* Progress Metrics */}
                                    {(() => {
                                        const paidCount = trackingState.payments.filter((p: any) => p.status === 'PAID').length;
                                        const totalCount = trackingState.payments.length;
                                        const percent = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;
                                        const totalPaidMxn = trackingState.payments
                                            .filter((p: any) => p.status === 'PAID')
                                            .reduce((sum: number, p: any) => sum + p.amount, 0);
                                        const totalPendingMxn = trackingState.payments
                                            .filter((p: any) => p.status === 'PENDING')
                                            .reduce((sum: number, p: any) => sum + p.amount, 0);
                                        return (
                                            <>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-baseline">
                                                        <span className="text-xs font-bold text-slate-500 uppercase">Progreso de Pagos</span>
                                                        <span className="text-sm font-black text-indigo-600">{paidCount} / {totalCount} ({percent}%)</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                                        <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                                    <div className="flex justify-between text-xs font-medium text-slate-500">
                                                        <span>Inversión Realizada (Pagado)</span>
                                                        <span className="font-bold text-slate-800 dark:text-slate-200">${totalPaidMxn.toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs font-medium text-slate-500">
                                                        <span>Inversión Pendiente</span>
                                                        <span className="font-bold text-slate-800 dark:text-slate-200">${totalPendingMxn.toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN</span>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}

                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            onClick={async () => {
                                                if (confirm("¿Estás seguro de que deseas limpiar tu estrategia y reiniciar tu agenda de pagos?")) {
                                                    const res = await clearStrategyAction(clientId || undefined);
                                                    if (res.success) {
                                                        showToast("Estrategia reiniciada", "success");
                                                        setTrackingState(null);
                                                    } else {
                                                        showToast("Error: " + res.error, "error");
                                                    }
                                                }
                                            }}
                                            className="w-full flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-rose-600 font-bold py-3 rounded-xl transition-all text-xs uppercase tracking-wider"
                                        >
                                            <RotateCcw size={14} />
                                            Reiniciar Estrategia
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Payment Schedule Checklist */}
                            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <CheckSquare className="text-indigo-600" size={18} /> Calendario de Pagos Mensuales
                                </h3>
                                <p className="text-xs text-slate-500 mb-4">
                                    Marca las casillas conforme realices tus pagos mensuales ante la ventanilla o portal del IMSS. El sistema recalcula tus proyecciones en base al estatus real de aportación.
                                </p>

                                <div className="max-h-[500px] overflow-y-auto pr-2 space-y-2">
                                    {trackingState.payments.map((payment: any) => {
                                        const isPaid = payment.status === 'PAID';
                                        return (
                                            <div 
                                                key={payment.id} 
                                                className={`flex items-center justify-between p-4 border rounded-2xl transition-all ${
                                                    isPaid 
                                                        ? 'bg-emerald-50/40 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30' 
                                                        : 'bg-slate-50/50 border-slate-200 dark:bg-slate-900 dark:border-slate-800'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        type="checkbox"
                                                        id={`pay-${payment.id}`}
                                                        className="accent-indigo-600 w-5 h-5 cursor-pointer rounded"
                                                        checked={isPaid}
                                                        disabled={isUpdatingPayment}
                                                        onChange={async (e) => {
                                                            setIsUpdatingPayment(true);
                                                            const newStatus = e.target.checked ? 'PAID' : 'PENDING';
                                                            const res = await togglePaymentStatusAction(payment.id, newStatus, clientId || undefined);
                                                            if (res.success && res.payments) {
                                                                setTrackingState({ ...trackingState, payments: res.payments });
                                                                showToast(`Pago de ${payment.label} marcado como ${newStatus === 'PAID' ? 'pagado' : 'pendiente'}.`, "success");
                                                            } else {
                                                                showToast("Error: " + (res.error || "No se pudo actualizar el pago"), "error");
                                                            }
                                                            setIsUpdatingPayment(false);
                                                        }}
                                                    />
                                                    <label htmlFor={`pay-${payment.id}`} className="cursor-pointer">
                                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{payment.label}</p>
                                                        <p className="text-[10px] text-slate-400">Cuota proyectada: {payment.days} días al {(payment.rate * 100).toFixed(3)}%</p>
                                                    </label>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm font-black ${isPaid ? 'text-emerald-700 dark:text-emerald-400' : 'text-indigo-900 dark:text-indigo-300'}`}>
                                                        ${payment.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                                                    </p>
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                        isPaid ? 'bg-emerald-200/50 text-emerald-800' : 'bg-slate-200 text-slate-600'
                                                    }`}>
                                                        {isPaid ? 'Pagado' : 'Pendiente'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
