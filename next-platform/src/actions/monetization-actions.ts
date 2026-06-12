'use server';

import { db } from '../lib/db';
import { auth } from '../auth';
import { revalidatePath } from 'next/cache';
import { Tier, Role } from '../lib/config/pricing';

/**
 * Simulates a checkout success by upgrading the user's tier.
 * In a production app, this would be a Stripe Webhook.
 */
export async function upgradeTierAction(tier: Tier) {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Debes iniciar sesión para comprar." };
    }

    // C4 Guard: Disable direct monetization upgrade bypass in production for non-admin accounts
    if (process.env.NODE_ENV === 'production' && (session.user as any).role !== 'ADMIN') {
        throw new Error("El upgrade directo de tier está deshabilitado en producción.");
    }

    try {
        const userRole = (session.user as any).role as Role || 'USER';

        // Role-Tier Guard (Deep Blue Phase - ADR-036)
        const b2cTiers: Tier[] = ['STRATEGY', 'DOSSIER'];
        const b2bTiers: Tier[] = ['STARTER', 'GROWTH', 'PRO'];

        if (userRole === 'USER' && b2bTiers.includes(tier)) {
            throw new Error("Los ciudadanos no pueden adquirir planes de asesor profesional.");
        }
        if (userRole === 'ADVISOR' && b2cTiers.includes(tier)) {
            throw new Error("Los asesores no pueden adquirir planes de ciudadanos básicos.");
        }

        await db.user.update({
            where: { id: session.user.id },
            data: { 
                tier: tier, 
                subscriptionStatus: "ACTIVE" 
            }
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Upgrade Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error al procesar la suscripción." };
    }
}
