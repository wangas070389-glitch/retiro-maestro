import { useState, useEffect, useMemo } from 'react';
import { getSealedDossiersAction, verifyDossierIntegrityAction } from '@/actions/authority-actions';
import { calculateProjectionAction } from '@/actions/calculate-pension';
import { generatePaymentCalendar, M40MonthlyPayment } from '@/lib/engine/m40-calculator';
import { useToast } from '@/components/ui/toast-context';

export function useAuthorityData(clientId: string | null) {
    const { showToast } = useToast();

    const [dossiers, setDossiers] = useState<any[]>([]);
    const [selectedDossierId, setSelectedDossierId] = useState<string | null>(null);
    const [projectionForPdf, setProjectionForPdf] = useState<any[]>([]);
    const [verifying, setVerifying] = useState<string | null>(null);

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

    return {
        dossiers,
        selectedDossierId,
        setSelectedDossierId,
        projectionForPdf,
        verifying,
        handleVerify,
        calendarData
    };
}
