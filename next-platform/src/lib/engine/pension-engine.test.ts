import test from 'node:test';
import assert from 'node:assert';
import { PensionEngine } from './pension-engine.ts';
import type { PensionInput } from './pension-engine.ts';

test('PensionEngine: base calculation with basic inputs', () => {
    const engine = new PensionEngine();
    const input: PensionInput = {
        weeks: 1000,
        salary_prom: 1000,
        age: 65,
        has_wife: true,
        children_count: 0,
        dependent_parents_count: 0,
        anchor_salary: 100 // UMA override
    };

    const result = engine.calculate(input);

    // Capping check: salary_prom (1000) <= 25 * UMA (2500)
    assert.strictEqual(result.capped_salary, 1000);
    // Age factor at 65 should be 1.0 (100%)
    assert.strictEqual(result.age_penalty, 100);
    // Wife allowance should be 15%
    assert.strictEqual(result.allowances.wife, 0.15);
    // Net pension should be computed and non-zero
    assert.ok(result.net_pension > 0);
});

test('PensionEngine: cap salary at 25 UMAs', () => {
    const engine = new PensionEngine();
    const input: PensionInput = {
        weeks: 1200,
        salary_prom: 5000, // Higher than 25 * UMA (25 * 100 = 2500)
        age: 60,
        has_wife: false,
        children_count: 1,
        dependent_parents_count: 0,
        anchor_salary: 100
    };

    const result = engine.calculate(input);

    // Should cap at 2500 (25 * 100 UMA)
    assert.strictEqual(result.capped_salary, 2500);
    // Age factor at 60 should be 75%
    assert.strictEqual(result.age_penalty, 75);
    // Children allowance should be 10%
    assert.strictEqual(result.allowances.children, 0.10);
    assert.strictEqual(result.allowances.wife, 0);
});

test('PensionEngine: solitude allowance when no wife/children', () => {
    const engine = new PensionEngine();
    const input: PensionInput = {
        weeks: 800,
        salary_prom: 500,
        age: 62,
        has_wife: false,
        children_count: 0,
        dependent_parents_count: 0,
        anchor_salary: 100
    };

    const result = engine.calculate(input);

    // Solitude allowance should be 15%
    assert.strictEqual(result.allowances.solitude, 0.15);
    assert.strictEqual(result.allowances.wife, 0);
    assert.strictEqual(result.allowances.children, 0);
});

test('PensionEngine: Ley 73 surplus semester rule rounding', () => {
    const engine = new PensionEngine();
    
    // Test case 1: Age 60.4 (fraction < 0.5) should round down to 60 (75% age factor)
    const resultDown = engine.calculate({
        weeks: 1000,
        salary_prom: 1000,
        age: 60.4,
        has_wife: true,
        children_count: 0,
        dependent_parents_count: 0,
        anchor_salary: 100
    });
    assert.strictEqual(resultDown.age_penalty, 75);

    // Test case 2: Age 60.5 (fraction == 0.5) should round up to 61 (80% age factor)
    const resultUpHalf = engine.calculate({
        weeks: 1000,
        salary_prom: 1000,
        age: 60.5,
        has_wife: true,
        children_count: 0,
        dependent_parents_count: 0,
        anchor_salary: 100
    });
    assert.strictEqual(resultUpHalf.age_penalty, 80);

    // Test case 3: Age 60.6 (fraction > 0.5) should round up to 61 (80% age factor)
    const resultUpMore = engine.calculate({
        weeks: 1000,
        salary_prom: 1000,
        age: 60.6,
        has_wife: true,
        children_count: 0,
        dependent_parents_count: 0,
        anchor_salary: 100
    });
    assert.strictEqual(resultUpMore.age_penalty, 80);
});

test('PensionEngine: weeks < 500 eligibility gate returns zeroed out pension', () => {
    const engine = new PensionEngine();
    const input: PensionInput = {
        weeks: 100, // Below 500
        salary_prom: 1000,
        age: 65,
        has_wife: true,
        children_count: 0,
        dependent_parents_count: 0,
        anchor_salary: 100
    };

    const result = engine.calculate(input);

    assert.strictEqual(result.net_pension, 0);
    assert.strictEqual(result.with_decree_111, 0);
    assert.strictEqual(result.total_monthly, 0);
    assert.strictEqual(result.daily_base_cuantia, 0);
});

