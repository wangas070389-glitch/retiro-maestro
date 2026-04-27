'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { assertTrialAccess } from "@/lib/trial-guard";
import { PensionInput, PensionResult } from "@/lib/engine/pension-engine";

export async function saveSimulationAction(name: string, input: PensionInput, result: PensionResult, integrityHash?: string, clientId?: string | null) {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

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
        // Trial Access Gate (only for the user's own simulations, not advisor impersonation)
        if (!clientId) {
            const user = await db.user.findUnique({
                where: { id: targetUserId },
                select: { role: true, tier: true, createdAt: true, trialSimulationsUsed: true } as any,
            });
            if (user) assertTrialAccess(user as any);
        }

        const simulation = await db.simulation.create({
            data: {
                userId: targetUserId,
                name,
                input: JSON.stringify(input),
                result: JSON.stringify(result),
                integrity_hash: integrityHash || "",
            }
        });

        // Increment trial counter atomically
        if (!clientId) {
            await db.user.update({
                where: { id: targetUserId },
                data: { trialSimulationsUsed: { increment: 1 } } as any,
            });
        }

        revalidatePath('/dashboard');
        return { success: true, id: simulation.id };
    } catch (error) {
        console.error("Failed to save simulation:", error);
        return { success: false, error: "Database error" };
    }
}

export async function getSimulationsAction(clientId?: string | null) {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    let targetUserId = session.user.id;

    if (clientId) {
        if (session.user.role !== 'ADVISOR' && session.user.role !== 'ADMIN') {
            return { success: false, error: "Access Denied" };
        }
        if (session.user.role === 'ADVISOR') {
            const verify = await db.user.findFirst({ where: { id: clientId, advisorId: session.user.id } });
            if (!verify) return { success: false, error: "Access Denied" };
        }
        targetUserId = clientId;
    }

    try {
        const simulations = await db.simulation.findMany({
            where: { userId: targetUserId },
            orderBy: { createdAt: 'desc' }
        });

        return {
            success: true, simulations: simulations.map(s => ({
                ...s,
                input: JSON.parse(s.input),
                result: JSON.parse(s.result || "{}")
            }))
        };
    } catch (error) {
        console.error("Failed to fetch simulations:", error);
        return { success: false, error: "Database error" };
    }
}
export async function deleteSimulationAction(id: string, clientId?: string | null) {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    let targetUserId = session.user.id;

    if (clientId) {
        if (session.user.role !== 'ADVISOR' && session.user.role !== 'ADMIN') {
            return { success: false, error: "Access Denied" };
        }
        if (session.user.role === 'ADVISOR') {
            const verify = await db.user.findFirst({ where: { id: clientId, advisorId: session.user.id } });
            if (!verify) return { success: false, error: "Access Denied" };
        }
        targetUserId = clientId;
    }

    try {
        const simulation = await db.simulation.findUnique({ where: { id } });

        if (!simulation) {
            return { success: false, error: "Simulation not found" };
        }

        if (simulation.userId !== targetUserId) {
            return { success: false, error: "Unauthorized access to this simulation" };
        }

        await db.simulation.delete({
            where: { id }
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete simulation:", error);
        return { success: false, error: "Database error" };
    }
}
