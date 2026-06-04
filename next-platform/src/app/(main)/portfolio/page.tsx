'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Users, ShieldCheck, ArrowRight, UserSquare2, Globe, Clock, Zap, MapPin } from 'lucide-react';
import { fetchAssignedClientsAction, fetchMarketLeadsAction } from '@/actions/advisor-actions';
import { claimLeadAction } from '@/actions/routing-actions';
import { useToast } from '@/components/ui/toast-context';
import { useRouter } from 'next/navigation';

export default function PortfolioPage() {
    const { data: session } = useSession();
    const { showToast } = useToast();
    const router = useRouter();

    const [clients, setClients] = useState<any[]>([]);
    const [marketLeads, setMarketLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isClaiming, setIsClaiming] = useState<string | null>(null);

    const loadPortfolio = useCallback(async () => {
        setLoading(true);
        const res = await fetchAssignedClientsAction();
        if (res.success && res.clients) setClients(res.clients);
        else showToast(res.error || "Error al cargar portafolio", "error");

        const marketRes = await fetchMarketLeadsAction();
        if (marketRes.success && marketRes.leads) setMarketLeads(marketRes.leads);

        setLoading(false);
    }, [showToast]);

    useEffect(() => {
        if (session?.user?.role === 'ADVISOR' || session?.user?.role === 'ADMIN') {
            loadPortfolio();
        }
    }, [session, loadPortfolio]);

    async function handleClaimLead(leadId: string) {
        setIsClaiming(leadId);
        const res = await claimLeadAction(leadId);
        if (res.success) {
            showToast("Lead asegurado exitosamente en tu Portafolio", "success");
            loadPortfolio(); // Refresh both grids immediately
        } else {
            showToast(res.error || "El lead ya no está disponible", "error");
        }
        setIsClaiming(null);
    }

    if (session?.user?.role !== 'ADVISOR' && session?.user?.role !== 'ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <ShieldCheck className="w-16 h-16 text-slate-300" />
                <h2 className="text-xl font-medium text-slate-500">Acceso No Autorizado</h2>
                <p className="text-sm text-slate-400">Esta terminal es exclusiva para Asesores Soberanos.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pt-6 px-6">
            <header className="space-y-2 mb-8">
                <div className="flex items-center space-x-3 text-emerald-500 mb-1">
                    <Users className="w-5 h-5" />
                    <span className="text-xs tracking-[0.2em] font-medium">CRM Soberano</span>
                </div>
                <h1 className="text-3xl font-light tracking-tight text-slate-800 dark:text-slate-100">
                    Portafolio de <span className="font-semibold">Clientes</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
                    Administra tus clientes asignados. Puedes ejecutar simulaciones y análisis de Modalidad 40 en su nombre.
                </p>
            </header>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="py-4 px-6 font-bold text-slate-600 dark:text-slate-400 text-xs tracking-wider">Cliente</th>
                                <th className="py-4 px-6 font-bold text-slate-600 dark:text-slate-400 text-xs tracking-wider">Email</th>
                                <th className="py-4 px-6 font-bold text-slate-600 dark:text-slate-400 text-xs tracking-wider">Nivel</th>
                                <th className="py-4 px-6 font-bold text-slate-600 dark:text-slate-400 text-xs tracking-wider">Registro</th>
                                <th className="py-4 px-6 font-bold text-slate-600 dark:text-slate-400 text-xs tracking-wider text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-500">
                                        Cargando lista de clientes...
                                    </td>
                                </tr>
                            ) : clients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500">
                                        <div className="flex flex-col items-center">
                                            <UserSquare2 className="w-12 h-12 mb-3 opacity-20" />
                                            <p>No tienes clientes asignados a tu portafolio aún.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : clients.map(client => (
                                <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="py-4 px-6 font-medium text-slate-900 dark:text-slate-100 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                                            {client.name ? client.name.substring(0, 2) : 'CL'}
                                        </div>
                                        {client.name || 'Sin Nombre'}
                                    </td>
                                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-mono text-xs">{client.email}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-widest ${client.tier === 'SOVEREIGN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                            client.tier === 'GOLD' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                            }`}>
                                            {client.tier}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-xs">
                                        {new Date(client.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button
                                            onClick={() => router.push(`/portfolio/client/${client.id}/workspace`)}
                                            className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition-colors inline-flex items-center gap-2"
                                        >
                                            Ejecutar Análisis <ArrowRight size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Epic 17: B2B Market Lead Auction Engine */}
            <div className="mt-12 mb-8 space-y-2">
                <div className="flex items-center space-x-3 text-amber-500 mb-1">
                    <Globe className="w-5 h-5" />
                    <span className="text-xs tracking-[0.2em] font-medium">Nuevos Clientes</span>
                </div>
                <h2 className="text-2xl font-light tracking-tight text-slate-800 dark:text-slate-100">
                    Mercado Disponible de <span className="font-semibold">Leads</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
                    Ciudadanos que buscan asesor en tu zona geográfica. Reclama un cliente antes de que otro asesor lo haga.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-slate-400">Cargando clientes disponibles...</div>
                ) : marketLeads.length === 0 ? (
                    <div className="col-span-full bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 text-center flex flex-col items-center">
                        <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                        <h3 className="text-slate-600 dark:text-slate-300 font-bold">Sin Clientes Disponibles</h3>
                        <p className="text-sm text-slate-400 mt-2 max-w-md">No hay ciudadanos buscando asesor en este momento. Nuevas solicitudes aparecerán aquí automáticamente.</p>
                    </div>
                ) : marketLeads.map(lead => (
                    <div key={lead.id} className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-shadow overflow-hidden group">
                        
                        {/* Status Badge */}
                        <div className="absolute top-0 right-0 p-3 pt-4 pr-4">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-widest flex items-center gap-1 ${
                                lead.leadStatus === 'PENDING_NATIONAL' 
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                            }`}>
                                <Zap className="w-3 h-3" />
                                {lead.leadStatus === 'PENDING_NATIONAL' ? 'REMOTO NACIONAL' : 'TALENTO LOCAL'}
                            </span>
                        </div>

                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-sm mb-4">
                            ID
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                            Prospecto Anónimo
                        </h3>
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-4 gap-2 font-mono">
                            <MapPin className="w-3 h-3" /> {lead.residencyState || "Geolocalización Desconocida"}
                            <span className="text-slate-300 dark:text-slate-600">|</span> 
                            {new Date(lead.createdAt).toLocaleDateString()}
                        </div>

                        <button
                            onClick={() => handleClaimLead(lead.id)}
                            disabled={isClaiming === lead.id}
                            className={`w-full py-3 rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-4 flex justify-center items-center gap-2 ${
                                lead.leadStatus === 'PENDING_NATIONAL'
                                    ? 'bg-purple-600 hover:bg-purple-500 text-white focus:ring-purple-500/30'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500/30'
                            } disabled:opacity-50`}
                        >
                            {isClaiming === lead.id ? "Asignando cliente..." : "Reclamar Cliente"} 
                            {!isClaiming && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
