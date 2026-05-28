import test from 'node:test';
import assert from 'node:assert';
import { InverseDesigner } from './inverse-designer.ts';
import type { PensionInput } from './pension-engine.ts';

test('InverseDesigner: goal seek required salary', () => {
    const designer = new InverseDesigner();
    const input: PensionInput = {
        weeks: 1500,
        salary_prom: 200,
        age: 60,
        has_wife: true,
        children_count: 0,
        dependent_parents_count: 0,
        anchor_salary: 100
    };

    // Meta alcanzable (por ejemplo, we want a target of 15,000)
    const result = designer.solveForTarget(input, 15000, 60);

    assert.strictEqual(result.targetMonthly, 15000);
    assert.ok(result.requiredSBC >= 0);
    assert.ok(result.totalInvestment >= 0);
    assert.ok(result.isViable);
});
