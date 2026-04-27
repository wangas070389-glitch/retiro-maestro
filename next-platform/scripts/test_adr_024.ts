import { PensionEngine } from './src/lib/engine/pension-engine';

const engine = new PensionEngine();

const userAge = 55;
const targetAge = 65;
const baseWeeks = 1000;
const baseSalary = 1000;

// Scenario 1: Employed until 65
const employedProjection = engine.calculateProjection(
    { age: userAge, weeks: baseWeeks, salary_prom: baseSalary, is_ongoing_work: true, has_wife: false, children_count: 0, dependent_parents_count: 0, retirement_age: targetAge },
    targetAge - userAge,
    'inercial'
);

// Scenario 2: Unemployed until 65
const unemployedProjection = engine.calculateProjection(
    { age: userAge, weeks: baseWeeks, salary_prom: baseSalary, is_ongoing_work: false, has_wife: false, children_count: 0, dependent_parents_count: 0, retirement_age: targetAge },
    targetAge - userAge,
    'inercial'
);

const finalEmployed = employedProjection[employedProjection.length - 1];
const finalUnemployed = unemployedProjection[unemployedProjection.length - 1];

console.log("--- ADR-024 UNIVERSAL SIMULATION LOGIC VERIFICATION ---");
console.log("Starting Profile: Age 55, 1000 Weeks, $1,000 MXN Daily Salary");
console.log("\n[SCENARIO 1: ONGOING WORK = TRUE]");
console.log(`Final Weeks at Age 65: ${finalEmployed.weeks} (Expected: 1520)`);
console.log(`Final Salary Average: $${finalEmployed.salaryProm.toFixed(2)} (Expected: $1000.00)`);
console.log(`Final Inercial Pension: $${finalEmployed.pension.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`);

console.log("\n[SCENARIO 2: ONGOING WORK = FALSE (UNEMPLOYED)]");
console.log(`Final Weeks at Age 65: ${finalUnemployed.weeks} (Expected: 1000)`);
console.log(`Final Salary Average: $${finalUnemployed.salaryProm.toFixed(2)} (Expected: $1000.00)`);
console.log(`Final Inercial Pension: $${finalUnemployed.pension.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`);

if (finalEmployed.weeks === 1520 && finalUnemployed.weeks === 1000 && finalEmployed.salaryProm === 1000 && finalUnemployed.salaryProm === 1000) {
    console.log("\n✅ ADR-024 VERIFICATION PASSED: The engine flawlessly isolates the variables.");
} else {
    console.log("\n❌ ADR-024 VERIFICATION FAILED: Math divergence detected.");
}
