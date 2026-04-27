import anchors from '../../data/legal-anchors.json';
import { PensionEngine, PensionInput } from '../pension-engine';

export interface ROIMetrics {
    total_investment: number;
    breakeven_months: number;
    lifetime_wealth_delta: number;
    monthly_pension_delta: number;
    crossover_age: number;
}

export class ROIComputer {
    private engine: PensionEngine;

    constructor() {
        this.engine = new PensionEngine();
    }

    /**
     * Calculates the cost of Modalidad 40 for a given input.
     * Accounts for the 2020 Reform graduated rates.
     */
    static calculateM40Cost(weeksToInvest: number, salary: number): number {
        const startYear = 2023; // Base simulation year
        const months = Math.floor(weeksToInvest / 4.345);
        let totalCost = 0;

        // Graduated rates (Simplified map for implementation)
        const rates: Record<number, number> = {
            2023: 0.11166,
            2024: 0.12256,
            2025: 0.13347,
            2026: 0.14438,
            2027: 0.15528,
            2028: 0.16619,
            2029: 0.17709,
            2030: 0.18800
        };

        for (let i = 0; i < months; i++) {
            const currentYear = startYear + Math.floor(i / 12);
            const rate = rates[Math.min(currentYear, 2030)];
            totalCost += salary * 30.416 * rate;
        }

        return totalCost;
    }

    /**
     * Performs the full ROI analysis.
     */
    async analyze(inputA: PensionInput, inputB: PensionInput): Promise<ROIMetrics> {
        const resA = this.engine.calculate(inputA);
        const resB = this.engine.calculate(inputB);

        const pensionDelta = resB.with_decree_111 - resA.with_decree_111;

        // Assume inputB has the investment
        // For simplicity, we detect weeks delta as investment period
        const weeksDelta = Math.max(0, inputB.weeks - inputA.weeks);
        const totalInvestment = ROIComputer.calculateM40Cost(weeksDelta, inputB.salary_prom);

        const breakevenMonths = pensionDelta > 0 ? totalInvestment / pensionDelta : Infinity;
        const yearsRemaining = 85 - inputB.age; // Actuarial cap at 85
        const lifetimeWealthDelta = (pensionDelta * 12 * yearsRemaining) - totalInvestment;

        return {
            total_investment: totalInvestment,
            breakeven_months: Math.ceil(breakevenMonths),
            lifetime_wealth_delta: lifetimeWealthDelta,
            monthly_pension_delta: pensionDelta,
            crossover_age: inputB.age + (breakevenMonths / 12)
        };
    }
}
