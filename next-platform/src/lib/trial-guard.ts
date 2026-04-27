const TRIAL_DAYS = 7;
const TRIAL_MAX_SIMULATIONS = 2;
const EXEMPT_ROLES = ['ADMIN'];

export interface TrialStatus {
    isTrialActive: boolean;
    isLocked: boolean;
    daysRemaining: number;
    simulationsUsed: number;
    simulationsRemaining: number;
    reason: string | null;
}

export interface TrialUser {
    role: string;
    tier: string;
    createdAt: Date;
    trialSimulationsUsed: number;
}

/**
 * Computes the trial status for a given user.
 * ADMIN roles are always exempt.
 */
export function getTrialStatus(user: TrialUser): TrialStatus {
    // Exempt roles bypass all trial restrictions
    if (EXEMPT_ROLES.includes(user.role)) {
        return {
            isTrialActive: false,
            isLocked: false,
            daysRemaining: 0,
            simulationsUsed: user.trialSimulationsUsed,
            simulationsRemaining: Infinity,
            reason: null,
        };
    }

    // Full Premium tier bypass (Sovereign Purge - ADR-036)
    if (['STRATEGY', 'DOSSIER', 'STARTER', 'GROWTH', 'PRO'].includes(user.tier)) {
        return {
            isTrialActive: false,
            isLocked: false,
            daysRemaining: Infinity,
            simulationsUsed: user.trialSimulationsUsed,
            simulationsRemaining: Infinity,
            reason: null,
        };
    }

    const now = new Date();
    const trialEndsAt = new Date(user.createdAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
    const msRemaining = trialEndsAt.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));
    const simulationsRemaining = Math.max(0, TRIAL_MAX_SIMULATIONS - user.trialSimulationsUsed);

    const isTimeExpired = msRemaining <= 0;
    const isLimitReached = user.trialSimulationsUsed >= TRIAL_MAX_SIMULATIONS;
    const isLocked = isTimeExpired || isLimitReached;

    let reason: string | null = null;
    if (isTimeExpired) {
        reason = 'Tu periodo de prueba gratuita de 7 días ha expirado.';
    } else if (isLimitReached) {
        reason = 'Has alcanzado el límite de 2 estudios en tu prueba gratuita.';
    }

    return {
        isTrialActive: !isLocked,
        isLocked,
        daysRemaining,
        simulationsUsed: user.trialSimulationsUsed,
        simulationsRemaining,
        reason,
    };
}

/**
 * Asserts that the current user has trial access.
 * Throws a descriptive error if locked.
 */
export function assertTrialAccess(user: TrialUser): void {
    const status = getTrialStatus(user);
    if (status.isLocked) {
        throw new Error(status.reason || 'Acceso de prueba denegado.');
    }
}
