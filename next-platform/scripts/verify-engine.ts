import { PensionEngine } from '../src/lib/engine/pension-engine';

// Benchmark from PDF Page 140 (Example 1)
// Results in $1,777.10 monthly according to the book
const engine = new PensionEngine();

const input = {
    weeks: 567,
    salary_prom: 1.2 * 54.80, // 1.2 x SMDF of $54.80
    age: 65,
    has_wife: false,
    children_count: 0,
    dependent_parents_count: 0,
    anchor_salary: 54.80, // Correct historical anchor
    days_per_month: 30   // Matching the Reference Manual multiplication factor
};

console.log("Running Benchmark: PDF Example 1 (Page 140)");
console.log("Input:", input);

const result = engine.calculate(input);

console.log("--- RESULT ---");
console.log("Daily Base Cuantia:", result.daily_base_cuantia);
console.log("Excess Years:", result.excess_years);
console.log("Total Monthly (with allowances):", result.total_monthly.toFixed(2));
console.log("Total Monthly (with Decree 1.11):", result.with_decree_111.toFixed(2));

if (Math.abs(result.with_decree_111 - 1777.10) < 1.0) {
    console.log("✅ VERIFICATION SUCCESS: Results match the Reference Manual.");
} else {
    console.log("❌ VERIFICATION FAILURE: Expected ~$1777.10, got", result.with_decree_111.toFixed(2));
}

console.log("\n--- RED TEAM AUDIT TESTS ---");

// Test CASE 2: Illegal Salary (Greater than 25 UMAs)
const uma = 117.31; // 2026 UMA
const illegalSalary = 10000; // $10,000 MXN daily (Illegal)
const cappedSalary = uma * 25; // ~$2,941 (Legal Limit)

const redTeamInput = {
    ...input,
    salary_prom: illegalSalary,
    anchor_salary: uma
};

console.log("Test 2: Salary Cap Enforcement ($10,000 input vs 25 UMA limit)");
const redTeamResult = engine.calculate(redTeamInput);
const legalLimitN = cappedSalary / uma; // Should be exactly 25

if (redTeamResult.daily_base_cuantia <= (cappedSalary * 0.13) + 1) { // 0.13 is PCB for n=25
    console.log("✅ SUCCESS: Salary was correctly capped at 25 UMAs.");
} else {
    console.log("❌ FAILURE: Salary was NOT capped. Daily Base:", redTeamResult.daily_base_cuantia);
}

// Test CASE 3: Impossible Weeks (10,000 weeks)
const impossibleWeeksInput = {
    ...input,
    weeks: 10000
};

console.log("Test 3: Physical Boundary Enforcement (10,000 weeks input)");
const impossibleWeeksResult = engine.calculate(impossibleWeeksInput);
if (impossibleWeeksResult.excess_years <= 43) { // 2700 - 500 = 2200 / 52 ~= 42.3
    console.log("✅ SUCCESS: Weeks were correctly clamped to physical maximum.");
} else {
    console.log("❌ FAILURE: Weeks were NOT clamped. Excess Years:", impossibleWeeksResult.excess_years);
}
