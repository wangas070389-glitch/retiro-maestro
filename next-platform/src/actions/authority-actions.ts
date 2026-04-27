'use server';

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { DossierBuilder, ForensicBundle } from "@/lib/engine/audit/dossier-builder";

export async function getSealedDossiersAction(clientId?: string | null) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    let targetUserId = session.user.id;

    if (clientId) {
        if (session.user.role !== 'ADVISOR' && session.user.role !== 'ADMIN') {
            return { success: false, error: "Access Denied: Impersonation requires ADVISOR clearance." };
        }
        if (session.user.role === 'ADVISOR') {
            const verify = await db.user.findFirst({ where: { id: clientId, advisorId: session.user.id } });
            if (!verify) return { success: false, error: "Access Denied: Client not in your portfolio." };
        }
        targetUserId = clientId;
    }

    try {
        const dossiers = await db.simulation.findMany({
            where: {
                userId: targetUserId,
                integrity_hash: { not: null }
            },
            orderBy: { createdAt: 'desc' }
        });

        return {
            success: true,
            dossiers: dossiers.map(d => ({
                id: d.id,
                name: d.name,
                hash: d.integrity_hash,
                createdAt: d.createdAt,
                input: JSON.parse(d.input),
                result: JSON.parse(d.result || "{}")
            }))
        };
    } catch (error) {
        return { success: false, error: "Database error" };
    }
}

export async function verifyDossierIntegrityAction(dossierId: string) {
    try {
        const dossier = await db.simulation.findUnique({
            where: { id: dossierId }
        });

        if (!dossier || !dossier.integrity_hash) {
            return { success: false, error: "Dossier not found or not sealed" };
        }

        // Reconstruct bundle for verification
        const bundle: ForensicBundle = {
            version: "1.0.0",
            generated_at: dossier.createdAt.toISOString(),
            anchors_snapshot: JSON.parse(dossier.input).anchors_snapshot || {}, // We'll need to ensure snapshot is in input
            projections: [JSON.parse(dossier.result || "{}")],
            integrity_hash: dossier.integrity_hash,
            formula_manifest: {
                pcb_definition: "Porcentaje de Cuantía Básica",
                apcb_definition: "Asignación por Cuantía Básica",
                legal_basis: "Ley 73"
            }
        };

        const result = await DossierBuilder.verifyBundle(bundle);
        return { success: true, valid: result.valid };
    } catch (error) {
        return { success: false, error: "Verification failed" };
    }
}
