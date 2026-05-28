'use server';

import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const RegisterSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(['USER', 'ADVISOR']).default('USER'),
    advisorCode: z.string().optional(),
    residencyState: z.string().optional()
});

export async function registerUserAction(formData: FormData) {
    // TODO: SEC-021 - Implement Upstream Rate Limiting (e.g. Redis sliding window or Edge Middleware)
    // to mitigate brute-force credentials stuffing on the auth entrypoints.
    try {
        const rawData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role'),
            advisorCode: formData.get('advisorCode'),
            residencyState: formData.get('residencyState'),
        };

        const validatedFields = RegisterSchema.safeParse(rawData);

        if (!validatedFields.success) {
            return {
                success: false,
                error: validatedFields.error.errors[0].message
            };
        }

        const { name, email, password, role, advisorCode, residencyState } = validatedFields.data;

        // Check if user already exists
        const existingUser = await db.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return {
                success: false,
                error: "User with this email already exists"
            };
        }

        let verifiedAdvisorId: string | undefined = undefined;

        // 2. Validate Advisor Code if presented by a standard USER
        if (role === 'USER' && advisorCode) {
            const advisor = await db.user.findFirst({
                where: { 
                    id: advisorCode,
                    role: 'ADVISOR'
                }
            });

            if (!advisor) {
                return {
                    success: false,
                    error: "El código de Asesor proporcionado es inválido o no existe."
                };
            }
            verifiedAdvisorId = advisor.id;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Rule 1: First-Right of Refusal (Opt-in only)


        await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                tier: "FREE",
                role: role,
                isApproved: true,
                trialSimulationsUsed: 0,
                advisorId: verifiedAdvisorId,
                residencyState: residencyState || null,
                
                // Binding to Temporal Routing Matrix (Opt-in only via Authority Page)
                leadStatus: verifiedAdvisorId ? "CLAIMED" : "NONE",
                claimedById: verifiedAdvisorId ? verifiedAdvisorId : null,
                slaExpiresAt: null
            } as any
        });

        return { success: true };

    } catch (error) {
        console.error("Registration error:", error);
        return { success: false, error: "An unexpected error occurred during registration" };
    }
}
