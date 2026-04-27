'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { getTrialStatus, TrialStatus } from '@/lib/trial-guard';

/**
 * Server action: fetches the current user's trial status.
 */
export async function checkTrialStatusAction(): Promise<{ success: boolean; status?: TrialStatus; error?: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'No autenticado.' };
    }

    try {
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: { role: true, tier: true, createdAt: true, trialSimulationsUsed: true } as any,
        });

        if (!user) {
            return { success: false, error: 'Usuario no encontrado.' };
        }

        const status = getTrialStatus(user as any);
        return { success: true, status };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : 'Error al verificar estado de prueba.' };
    }
}
