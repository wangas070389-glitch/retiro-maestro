'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
    LayoutDashboard, 
    Calculator, 
    History, 
    CalendarDays, 
    CheckSquare, 
    RotateCcw, 
    FileText, 
    ShieldAlert, 
    ShieldCheck, 
    Trash2, 
    ArrowRight, 
    TrendingUp, 
    UserCheck, 
    DollarSign, 
    Briefcase,
    Calendar,
    ChevronRight,
    Loader2,
    Users,
    Settings,
    UserSquare2,
    Globe,
    Clock,
    Zap,
    MapPin,
    Search,
    Unlock,
    Lock
} from 'lucide-react';
import { getClientTrackingAction, togglePaymentStatusAction, clearStrategyAction, activateSimulationAsStrategyAction } from '@/actions/tracking-actions';
import { getSimulationsAction, deleteSimulationAction } from '@/actions/simulation-actions';
import { calculateProjectionAction } from '@/actions/calculate-pension';
import { fetchAssignedClientsAction, fetchMarketLeadsAction } from '@/actions/advisor-actions';
import { getAllUsersAction, toggleUserApprovalAction, toggleUserBlockAction } from '@/actions/admin-actions';
import { claimLeadAction } from '@/actions/routing-actions';
import { DossierBuilder } from '@/lib/engine/audit/dossier-builder';
import { useToast } from '@/components/ui/toast-context';
import { getPlan, Role, Tier } from '@/lib/config/pricing';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const InercialBriefPDFButton = dynamic(
    () => import('@/components/reports/PDFDownloadButtons').then(mod => mod.InercialBriefPDFButton),
    { ssr: false }
);

const InercialComprehensivePDFButton = dynamic(
    () => import('@/components/reports/PDFDownloadButtons').then(mod => mod.InercialComprehensivePDFButton),
    { ssr: false }
);

function DashboardContent() {
    const { data: session } = useSession();
    const { showToast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const clientId = searchParams.get('clientId');

    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);

    // Client/Impersonated States
    const [trackingState, setTrackingState] = useState<any>(null);
    const [simulations, setSimulations] = useState<any[]>([]);
    const [activeSim, setActiveSim] = useState<any | null>(null);
    const [projectionData, setProjectionData] = useState<any[]>([]);
    const [bundle, setBundle] = useState<any | null>(null);
    const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Advisor / Admin States
    const [assignedClients, setAssignedClients] = useState<any[]>([]);
    const [marketLeads, setMarketLeads] = useState<any[]>([]);
    const [systemUsers, setSystemUsers] = useState<any[]>([]);
    const [clientSearch, setClientSearch] = useState('');
    const [isClaiming, setIsClaiming] = useState<string | null>(null);
    const [actionUserLoading, setActionUserLoading] = useState<string | null>(null);
    const [adminViewMode, setAdminViewMode] = useState<'ADMIN' | 'ADVISOR'>('ADMIN');

    const userRole = (session?.user as any)?.role as Role || 'USER';
    const userTier = (session?.user as any)?.tier as Tier || 'FREE';
    const currentPlan = getPlan(userRole, userTier);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Load Advisor/Admin specific lists
    const loadAdvisorAdminData = useCallback(async () => {
        setLoading(true);
        try {
            const clientsRes = await fetchAssignedClientsAction();
            if (clientsRes.success && clientsRes.clients) {
                setAssignedClients(clientsRes.clients);
            }

            const leadsRes = await fetchMarketLeadsAction();
            if (leadsRes.success && leadsRes.leads) {
                setMarketLeads(leadsRes.leads);
            }

            if (userRole === 'ADMIN') {
                const usersRes = await getAllUsersAction();
                if (usersRes.success && usersRes.users) {
                    setSystemUsers(usersRes.users);
                }
            }
        } catch (err) {
            console.error("Error loading advisor/admin data:", err);
            showToast("Error al cargar los datos del tablero", "error");
        } finally {
            setLoading(false);
        }
    }, [userRole, showToast]);

    // Load Client specific lists
    const loadClientDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const trackRes = await getClientTrackingAction(clientId || undefined);
            let activeTrackObj = null;
            if (trackRes.success && trackRes.m40PaymentsState) {
                activeTrackObj = JSON.parse(trackRes.m40PaymentsState);
                setTrackingState(activeTrackObj);
            } else {
                setTrackingState(null);
            }

            const simsRes = await getSimulationsAction(clientId);
            if (simsRes.success && simsRes.simulations) {
                setSimulations(simsRes.simulations);
                if (activeTrackObj) {
                    const match = simsRes.simulations.find((s: any) => 
                        s.name.includes("ACTIVA:") || 
                        s.name.includes(activeTrackObj.strategyName)
                    ) || simsRes.simulations[0];
                    setActiveSim(match || null);
                } else {
                    setActiveSim(null);
                }
            }
        } catch (err) {
            console.error("Error loading client dashboard data:", err);
            showToast("Error al cargar datos del tablero", "error");
        } finally {
            setLoading(false);
        }
    }, [clientId, showToast]);

    useEffect(() => {
        if (!session) return;

        if (clientId) {
            loadClientDashboardData();
        } else if (userRole === 'ADVISOR' || userRole === 'ADMIN') {
            loadAdvisorAdminData();
        } else {
            loadClientDashboardData();
        }
    }, [session, clientId, userRole, loadClientDashboardData, loadAdvisorAdminData]);

    // Load active projection for client impersonation
    useEffect(() => {
        const fetchActiveProjection = async () => {
            if (!activeSim) {
                setProjectionData([]);
                setBundle(null);
                return;
            }
            try {
                const res = await calculateProjectionAction(activeSim.input, 'modalidad40', 0);
                if (res.projection) {
                    setProjectionData(res.projection);
                    const finalYearData = res.projection[res.projection.length - 1];
                    const adhocBundle = await DossierBuilder.buildAdHocBundle({
                        strategy: `Estrategia - ${activeSim.name}`,
                        mode: 'modalidad40',
                        data: finalYearData
                    });
                    setBundle(adhocBundle);
                }
            } catch (err) {
                console.error("Failed to load active strategy projection:", err);
            }
        };

        fetchActiveProjection();
    }, [activeSim]);

    // Lead Claiming Handler
    const handleClaimLead = async (leadId: string) => {
        setIsClaiming(leadId);
        const res = await claimLeadAction(leadId);
        if (res.success) {
            showToast("Lead asegurado exitosamente en tu Portafolio", "success");
            await loadAdvisorAdminData();
        } else {
            showToast(res.error || "El lead ya no está disponible", "error");
        }
        setIsClaiming(null);
    };

    // Admin Toggle User Approval
    const handleToggleApproval = async (userId: string, currentStatus: boolean) => {
        setActionUserLoading(userId);
        const res = await toggleUserApprovalAction(userId, !currentStatus);
        if (res.success) {
            showToast(`Usuario ${!currentStatus ? 'aprobado' : 'desaprobado'} con éxito`, "success");
            await loadAdvisorAdminData();
        } else {
            showToast(res.error || "Error al actualizar aprobación", "error");
        }
        setActionUserLoading(null);
    };

    // Admin Toggle User Block
    const handleToggleBlock = async (userId: string, currentStatus: boolean) => {
        setActionUserLoading(userId);
        const res = await toggleUserBlockAction(userId, !currentStatus);
        if (res.success) {
            showToast(`Usuario ${!currentStatus ? 'bloqueado' : 'desbloqueado'} con éxito`, "success");
            await loadAdvisorAdminData();
        } else {
            showToast(res.error || "Error al actualizar bloqueo", "error");
        }
        setActionUserLoading(null);
    };

    // Client Strategy Activation Handlers
    const handleActivateSimulation = async (simId: string) => {
        setActionLoading(simId);
        const res = await activateSimulationAsStrategyAction(simId, clientId || undefined);
        if (res.success) {
            showToast("Estrategia activada con éxito en tu tablero", "success");
            await loadClientDashboardData();
        } else {
            showToast("Error al activar: " + res.error, "error");
        }
        setActionLoading(null);
    };

    const handleDeleteSimulation = async (simId: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este estudio permanentemente?')) return;
        const res = await deleteSimulationAction(simId, clientId);
        if (res.success) {
            showToast("Estudio eliminado", "success");
            setSimulations(sims => sims.filter(s => s.id !== simId));
            if (activeSim?.id === simId) setActiveSim(null);
        } else {
            showToast("Error al eliminar", "error");
        }
    };

    const handleClearStrategy = async () => {
        if (!confirm("¿Estás seguro de que deseas limpiar tu estrategia activa y reiniciar tu agenda de pagos?")) return;
        const res = await clearStrategyAction(clientId || undefined);
        if (res.success) {
            showToast("Estrategia desactivada y calendario reiniciado", "success");
            setTrackingState(null);
            setActiveSim(null);
            await loadClientDashboardData();
        } else {
            showToast("Error al reiniciar estrategia: " + res.error, "error");
        }
    };

    if (loading) {
        return (
            <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
                <Skeleton className="h-12 w-2/3 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Skeleton className="h-28 rounded-2xl" />
                    <Skeleton className="h-28 rounded-2xl" />
                    <Skeleton className="h-28 rounded-2xl" />
                    <Skeleton className="h-28 rounded-2xl" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="h-96 lg:col-span-2 rounded-3xl" />
                    <Skeleton className="h-96 lg:col-span-1 rounded-3xl" />
                </div>
            </div>
        );
    }

    // ==========================================
    // VIEW ROLE: ADVISOR Dashboard (No client ID)
    // ==========================================
    if ((userRole === 'ADVISOR' || (userRole === 'ADMIN' && adminViewMode === 'ADVISOR')) && !clientId) {
        const filteredClients = assignedClients.filter(c => 
            c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
            (c.email && c.email.toLowerCase().includes(clientSearch.toLowerCase()))
        );

        return (
            <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
                {/* Advisor Top Welcome Header */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none">
                        <Users size={180} />
                    </div>
                    <div className="relative z-10 space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30 w-fit">
                                Consola del Asesor Actuarial
                            </span>
                            
                            {userRole === 'ADMIN' && (
                                <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-inner">
                                    <button
                                        onClick={() => setAdminViewMode('ADMIN')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                            (adminViewMode as string) === 'ADMIN'
                                                ? 'bg-white text-slate-950 shadow-md scale-100'
                                                : 'text-slate-200 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <Settings size={14} /> Administrador
                                    </button>
                                    <button
                                        onClick={() => setAdminViewMode('ADVISOR')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                            (adminViewMode as string) === 'ADVISOR'
                                                ? 'bg-white text-slate-950 shadow-md scale-100'
                                                : 'text-slate-200 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <Briefcase size={14} /> Asesor
                                    </button>
                                </div>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-light tracking-tight">
                            Bienvenido, <strong className="font-bold text-white">{session?.user?.name}</strong>
                        </h1>
                        <p className="text-indigo-200 text-sm max-w-3xl leading-relaxed">
                            Gestiona tu cartera de clientes y asegura prospectos del mercado geolocalizado. Ejecuta simulaciones y audita expedientes bajo las leyes de pensiones del IMSS.
                        </p>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden">
                        <div className="absolute top-4 right-4 p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-emerald-600">
                            <UserCheck size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clientes en Cartera</span>
                        <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{assignedClients.length}</p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Asignados bajo tu expediente</span>
                    </div>

                    <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden">
                        <div className="absolute top-4 right-4 p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg text-indigo-600">
                            <Globe size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Leads en el Mercado</span>
                        <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{marketLeads.length}</p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Disponibles para reclamación</span>
                    </div>

                    <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden">
                        <div className="absolute top-4 right-4 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-amber-600">
                            <Zap size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Plan de Asesoría</span>
                        <p className="text-2xl font-black text-amber-600 uppercase">{userTier}</p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Límites y funciones premium habilitadas</span>
                    </div>
                </div>

                {/* Main Content Splitting */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Cartera de Clientes */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                                    <Users size={18} className="text-indigo-600" /> Mi Cartera de Clientes
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">Accede y simula en nombre de tus clientes registrados</p>
                            </div>
                            
                            {/* Search bar */}
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar cliente..."
                                    value={clientSearch}
                                    onChange={(e) => setClientSearch(e.target.value)}
                                    className="pl-8 pr-3 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-48"
                                />
                            </div>
                        </div>

                        {filteredClients.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                <UserSquare2 className="w-12 h-12 text-slate-300 mb-2 opacity-50" />
                                <p className="text-slate-500 text-sm font-medium">Ningún cliente coincide con la búsqueda</p>
                                <Link href="/portfolio" className="text-indigo-600 text-xs font-bold mt-2 hover:underline">Registrar Nuevo Cliente</Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            <th className="px-4 py-3">Nombre</th>
                                            <th className="px-4 py-3">Email</th>
                                            <th className="px-4 py-3">Gestión de Pensión</th>
                                            <th className="px-4 py-3">Registro</th>
                                            <th className="px-4 py-3 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                        {filteredClients.map((c) => {
                                            let gestionStatus = "Sin propuestas / Onboarding";
                                            let statusColor = "text-slate-500 bg-slate-100 dark:bg-slate-900 dark:text-slate-400";
                                            
                                            if (c.activeStrategy) {
                                                let pagosCount = 0;
                                                let totalPagos = 0;
                                                if (c.m40PaymentsState) {
                                                    try {
                                                        const stateObj = JSON.parse(c.m40PaymentsState);
                                                        if (stateObj.payments) {
                                                            totalPagos = stateObj.payments.length;
                                                            pagosCount = stateObj.payments.filter((p: any) => p.status === 'PAID').length;
                                                        }
                                                    } catch (e) {}
                                                }
                                                gestionStatus = `Estrategia Activa: ${c.activeStrategy} (${pagosCount}/${totalPagos} pagos)`;
                                                statusColor = "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400";
                                            } else if (c.simulationsCount > 0) {
                                                gestionStatus = `Propuesta Creada (${c.simulationsCount} estudios)`;
                                                statusColor = "text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400";
                                            }

                                            return (
                                                <tr key={c.id} className="hover:bg-indigo-50/10 dark:hover:bg-slate-900/40 transition-colors group">
                                                    <td className="px-4 py-3.5">
                                                        <span className="font-bold text-slate-850 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">{c.name}</span>
                                                        {c.isLead && <span className="ml-1.5 text-[8px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-full uppercase">Lead B2C</span>}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-slate-500">{c.email || 'N/A'}</td>
                                                    <td className="px-4 py-3.5">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusColor}`}>
                                                            {gestionStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-4 py-3.5 text-right">
                                                        <Link
                                                            href={`/dashboard?clientId=${c.id}`}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-600 hover:text-white rounded-lg transition-all text-[10px] uppercase tracking-wider"
                                                        >
                                                            Impersonar <ChevronRight size={12} />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Lead Market */}
                    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                                <Globe size={18} className="text-emerald-500" /> Mercado de Leads Calientes
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">Asegura clientes solicitando asesores locales y remotos</p>
                        </div>

                        {marketLeads.length === 0 ? (
                            <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-xs leading-relaxed space-y-2">
                                <Globe className="w-10 h-10 mx-auto text-slate-200 opacity-50" />
                                <p>No hay leads disponibles en el mercado en este momento.</p>
                                <p className="text-[10px]">Revisa más tarde o actualiza tu configuración regional.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                {marketLeads.map((lead) => {
                                    const isClaimingThis = isClaiming === lead.id;
                                    return (
                                        <div key={lead.id} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-slate-850 dark:text-slate-200 text-xs">{lead.name}</p>
                                                    <span className="text-[9px] text-slate-400 font-mono">Region: {lead.residencyState || 'Nacional'}</span>
                                                </div>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                    lead.leadStatus === 'PENDING_LOCAL' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {lead.leadStatus === 'PENDING_LOCAL' ? 'Local SLA' : 'Nacional'}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                                                <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                                                    <Clock size={10} /> {new Date(lead.createdAt).toLocaleDateString()}
                                                </span>
                                                <button
                                                    onClick={() => handleClaimLead(lead.id)}
                                                    disabled={isClaiming !== null}
                                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[9px] uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                                >
                                                    {isClaimingThis ? (
                                                        <>
                                                            <Loader2 size={8} className="animate-spin" /> Adquiriendo...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Asegurar Lead
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ========================================
    // VIEW ROLE: ADMIN Dashboard (No client ID)
    // ========================================
    if (userRole === 'ADMIN' && !clientId && adminViewMode === 'ADMIN') {
        return (
            <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
                {/* Admin Welcome Header */}
                <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none">
                        <Settings size={200} />
                    </div>
                    <div className="relative z-10 space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30 w-fit">
                                Panel de Administración del Sistema
                            </span>
                            
                            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-inner">
                                <button
                                    onClick={() => setAdminViewMode('ADMIN')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        (adminViewMode as string) === 'ADMIN'
                                            ? 'bg-white text-slate-950 shadow-md scale-100'
                                            : 'text-slate-200 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <Settings size={14} /> Administrador
                                </button>
                                <button
                                    onClick={() => setAdminViewMode('ADVISOR')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        (adminViewMode as string) === 'ADVISOR'
                                            ? 'bg-white text-slate-950 shadow-md scale-100'
                                            : 'text-slate-200 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <Briefcase size={14} /> Asesor
                                </button>
                            </div>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-light tracking-tight">
                            Consola Root: <strong className="font-bold text-white">{session?.user?.name}</strong>
                        </h1>
                        <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
                            Control total sobre el enrutamiento de leads geolocalizados, la aprobación de usuarios del sistema, la asignación de planes y la auditoría de seguridad del motor actuarial.
                        </p>
                    </div>
                </div>

                {/* Admin Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden">
                        <div className="absolute top-4 right-4 p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg text-indigo-600">
                            <Users size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Usuarios Registrados</span>
                        <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{systemUsers.length}</p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Cuentas creadas en base de datos</span>
                    </div>

                    <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden">
                        <div className="absolute top-4 right-4 p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-emerald-600">
                            <Briefcase size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Asesores Activos</span>
                        <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                            {systemUsers.filter(u => u.role === 'ADVISOR').length}
                        </p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Asesores B2B profesionales</span>
                    </div>

                    <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden">
                        <div className="absolute top-4 right-4 p-2 bg-rose-50 dark:bg-rose-950/30 rounded-lg text-rose-600">
                            <Globe size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Leads B2C en Cola</span>
                        <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                            {systemUsers.filter(u => u.role === 'USER' && ['PENDING_INTERNAL', 'PENDING_LOCAL', 'PENDING_NATIONAL'].includes(u.leadStatus)).length}
                        </p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Leads en cola de asignación</span>
                    </div>

                    <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden">
                        <div className="absolute top-4 right-4 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-amber-600">
                            <ShieldAlert size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bloqueos Activos</span>
                        <p className="text-2xl font-black text-rose-600">
                            {systemUsers.filter(u => u.isBlocked).length}
                        </p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Cuentas restringidas</span>
                    </div>
                </div>

                {/* Admin Management Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Recent Registrations Table */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                                    <Users size={18} className="text-indigo-600" /> Registro de Cuentas Recientes
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">Aprobaciones y restricciones globales del sistema</p>
                            </div>
                            <Link href="/admin/users" className="text-xs font-bold text-indigo-600 hover:underline">Ver Todo</Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="px-4 py-3">Usuario</th>
                                        <th className="px-4 py-3">Rol / Nivel</th>
                                        <th className="px-4 py-3">Estatus</th>
                                        <th className="px-4 py-3 text-right">Acciones Directas</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                    {systemUsers.slice(0, 5).map((u) => {
                                        const isActioningThis = actionUserLoading === u.id;
                                        return (
                                            <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-slate-800 dark:text-slate-200">{u.name}</div>
                                                    <div className="text-[10px] text-slate-400">{u.email}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                        u.role === 'ADMIN' ? 'bg-rose-100 text-rose-800' :
                                                        u.role === 'ADVISOR' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-650'
                                                    }`}>
                                                        {u.role}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 ml-1.5 uppercase font-mono">{u.tier}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                                        u.isBlocked ? 'bg-red-100 text-red-700' :
                                                        u.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {u.isBlocked ? 'Bloqueado' : u.isApproved ? 'Aprobado' : 'Pendiente'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleToggleApproval(u.id, u.isApproved)}
                                                            disabled={isActioningThis || u.role === 'ADMIN'}
                                                            className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border transition-all ${
                                                                u.isApproved 
                                                                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                                                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                                                        >
                                                            {u.isApproved ? 'Desaprobar' : 'Aprobar'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleBlock(u.id, u.isBlocked)}
                                                            disabled={isActioningThis || u.id === session?.user?.id}
                                                            className={`p-1.5 rounded transition-all ${
                                                                u.isBlocked 
                                                                    ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' 
                                                                    : 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                                                            } disabled:opacity-40`}
                                                            title={u.isBlocked ? 'Desbloquear' : 'Bloquear'}
                                                        >
                                                            {u.isBlocked ? <Unlock size={12} /> : <Lock size={12} />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right: Admin Quick Operations */}
                    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">Operaciones Root</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Acceso rápido a las directivas de control del sistema</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <Link
                                href="/admin/users"
                                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl hover:bg-indigo-50/30 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 rounded-xl">
                                        <Users size={16} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-slate-850 dark:text-slate-200 text-xs">Gestión de Usuarios</p>
                                        <p className="text-[10px] text-slate-400">Modifica roles, tiers y contraseñas</p>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-all" />
                            </Link>

                            <Link
                                href="/portfolio"
                                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl hover:bg-indigo-50/30 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
                                        <Briefcase size={16} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-slate-850 dark:text-slate-200 text-xs">Cartera Universal de Clientes</p>
                                        <p className="text-[10px] text-slate-400">Ver asignaciones de todos los asesores</p>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-all" />
                            </Link>

                            <Link
                                href="/settings"
                                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl hover:bg-indigo-50/30 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-200 dark:bg-slate-800 text-slate-600 rounded-xl">
                                        <Settings size={16} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-slate-850 dark:text-slate-200 text-xs">Configuración Global</p>
                                        <p className="text-[10px] text-slate-400">Modificar parámetros generales del sistema</p>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-all" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ========================================
    // VIEW ROLE: Standard CLIENT / Impersonation
    // ========================================
    
    // STATE 1: Active Strategy Dashboard (Client context)
    if (trackingState) {
        const paidCount = trackingState.payments.filter((p: any) => p.status === 'PAID').length;
        const totalCount = trackingState.payments.length;
        const percent = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;
        const totalPaidMxn = trackingState.payments
            .filter((p: any) => p.status === 'PAID')
            .reduce((sum: number, p: any) => sum + p.amount, 0);
        const totalPendingMxn = trackingState.payments
            .filter((p: any) => p.status === 'PENDING')
            .reduce((sum: number, p: any) => sum + p.amount, 0);
        const monthlyPension = activeSim?.result?.with_decree_111 || activeSim?.result?.netPension || 0;

        return (
            <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
                {/* Impersonation Warning Header */}
                {clientId && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900 shadow-sm animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="text-amber-600 shrink-0" size={16} />
                            <span>Modo de impersonación: Estás viendo e interactuando como el cliente **{activeSim ? activeSim.name.replace("Estrategia ACTIVA: ", "").split(' - ')[0] : 'Expediente del Cliente'}**.</span>
                        </div>
                        <Link href="/portfolio" className="font-bold text-amber-800 hover:underline shrink-0">Volver a Cartera</Link>
                    </div>
                )}

                {/* Top Glassmorphic Header */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                        <CalendarDays size={200} />
                    </div>
                    <div className="relative z-10 space-y-3">
                        <div className="flex flex-wrap gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                                <ShieldCheck size={12} /> Estrategia Activa Oficial
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-light tracking-tight">
                            Seguimiento: <strong className="font-bold text-white">{trackingState.strategyName}</strong>
                        </h1>
                        <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
                            Mantén el registro de tus aportaciones voluntarias ante la ventanilla del IMSS. El sistema recalcula la viabilidad de tus proyecciones en tiempo real.
                        </p>
                    </div>
                </div>

                {/* Metrics Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute top-4 right-4 p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-emerald-600">
                            <DollarSign size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pensión Proyectada</span>
                        <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                            {monthlyPension > 0 ? `$${monthlyPension.toLocaleString('es-MX', { maximumFractionDigits: 0 })}` : 'Cargando...'}
                        </p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Netos estimados / mes</span>
                    </div>

                    <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute top-4 right-4 p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg text-indigo-600">
                            <CalendarDays size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Progreso de Pagos</span>
                        <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                            {paidCount} / {totalCount}
                        </p>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                            <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">{percent}% de la meta</span>
                    </div>

                    <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute top-4 right-4 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-blue-600">
                            <UserCheck size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inversión Realizada</span>
                        <p className="text-2xl font-black text-emerald-600">
                            ${totalPaidMxn.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                        </p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">MXN pagado acumulado</span>
                    </div>

                    <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute top-4 right-4 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-amber-600">
                            <TrendingUp size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inversión Proyectada Restante</span>
                        <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                            ${totalPendingMxn.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                        </p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">MXN por pagar</span>
                    </div>
                </div>

                {/* Dashboard Split Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Checklist (2 Columns Width) */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                                <CheckSquare size={18} className="text-indigo-600" /> Calendario de Pagos Mensuales
                            </h3>
                            <span className="text-[11px] font-mono text-slate-400">Total: {totalCount} meses</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Registra cada aportación mensual conforme realices el pago ante el IMSS. Esto garantiza la integridad y exactitud de tu promedio salarial proyectado.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                            {trackingState.payments.map((payment: any) => {
                                const isPaid = payment.status === 'PAID';
                                return (
                                    <div 
                                        key={payment.id} 
                                        className={`flex items-center justify-between p-4 border rounded-2xl transition-all ${
                                            isPaid 
                                                ? 'bg-emerald-50/30 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30' 
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
                                                        showToast(`Pago de ${payment.label} actualizado.`, "success");
                                                    } else {
                                                        showToast("Error: " + (res.error || "No se pudo actualizar"), "error");
                                                    }
                                                    setIsUpdatingPayment(false);
                                                }}
                                            />
                                            <label htmlFor={`pay-${payment.id}`} className="cursor-pointer">
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{payment.label}</p>
                                                <p className="text-[10px] text-slate-400">Cuota: {payment.days} días al {(payment.rate * 100).toFixed(3)}%</p>
                                            </label>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xs font-black ${isPaid ? 'text-emerald-700 dark:text-emerald-400' : 'text-indigo-900 dark:text-indigo-300'}`}>
                                                ${payment.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                                            </p>
                                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                                                isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                                {isPaid ? 'Pagado' : 'Pendiente'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Summary Card (1 Column Width) */}
                    <div className="space-y-6">
                        {/* Simulation Profile Card */}
                        {activeSim && (
                            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                                <h3 className="text-md font-bold text-slate-850 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                                    Ficha Técnica del Estudio
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500">Edad de retiro:</span>
                                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{activeSim.input.retirement_age || activeSim.input.age} Años</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500">Semanas cotizadas proy:</span>
                                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{activeSim.input.weeks} Semanas</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500">Salario diario IMSS:</span>
                                        <span className="font-extrabold text-slate-800 dark:text-slate-200">${Number(trackingState.dailySalaryMxn).toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN</span>
                                    </div>
                                </div>

                                {/* PDF Downloads */}
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">Descargar Reportes Oficiales</span>
                                    <div className="grid grid-cols-1 gap-2">
                                        {mounted && (
                                            <>
                                                <InercialBriefPDFButton
                                                    clientName={session?.user?.name || 'Cliente'}
                                                    input={activeSim.input}
                                                    strategyName={trackingState.strategyName}
                                                    strategyResult={{
                                                        pensionMensual: monthlyPension,
                                                        totalInversion: totalPaidMxn + totalPendingMxn,
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
                                                        input={activeSim.input}
                                                        strategyName={trackingState.strategyName}
                                                        strategyResult={{
                                                            pensionMensual: monthlyPension,
                                                            totalInversion: totalPaidMxn + totalPendingMxn,
                                                            roiMeses: 0
                                                        }}
                                                        projectionData={projectionData}
                                                        bundle={bundle && currentPlan.allowedFeatures.integrityBundle ? {
                                                            integrity_hash: bundle.integrity_hash,
                                                            generated_at: bundle.generated_at,
                                                            version: bundle.version
                                                        } : undefined}
                                                        aforeSaldos={activeSim.input.aforeSaldos}
                                                    />
                                                ) : (
                                                    <button 
                                                        onClick={() => showToast("Desbloquea el plan activo para descargar reportes completos", "warning")}
                                                        className="w-full flex items-center justify-center gap-1.5 bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed font-bold py-2.5 rounded-xl text-[10px]"
                                                    >
                                                        <ShieldAlert size={14} /> Reporte Completo Cerrado
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reset Strategy action */}
                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between items-center text-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gestión de Cuenta</span>
                            <p className="text-xs text-slate-500 mt-2 max-w-[200px] leading-relaxed">
                                ¿Deseas modificar los parámetros o iniciar otra planeación? Puedes reiniciar el seguimiento aquí.
                            </p>
                            <button
                                onClick={handleClearStrategy}
                                className="w-full flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 bg-white hover:bg-rose-50 text-rose-600 font-bold py-2.5 rounded-xl transition-all text-xs uppercase tracking-wider mt-4"
                            >
                                <RotateCcw size={14} />
                                Reiniciar Estrategia
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // STATE 2: Has Saved Simulations but No Active Strategy (Client context)
    if (simulations.length > 0) {
        return (
            <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
                {/* Impersonation Warning Header */}
                {clientId && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900 shadow-sm animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="text-amber-600 shrink-0" size={16} />
                            <span>Modo de impersonación: Estás viendo e interactuando como el cliente **{activeSim ? activeSim.name.replace("Estrategia ACTIVA: ", "").split(' - ')[0] : 'Expediente del Cliente'}**.</span>
                        </div>
                        <Link href="/portfolio" className="font-bold text-amber-800 hover:underline shrink-0">Volver a Cartera</Link>
                    </div>
                )}

                {/* Onboarding Welcome Header */}
                <div className="p-6 md:p-8 bg-indigo-950 text-white rounded-3xl shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none">
                        <Calculator size={150} />
                    </div>
                    <div className="relative z-10 max-w-3xl space-y-3">
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
                            Estudios Guardados
                        </span>
                        <h1 className="text-2xl md:text-3xl font-light tracking-tight">
                            Hola, <strong className="font-bold text-white">{session?.user?.name || 'Cliente'}</strong>. Diseña tu retiro maestro.
                        </h1>
                        <p className="text-indigo-200 text-sm leading-relaxed">
                            Tienes estudios guardados. Selecciona el plan que prefieras para activarlo como tu **Estrategia Activa** y generar tu calendario de pagos mensuales.
                        </p>
                        <div className="pt-2 flex flex-wrap gap-3">
                            <Link 
                                href={clientId ? `/dashboard/simulator?clientId=${clientId}` : "/dashboard/simulator"}
                                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md text-xs uppercase tracking-wider"
                            >
                                Iniciar Nueva Simulación <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Table of Saved Simulations */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="text-md font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                            <History className="text-indigo-500" size={16} /> Mis Simulaciones Guardadas
                        </h3>
                        <span className="text-xs text-slate-400 font-mono">{simulations.length} registros</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Nombre</th>
                                    <th className="px-6 py-4">Semanas</th>
                                    <th className="px-6 py-4">Salario SBC</th>
                                    <th className="px-6 py-4">Edad Retiro</th>
                                    <th className="px-6 py-4">Pensión Estimada</th>
                                    <th className="px-6 py-4 text-right">Estrategia</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                {simulations.map((sim) => {
                                    const expectedPension = sim.result?.with_decree_111 || sim.result?.netPension || 0;
                                    const isActivating = actionLoading === sim.id;
                                    return (
                                        <tr key={sim.id} className="hover:bg-indigo-50/20 dark:hover:bg-slate-900/40 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 rounded-xl">
                                                        <FileText size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{sim.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-mono">ID: {sim.id.split('-')[0]}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-650 dark:text-slate-400">
                                                {sim.input.weeks} semanas
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-650 dark:text-slate-400">
                                                ${sim.input.salary_prom.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-650 dark:text-slate-400">
                                                {sim.input.retirement_age || sim.input.age} años
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-black text-emerald-600 flex items-center">
                                                    ${expectedPension.toLocaleString('es-MX', { maximumFractionDigits: 0 })} <span className="text-[9px] font-bold text-slate-400 ml-1">/ mes</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center gap-3">
                                                    <button
                                                        onClick={() => handleActivateSimulation(sim.id)}
                                                        disabled={isActivating || actionLoading !== null}
                                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                                    >
                                                        {isActivating ? (
                                                            <>
                                                                <Loader2 size={12} className="animate-spin" /> Activando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                Activar Estrategia
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSimulation(sim.id)}
                                                        title="Eliminar"
                                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // STATE 3: Onboarding Empty State (Client context)
    return (
        <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[80vh] text-center">
            {/* Impersonation Warning Header */}
            {clientId && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900 shadow-sm animate-in slide-in-from-top-2 w-full mb-4">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="text-amber-600 shrink-0" size={16} />
                        <span>Modo de impersonación: Estás viendo e interactuando como el cliente **{activeSim ? activeSim.name.replace("Estrategia ACTIVA: ", "").split(' - ')[0] : 'Expediente del Cliente'}**.</span>
                    </div>
                    <Link href="/portfolio" className="font-bold text-amber-800 hover:underline shrink-0">Volver a Cartera</Link>
                </div>
            )}

            <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-[2.5rem] p-10 md:p-14 shadow-xl relative overflow-hidden w-full flex flex-col items-center">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>
                
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/40 rounded-full flex items-center justify-center text-indigo-600 mb-8 border border-indigo-100 dark:border-indigo-900/50 shadow-inner animate-pulse">
                    <Calculator size={36} />
                </div>

                <h1 className="text-3xl font-light text-slate-800 dark:text-white tracking-tight mb-4">
                    Diseña tu <strong className="font-bold text-indigo-600">Futuro de Retiro</strong>
                </h1>

                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl leading-relaxed mb-10">
                    Estima tu pensión IMSS bajo la **Ley 1973** y optimiza tus ingresos mensuales. Diseña escenarios a medida y simula la Modalidad 40 para maximizar tus recursos de forma actuarial y segura.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Link
                        href={clientId ? `/dashboard/simulator?clientId=${clientId}` : "/dashboard/simulator"}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                    >
                        Iniciar Primera Simulación <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

            <p className="text-[10px] text-slate-400 max-w-md mt-6">
                * Cálculos estructurados bajo la Ley del Seguro Social vigente. Los resultados son simulaciones y estimaciones de carácter estratégico.
            </p>
        </div>
    );
}

export default function Dashboard() {
    return (
        <Suspense fallback={
            <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
                <Skeleton className="h-12 w-2/3 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Skeleton className="h-28 rounded-2xl" />
                    <Skeleton className="h-28 rounded-2xl" />
                    <Skeleton className="h-28 rounded-2xl" />
                    <Skeleton className="h-28 rounded-2xl" />
                </div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
