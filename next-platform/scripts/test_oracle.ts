import { OracleService } from '../src/lib/engine/oracle/oracle-service';
import legalData from '../src/lib/data/legal-anchors.json';

async function verifyOracle() {
    console.log("--- Oracle Anchor Verification ---");
    console.log("Hardcoded JSON UMA 2026: ", legalData.uma_2026);
    console.log("Hardcoded JSON SMDF 2026: ", legalData.smdf_2026);

    console.log("\n--- Service Fetch ---");
    const serviceData = await OracleService.fetchLatestAnchors();
    console.log("Service UMA: ", serviceData.uma);
    console.log("Service INPC: ", serviceData.inpc);
    console.log("Service SMDF: ", serviceData.smdf);
    console.log("Service Source: ", serviceData.source);
}

verifyOracle();
