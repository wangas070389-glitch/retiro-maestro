'use server';

import { db } from "@/lib/db";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AdminLogic } from "@/lib/engine/admin-logic";

export async function deleteUserAction(userId: string) {
    try {
        const admin = await verifyAdmin();

        // 1. Core Logic Validation (Invariants)
        const eligibility = AdminLogic.validateDeletion(userId, admin.id);
        if (!eligibility.isEligible) {
            throw new Error(eligibility.reason);
        }

        // 2. Cascade Delete in Prisma (Relational Purge)
        await db.user.delete({
            where: { id: userId }
        });

        // 3. Audit Trail
        console.warn(`[DANGER: DELETE] Administrador ${admin.email} (ID: ${admin.id}) ELIMINÓ permanentemente al Usuario ID: ${userId}`);

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: unknown) {
        console.error("Delete User Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Error fatal al intentar eliminar el usuario." };
    }
}

async function verifyAdmin() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        throw new Error("Unauthorized. Only administrators can perform this action.");
    }
    return session.user;
}

export async function getAllUsersAction() {
    try {
        await verifyAdmin();
        const users = await db.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                tier: true,
                isApproved: true,
                isBlocked: true,
                createdAt: true,
                advisorId: true,
                advisor: {
                    select: {
                        email: true
                    }
                }
            }
        });
        return { success: true, users };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to fetch users" };
    }
}

export async function toggleUserApprovalAction(userId: string, isApproved: boolean) {
    try {
        await verifyAdmin();
        const updated = await db.user.update({
            where: { id: userId },
            data: { isApproved }
        });
        revalidatePath('/admin/users');
        return { success: true, user: updated };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to update user approval" };
    }
}

export async function toggleUserBlockAction(userId: string, isBlocked: boolean) {
    try {
        const admin = await verifyAdmin();
        if (userId === admin.id) {
            throw new Error("No puedes bloquear tu propia cuenta.");
        }

        const updated = await db.user.update({
            where: { id: userId },
            data: { isBlocked }
        });
        revalidatePath('/admin/users');
        return { success: true, user: updated };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to updated user block status" };
    }
}

const PasswordSchema = z.string().min(8, "La contraseña debe tener al menos 8 caracteres");

export async function resetUserPasswordAction(userId: string, newPasswordPlain: string) {
    try {
        const admin = await verifyAdmin();

        const parseResult = PasswordSchema.safeParse(newPasswordPlain);
        if (!parseResult.success) {
            throw new Error(parseResult.error.errors[0].message);
        }

        const targetUser = await db.user.findUnique({ where: { id: userId } });
        if (!targetUser) throw new Error("User not found");

        // Prevent standard admins from resetting other admins' passwords (Hierarchical isolation)
        if (targetUser.role === 'ADMIN' && targetUser.id !== admin.id) {
            throw new Error("No puedes resetear la contraseña de otro administrador.");
        }

        const hashedPassword = await bcrypt.hash(newPasswordPlain, 10);

        await db.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        // Audit Trail Console
        console.warn(`[AUDIT] Administrador ${admin.email} (ID: ${admin.id}) reseteó la contraseña de Usuario ID: ${userId}`);

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to reset password" };
    }
}

export async function modifyUserClearanceAction(userId: string, role: string, tier: string, advisorId?: string | null) {
    try {
        const admin = await verifyAdmin();
        if (userId === admin.id && role !== 'ADMIN') {
            throw new Error("No puedes quitarte los permisos de administrador a ti mismo.");
        }

        const updated = await db.user.update({
            where: { id: userId },
            data: {
                role,
                tier,
                advisorId: advisorId === "unassigned" ? null : advisorId
            }
        });

        revalidatePath('/admin/users');
        return { success: true, user: updated };
    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to update user clearance" };
    }
}
