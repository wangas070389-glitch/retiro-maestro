import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from '@/components/ui/toast-context';
import { auth } from "@/auth";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: 'Retiro Maestro | Sovereign Pension Intelligence',
    description: 'Secure, immutable retirement strategy powered by the Thelma Protocol. Calculated with actuarial precision and protected by cryptographic signatures.',
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#0f172a', // Slate-950
}

import { MotionProvider } from "@/components/providers/MotionProvider";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth();
    return (
        <html lang="en">
            <body className={font.className}>
                <SessionProvider session={session}>
                    <ToastProvider>
                        <MotionProvider>
                            {children}
                        </MotionProvider>
                    </ToastProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
