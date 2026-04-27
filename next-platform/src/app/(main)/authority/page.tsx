'use client';

import { Scale, FileSignature, Download, CalendarDays, ShieldCheck, CheckCircle2, Lock, ArrowRight, Activity, FileText, ShieldAlert, UserPlus, MapPin, ExternalLink } from 'lucide-react';
import { triggerInitialRouting } from '../../../actions/routing-actions';
import { updateResidencyStateAction } from '../../../actions/user-actions';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { OfficialDocument } from '../../../components/reports/OfficialDocument';
import { RetirementReport } from '../../../components/reports/RetirementReport';
import { useSimulationStore } from '../../../store';
import { getSealedDossiersAction, verifyDossierIntegrityAction } from '../../../actions/authority-actions';
import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import legalData from '@/lib/data/legal-anchors.json';
import { generatePaymentCalendar, M40MonthlyPayment } from '../../../lib/engine/m40-calculator';
import { PensionEngine } from '../../../lib/engine/pension-engine';
import { generateDocumentAction } from '../../../actions/generate-document';
import { useToast } from '../../../components/ui/toast-context';
import { useSearchParams } from 'next/navigation';

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-8 ${className}`}>
        {children}
    </div>
);

const Badge = ({ children, type = "success" }: { children: React.ReactNode, type?: "success" | "warning" | "danger" | "neutral" | "emerald" | "indigo" | "amber" }) => {
    const colors = {
        success: "bg-emerald-100 text-emerald-700 border border-emerald-200",
        emerald: "bg-emerald-100 text-emerald-700 border border-emerald-200",
        warning: "bg-amber-100 text-amber-700 border border-amber-200",
        amber: "bg-amber-100 text-amber-700 border border-amber-200",
        danger: "bg-red-100 text-red-700 border border-red-200",
        neutral: "bg-slate-100 text-slate-700 border border-slate-200",
        indigo: "bg-indigo-100 text-indigo-700 border border-indigo-200",
    };
    return (
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest shadow-sm ${colors[type]}`}>
            {children}
        </span>
    );
};

const LockedOverlay = ({ children, isLocked, isB2C = false }: { children: React.ReactNode, isLocked: boolean, isB2C?: boolean }) => {
    if (!isLocked) return <>{children}</>;
    return (
        <div className="relative group">
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50/60 backdrop-blur-[2px] rounded-2xl border-2 border-dashed border-slate-300 shadow-inner p-6 text-center transition-all group-hover:bg-slate-50/40">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-100 mb-4 text-slate-400">
                    <Lock size={24} />
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-1">
                    {isB2C ? 'Función Disponible con Plan Activo' : 'Función Profesional'}
                </h4>
                <p className="text-slate-500 text-xs mb-6 max-w-[220px]">
                    {isB2C 
                        ? 'Desbloquea esta herramienta con el plan "Mi Mejor Pensión" o "Expediente Completo".'
                        : 'Esta herramienta requiere una licencia Starter, Growth o Pro activa.'}
                </p>
                <a 
                    href="/profile" 
                    className={`px-6 py-2.5 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 ${isB2C ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'}`}
                >
                    {isB2C ? 'Ver Planes Disponibles' : 'Desbloquear en Mi Perfil'} <ArrowRight size={14} />
                </a>
            </div>
            <div className="pointer-events-none opacity-40 grayscale blur-[1px]">
                {children}
            </div>
        </div>
    );
};

export default function AuthorityPage() {
    const { data: session } = useSession();
    const { showToast } = useToast();
    const searchParams = useSearchParams();
    const clientId = searchParams.get('clientId');
    const [generating, setGenerating] = useState<string | null>(null);
    const [dossiers, setDossiers] = useState<any[]>([]);
    const [verifying, setVerifying] = useState<string | null>(null);
    const { userProfile } = useSimulationStore();

    useEffect(() => {
        const fetchDossiers = async () => {
            const res = await getSealedDossiersAction(clientId);
            if (res.success) setDossiers(res.dossiers || []);
        };
        fetchDossiers();
    }, [clientId]);

    const handleVerify = async (id: string) => {
        setVerifying(id);
        const res = await verifyDossierIntegrityAction(id);
        if (res.success && res.valid) {
            showToast("Integridad Validada: Dossier Intacto", "success");
        } else {
            showToast("Error de Integridad: Datos Alterados", "error");
        }
        setVerifying(null);
    };

    const engine = useMemo(() => new PensionEngine(), []);
    const [selectedDossierId, setSelectedDossierId] = useState<string | null>(null);
    const [projectionForPdf, setProjectionForPdf] = useState<any[]>([]);

    useEffect(() => {
        if (selectedDossierId) {
            const d = dossiers.find(dx => dx.id === selectedDossierId);
            if (d && d.input) {
                const isM40 = d.name.includes("CUSTOM") || d.name.includes("OPTIMIZADA");
                const strategyMode = isM40 ? 'modalidad40' : 'inercial';
                const targetDailySalary = d.result?.capped_salary || d.input.salary_prom;
                const monthsToTarget = Math.max(0, (d.input.retirement_age || 65) - d.input.age) * 12;
                const monthlyInv = isM40 ? (d.result?.investment / (monthsToTarget || 60)) : 0;

                const proj = engine.calculateProjection(d.input, null, strategyMode, monthlyInv, targetDailySalary);
                setProjectionForPdf(proj);
            } else {
                setProjectionForPdf([]);
            }
        }
    }, [selectedDossierId, dossiers, engine]);

    useEffect(() => {
        if (!selectedDossierId && dossiers.length > 0) {
            const firstM40 = dossiers.find(d => {
                const isM40 = d.name.includes("CUSTOM") || d.name.includes("OPTIMIZADA");
                const hasInvestment = (d.result?.investment > 0) || (d.result?.totalInversion > 0);
                return isM40 || hasInvestment;
            });
            if (firstM40) {
                setSelectedDossierId(firstM40.id);
            }
        }
    }, [dossiers, selectedDossierId]);

    const [requestingAdvisor, setRequestingAdvisor] = useState(false);
    const [residencyStateInput, setResidencyStateInput] = useState('');

    const handleRequestAdvisor = async () => {
        if (!residencyStateInput && !(session?.user as any)?.residencyState) {
            showToast("Por favor selecciona tu estado de residencia.", "warning");
            return;
        }

        setRequestingAdvisor(true);
        
        // 1. Update residency if provided
        if (residencyStateInput) {
            await updateResidencyStateAction(residencyStateInput);
        }

        // 2. Trigger routing
        const res = await triggerInitialRouting();
        if (res.success) {
            showToast("Solicitud enviada. Analizando perfiles de expertos...", "success");
            // Refresh session to update leadStatus locally
            window.location.reload();
        } else {
            showToast(res.error || "Error al solicitar asesor", "error");
        }
        setRequestingAdvisor(false);
    };

    const isLocked = session?.user?.tier === 'FREE';
    const isB2C = session?.user?.role === 'USER';
    const hasAdvisor = !!session?.user?.advisorId;
    const leadStatus = (session?.user as any)?.leadStatus || 'NONE';
    const currentResidency = (session?.user as any)?.residencyState || '';

    useEffect(() => {
        if (currentResidency) setResidencyStateInput(currentResidency);
    }, [currentResidency]);

    const activeDossier = useMemo(() => {
        return dossiers.find(d => d.id === selectedDossierId) || null;
    }, [dossiers, selectedDossierId]);

    const m40Dossier = useMemo(() => {
        if (activeDossier) {
            const isM40 = activeDossier.name.includes("CUSTOM") || activeDossier.name.includes("OPTIMIZADA");
            const hasInvestment = (activeDossier.result?.investment > 0) || (activeDossier.result?.totalInversion > 0);
            if (isM40 || hasInvestment) return activeDossier;
        }
        return null;
    }, [activeDossier]);

    const calendarData: M40MonthlyPayment[] = useMemo(() => {
        if (!m40Dossier) return [];
        const salary = m40Dossier.result.capped_salary || 0;
        if (salary <= 0) return [];
        const now = new Date();
        return generatePaymentCalendar(salary, now.getFullYear(), now.getMonth() + 1, 4);
    }, [m40Dossier]);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col border-b border-slate-200 pb-6">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-4 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-900/20">
                        <Scale size={32} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck size={16} className="text-emerald-500" />
                            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Sistema Certificado y Seguro</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Expediente Legal Validado</h1>
                    </div>
                </div>
                <p className="text-slate-500 text-lg mt-2 ml-[88px] max-w-2xl leading-relaxed">
                    Acceso a documentos certificados y validaciones normativas. Todo el respaldo legal para tu trámite de jubilación en un solo lugar.
                </p>
            </div>

            {/* B2C Lead Generation Anchor */}
            {isB2C && !hasAdvisor && (
                <div className={`p-8 rounded-3xl border-2 transition-all shadow-lg ${leadStatus === 'NONE' ? 'bg-indigo-900 border-indigo-500 text-white' : 'bg-emerald-900 border-emerald-500 text-white'}`}>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-2xl ${leadStatus === 'NONE' ? 'bg-indigo-500/20' : 'bg-emerald-500/20'}`}>
                                    {leadStatus === 'NONE' ? <UserPlus size={32} /> : <Activity className="animate-pulse" size={32} />}
                                </div>
                                <h2 className="text-3xl font-black tracking-tight">
                                    {leadStatus === 'NONE' ? '¿Necesitas un Asesor Actuarial?' : 'Búsqueda de Asesor Activa'}
                                </h2>
                            </div>
                            <p className="text-indigo-100 text-lg opacity-80 leading-relaxed max-w-2xl">
                                {leadStatus === 'NONE' 
                                    ? 'No realices tu trámite sin asesoría. Solicita un experto certificado para validar tus documentos y asegurar que tu estrategia cumpla con todos los requisitos del IMSS.'
                                    : 'Nuestro sistema de asignación está localizando al asesor certificado más cercano a tu ubicación para brindarte atención personalizada.'}
                            </p>
                        </div>

                        <div className="w-full md:w-auto min-w-[320px] bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                            {leadStatus === 'NONE' ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Estado de Residencia</label>
                                        <select
                                            className="w-full bg-slate-900/50 border border-white/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none text-white"
                                            value={residencyStateInput}
                                            onChange={(e) => setResidencyStateInput(e.target.value)}
                                            title="Selecciona tu Estado de Residencia"
                                        >
                                            <option value="" disabled>Selecciona tu Estado</option>
                                            <option value="CDMX">Ciudad de México</option>
                                            <option value="Jalisco">Jalisco</option>
                                            <option value="Nuevo Leon">Nuevo León</option>
                                            <option value="Edomex">Estado de México</option>
                                            <option value="Puebla">Puebla</option>
                                            <option value="Queretaro">Querétaro</option>
                                            <option value="Guanajuato">Guanajuato</option>
                                            <option value="Veracruz">Veracruz</option>
                                            <option value="Sonora">Sonora</option>
                                            <option value="Chihuahua">Chihuahua</option>
                                            <option value="Otro">Otro Estado</option>
                                        </select>
                                    </div>
                                    <button 
                                        onClick={handleRequestAdvisor}
                                        disabled={requestingAdvisor}
                                        className="w-full py-4 bg-white text-indigo-900 font-black tracking-tighter rounded-xl shadow-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {requestingAdvisor ? 'Conectando...' : 'SOLICITAR ASIGNACIÓN AHORA'}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center space-y-4 py-4">
                                    <div className="flex justify-center flex-col items-center">
                                        <div className="text-emerald-400 font-bold text-xs tracking-widest uppercase mb-1 flex items-center gap-2">
                                            {isB2C ? 'Búsqueda Activa' : leadStatus.replace('PENDING_', 'SUBASTA ')} <ShieldCheck size={14} />
                                        </div>
                                        <p className="text-sm font-medium text-emerald-100 italic">"Esperando primer reclamo de talento certificado..."</p>
                                    </div>
                                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="w-1/3 h-full bg-emerald-400 animate-[loading_2s_infinite]"></div>
                                    </div>
                                    <p className="text-[10px] text-indigo-200 opacity-60">{isB2C ? 'Tiempo estimado de respuesta: 4-12 horas.' : 'SLA de Respuesta Estimado: 4-12 horas.'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ZONE 1: Operativo */}
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
                                    <PDFDownloadLink
                                        document={<OfficialDocument docType="m40" clientName={userProfile.name} nss={userProfile.nss} />}
                                        fileName="Alta_Modalidad_40.pdf"
                                        className="w-full flex justify-center items-center gap-2 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 mt-2"
                                    >
                                        {({ loading }) => (
                                            loading ? 'Generando Documento...' : <><FileText size={18} /> Descargar Documento</>
                                        )}
                                    </PDFDownloadLink>
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
                                    <PDFDownloadLink
                                        document={<OfficialDocument docType="renuncia" clientName={userProfile.name} nss={userProfile.nss} />}
                                        fileName="Baja_Voluntaria.pdf"
                                        className="w-full flex justify-center items-center gap-2 py-3 bg-white text-blue-600 border-2 border-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors mt-2"
                                    >
                                        {({ loading }) => (
                                            loading ? 'Generando Documento...' : <><FileText size={18} /> Descargar Documento</>
                                        )}
                                    </PDFDownloadLink>
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

            {/* ZONE 2: Seguridad y Auditoría */}
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
                                <img src="https://cdn-icons-png.flaticon.com/512/6124/6124997.png" alt="Sello de Integridad" className="w-16 h-16 opacity-30 mix-blend-multiply" />
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
                                                                    <PDFDownloadLink
                                                                        document={
                                                                            <RetirementReport
                                                                                clientName={userProfile.name}
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
                                                                                certifiedDossier={null}
                                                                                agencyProfile={session?.user}
                                                                            />
                                                                        }
                                                                        fileName={`Certificado_${d.name.replace(/\s+/g, '_')}.pdf`}
                                                                        className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 border border-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        {({ loading }) => (
                                                                            loading ? <Scale size={14} className="animate-spin" /> : <><Download size={14} /> PDF Listo</>
                                                                        )}
                                                                    </PDFDownloadLink>
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
                                    const { syncEconomicAnchorsAction } = await import('../../../actions/oracle-actions');
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
        </div>
    );
}
