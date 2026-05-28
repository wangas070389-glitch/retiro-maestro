import { PensionEngine } from './pension-engine.ts';
import type { PensionInput } from './pension-engine.ts';
import legalData from '../data/legal-anchors.json' with { type: 'json' };
import { getM40RateForYear } from './m40-calculator.ts';

export interface ExecutiveRecommendation {
    strategyName: string;
    investmentMonths: number;
    totalInvestment: number;
    monthlyPension: number;
    pensionGain: number;
    paybackMonths: number;
    roiPercentage: number;
    costOfInaction: number;
    isOptimal: boolean;
}

export class ROIOptimizer {
    private engine: PensionEngine;

    constructor() {
        this.engine = new PensionEngine();
    }

    /**
     * Scans multiple investment windows (12-60 months) to find the mathematically 
     * optimal point of entry for Modalidad 40.
     */
    public optimize(input: PensionInput, originalAge?: number): ExecutiveRecommendation[] {
        const recommendations: ExecutiveRecommendation[] = [];
        
        // 1. Base Scenario (Inercial - $0 Investment)
        const inercialResult = this.engine.calculate({
            ...input,
            // Project age/weeks to retirement age even if inercial
            ...PensionEngine.projectInput(input)
        });

        // 2. Test standard investment windows (1 to 5 years)
        const windows = [12, 24, 36, 48, 60];
        const uma25 = (input.anchor_salary || legalData.uma_2026) * 25;
        
        const currentYear = new Date().getFullYear();
        const startAge = originalAge ?? (input.age - 5); // fallback if not provided: assume 5 years of investment
        const retirementYear = currentYear + Math.max(0, input.age - startAge);

        for (const months of windows) {
            const yearsOfInvestment = months / 12;
            let totalInvestment = 0;
            // Sum the investment cost for each year in the investment window
            // We assume the investment happens right before retirement
            for (let y = 0; y < yearsOfInvestment; y++) {
                const year = retirementYear - yearsOfInvestment + y;
                const rate = getM40RateForYear(year);
                totalInvestment += uma25 * rate * 30.416 * 12;
            }
            
            // Calculate projected pension with this investment window
            // We assume the investment happens right before retirement
            const investWeeks = Math.floor((months / 12) * 52);
            const histWeeks = 250 - Math.min(250, investWeeks);
            
            const projectedSalaryProm = ((uma25 * Math.min(250, investWeeks)) + (input.salary_prom * histWeeks)) / 250;
            
            const projection = PensionEngine.projectInput(input, 'modalidad40');
            
            const result = this.engine.calculate({
                ...input,
                age: projection.age,
                weeks: projection.weeks,
                salary_prom: projectedSalaryProm
            });

            const pensionGain = result.net_pension - inercialResult.net_pension;
            const paybackMonths = pensionGain > 0 ? totalInvestment / pensionGain : Infinity;
            const roiPercentage = totalInvestment > 0 ? (pensionGain * 12 / totalInvestment) * 100 : 0;

            recommendations.push({
                strategyName: `${months / 12} Años Topado`,
                investmentMonths: months,
                totalInvestment,
                monthlyPension: result.net_pension,
                pensionGain,
                paybackMonths,
                roiPercentage,
                costOfInaction: pensionGain, // Simplifying: every month delayed is a month of gain lost
                isOptimal: false // To be determined below
            });
        }

        // 3. Mark the Optimal Strategy (Best ROI usually at 60 months for Ley 73, but depends on entry age)
        const optimal = recommendations.reduce((prev, current) => 
            (current.roiPercentage > prev.roiPercentage) ? current : prev
        );
        optimal.isOptimal = true;

        return recommendations;
    }
}
