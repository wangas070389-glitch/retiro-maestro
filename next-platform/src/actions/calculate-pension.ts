'use server';

import { z } from 'zod';
import { PensionEngine, PensionInput } from '../lib/engine/pension-engine';
import { VigenciaGuard } from '../lib/engine/vigencia-guard';
import { db } from '../lib/db';
import { auth } from '../auth';
import { assertTrialAccess } from '../lib/trial-guard';
import { ROIOptimizer, ExecutiveRecommendation } from '../lib/engine/roi-optimizer';
import { getPlan, Role, Tier } from '../lib/config/pricing';
import { checkUserAccess } from '../lib/auth/access-control';

const PensionSchema = z.object({
    weeks: z.number().min(0).max(3000, "Weeks out of bounds"),
    salary_prom: z.number().min(0, "Salary cannot be negative"),
    age: z.number().min(18).max(100),
    retirement_age: z.number().min(60).max(100).optional(),
    has_wife: z.boolean(),
    children_count: z.number().min(0).max(10),
    dependent_parents_count: z.number().min(0).max(2),
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
      }
    | { success: false; error: string; needsRecovery?: boolean };

export async function calculatePensionAction(formData: FormData | PensionInput): Promise<ValidationResult> {
    try {
        const session = await auth();
        if (!session) return { success: false, error: "Unauthorized" };

        const userId = session.user?.id;
        const userRole = (session.user as any).role as Role || 'USER';
        const userTier = (session.user as any).tier as Tier || 'FREE';

        if (userId) {
            const user = await db.user.findUnique({
                where: { id: userId },
                select: { role: true, tier: true, createdAt: true, trialSimulationsUsed: true } as any,
            });
            if (user) {
                assertTrialAccess(user as any);
            }
        }

        let rawInput: unknown = formData;
        if (formData instanceof FormData) {
            rawInput = {
                weeks: Number(formData.get('weeks')),
                salary_prom: Number(formData.get('salary_prom')),
                age: Number(formData.get('age')),
                retirement_age: formData.get('retirement_age') ? Number(formData.get('retirement_age')) : undefined,
                has_wife: formData.get('has_wife') === 'true' || formData.get('has_wife') === 'on',
                children_count: Number(formData.get('children_count') || 0),
                dependent_parents_count: Number(formData.get('dependent_parents_count') || 0),
                inflation_percentage: Number(formData.get('inflation_percentage') || 0),
                is_ongoing_work: formData.get('is_ongoing_work') === 'true' || formData.get('is_ongoing_work') === 'on',
                last_termination_date: formData.get('last_termination_date') ? String(formData.get('last_termination_date')) : undefined
            }
        }

        const validatedFields = PensionSchema.safeParse(rawInput);
        if (!validatedFields.success) return { success: false, error: validatedFields.error.message };

        const projection = PensionEngine.projectInput({
            age: validatedFields.data.age,
            weeks: validatedFields.data.weeks,
            retirement_age: validatedFields.data.retirement_age,
            is_ongoing_work: validatedFields.data.is_ongoing_work
        });

        const calcInput: PensionInput = {
            ...validatedFields.data,
            age: projection.age,
            weeks: projection.weeks
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

        // Feature Gated Recommendations (Phase 3 Refactor)
        let recommendations: ExecutiveRecommendation[] | undefined = undefined;
        if (checkUserAccess(userRole, userTier, 'roiOptimizer')) {
            const optimizer = new ROIOptimizer();
            recommendations = optimizer.optimize(calcInput as PensionInput);
        }

        return { success: true, data: result, vigenciaAlert, recommendations };

    } catch (error) {
        console.error("Calculation Error:", error);
        return { success: false, error: "Server Error during calculation." };
    }
}
