import test from 'node:test';
import assert from 'node:assert';
import { PersonaClassifier } from './persona-classifier.ts';

test('PersonaClassifier: Group 5 (Low weeks/No information)', () => {
    // Weeks < 150
    const res = PersonaClassifier.classify(62, true, 80, null);
    assert.strictEqual(res.id, 5);
    assert.strictEqual(res.riskStatus, 'HIGH');
});

test('PersonaClassifier: Group 1 (Age >= 60, Working)', () => {
    const res = PersonaClassifier.classify(63, true, 800, null);
    assert.strictEqual(res.id, 1);
    assert.strictEqual(res.riskStatus, 'LOW');
});

test('PersonaClassifier: Group 2 (Age >= 60, Inactive, Vigente)', () => {
    // Low time since last baja (active vigencia)
    const lastBaja = new Date();
    lastBaja.setFullYear(lastBaja.getFullYear() - 1);
    const res = PersonaClassifier.classify(62, false, 1200, lastBaja.toISOString());
    assert.strictEqual(res.id, 2);
    assert.strictEqual(res.riskStatus, 'MEDIUM');
});

test('PersonaClassifier: Group 2 (Age >= 60, Inactive, Expired)', () => {
    // High time since last baja (expired vigencia)
    const lastBaja = new Date();
    lastBaja.setFullYear(lastBaja.getFullYear() - 15);
    const res = PersonaClassifier.classify(62, false, 600, lastBaja.toISOString());
    assert.strictEqual(res.id, 2);
    assert.strictEqual(res.riskStatus, 'CRITICAL');
});

test('PersonaClassifier: Group 3 (Age < 60, Working)', () => {
    const res = PersonaClassifier.classify(45, true, 1000, null);
    assert.strictEqual(res.id, 3);
    assert.strictEqual(res.riskStatus, 'LOW');
});

test('PersonaClassifier: Group 4 (Age < 60, Inactive, Vigente)', () => {
    const lastBaja = new Date();
    lastBaja.setFullYear(lastBaja.getFullYear() - 1);
    const res = PersonaClassifier.classify(45, false, 800, lastBaja.toISOString());
    assert.strictEqual(res.id, 4);
    assert.strictEqual(res.riskStatus, 'HIGH');
});

test('PersonaClassifier: Group 4 (Age < 60, Inactive, Expired)', () => {
    const lastBaja = new Date();
    lastBaja.setFullYear(lastBaja.getFullYear() - 10);
    const res = PersonaClassifier.classify(45, false, 500, lastBaja.toISOString());
    assert.strictEqual(res.id, 4);
    assert.strictEqual(res.riskStatus, 'CRITICAL');
});
