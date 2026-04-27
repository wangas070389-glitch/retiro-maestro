'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSimulationStore } from '@/store';
import { saveSimulationAction } from '@/actions/simulation-actions';

export function useSovereignHandshake() {
    const { data: session, status } = useSession();
    const { scenarioA, userId } = useSimulationStore();

    useEffect(() => {
        // Only run sync if authenticated and we haven't synced this session yet
        if (status === 'authenticated' && session?.user?.id && !userId) {
            const syncLocalToCloud = async () => {
                // If there's local data in scenarioA, consider saving it to cloud
                // This is a simple 'handshake' - more complex ones could iterate over a local list
                if (scenarioA.result) {
                    await saveSimulationAction(
                        `Imported: ${new Date().toLocaleDateString()}`,
                        scenarioA.input,
                        scenarioA.result
                    );
                }
            };
            syncLocalToCloud();
        }
    }, [status, session, scenarioA, userId]);
}
