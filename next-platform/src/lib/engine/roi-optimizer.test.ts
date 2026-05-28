import test from 'node:test';
import assert from 'node:assert';
import { ROIOptimizer } from './roi-optimizer.ts';
import type { PensionInput } from './pension-engine.ts';

test('ROIOptimizer: optimize strategy recommendations', () => {
    const optimizer = new ROIOptimizer();
    const input: PensionInput = {
        weeks: 1200,
        salary_prom: 1000,
        age: 60,
        has_wife: true,
        children_count: 0,
        dependent_parents_count: 0,
        anchor_salary: 100
    };

    // Optimize for retirement at 65 (5 years of M40 potential)
    const recs = optimizer.optimize(input, 60);

    // Should return recommendations for 5 windows: 1, 2, 3, 4, 5 years
    assert.strictEqual(recs.length, 5);

    // Verify recommendations structures
    for (const rec of recs) {
        assert.ok(rec.strategyName);
        assert.ok(rec.totalInvestment > 0);
        assert.ok(rec.monthlyPension > 0);
        assert.ok(rec.paybackMonths !== undefined);
        assert.ok(rec.roiPercentage !== undefined);
    }

    // Exactly one strategy should be flagged as optimal
    const optimalRecs = recs.filter(r => r.isOptimal);
    assert.strictEqual(optimalRecs.length, 1);
});
