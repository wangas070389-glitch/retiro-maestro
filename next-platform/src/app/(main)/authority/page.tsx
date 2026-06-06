'use client';

import { Scale, ShieldCheck } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSimulationStore } from '@/store';
import { useToast } from '@/components/ui/toast-context';

import { useAuthorityData } from './hooks/useAuthorityData';
import { AdvisorSection } from './components/AdvisorSection';
import { OperativoZone } from './components/OperativoZone';
import { SecurityZone } from './components/SecurityZone';

export default function AuthorityPage() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const clientId = searchParams.get('clientId');
    const { userProfile } = useSimulationStore();

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const {
        dossiers,
        selectedDossierId,
        setSelectedDossierId,
        projectionForPdf,
        verifying,
        handleVerify,
        calendarData
    } = useAuthorityData(clientId);

    const isLocked = session?.user?.tier === 'FREE';
    const isB2C = session?.user?.role === 'USER';

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
            <AdvisorSection />

            {/* ZONE 1: Operativo */}
            <OperativoZone
                isLocked={isLocked}
                isB2C={isB2C}
                userProfile={userProfile}
                calendarData={calendarData}
            />

            {/* ZONE 2: Seguridad y Auditoría */}
            <SecurityZone
                isLocked={isLocked}
                isB2C={isB2C}
                dossiers={dossiers}
                selectedDossierId={selectedDossierId}
                setSelectedDossierId={setSelectedDossierId}
                handleVerify={handleVerify}
                verifying={verifying}
                userProfile={userProfile}
                projectionForPdf={projectionForPdf}
                sessionUser={session?.user}
                showToast={showToast}
            />
        </div>
    );
}
