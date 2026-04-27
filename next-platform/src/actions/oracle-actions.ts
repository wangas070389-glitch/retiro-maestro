'use server';

import { OracleService } from "@/lib/engine/oracle/oracle-service";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function syncEconomicAnchorsAction() {
    try {
        const latest = await OracleService.fetchLatestAnchors();

        // Persist to database
        await db.economicAnchor.upsert({
            where: {
                year_source: {
                    year: new Date().getFullYear(),
                    source: latest.source
                }
            },
            update: {
                uma: latest.uma,
                inpc: latest.inpc,
                smdf: latest.smdf,
                is_verified: true,
                signature: `SIG_ORACLE_${Date.now()}` // Mock signature for now
            },
            create: {
                year: new Date().getFullYear(),
                uma: latest.uma,
                inpc: latest.inpc,
                smdf: latest.smdf,
                source: latest.source,
                is_verified: true,
                signature: `SIG_ORACLE_${Date.now()}`
            }
        });

        console.log("Oracle: Synced anchors from", latest.source);

        revalidatePath('/dashboard');
        revalidatePath('/authority');
        return { success: true, data: latest };
    } catch (error) {
        console.error("Oracle Sync Error:", error);
        return { success: false, error: "Failed to reach official sources" };
    }
}

export async function updateManualAnchorAction(uma: number, inpc: number) {
    try {
        const { auth } = await import('@/auth');
        const session = await auth();

        // RBAC Enforcement (ADR-029)
        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized. Admin privileges required." };
        }

        // We also need the SMDF. For now, we'll keep the current SMDF from legalData or allow passing it. 
        // We will default SMDF to the JSON truth to avoid needing a 3rd input if they only update UMA.
        const legalData = (await import('@/lib/data/legal-anchors.json')).default;

        await db.economicAnchor.upsert({
            where: {
                year_source: {
                    year: new Date().getFullYear(),
                    source: "Admin Override"
                }
            },
            update: {
                uma,
                inpc,
                smdf: legalData.smdf_2026,
                is_verified: true,
                signature: `SIG_ADMIN_${Date.now()}`
            },
            create: {
                year: new Date().getFullYear(),
                uma,
                inpc,
                smdf: legalData.smdf_2026,
                source: "Admin Override",
                is_verified: true,
                signature: `SIG_ADMIN_${Date.now()}`
            }
        });

        console.log(`Oracle: Admin Override Injected [UMA: ${uma}, INPC: ${inpc}]`);

        revalidatePath('/dashboard');
        revalidatePath('/authority');
        revalidatePath('/settings');

        return { success: true };
    } catch (error) {
        console.error("Manual Override Error:", error);
        return { success: false, error: "Database transaction failed." };
    }
}
