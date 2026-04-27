'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { randomUUID } from 'crypto';

export async function generateMagicLink(clientId: string) {
    const session = await auth();

    if (!session?.user || (session.user.role !== 'ADVISOR' && session.user.role !== 'ADMIN')) {
        return { success: false, error: 'Acceso Denegado: Permisos Insuficientes.' };
    }

    try {
        // 1. Validate Client Ownership
        const client = await db.user.findFirst({
            where: { id: clientId, advisorId: session.user.id }
        });

        if (!client) {
            return { success: false, error: 'Cliente no encontrado o no pertenece a su portafolio.' };
        }

        // 2. Generate Cryptographic Token & TTL (Validity: 72 hours)
        const token = randomUUID();
        const expiresAt = new Date(Date.now() + (72 * 60 * 60 * 1000));

        // 3. Persist Magic Link Entity
        await db.user.update({
            where: { id: clientId },
            data: { 
                magicLinkToken: token,
                magicLinkExpires: expiresAt
            } as any
        });

        // 4. Return canonical Drop Zone Route
        // Using relative origin from frontend or environmental absolute path
        const magicPath = `/drop/${token}`;
        
        return { 
            success: true, 
            token, 
            magicPath,
            expires: expiresAt
        };

    } catch (error) {
        console.error('MagicLink Error:', error);
        return { success: false, error: 'Incapaz de establecer túnel criptográfico. Intente nuevamente.' };
    }
}
