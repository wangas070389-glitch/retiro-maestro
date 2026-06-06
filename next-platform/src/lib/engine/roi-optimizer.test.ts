import test from 'node:test';
import assert from 'node:assert';
import { ROIOptimizer } from './roi-optimizer.ts';
import type { PensionInput } from './pension-engine.ts';

test('ROIOptimizer: optimize strategy recommendations (happy path)', () => {
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

test('ROIOptimizer: uses fallback age when originalAge is undefined', () => {
    const optimizer = new ROIOptimizer();
    const input: PensionInput = {
        weeks: 1200,
        salary_prom: 1000,
        age: 65, // User is already 65
        has_wife: true,
        children_count: 0,
        dependent_parents_count: 0,
        anchor_salary: 100
    };

    // Calling optimize without originalAge should fallback to input.age - 5 = 60
    const recsWithFallback = optimizer.optimize(input);
    const recsWithExplicitAge = optimizer.optimize(input, 60);

    // Verify both approaches yield the same recommendations
    assert.deepStrictEqual(
        recsWithFallback.map(r => r.totalInvestment),
        recsWithExplicitAge.map(r => r.totalInvestment)
    );
});

test('ROIOptimizer: identifies the correct optimal strategy based on max ROI', () => {
    const optimizer = new ROIOptimizer();
    const input: PensionInput = {
        weeks: 800,
        salary_prom: 500,
        age: 60,
        has_wife: false,
        children_count: 0,
        dependent_parents_count: 0,
        anchor_salary: 100
    };

    const recs = optimizer.optimize(input, 60);

    // Find the strategy with the max ROI mathematically
    const maxRoiStrategy = recs.reduce((prev, current) =>
        (current.roiPercentage > prev.roiPercentage) ? current : prev
    );

    // Assert that the optimizer actually flagged this exact strategy as optimal
    assert.strictEqual(maxRoiStrategy.isOptimal, true);

    // Assert no other strategy is flagged
    const optimalRecs = recs.filter(r => r.isOptimal);
    assert.strictEqual(optimalRecs.length, 1);
});

test('ROIOptimizer: handles scenarios with marginal or zero pension gain', () => {
    const optimizer = new ROIOptimizer();
    // Simulate a user who already has maximum salary and lots of weeks
    // Thus M40 won't add much value, potentially 0 gain depending on math
    const input: PensionInput = {
        weeks: 2500,
        salary_prom: 2500, // already at 25 UMA cap
        age: 65,
        has_wife: true,
        children_count: 0,
        dependent_parents_count: 0,
        anchor_salary: 100
    };

    const recs = optimizer.optimize(input, 60);

    for (const rec of recs) {
        if (rec.pensionGain <= 0) {
            // Payback months should be Infinity if there's no gain
            assert.strictEqual(rec.paybackMonths, Infinity);
        }
    }
});
