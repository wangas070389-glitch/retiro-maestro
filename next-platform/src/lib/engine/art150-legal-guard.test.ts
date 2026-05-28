import test from 'node:test';
import assert from 'node:assert';
import { Art150LegalGuard } from './art150-legal-guard.ts';

test('Art150LegalGuard: validateConservation active and expired', () => {
    // Active case
    const activeRes = Art150LegalGuard.validateConservation(1000, null);
    assert.strictEqual(activeRes.isVigente, true);
    assert.strictEqual(activeRes.semanasGracia, 0);

    // Expired case
    const terminationDate = new Date();
    terminationDate.setDate(terminationDate.getDate() - (300 * 7)); // 300 weeks ago
    const expiredRes = Art150LegalGuard.validateConservation(500, terminationDate.toISOString().split('T')[0]); // 125 weeks grace
    assert.strictEqual(expiredRes.isVigente, false);
    assert.ok(expiredRes.mensaje.includes('Riesgo Crítico'));
});
