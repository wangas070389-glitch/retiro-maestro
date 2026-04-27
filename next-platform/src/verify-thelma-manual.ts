import { PensionEngine } from './lib/engine/pension-engine';
const engine = new PensionEngine();

// Case: Thelma Alicia Gallegos Aguiñaga
// Data extracted from context or previous knowledge
const thelmaInput = {
    weeks: 2083, // Unknown exact, estimating from context if not found
    salary_prom: 2450, // Estimating topado or high salary
    age: 60,
    has_wife: false,
    children_count: 0,
    dependent_parents_count: 0,
    // inflation_percentage: 0 
};

// Trying to match a known result if available.
// Since we don't have the exact input in the file, we will run a sensitivity analysis
// or just print the result for the user to confirm.

const result = engine.calculate(thelmaInput);

console.log('--- Thelma Case Verification ---');
console.log('Input:', thelmaInput);
console.log('Result:', result);
console.log('Pension Mensual (Con Decreto):', result.with_decree_111);
