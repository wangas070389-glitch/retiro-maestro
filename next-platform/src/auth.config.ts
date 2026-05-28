import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            console.log("MIDDLEWARE AUTH OBJECT:", JSON.stringify(auth));
            const isLoggedIn = !!auth?.user;
            const isProtected = nextUrl.pathname.startsWith('/dashboard') ||
                nextUrl.pathname.startsWith('/laboratory') ||
                nextUrl.pathname.startsWith('/authority') ||
                nextUrl.pathname.startsWith('/admin') ||
                nextUrl.pathname.startsWith('/portfolio') ||
                nextUrl.pathname.startsWith('/profile') ||
                nextUrl.pathname.startsWith('/settings');

            if (isProtected) {
                if (isLoggedIn) {
                    if (nextUrl.pathname.startsWith('/admin') && (auth.user as any)?.role !== 'ADMIN') {
                        return Response.redirect(new URL('/dashboard', nextUrl));
                    }
                    return true;
                }
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // If already logged in and on login/register page, redirect to dashboard
                if (nextUrl.pathname === '/login' || nextUrl.pathname === '/register') {
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }
            }
            return true;
        },
        async session({ session, token }) {
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
            return session;
        },
        async jwt({ token, user, trigger, session }) {
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
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
