'use client';

import { useEffect, useRef } from 'react';
import { useSimulationStore } from '@/store';
import { useSovereignHandshake } from '@/hooks/useSovereignHandshake';

interface StoreInitializerProps {
    userId: string | null;
    userName: string | null;
    birthDate?: string | Date | null;
    nss?: string | null;
    isWorking?: boolean | null;
    lastBajaDate?: string | Date | null;
}

function formatDateForInput(dateVal: any): string {
    if (!dateVal) return '';
    try {
        let d: Date;
        if (typeof dateVal === 'string') {
            if (/^\d{4}-\d{2}-\d{2}/.test(dateVal)) {
                return dateVal.substring(0, 10);
            }
            d = new Date(dateVal);
        } else if (dateVal instanceof Date) {
            d = dateVal;
        } else {
            return '';
        }
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    } catch {
        return '';
    }
}

export default function StoreInitializer({ 
    userId, 
    userName,
    birthDate,
    nss,
    isWorking,
    lastBajaDate
}: StoreInitializerProps) {
    const initialized = useRef(false);

    // Call the handshake to sync local data if needed
    useSovereignHandshake();

    useEffect(() => {
        if (!initialized.current) {
            if (userId) {
                useSimulationStore.getState().setUserId(userId);
            }
            if (userName) {
                useSimulationStore.getState().setUserProfile({ name: userName });
            }
            
            const updates: any = {};
            if (birthDate) {
                const exactAge = (new Date().getTime() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
                updates.age = Number(exactAge.toFixed(2));
            }
            if (isWorking !== undefined && isWorking !== null) {
                updates.is_ongoing_work = !!isWorking;
            }
            if (lastBajaDate) {
                updates.last_termination_date = formatDateForInput(lastBajaDate);
            }
            if (Object.keys(updates).length > 0) {
                useSimulationStore.getState().updateScenarioA(updates);
            }
            
            initialized.current = true;
        }
    }, [userId, userName, birthDate, nss, isWorking, lastBajaDate]);

    return null;
}
