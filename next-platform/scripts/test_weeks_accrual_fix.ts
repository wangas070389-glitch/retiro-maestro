import { PensionEngine } from '../src/lib/engine/pension-engine';

const engine = new PensionEngine();

const input = {
  age: 60,
  weeks: 1000,
  salary_prom: 1000,
  has_wife: false,
  children_count: 0,
  dependent_parents_count: 0,
  retirement_age: 65,
  is_ongoing_work: false
};

console.log("--- WEEKS ACCRUAL FIX VERIFICATION ---");

// Test calculateProjection
const projection = engine.calculateProjection(input, 5, 'modalidad40');
const lastYear = projection[projection.length - 1];
console.log(`\n[calculateProjection - M40]`);
console.log(`Input: is_ongoing_work = false, strategyMode = modalidad40`);
console.log(`Result weeks at Age 65: ${lastYear.weeks} (Expected: 1260)`);

if (lastYear.weeks === 1260) {
  console.log("✅ calculateProjection passed");
} else {
  console.log("❌ calculateProjection failed");
}

// Test projectInput
const projInercial = PensionEngine.projectInput(input, 'inercial');
console.log(`\n[projectInput - Inercial]`);
console.log(`Input: is_ongoing_work = false, strategyMode = inercial`);
console.log(`Result weeks: ${projInercial.weeks} (Expected: 1000)`);

if (projInercial.weeks === 1000) {
  console.log("✅ projectInput Inercial passed");
} else {
  console.log("❌ projectInput Inercial failed");
}

const projM40 = PensionEngine.projectInput(input, 'modalidad40');
console.log(`\n[projectInput - M40]`);
console.log(`Input: is_ongoing_work = false, strategyMode = modalidad40`);
console.log(`Result weeks: ${projM40.weeks} (Expected: 1260)`);

if (projM40.weeks === 1260) {
  console.log("✅ projectInput M40 passed");
} else {
  console.log("❌ projectInput M40 failed");
}

// Additional test: Inercial without ongoing work in calculateProjection
const projectionInercial = engine.calculateProjection(input, 5, 'inercial');
const lastYearInercial = projectionInercial[projectionInercial.length - 1];
console.log(`\n[calculateProjection - Inercial]`);
console.log(`Input: is_ongoing_work = false, strategyMode = inercial`);
console.log(`Result weeks at Age 65: ${lastYearInercial.weeks} (Expected: 1000)`);

if (lastYearInercial.weeks === 1000) {
  console.log("✅ calculateProjection Inercial passed");
} else {
  console.log("❌ calculateProjection Inercial failed");
}
