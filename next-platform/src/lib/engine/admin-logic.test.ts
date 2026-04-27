import test from 'node:test';
import assert from 'node:assert';
import { AdminLogic } from './admin-logic.ts';

test('AdminLogic.validateDeletion: admin trying to delete themselves', () => {
    const result = AdminLogic.validateDeletion('admin123', 'admin123');
    assert.strictEqual(result.isEligible, false);
    assert.strictEqual(result.reason, 'No puedes eliminar tu propia cuenta administrativa.');
});

test('AdminLogic.validateDeletion: admin trying to delete another user', () => {
    const result = AdminLogic.validateDeletion('user456', 'admin123');
    assert.strictEqual(result.isEligible, true);
    assert.strictEqual(result.reason, undefined);
});
