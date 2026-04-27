'use server';

import { db } from "@/lib/db";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";

async function verifySelf() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("No estás autenticado.");
    }
    return session.user;
}

const ProfileInfoSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Correo electrónico inválido")
});

export async function updateProfileInfoAction(name: string, email: string) {
    try {
        const user = await verifySelf();

        const parseResult = ProfileInfoSchema.safeParse({ name, email });
        if (!parseResult.success) {
            throw new Error(parseResult.error.errors[0].message);
        }

        // Check if email is being changed
        if (email !== user.email) {
            const existingUser = await db.user.findUnique({ where: { email } });
            if (existingUser) {
                throw new Error("El correo electrónico ya está en uso por otra cuenta.");
            }
        }

        const updated = await db.user.update({
            where: { id: user.id },
            data: { name, email }
        });

        // Optional: Log audit
        console.warn(`[AUDIT] Usuario ${user.id} actualizó su perfil (Nombre: ${name}, Email: ${email})`);

        return { success: true, user: { name: updated.name, email: updated.email } };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to update profile information" };
    }
}

const PasswordUpdateSchema = z.object({
    currentPassword: z.string().min(1, "Debes ingresar tu contraseña actual"),
    newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres")
});

export async function updatePasswordAction(currentPassword: string, newPasswordPlain: string) {
    try {
        const user = await verifySelf();

        const parseResult = PasswordUpdateSchema.safeParse({ currentPassword, newPassword: newPasswordPlain });
        if (!parseResult.success) {
            throw new Error(parseResult.error.errors[0].message);
        }

        // Fetch user from DB to get the current hash
        const dbUser = await db.user.findUnique({ where: { id: user.id } });
        if (!dbUser || !dbUser.password) {
            throw new Error("Usuario no encontrado o no tiene contraseña registrada.");
        }

        // Verify current password
        const passwordMatch = await bcrypt.compare(currentPassword, dbUser.password);
        if (!passwordMatch) {
            throw new Error("La contraseña actual es incorrecta.");
        }

        // Hash new password and update
        const hashedNewPassword = await bcrypt.hash(newPasswordPlain, 10);

        await db.user.update({
            where: { id: user.id },
            data: { password: hashedNewPassword }
        });

        console.warn(`[AUDIT-RED] Usuario ${user.id} actualizó su contraseña con éxito.`);

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to update password" };
    }
}

export async function updateAgencyInfoAction(agencyName: string, agencyPhone: string, agencyLogoUrl: string) {
    try {
        const user = await verifySelf();
        
        const updated = await db.user.update({
            where: { id: user.id },
            data: { agencyName, agencyPhone, agencyLogoUrl } as any
        }) as any;

        console.warn(`[AUDIT] Usuario ${user.id} actualizó su Marca Blanca (Agencia: ${agencyName})`);

        return { 
            success: true, 
            user: { 
                agencyName: updated.agencyName, 
                agencyPhone: updated.agencyPhone, 
                agencyLogoUrl: updated.agencyLogoUrl 
            } 
        };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Fallo al actualizar datos de Marca Blanca." };
    }
}

export async function updateGeoConfigAction(operationState: string, remoteReady: boolean) {
    try {
        const user = await verifySelf();
        
        const updated = await db.user.update({
            where: { id: user.id },
            data: { operationState, remoteReady } as any
        }) as any;

        console.warn(`[AUDIT] Usuario ${user.id} actualizó su Cobertura Geo-Espacial (Estado: ${operationState}, Remoto: ${remoteReady})`);

        return { 
            success: true, 
            user: { 
                operationState: updated.operationState, 
                remoteReady: updated.remoteReady
            } 
        };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Fallo al actualizar matriz geo-espacial." };
    }
}

export async function updateResidencyStateAction(residencyState: string) {
    try {
        const user = await verifySelf();
        
        const updated = await db.user.update({
            where: { id: user.id },
            data: { residencyState } as any
        }) as any;

        console.warn(`[AUDIT] Usuario B2C ${user.id} actualizó su Estado de Residencia: ${residencyState}`);

        return { 
            success: true, 
            residencyState: updated.residencyState
        };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Fallo al actualizar estado de residencia." };
    }
}

export async function updateUserActuarialAction(age: number, currentWeeks: number, avgSalary: number, lastBajaDate: string | null) {
    try {
        const user = await verifySelf();
        
        const updated = await db.user.update({
            where: { id: user.id },
            data: { 
                age, 
                currentWeeks, 
                avgSalary, 
                lastBajaDate: lastBajaDate ? new Date(lastBajaDate) : null 
            } as any
        }) as any;

        console.warn(`[AUDIT] Usuario B2C ${user.id} actualizó su Perfil Actuarial (Semanas: ${currentWeeks}, Salary: ${avgSalary})`);

        return { 
            success: true, 
            user: { 
                name: updated.name,
                email: updated.email,
                role: updated.role,
                tier: updated.tier,
                isApproved: updated.isApproved,
                isBlocked: updated.isBlocked,
                agencyName: updated.agencyName,
                agencyPhone: updated.agencyPhone,
                agencyLogoUrl: updated.agencyLogoUrl,
                operationState: updated.operationState,
                remoteReady: updated.remoteReady,
                age: updated.age, 
                currentWeeks: updated.currentWeeks, 
                avgSalary: updated.avgSalary,
                lastBajaDate: updated.lastBajaDate
            } 
        };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Fallo al actualizar perfil actuarial." };
    }
}
