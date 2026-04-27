import NextAuth from "next-auth"
import { authConfig } from './auth.config';
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "./lib/db"

async function getUser(email: string): Promise<any> {
    try {
        const user = await db.user.findUnique({ where: { email } });
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" }, // Still using JWT for session but adapter for persistence if needed
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(8) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user || !user.password) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) {
                        if (user.isBlocked) {
                            throw new Error("Cuenta bloqueada por administrador.");
                        }
                        if (!user.isApproved) {
                            throw new Error("Cuenta pendiente de autorización.");
                        }
                        return user;
                    }
                }

                console.log("Invalid credentials");
                return null;
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async session({ session, token }) {
            console.log("[AUTH DEBUG] Session Callback - Token:", JSON.stringify(token));
            if (token.sub && session.user) {
                session.user.id = token.sub;
                session.user.role = token.role as string;
                session.user.tier = token.tier as string;
                session.user.isApproved = token.isApproved as boolean;
                session.user.isBlocked = token.isBlocked as boolean;
                if (token.agencyLogoUrl) session.user.agencyLogoUrl = token.agencyLogoUrl as string;
                if (token.leadStatus) (session.user as any).leadStatus = token.leadStatus as string;
                if (token.residencyState) (session.user as any).residencyState = token.residencyState as string;
                if (token.operationState) (session.user as any).operationState = token.operationState as string;
                
                // Actuarial Identity Fields
                if (token.age) (session.user as any).age = token.age as number;
                if (token.currentWeeks) (session.user as any).currentWeeks = token.currentWeeks as number;
                if (token.avgSalary) (session.user as any).avgSalary = token.avgSalary as number;
                if (token.lastBajaDate) (session.user as any).lastBajaDate = token.lastBajaDate as string | Date;
            }
            console.log("[AUTH DEBUG] Session Callback - Resulting Session:", JSON.stringify(session));
            return session;
        },
        async jwt({ token, user, trigger, session }) {
            console.log("[AUTH DEBUG] JWT Callback - Trigger:", trigger, "User:", user ? user.email : "none");
            if (user) {
                token.role = user.role;
                token.tier = user.tier;
                token.isApproved = user.isApproved;
                token.isBlocked = user.isBlocked;
                if (user.agencyLogoUrl) token.agencyLogoUrl = user.agencyLogoUrl;
                if (user.leadStatus) token.leadStatus = user.leadStatus;
                if (user.residencyState) token.residencyState = user.residencyState;
                if (user.operationState) token.operationState = user.operationState;

                // Actuarial Sync
                token.age = (user as any).age;
                token.currentWeeks = (user as any).currentWeeks;
                token.avgSalary = (user as any).avgSalary;
                token.lastBajaDate = (user as any).lastBajaDate;
            }
            if (trigger === "update" && session) {
                token = { ...token, ...session.user }
            }
            return token;
        }
    }
});
