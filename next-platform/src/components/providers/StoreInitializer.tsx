'use client';

import { useEffect, useRef } from 'react';
import { useSimulationStore } from '@/store';
import { useSovereignHandshake } from '@/hooks/useSovereignHandshake';

interface StoreInitializerProps {
    userId: string | null;
    userName: string | null;
}

export default function StoreInitializer({ userId, userName }: StoreInitializerProps) {
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
            initialized.current = true;
        }
    }, [userId, userName]);

    return null;
}
