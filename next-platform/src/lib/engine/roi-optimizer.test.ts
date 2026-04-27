import test from 'node:test';
import assert from 'node:assert';
import { ROIOptimizer } from './roi-optimizer';
import { type PensionInput } from './pension-engine';

test('ROIOptimizer.optimize: standard scenario returns 5 windows and identifies optimal', () => {
    const optimizer = new ROIOptimizer();
    const input: PensionInput = {
        age: 60,
        weeks: 1500,
        salary_prom: 500,
        has_wife: true,
        children_count: 0,
        dependent_parents_count: 0,
        is_ongoing_work: false // Stop working, wait until retirement
    };

    const recommendations = optimizer.optimize(input);

    // 1. Should return exactly 5 windows (12, 24, 36, 48, 60 months)
    assert.strictEqual(recommendations.length, 5);

    // 2. Check investment scaling (60 months should cost exactly 5x of 12 months)
    const rec12 = recommendations.find(r => r.investmentMonths === 12);
    const rec60 = recommendations.find(r => r.investmentMonths === 60);
    assert(rec12 && rec60, 'Should have 12 and 60 month recommendations');

    // allow a tiny floating point variance
    assert(Math.abs(rec60.totalInvestment - (rec12.totalInvestment * 5)) < 0.1, 'Investment should scale linearly');

    // 3. Exactly one recommendation should be optimal
    const optimalRecs = recommendations.filter(r => r.isOptimal);
    assert.strictEqual(optimalRecs.length, 1, 'There should be exactly one optimal recommendation');

    // 4. The optimal recommendation should have the highest ROI
    const maxRoi = Math.max(...recommendations.map(r => r.roiPercentage));
    assert.strictEqual(optimalRecs[0].roiPercentage, maxRoi, 'Optimal recommendation must have the highest ROI');
});

test('ROIOptimizer.optimize: high salary scenario yields zero gain or zero ROI', () => {
    const optimizer = new ROIOptimizer();
    // A scenario where the user already has a huge salary and a lot of weeks
    const input: PensionInput = {
        age: 60,
        weeks: 2000,
        salary_prom: 10000, // Very high salary, already well above 25 UMAs
        has_wife: true,
        children_count: 0,
        dependent_parents_count: 0
    };

    const recommendations = optimizer.optimize(input);

    recommendations.forEach(rec => {
        // Because the salary is already maxed out, investing more shouldn't give any pension gain
        // The PensionEngine caps salary at 25 UMAs.
        assert(rec.pensionGain <= 0.01, `Pension gain should be practically zero, got ${rec.pensionGain}`);

        // As a result, paybackMonths should be Infinity and roiPercentage should be 0
        assert.strictEqual(rec.paybackMonths, Infinity);
        assert.strictEqual(rec.roiPercentage, 0);
    });

    // One of them is still marked optimal (likely the first one due to reduce behavior), but we ensure ROI is 0
    const optimalRecs = recommendations.filter(r => r.isOptimal);
    assert.strictEqual(optimalRecs.length, 1);
    assert.strictEqual(optimalRecs[0].roiPercentage, 0);
});

test('ROIOptimizer.optimize: paybackMonths and costOfInaction calculations', () => {
    const optimizer = new ROIOptimizer();
    const input: PensionInput = {
        age: 55,
        weeks: 1000,
        salary_prom: 1000,
        has_wife: false,
        children_count: 0,
        dependent_parents_count: 0,
        retirement_age: 60
    };

    const recommendations = optimizer.optimize(input);

    recommendations.forEach(rec => {
        if (rec.pensionGain > 0) {
            // Payback months = Total Investment / Pension Gain
            const expectedPayback = rec.totalInvestment / rec.pensionGain;
            assert(Math.abs(rec.paybackMonths - expectedPayback) < 0.1, 'Payback months should be calculated correctly');

            // Cost of inaction = Pension Gain
            assert.strictEqual(rec.costOfInaction, rec.pensionGain, 'Cost of inaction should equal pension gain');

            // ROI = (Gain * 12 / Investment) * 100
            const expectedRoi = (rec.pensionGain * 12 / rec.totalInvestment) * 100;
            assert(Math.abs(rec.roiPercentage - expectedRoi) < 0.1, 'ROI should be calculated correctly');
        }
    });
});
