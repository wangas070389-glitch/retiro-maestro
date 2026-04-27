import { db } from '../src/lib/db';
import { OracleService } from '../src/lib/engine/oracle/oracle-service';

async function verifySaaS() {
    console.log("--- SaaS Foundation Verification ---");

    // 1. Check Oracle
    const anchors = await OracleService.fetchLatestAnchors();
    console.log("Oracle fetch success:", !!anchors);
    console.log("Oracle source:", anchors.source);

    // 2. Check Database Connectivity
    try {
        const userCount = await db.user.count();
        console.log("Database connected. User count:", userCount);

        const simCount = await db.simulation.count();
        console.log("Simulation count:", simCount);
    } catch (error) {
        console.error("Database connection failed:", error);
    }

    console.log("--- Verification Complete ---");
}

verifySaaS();
