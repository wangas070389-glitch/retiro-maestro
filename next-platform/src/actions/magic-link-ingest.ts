'use server';

import { db } from '@/lib/db';
import { PensionInput, PensionEngine } from '@/lib/engine/pension-engine';
import { revalidatePath } from 'next/cache';

export async function ingestDecentralizedConstancia(token: string, clientId: string, rawInput: PensionInput) {
    try {
        // 1. Validate Token Integrity & TTL
        const client = await db.user.findUnique({
            where: { magicLinkToken: token, id: clientId } as any
        }) as any;

        if (!client || !client.magicLinkExpires) {
            return { success: false, error: 'Túnel criptográfico inválido o desconectado.' };
        }

        if (client.magicLinkExpires < new Date()) {
            return { success: false, error: 'Enlace expirado. Por favor solicite uno nuevo a su Asesor.' };
        }

        // 2. Extrapolate Result Math utilizing Core Engine
        const engine = new PensionEngine();
        const result = engine.calculate(rawInput);

        // 3. Persist Simulation (Decentralized Inject)
        const simulationName = `Expediente IMSS (Auto-Ingesta ${new Date().toLocaleDateString()})`;
        
        await db.simulation.create({
            data: {
                userId: clientId,
                name: simulationName,
                input: JSON.stringify(rawInput),
                result: JSON.stringify(result),
                integrity_hash: `B2B2C-MAGIC-LINK-${token.substring(0,8)}`,
                is_forensic: true // Flags this as an immutable external source record
            }
        });

        // 4. Burn the Token to ensure One-Time Use (Single-Use Protocol)
        await db.user.update({
            where: { id: clientId },
            data: {
                magicLinkToken: null,
                magicLinkExpires: null
            } as any
        });

        revalidatePath('/dashboard');
        return { success: true };

    } catch (error) {
        console.error('B2B2C Magic Link Ingestion Failure:', error);
        return { success: false, error: 'Fallo de inyección en la base de datos principal.' };
    }
}
