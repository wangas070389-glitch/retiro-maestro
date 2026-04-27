import { DossierBuilder } from '../src/lib/engine/audit/dossier-builder';
import { useLedgerStore } from '../src/store/ledger';

/**
 * Strategy 006 Verification Mock
 * Ensures the bundle integrity and signature verification logic holds
 * even when data is serialized and re-imported.
 */
async function verifyResilience() {
    console.log("🧪 Starting STRAT-006 Resilience Verification...");

    // 1. Mock the Ledger State
    const mockEntry = {
        id: "test-id",
        tuple: {
            formula_id: "MATH-001v1.1",
            anchor_hash: "LOCAL_D6F9",
            input_state: { weeks: 1250, salary_prom: 1500, age: 60 },
            timestamp: new Date().toISOString()
        },
        signature: "", // Will be signed
        pension_amount: 15000
    };

    // 2. Sign the entry (logic from SimulationStore)
    const { EvidenceSigner } = await import('../src/lib/engine/audit/evidence-signer');
    mockEntry.signature = await EvidenceSigner.sign(mockEntry.tuple);

    // 3. Populate store manually for test
    useLedgerStore.getState().entries = [mockEntry];

    // 4. Build Bundle
    const bundle = await DossierBuilder.buildBundle();
    console.log("✅ Bundle built with integrity hash:", bundle.integrity_hash);

    // 5. Verify Bundle
    const result = await DossierBuilder.verifyBundle(bundle);
    if (result.valid) {
        console.log("✅ STRAT-006 VALID: Bundle integrity and signatures verified.");
    } else {
        console.error("❌ STRAT-006 FAILED:", result.results);
    }

    // 6. Test Tamper Resistance
    console.log("🛡️ Testing Tamper Resistance (Scenario: Modified Amount)...");
    const tamperedBundle = JSON.parse(JSON.stringify(bundle));
    tamperedBundle.projections[0].pension_amount = 99999;
    // Should fail because the integrity hash (Master Hash) includes projections
    const tamperedResult = await DossierBuilder.verifyBundle(tamperedBundle);

    if (!tamperedResult.valid) {
        console.log("✅ STRAT-006 VALID: Tampering detected (Master Hash mismatch).");
    } else {
        console.error("❌ STRAT-006 FAILURE: Tampering went undetected!");
    }
}

// Note: This script is intended as a logical verification in the implementation phase.
verifyResilience().catch(console.error);
