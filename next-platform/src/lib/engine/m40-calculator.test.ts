import test from 'node:test';
import assert from 'node:assert';
import { getM40RateForYear } from './m40-calculator.ts';

test('getM40RateForYear: years <= 2022', () => {
    assert.strictEqual(getM40RateForYear(2020), 0.10075);
    assert.strictEqual(getM40RateForYear(2022), 0.10075);
});

test('getM40RateForYear: progressive years 2023-2029', () => {
    assert.strictEqual(getM40RateForYear(2023), 0.11166);
    assert.strictEqual(getM40RateForYear(2024), 0.12256);
    assert.strictEqual(getM40RateForYear(2025), 0.13347);
    assert.strictEqual(getM40RateForYear(2026), 0.14438);
    assert.strictEqual(getM40RateForYear(2027), 0.15528);
    assert.strictEqual(getM40RateForYear(2028), 0.16619);
    assert.strictEqual(getM40RateForYear(2029), 0.17709);
});

test('getM40RateForYear: years >= 2030 (plateau)', () => {
    assert.strictEqual(getM40RateForYear(2030), 0.18800);
    assert.strictEqual(getM40RateForYear(2040), 0.18800);
});
