import { PensionEngine, PensionInput, PensionResult } from '../pension-engine';

export interface StressTestResult {
    totalTests: number;
    passed: number;
    failed: number;
    monotonicityViolations: any[];
    boundaryViolations: any[];
}

export class StressTester {
    private engine: PensionEngine;

    constructor() {
        this.engine = new PensionEngine();
    }

    /**
     * Runs an automated suit of 1,000 property-based tests.
     * Verifies Monotonicity and Boundary Invariants (MATH-008).
     */
    async runSuite(sampleSize: number = 1000): Promise<StressTestResult> {
        let passed = 0;
        let failed = 0;
        const monotonicityViolations: any[] = [];
        const boundaryViolations: any[] = [];

        for (let i = 0; i < sampleSize; i++) {
            const input = this.generateRandomInput();

            try {
                const result = this.engine.calculate(input);

                // 1. Check Boundary Invariants
                if (result.with_decree_111 < 0 || isNaN(result.with_decree_111)) {
                    boundaryViolations.push({ input, error: 'Negative or NaN Pension' });
                    failed++;
                    continue;
                }

                // 2. Check Monotonicity Invariant (Weeks)
                const inputMoreWeeks = { ...input, weeks: input.weeks + 52 };
                const resultMoreWeeks = this.engine.calculate(inputMoreWeeks);
                if (resultMoreWeeks.with_decree_111 < result.with_decree_111) {
                    monotonicityViolations.push({ input, error: 'Decreasing pension for more weeks' });
                    failed++;
                    continue;
                }

                // 3. Check Monotonicity Invariant (Salary)
                const inputMoreSalary = { ...input, salary_prom: input.salary_prom * 1.1 };
                const resultMoreSalary = this.engine.calculate(inputMoreSalary);
                if (resultMoreSalary.with_decree_111 < result.with_decree_111) {
                    monotonicityViolations.push({ input, error: 'Decreasing pension for more salary' });
                    failed++;
                    continue;
                }

                passed++;
            } catch (e) {
                failed++;
                boundaryViolations.push({ input, error: 'Engine Crash' });
            }
        }

        return {
            totalTests: sampleSize,
            passed,
            failed,
            monotonicityViolations,
            boundaryViolations
        };
    }

    private generateRandomInput(): PensionInput {
        // Bias towards boundary conditions as per MATH-008
        const useBoundary = Math.random() > 0.7;

        if (useBoundary) {
            return {
                weeks: [500, 2750, 52, 10].sort(() => Math.random() - 0.5)[0],
                salary_prom: [207.44, 2593.5, 50, 10000].sort(() => Math.random() - 0.5)[0],
                age: [60, 65, 14, 100].sort(() => Math.random() - 0.5)[0],
                has_wife: Math.random() > 0.5,
                children_count: Math.floor(Math.random() * 5),
                dependent_parents_count: Math.floor(Math.random() * 2)
            };
        }

        return {
            weeks: Math.floor(Math.random() * 3000),
            salary_prom: 200 + Math.random() * 2500,
            age: 60 + Math.random() * 25,
            has_wife: Math.random() > 0.5,
            children_count: Math.floor(Math.random() * 5),
            dependent_parents_count: Math.floor(Math.random() * 2)
        };
    }
}
