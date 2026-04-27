import { PensionEngine, PensionInput, PensionResult } from './pension-engine';
import legalData from '../data/legal-anchors.json';

export type ScenarioType = 'BASE' | 'M40_1Y' | 'M40_2Y' | 'M40_3Y' | 'M40_5Y';

export interface ScenarioResult {
    name: string;
    type: ScenarioType;
    input: PensionInput;
    result: PensionResult;
    delta?: {
        investmentTotal: number;
        monthlyIncrement: number;
        roiMonths: number;
        monthlyCost: number;
    }
}

// Scenario definitions: [type, label, weeks]
const SCENARIO_DEFINITIONS: Array<{ type: ScenarioType; name: string; weeks: number }> = [
    { type: 'M40_1Y', name: 'Modalidad 40 (1 Año)',  weeks: 52 },
    { type: 'M40_2Y', name: 'Modalidad 40 (2 Años)', weeks: 104 },
    { type: 'M40_3Y', name: 'Óptimo M40 (3 Años)',   weeks: 156 },
    { type: 'M40_5Y', name: 'Topado Máximo (5 Años)', weeks: 250 },
];

export class M40MultiScenarioEngine {
    private engine: PensionEngine;
    private m40Percentage = 0.12256; // 12.256% of registered salary in 2024+

    constructor() {
        this.engine = new PensionEngine();
    }

    private computeM40Investment(weeksToTarget: number, anchorSalary: number): { total: number; monthly: number } {
        const topadoDaily = anchorSalary * 25;
        const topadoMonthly = topadoDaily * 30.4;
        const monthlyM40Cost = topadoMonthly * this.m40Percentage;
        
        const years = weeksToTarget / 52;
        const months = years * 12;
        return { 
            total: monthlyM40Cost * months,
            monthly: monthlyM40Cost
        };
    }

    public runParallel(baseInput: PensionInput): ScenarioResult[] {
        const effectiveAnchor = baseInput.anchor_salary || legalData.uma_2026;
        const topadoDaily = effectiveAnchor * 25;

        // 1. BASE SCENARIO (INERCIAL — no investment)
        const baseResult = this.engine.calculate(baseInput);
        const scenarios: ScenarioResult[] = [{
            name: "Inercial (Sin Inversión)",
            type: 'BASE',
            input: { ...baseInput },
            result: baseResult,
            delta: {
                investmentTotal: 0,
                monthlyIncrement: 0,
                roiMonths: 0,
                monthlyCost: 0
            }
        }];

        // 2. GENERATE ALL M40 SCENARIOS
        for (const def of SCENARIO_DEFINITIONS) {
            const scenarioInput: PensionInput = {
                ...baseInput,
                weeks: baseInput.weeks + def.weeks,
                age: Math.min(65, Math.ceil(baseInput.age + (def.weeks / 52))),
                // Weighted average salary over last 250 weeks
                salary_prom: def.weeks >= 250 
                    ? topadoDaily  // Full 250 weeks at max
                    : ((baseInput.salary_prom * (250 - def.weeks)) + (topadoDaily * def.weeks)) / 250
            };

            const result = this.engine.calculate(scenarioInput);
            const investment = this.computeM40Investment(def.weeks, effectiveAnchor);
            const monthlyIncrement = result.net_pension - baseResult.net_pension;

            scenarios.push({
                name: def.name,
                type: def.type,
                input: scenarioInput,
                result,
                delta: {
                    investmentTotal: investment.total,
                    monthlyIncrement,
                    roiMonths: monthlyIncrement > 0 ? (investment.total / monthlyIncrement) : Infinity,
                    monthlyCost: investment.monthly
                }
            });
        }

        // 3. Mark the optimal strategy (best ROI)
        const investmentScenarios = scenarios.filter(s => s.type !== 'BASE');
        if (investmentScenarios.length > 0) {
            // Find best ROI — lowest payback months (excluding Infinity)
            const validScenarios = investmentScenarios.filter(s => s.delta && s.delta.roiMonths < Infinity);
            if (validScenarios.length > 0) {
                // Best ROI = highest monthly increment relative to investment
                const optimal = validScenarios.reduce((prev, current) => {
                    const prevROI = prev.delta!.monthlyIncrement * 12 / prev.delta!.investmentTotal;
                    const currROI = current.delta!.monthlyIncrement * 12 / current.delta!.investmentTotal;
                    return currROI > prevROI ? current : prev;
                });
                // Tag it — we reuse the type field as a marker
                (optimal as any).isOptimal = true;
            }
        }

        return scenarios;
    }
}
