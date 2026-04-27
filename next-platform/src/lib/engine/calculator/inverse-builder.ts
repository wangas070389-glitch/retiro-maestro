import { PensionEngine, PensionInput } from '../pension-engine';
import anchors from '../../data/legal-anchors.json';

interface InverseProfile {
    weeksCotized: number;
    currentAge: number;
    hasSpouse: boolean;
    children: number;
}

export interface InverseResult {
    requiredDailySalary: number;
    requiredMonthlySalary: number;
    monthlyCost: number;
    totalInvestment: number;
    realPension: number;
    isPossible: boolean;
    limitMessage: string;
    finishAge: number;
    timeYears: number;
}

export class InverseBuilder {
    private engine: PensionEngine;

    constructor() {
        this.engine = new PensionEngine();
    }

    /**
     * Calculates the required salary and time to reach a target pension.
     * Logic ported and modularized from prototype_retiromaestro73.txt
     */
    calculate(targetPension: number, years: number, profile: InverseProfile): InverseResult {
        const UMA = anchors.uma_2026;
        const SALARIO_TOPADO_DIARIO = UMA * 25;

        const futureWeeks = years * 52;
        const totalWeeks = Number(profile.weeksCotized) + futureWeeks;
        const excessWeeks = Math.max(0, totalWeeks - 500);
        const increments = Math.floor(excessWeeks / 52);

        const projectedRetirementAge = Math.max(60, Number(profile.currentAge) + years);

        // Find age factor from anchors
        const ageKey = String(Math.min(65, Math.floor(projectedRetirementAge)));
        const ageFactor = (anchors.age_factors as Record<string, number>)[ageKey] || 1.0;

        // Family factors
        const asignacionEsposa = profile.hasSpouse ? 0.15 : 0.0;
        const asignacionHijos = (profile.children || 0) * 0.10;
        const asignacionSoledad = (!profile.hasSpouse && (profile.children || 0) === 0) ? 0.15 : 0.0;
        const famFactor = 1 + asignacionEsposa + asignacionHijos + asignacionSoledad;

        const foxFactor = anchors.decree_factor;

        // The factorSalario constant represents the simplified multiplier for daily salary
        // logic from prototype: (0.13 + (0.0245 * increments)) * 30.4 * ageFactor * famFactor * foxFactor
        const factorSalario = (0.13 + (0.0245 * increments)) * 30.4 * ageFactor * famFactor * foxFactor;

        let requiredDailySalary = targetPension / factorSalario;
        let isPossible = true;
        let limitMessage = "";

        if (requiredDailySalary > SALARIO_TOPADO_DIARIO) {
            requiredDailySalary = SALARIO_TOPADO_DIARIO;
            isPossible = false;
            limitMessage = "El salario requerido supera el tope legal de 25 UMAs. Se ajustó al máximo posible.";
        }

        // Graduated cost estimate (simplified for direct tool use)
        // From prototype: (requiredDailySalary * 30.4) * 0.125
        const monthlyCost = (requiredDailySalary * 30.4) * 0.125;
        const totalInvestment = monthlyCost * 12 * years;

        const realPension = this.engine.calculate({
            weeks: totalWeeks,
            salary_prom: requiredDailySalary,
            age: projectedRetirementAge,
            has_wife: profile.hasSpouse,
            children_count: profile.children || 0,
            dependent_parents_count: 0
        }).with_decree_111;

        return {
            requiredDailySalary,
            requiredMonthlySalary: requiredDailySalary * 30.4,
            monthlyCost,
            totalInvestment,
            realPension,
            isPossible,
            limitMessage,
            finishAge: projectedRetirementAge,
            timeYears: years
        };
    }
}
