import test from 'node:test';
import assert from 'node:assert';
import { TaxEngine } from './tax-engine.ts';

test('TaxEngine: exempt pension under 15 UMAs', () => {
    // 15 UMAs * 117.67 * 30.4 = 53657.52
    // A gross pension of 30,000 should be completely tax-exempt.
    const result = TaxEngine.calculateISR(30000);
    assert.strictEqual(result.isTaxable, false);
    assert.strictEqual(result.estimatedTax, 0);
    assert.strictEqual(result.netPension, 30000);
});

test('TaxEngine: taxable pension over 15 UMAs', () => {
    // 15 UMAs * 117.67 * 30.4 = 53657.52
    // A gross pension of 80,000 has a taxable income of ~26,342.48
    const result = TaxEngine.calculateISR(80000);
    assert.strictEqual(result.isTaxable, true);
    assert.ok(result.estimatedTax > 0);
    assert.strictEqual(result.netPension, 80000 - result.estimatedTax);
});
