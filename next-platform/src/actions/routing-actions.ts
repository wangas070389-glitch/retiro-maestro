'use server';

import { db } from "@/lib/db";
import { auth } from "@/auth";

/**
 * Epic 17: Temporal SLA & Auction Engine
 * Executes the First-Right-of-Refusal Geo-Spatial logic for Lead Distribution.
 */

// Global Config
const SLA_INTERNAL_HOURS = 4;
const SLA_LOCAL_HOURS = 24;

export async function triggerInitialRouting() {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: { id: session.user.id }
        }) as any;

        // Only raw users with no Advisor
        if (user.role !== 'USER' || user.advisorId || user.leadStatus !== 'NONE') {
            return { success: false, error: "Usuario no elegible para enrutamiento orgánico." };
        }

        // Rule 1: Send to PENDING_INTERNAL (4-hour SLA Window for Corporate)
        const slaTarget = new Date();
        slaTarget.setHours(slaTarget.getHours() + SLA_INTERNAL_HOURS);

        await db.user.update({
            where: { id: user.id },
            data: {
                leadStatus: "PENDING_INTERNAL",
                slaExpiresAt: slaTarget
            } as any
        });

        return { success: true };
    } catch (e) {
        return { success: false, error: "Error de servidor al inyectar al Routing Engine." };
    }
}

/**
 * Mutates the Lead State via Temporal Rules based on Node evaluation.
 * Call this dynamically when Advisor loads their Lead Market, or via Background Job.
 */
export async function evaluateAuctionMatrix() {
    try {
        // Find all leads where SLA has expired AND they are not claimed
        const now = new Date();
        
        // Rule 2 Geo-Spill: Move Expired Internals to Local Pool (+24 Hours TTL)
        const newSla = new Date();
        newSla.setHours(newSla.getHours() + SLA_LOCAL_HOURS);

        const internalUpdateResult = await db.user.updateMany({
            where: {
                leadStatus: "PENDING_INTERNAL",
                slaExpiresAt: { lt: now }
            },
            data: {
                leadStatus: "PENDING_LOCAL",
                slaExpiresAt: newSla
            }
        });

        if (internalUpdateResult.count > 0) {
            console.log(`[ROUTING ENGINE] ${internalUpdateResult.count} leads spilled over to LOCAL_POOL.`);
        }

        // Rule 3 Fallback: Move Expired Locals to National Pool
        const localUpdateResult = await db.user.updateMany({
            where: {
                leadStatus: "PENDING_LOCAL",
                slaExpiresAt: { lt: now }
            },
            data: {
                leadStatus: "PENDING_NATIONAL",
                slaExpiresAt: null // No expiration, open to anyone
            }
        });

        if (localUpdateResult.count > 0) {
            console.log(`[ROUTING ENGINE] ${localUpdateResult.count} leads degraded to NATIONAL_POOL.`);
        }

        return { success: true, processed: internalUpdateResult.count + localUpdateResult.count };
    } catch (error) {
        console.error("Evaluation Error", error);
        return { success: false };
    }
}

/**
 * Claim action triggered by Advisor in the Frontend "Lead Market".
 */
export async function claimLeadAction(leadId: string) {
    try {
        const session = await auth();
        const userRole = (session?.user as any)?.role;
        if (!session?.user?.id || (userRole !== 'ADVISOR' && userRole !== 'ADMIN')) {
            throw new Error("Only Advisors or Admins can claim leads.");
        }

        // Lock Record
        const lead = await db.user.findUnique({
            where: { id: leadId }
        }) as any;

        if (!lead || lead.leadStatus === 'CLAIMED' || lead.advisorId) {
            return { success: false, error: "El lead ya no está disponible." };
        }

        const advisor = await db.user.findUnique({
            where: { id: session.user.id }
        }) as any;

        // Paywall Guard (Deep Blue Phase - ADR-036)
        const allowedTiers = ['STARTER', 'GROWTH', 'PRO', 'FREE']; 
        // Note: Currently allowed for FREE during Beta? User said "GOLD only" previously.
        // Actually the SPEC says: "B2B (Advisor): FREE -> STARTER -> GROWTH -> PRO".
        // And the user wants to eradicate GOLD.
        
        const professionalTiers = ['STARTER', 'GROWTH', 'PRO'];
        if (!professionalTiers.includes(advisor.tier)) {
            return { success: false, error: "Tu plan actual no permite reclamar leads. Actualiza a un plan profesional." };
        }

        // Enforce Geographic Constraints
        if (lead.leadStatus === 'PENDING_LOCAL') {
            if (advisor.operationState !== lead.residencyState) {
                return { success: false, error: "SLA Activo: El lead está restringido a Talento Local." };
            }
        }

        if (lead.leadStatus === 'PENDING_NATIONAL') {
            if (!advisor.remoteReady) {
                return { success: false, error: "El lead es remoto. Activa tu disposición Nacional en Perfil." };
            }
        }

        // Execute Bind (First-Come, First-Served)
        await db.user.update({
            where: { id: lead.id },
            data: {
                leadStatus: "CLAIMED",
                advisorId: advisor.id,
                claimedById: advisor.id,
                slaExpiresAt: null
            } as any
        });

        console.warn(`[ROUTING ENGINE] Lead ${lead.id} CLAIMED by Advisor ${advisor.id}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error en concurrencia (Transaction Deadlock)." };
    }
}

/**
 * Epic 18: Frontend Observer Action
 * Clients poll this to render the Matchmaker UI or cleanly unlock their dashboard.
 */
export async function checkLeadStatusAction() {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false };

        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: { leadStatus: true, residencyState: true, advisor: { select: { name: true, agencyName: true } } } as any
        }) as any;

        return { 
            success: true, 
            status: user.leadStatus, 
            state: user.residencyState,
            advisorName: user.advisor?.agencyName || user.advisor?.name || null
        };
    } catch (e) {
        return { success: false };
    }
}
