import test from 'node:test';
import assert from 'node:assert';
import { VigenciaGuard } from './vigencia-guard.ts';

test('VigenciaGuard: active rights check', () => {
    // 1000 weeks / 4 = 250 weeks of conservation.
    // Date of termination is 50 weeks ago.
    const terminationDate = new Date();
    terminationDate.setDate(terminationDate.getDate() - (50 * 7));

    const result = VigenciaGuard.checkRights(1000, terminationDate.toISOString().split('T')[0]);
    assert.strictEqual(result.hasRights, true);
    assert.strictEqual(result.recoveryNeeded, false);
    assert.strictEqual(result.conservationWeeks, 250);
});

test('VigenciaGuard: expired rights check', () => {
    // 500 weeks / 4 = 125 weeks of conservation.
    // Date of termination is 200 weeks ago.
    const terminationDate = new Date();
    terminationDate.setDate(terminationDate.getDate() - (200 * 7));

    const result = VigenciaGuard.checkRights(500, terminationDate.toISOString().split('T')[0]);
    assert.strictEqual(result.hasRights, false);
    assert.strictEqual(result.recoveryNeeded, true);
});

test('VigenciaGuard: proximity warning', () => {
    // 1000 weeks / 4 = 250 weeks of conservation.
    // Date of termination is 220 weeks ago (220 / 250 = 88% elapsed, which is > 80%).
    const terminationDate = new Date();
    terminationDate.setDate(terminationDate.getDate() - (220 * 7));

    const result = VigenciaGuard.checkRights(1000, terminationDate.toISOString().split('T')[0]);
    assert.strictEqual(result.hasRights, true);
    assert.ok(result.warning !== undefined);
    assert.ok(result.warning.includes('ATENCIÓN'));
});
