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
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
