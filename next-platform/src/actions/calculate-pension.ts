'use server';

import { z } from 'zod';
import { PensionEngine, PensionInput } from '../lib/engine/pension-engine';
import { VigenciaGuard } from '../lib/engine/vigencia-guard';
import { PersonaClassifier, PersonaGroupInfo } from '../lib/engine/persona-classifier';
import { db } from '../lib/db';
import { auth } from '../auth';
import { assertTrialAccess } from '../lib/trial-guard';
import { ROIOptimizer, ExecutiveRecommendation } from '../lib/engine/roi-optimizer';
import { getPlan, Role, Tier } from '../lib/config/pricing';
import { checkUserAccess } from '../lib/auth/access-control';
import { OracleService } from '../lib/engine/oracle/oracle-service';
import { InverseDesigner } from '../lib/engine/inverse-designer';
import { TaxEngine } from '../lib/engine/fiscal/tax-engine';
import { getM40RateForYear } from '../lib/engine/m40-calculator';

const PensionSchema = z.object({
    weeks: z.number().min(0).max(3000, "Weeks out of bounds"),
    salary_prom: z.number().min(0, "Salary cannot be negative"),
    age: z.number().min(18).max(100),
    retirement_age: z.number().min(60).max(100).optional(),
    has_wife: z.boolean().default(false),
    children_count: z.number().min(0).max(10).default(0),
    dependent_parents_count: z.number().min(0).max(2).default(0),
    anchor_salary: z.number().optional(),
    inflation_percentage: z.number().min(0).max(1000).optional(),
    is_ongoing_work: z.boolean().optional(),
    last_termination_date: z.string().optional()
}).refine(data => {
    if (data.is_ongoing_work === false || !data.is_ongoing_work) {
        return !!data.last_termination_date;
    }
    return true;
}, {
    message: "La fecha de baja es obligatoria si no se encuentra cotizando actualmente.",
    path: ["last_termination_date"]
});

export type ValidationResult =
    | { 
        success: true; 
        data: ReturnType<PensionEngine['calculate']>; 
        vigenciaAlert?: string;
        recommendations?: ExecutiveRecommendation[]; 
        personaGroup?: PersonaGroupInfo;
      }
    | { success: false; error: string; needsRecovery?: boolean };

export async function calculatePensionAction(formData: FormData | PensionInput): Promise<ValidationResult> {
    try {
        const session = await auth();
        if (!session) return { success: false, error: "Unauthorized" };

        const userId = session.user?.id;
        const userRole = (session.user as any).role as Role || 'USER';
        const userTier = (session.user as any).tier as Tier || 'FREE';

        let userBirthDate: any = null;
        if (userId) {
            const user = await db.user.findUnique({
                where: { id: userId },
                select: { role: true, tier: true, createdAt: true, trialSimulationsUsed: true, birthDate: true } as any,
            }) as any;
            if (user) {
                assertTrialAccess(user);
                userBirthDate = user.birthDate;
            }
        }

        let rawInput: any = formData;
        if (formData instanceof FormData) {
            rawInput = {
                weeks: Number(formData.get('weeks')),
                salary_prom: Number(formData.get('salary_prom')),
                age: formData.get('age') ? Number(formData.get('age')) : undefined,
                retirement_age: formData.get('retirement_age') ? Number(formData.get('retirement_age')) : undefined,
                has_wife: formData.get('has_wife') === 'true' || formData.get('has_wife') === 'on',
                children_count: Number(formData.get('children_count') || 0),
                dependent_parents_count: Number(formData.get('dependent_parents_count') || 0),
                inflation_percentage: Number(formData.get('inflation_percentage') || 0),
                is_ongoing_work: formData.get('is_ongoing_work') === 'true' || formData.get('is_ongoing_work') === 'on',
                last_termination_date: formData.get('last_termination_date') ? String(formData.get('last_termination_date')) : undefined
            };
        } else if (rawInput && typeof rawInput === 'object') {
            rawInput = { ...rawInput };
        }

        if (userBirthDate && rawInput && typeof rawInput === 'object' && (!rawInput.age || isNaN(Number(rawInput.age)))) {
            const exactAge = (new Date().getTime() - new Date(userBirthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
            rawInput.age = exactAge;
        }

        const validatedFields = PensionSchema.safeParse(rawInput);
        if (!validatedFields.success) return { success: false, error: validatedFields.error.message };

        const projection = PensionEngine.projectInput({
            age: validatedFields.data.age,
            weeks: validatedFields.data.weeks,
            retirement_age: validatedFields.data.retirement_age,
            is_ongoing_work: validatedFields.data.is_ongoing_work
        });

        const anchors = await OracleService.fetchLatestAnchors();
        const calcInput: PensionInput = {
            ...validatedFields.data,
            age: projection.age,
            weeks: projection.weeks,
            anchor_salary: validatedFields.data.anchor_salary || anchors.uma,
            anchor_smdf: anchors.smdf
        };

        const engine = new PensionEngine();

        let vigenciaAlert: string | undefined = undefined;
        if (validatedFields.data.last_termination_date) {
            const vGuard = VigenciaGuard.checkRights(validatedFields.data.weeks, validatedFields.data.last_termination_date);
            if (!vGuard.hasRights) {
                return { success: false, error: vGuard.message, needsRecovery: true };
            }
            vigenciaAlert = vGuard.warning;
        }

        const result = engine.calculate(calcInput as PensionInput);

        const personaGroup = PersonaClassifier.classify(
            validatedFields.data.age,
            validatedFields.data.is_ongoing_work !== false,
            validatedFields.data.weeks,
            validatedFields.data.last_termination_date
        );

        // Feature Gated Recommendations (Phase 3 Refactor)
        let recommendations: ExecutiveRecommendation[] | undefined = undefined;
        if (checkUserAccess(userRole, userTier, 'roiOptimizer')) {
            const optimizer = new ROIOptimizer();
            recommendations = optimizer.optimize(calcInput as PensionInput, validatedFields.data.age);
        }

        return { success: true, data: result, vigenciaAlert, recommendations, personaGroup };

    } catch (error) {
        console.error("Calculation Error:", error);
        return { success: false, error: "Server Error during calculation." };
    }
}

export async function calculateProjectionAction(
    input: PensionInput,
    strategyMode: 'modalidad40' | 'inercial',
    monthlyInvestment: number,
    targetDailySalary?: number,
    targetDailyHigh?: number,
    splitYear?: number
) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const anchors = await OracleService.fetchLatestAnchors();
    const inputWithAnchor = {
        ...input,
        anchor_salary: input.anchor_salary || anchors.uma,
        anchor_smdf: input.anchor_smdf || anchors.smdf
    };

    const engine = new PensionEngine();
    const projection = engine.calculateProjection(
        inputWithAnchor,
        null,
        strategyMode,
        monthlyInvestment,
        targetDailySalary,
        targetDailyHigh,
        splitYear
    );

    const basePensionData = (() => {
        const yearsLeft = Math.max(0, (inputWithAnchor.retirement_age || 65) - inputWithAnchor.age);
        const inercialWeeks = inputWithAnchor.weeks + (inputWithAnchor.is_ongoing_work !== false ? yearsLeft * 52 : 0);
        const inercialResult = engine.calculate({
            ...inputWithAnchor,
            weeks: inercialWeeks,
            age: inputWithAnchor.retirement_age || 65
        });
        return TaxEngine.calculateISR(inercialResult.with_decree_111).netPension;
    })();

    const yearsLeft = Math.max(0, (inputWithAnchor.retirement_age || 65) - inputWithAnchor.age);
    const baselineProjection = engine.calculateProjection(
        inputWithAnchor,
        yearsLeft,
        'inercial',
        0
    );

    return {
        projection,
        basePensionData,
        baselineProjection
    };
}

export async function calculateStrategiesAction(input: PensionInput) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const anchors = await OracleService.fetchLatestAnchors();
    const inputWithAnchor = {
        ...input,
        anchor_salary: input.anchor_salary || anchors.uma,
        anchor_smdf: input.anchor_smdf || anchors.smdf
    };

    const engine = new PensionEngine();
    const yearsLeft = Math.max(0, (inputWithAnchor.retirement_age || 65) - inputWithAnchor.age);
    const monthsLeft = yearsLeft * 12;

    // Baseline (Inercial)
    const inercialWeeks = inputWithAnchor.weeks + (inputWithAnchor.is_ongoing_work !== false ? yearsLeft * 52 : 0);
    const inercialResult = engine.calculate({
        ...inputWithAnchor,
        weeks: inercialWeeks,
        age: inputWithAnchor.retirement_age || 65
    });
    const baseNet = TaxEngine.calculateISR(inercialResult.with_decree_111).netPension;

    if (yearsLeft === 0) return { baseNet, strategies: [] };

    const UMA_MONTHLY = anchors.uma * 30.416;
    const TOP_SALARY = UMA_MONTHLY * 25;
    const LOW_SALARY = Math.max(UMA_MONTHLY * 1.5, inputWithAnchor.salary_prom * 30.416);

    let bestEfficiency = 0;
    let optimalStrategyData: any = null;
    let absoluteMaxPension = 0;
    let absoluteMaxStrategyData: any = null;
    const viableStrategies: any[] = [];

    const calculateInvestment = (monthlySalary: number, years: number, startYearOffset: number = 0) => {
        let total = 0;
        for (let i = 0; i < years; i++) {
            const currentYear = new Date().getFullYear();
            const year = currentYear + Math.max(0, (inputWithAnchor.retirement_age || 65) - inputWithAnchor.age) - years + i + startYearOffset;
            const rate = getM40RateForYear(year);
            const inflationFactor = Math.pow(1.04, i + startYearOffset);
            const adjustedSalary = monthlySalary * inflationFactor;
            const yearlyCost = adjustedSalary * rate * 12;
            total += yearlyCost;
        }
        return total;
    };

    for (let targetYears = 1; targetYears <= yearsLeft; targetYears++) {
        const lowYears = Math.max(0, yearsLeft - targetYears);
        const highYears = targetYears;

        const highWeeks = Math.min(250, highYears * 52);
        const remainingRequiredWeeks = 250 - highWeeks;
        const lowWeeks = Math.min(remainingRequiredWeeks, lowYears * 52);
        const historicalWeeks = Math.max(0, remainingRequiredWeeks - lowWeeks);

        const topDaily = TOP_SALARY / 30.416;
        const lowDaily = LOW_SALARY / 30.416;

        const projectedBlendedSalary = ((topDaily * highWeeks) + (lowDaily * lowWeeks) + (inputWithAnchor.salary_prom * historicalWeeks)) / 250;
        const projectedWeeks = inputWithAnchor.weeks + (yearsLeft * 52);

        const result = engine.calculate({
            ...inputWithAnchor,
            weeks: projectedWeeks,
            salary_prom: projectedBlendedSalary,
            age: inputWithAnchor.retirement_age || 65
        });

        const netResult = TaxEngine.calculateISR(result.with_decree_111).netPension;

        const invLowTotal = calculateInvestment(LOW_SALARY, lowYears, 0);
        const invHighTotal = calculateInvestment(TOP_SALARY, highYears, lowYears);
        const totalInv = invLowTotal + invHighTotal;

        const deltaPension = netResult - baseNet;
        const efficiencyRatio = totalInv > 0 ? deltaPension / totalInv : 0;
        const roiMonths = deltaPension > 0 ? (totalInv / deltaPension) : 999;

        const iterationData = {
            highYears,
            lowYears,
            netPension: netResult,
            totalInvestment: totalInv,
            avgMonthlyInvestment: monthsLeft > 0 ? totalInv / monthsLeft : 0,
            targetSalary: projectedBlendedSalary,
            rawTargetDaily: topDaily,
            delta: deltaPension,
            roiMonths: roiMonths,
        };

        if (netResult > absoluteMaxPension) {
            absoluteMaxPension = netResult;
            absoluteMaxStrategyData = iterationData;
        }

        const penalizedEfficiency = roiMonths > 60 ? efficiencyRatio * (60 / roiMonths) : efficiencyRatio;

        if (penalizedEfficiency > bestEfficiency) {
            bestEfficiency = penalizedEfficiency;
            optimalStrategyData = iterationData;
        }

        if (deltaPension > 0) {
            viableStrategies.push(iterationData);
        }
    }

    let conservativeStrategyData: any = null;
    if (viableStrategies.length > 0) {
        viableStrategies.sort((a, b) => a.totalInvestment - b.totalInvestment);
        conservativeStrategyData = viableStrategies[0];
    }

    const buildCard = (id: string, name: string, description: string, data: any, color: 'indigo' | 'amber' | 'emerald') => ({
        id,
        name,
        description,
        ...data,
        color,
        percentageIncrease: ((data.netPension - baseNet) / baseNet) * 100,
        lifetimeImpact: data.delta * 12 * 20
    });

    const cards = [];
    const isOptEqMax = optimalStrategyData?.highYears === absoluteMaxStrategyData?.highYears;
    const isConsEqOpt = conservativeStrategyData?.highYears === optimalStrategyData?.highYears;

    if (conservativeStrategyData && (!isConsEqOpt || viableStrategies.length === 1)) {
        const hasRampa = conservativeStrategyData.lowYears > 0;
        cards.push(buildCard('conservador',
            `Ruta Conservadora`,
            `Menor barrera de entrada. Inversión mínima requerida (${hasRampa ? `${conservativeStrategyData.lowYears}+${conservativeStrategyData.highYears}` : `${conservativeStrategyData.highYears} años`}).`,
            conservativeStrategyData, 'emerald'
        ));
    }

    if (optimalStrategyData) {
        const hasRampa = optimalStrategyData.lowYears > 0;
        cards.push(buildCard('optimo',
            `Estrategia Recomendada`,
            `Mayor equilibrio costo-beneficio. Modelo matemático ${hasRampa ? `${optimalStrategyData.lowYears}+${optimalStrategyData.highYears}` : `${optimalStrategyData.highYears} años`}.`,
            optimalStrategyData, 'amber'
        ));
    }

    if (absoluteMaxStrategyData && !isOptEqMax) {
        cards.push(buildCard('maximo', `Techo Legal Máximo (${absoluteMaxStrategyData.highYears} Años)`,
            `Estrategia de cotización al tope de 25 UMAs para alcanzar el máximo beneficio de ley.`,
            absoluteMaxStrategyData, 'indigo'
        ));
    }

    return {
        baseNet,
        strategies: cards
    };
}

export async function calculateInverseDesignAction(input: PensionInput, targetPension: number) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const anchors = await OracleService.fetchLatestAnchors();
    const inputWithAnchor = {
        ...input,
        anchor_salary: input.anchor_salary || anchors.uma,
        anchor_smdf: input.anchor_smdf || anchors.smdf
    };

    const engine = new PensionEngine();
    const designer = new InverseDesigner();

    const maxLegalPension = engine.maxPossiblePension(inputWithAnchor);
    const yearsToProject = Math.max(0, (inputWithAnchor.retirement_age || 65) - inputWithAnchor.age);
    const inercialWeeks = inputWithAnchor.weeks + (inputWithAnchor.is_ongoing_work !== false ? yearsToProject * 52 : 0);

    const inercialResult = engine.calculate({
        ...inputWithAnchor,
        weeks: inercialWeeks,
        age: inputWithAnchor.retirement_age || 65
    });
    const basePensionData = inercialResult.net_pension;

    const invMonths = Math.max(12, yearsToProject * 12);
    const solve = designer.solveForTarget(inputWithAnchor, targetPension, invMonths);

    return {
        maxLegalPension,
        basePensionData,
        solve: {
            requiredDailySalary: solve.requiredSBC,
            cappedDailySalary: solve.requiredSBC,
            monthlyInvestment: solve.totalInvestment / Math.max(1, invMonths),
            totalInvestment: solve.totalInvestment,
            isPossible: solve.isViable,
            maxPension: maxLegalPension,
            maxPensionGross: maxLegalPension * 1.1,
            weeks: inputWithAnchor.weeks + Math.floor(yearsToProject * 52),
            months: invMonths
        }
    };
}

export async function getMaxPossiblePensionAction(input: PensionInput) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const anchors = await OracleService.fetchLatestAnchors();
    const inputWithAnchor = {
        ...input,
        anchor_salary: input.anchor_salary || anchors.uma,
        anchor_smdf: input.anchor_smdf || anchors.smdf
    };

    const engine = new PensionEngine();
    return engine.maxPossiblePension(inputWithAnchor);
}
