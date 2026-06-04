'use server';

import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const RegisterSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Dirección de correo inválida"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    role: z.enum(['USER', 'ADVISOR']).default('USER'),
    advisorCode: z.string().optional(),
    residencyState: z.string().optional(),
    nss: z.string().optional().refine(val => !val || /^\d{11}$/.test(val), {
        message: "El NSS debe tener exactamente 11 dígitos"
    }),
    birthDate: z.string().optional(),
    isWorking: z.boolean().optional(),
    lastBajaDate: z.string().optional()
}).refine(data => {
    if (data.role === 'USER') {
        if (!data.birthDate) return false;
        if (data.isWorking === false || !data.isWorking) {
            return !!data.lastBajaDate;
        }
    }
    return true;
}, {
    message: "La fecha de nacimiento es obligatoria y la fecha de baja es requerida si no cotiza actualmente.",
    path: ["lastBajaDate"]
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
            nss: formData.get('nss') ? String(formData.get('nss')) : undefined,
            birthDate: formData.get('birthDate') ? String(formData.get('birthDate')) : undefined,
            isWorking: formData.get('isWorking') === 'true' || formData.get('isWorking') === 'on',
            lastBajaDate: formData.get('lastBajaDate') ? String(formData.get('lastBajaDate')) : undefined,
        };

        const validatedFields = RegisterSchema.safeParse(rawData);

        if (!validatedFields.success) {
            return {
                success: false,
                error: validatedFields.error.errors[0].message
            };
        }

        const { name, email, password, role, advisorCode, residencyState, nss, birthDate, isWorking, lastBajaDate } = validatedFields.data;

        // Check if user already exists
        const existingUser = await db.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return {
                success: false,
                error: "El correo electrónico ya está registrado."
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

                nss: role === 'USER' ? (nss || null) : null,
                birthDate: (role === 'USER' && birthDate) ? new Date(birthDate) : null,
                isWorking: role === 'USER' ? !!isWorking : false,
                lastBajaDate: (role === 'USER' && !isWorking && lastBajaDate) ? new Date(lastBajaDate) : null,
                
                // Binding to Temporal Routing Matrix (Opt-in only via Authority Page)
                leadStatus: verifiedAdvisorId ? "CLAIMED" : "NONE",
                claimedById: verifiedAdvisorId ? verifiedAdvisorId : null,
                slaExpiresAt: null
            } as any
        });

        return { success: true };

    } catch (error) {
        console.error("Registration error:", error);
        return { success: false, error: "Ocurrió un error inesperado durante el registro" };
    }
}
