'use client';

import { Scale, ShieldCheck } from 'lucide-react';
import { triggerInitialRouting } from '../../../actions/routing-actions';
import { updateResidencyStateAction } from '../../../actions/user-actions';
import { useSimulationStore } from '../../../store';
import { getSealedDossiersAction, verifyDossierIntegrityAction } from '../../../actions/authority-actions';
import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import legalData from '@/lib/data/legal-anchors.json';
import { generatePaymentCalendar, M40MonthlyPayment } from '../../../lib/engine/m40-calculator';
import { calculateProjectionAction } from '../../../actions/calculate-pension';
import { useToast } from '../../../components/ui/toast-context';
import { useSearchParams } from 'next/navigation';

import { AdvisorBridge } from './_components/AdvisorBridge';
import { DocumentHub } from './_components/DocumentHub';
import { AuditDossier } from './_components/AuditDossier';
import { OraclePulse } from './_components/OraclePulse';

export default function AuthorityPage() {
    const { data: session } = useSession();
    const { showToast } = useToast();
    const searchParams = useSearchParams();
    const clientId = searchParams.get('clientId');
    const [dossiers, setDossiers] = useState<any[]>([]);
    const [verifying, setVerifying] = useState<string | null>(null);
    const { userProfile } = useSimulationStore();

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

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

                calculateProjectionAction(d.input, strategyMode, monthlyInv, targetDailySalary)
                    .then((res) => {
                        setProjectionForPdf(res.projection);
                    })
                    .catch((err) => {
                        console.error("Failed to calculate projection for PDF:", err);
                    });
            } else {
                setProjectionForPdf([]);
            }
        }
    }, [selectedDossierId, dossiers]);

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

    const [leadStatus, setLeadStatus] = useState<string>('NONE');
    const [hasAdvisor, setHasAdvisor] = useState<boolean>(false);
    const [advisorName, setAdvisorName] = useState<string | null>(null);
    const [advisorPhone, setAdvisorPhone] = useState<string | null>(null);
    const [advisorEmail, setAdvisorEmail] = useState<string | null>(null);

    // Sync initial session data to state to avoid visual jumps
    useEffect(() => {
        if (session?.user) {
            const u = session.user as any;
            setLeadStatus(u.leadStatus || 'NONE');
            setHasAdvisor(u.leadStatus === 'CLAIMED' || !!u.advisorId);
            setAdvisorName(u.advisorName || null);
            setAdvisorPhone(u.advisorPhone || null);
            setAdvisorEmail(u.advisorEmail || null);
            if (u.residencyState) {
                setResidencyStateInput(u.residencyState);
            }
        }
    }, [session]);

    // Live poller for B2C client's lead & advisor status
    useEffect(() => {
        if (session?.user?.role === 'USER') {
            const checkStatus = async () => {
                const { checkLeadStatusAction } = await import('../../../actions/routing-actions');
                const res = await checkLeadStatusAction();
                if (res.success && res.status) {
                    setLeadStatus(res.status);
                    setHasAdvisor(res.status === 'CLAIMED');
                    setAdvisorName(res.advisorName || null);
                    setAdvisorPhone(res.advisorPhone || null);
                    setAdvisorEmail(res.advisorEmail || null);
                    if (res.state) {
                        setResidencyStateInput(res.state);
                    }
                }
            };
            
            checkStatus();
            
            const interval = setInterval(checkStatus, 8000);
            return () => clearInterval(interval);
        }
    }, [session]);

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
            setLeadStatus('PENDING_INTERNAL');
        } else {
            showToast(res.error || "Error al solicitar asesor", "error");
        }
        setRequestingAdvisor(false);
    };

    const isLocked = session?.user?.tier === 'FREE';
    const isB2C = session?.user?.role === 'USER';
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

    if (!mounted) return null;

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
            <AdvisorBridge
                isB2C={isB2C}
                hasAdvisor={hasAdvisor}
                leadStatus={leadStatus}
                residencyStateInput={residencyStateInput}
                setResidencyStateInput={setResidencyStateInput}
                requestingAdvisor={requestingAdvisor}
                handleRequestAdvisor={handleRequestAdvisor}
                advisorName={advisorName}
                advisorPhone={advisorPhone}
                advisorEmail={advisorEmail}
            />

            {/* ZONE 1: Operativo */}
            <DocumentHub
                isLocked={isLocked}
                isB2C={isB2C}
                userProfile={userProfile}
                calendarData={calendarData}
            />

            {/* ZONE 2: Seguridad y Auditoría */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-6 flex items-center gap-2">
                    <div className="w-8 h-px bg-slate-300"></div>
                    Certificaciones y Respaldo de Datos
                    <div className="flex-1 h-px bg-slate-200"></div>
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
                    {/* Dossier Soberano */}
                    <AuditDossier
                        isLocked={isLocked}
                        isB2C={isB2C}
                        dossiers={dossiers}
                        selectedDossierId={selectedDossierId}
                        setSelectedDossierId={setSelectedDossierId}
                        verifying={verifying}
                        handleVerify={handleVerify}
                        projectionForPdf={projectionForPdf}
                        userProfile={userProfile}
                        session={session}
                        showToast={showToast}
                    />

                    {/* Oracle Pulse */}
                    <OraclePulse
                        isLocked={isLocked}
                        isB2C={isB2C}
                        legalData={legalData}
                        showToast={showToast}
                    />
                </div>
            </div>
        </div>
    );
}
