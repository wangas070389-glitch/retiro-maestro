import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: string;
            tier: string;
            isApproved: boolean;
            isBlocked: boolean;
            advisorId?: string | null;
            agencyName?: string | null;
            agencyPhone?: string | null;
            agencyLogoUrl?: string | null;
            leadStatus?: string | null;
            residencyState?: string | null;
            operationState?: string | null;
        } & DefaultSession['user'];
    }

    interface User extends DefaultUser {
        role?: string;
        tier?: string;
        isApproved?: boolean;
        isBlocked?: boolean;
        advisorId?: string | null;
        agencyName?: string | null;
        agencyPhone?: string | null;
        agencyLogoUrl?: string | null;
        leadStatus?: string | null;
        residencyState?: string | null;
        operationState?: string | null;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        role?: string;
        tier?: string;
        isApproved?: boolean;
        isBlocked?: boolean;
        advisorId?: string | null;
        agencyName?: string | null;
        agencyPhone?: string | null;
        agencyLogoUrl?: string | null;
        leadStatus?: string | null;
        residencyState?: string | null;
        operationState?: string | null;
    }
}
