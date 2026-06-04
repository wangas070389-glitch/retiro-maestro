import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
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
                    if (nextUrl.pathname.startsWith('/admin') && auth?.user?.role !== 'ADMIN') {
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
                session.user.role = (token.role as string) || 'USER';
                session.user.tier = (token.tier as string) || 'FREE';
                session.user.isApproved = !!token.isApproved;
                session.user.isBlocked = !!token.isBlocked;
                
                if (token.advisorId !== undefined) session.user.advisorId = token.advisorId as string | null;
                if (token.agencyName !== undefined) session.user.agencyName = token.agencyName as string | null;
                if (token.agencyPhone !== undefined) session.user.agencyPhone = token.agencyPhone as string | null;
                if (token.agencyLogoUrl !== undefined) session.user.agencyLogoUrl = token.agencyLogoUrl as string | null;
                if (token.leadStatus !== undefined) session.user.leadStatus = token.leadStatus as string | null;
                if (token.residencyState !== undefined) session.user.residencyState = token.residencyState as string | null;
                if (token.operationState !== undefined) session.user.operationState = token.operationState as string | null;
                if (token.remoteReady !== undefined) session.user.remoteReady = !!token.remoteReady;
                
                // Actuarial Identity Fields
                if (token.age !== undefined) session.user.age = token.age as number | null;
                if (token.currentWeeks !== undefined) session.user.currentWeeks = token.currentWeeks as number | null;
                if (token.avgSalary !== undefined) session.user.avgSalary = token.avgSalary as number | null;
                if (token.lastBajaDate !== undefined) session.user.lastBajaDate = token.lastBajaDate as string | Date | null;
                if (token.nss !== undefined) session.user.nss = token.nss as string | null;
                if (token.birthDate !== undefined) session.user.birthDate = token.birthDate as string | Date | null;
                if (token.isWorking !== undefined) session.user.isWorking = !!token.isWorking;
            }
            return session;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.tier = user.tier;
                token.isApproved = user.isApproved;
                token.isBlocked = user.isBlocked;
                token.advisorId = (user as any).advisorId;
                token.agencyName = (user as any).agencyName;
                token.agencyPhone = (user as any).agencyPhone;
                token.agencyLogoUrl = (user as any).agencyLogoUrl;
                token.leadStatus = (user as any).leadStatus;
                token.residencyState = (user as any).residencyState;
                token.operationState = (user as any).operationState;
                token.remoteReady = (user as any).remoteReady;

                // Actuarial Sync
                token.age = user.age;
                token.currentWeeks = user.currentWeeks;
                token.avgSalary = user.avgSalary;
                token.lastBajaDate = user.lastBajaDate;
                token.nss = (user as any).nss;
                token.birthDate = (user as any).birthDate;
                token.isWorking = (user as any).isWorking;
            }
            if (trigger === "update" && session) {
                token = { ...token, ...session.user }
            }
            return token;
        }
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
