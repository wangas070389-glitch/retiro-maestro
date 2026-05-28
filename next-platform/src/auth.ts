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
});
