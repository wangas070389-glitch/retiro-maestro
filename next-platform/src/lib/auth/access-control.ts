import { db } from '../db';
import { PRICING_CONFIG, Role, Tier, getPlan, PricingPlan } from '../config/pricing';
import { subDays } from 'date-fns';

/**
 * Validates if the user can access a specific feature based on their Role/Tier config.
 */
export function checkUserAccess(role: Role, tier: Tier, feature: keyof PricingPlan['allowedFeatures']): boolean {
    if (role === 'ADMIN') return true; // Admins have absolute feature access
    const plan = getPlan(role, tier);
    // @ts-ignore - Prisma / Dynamic indexing bypass for feature keys
    return plan.allowedFeatures[feature] || false;
}

/**
 * Counts "Active Clients" for an Advisor.
 * "Active" = client with at least one simulation in the last 30 days.
 */
export async function getActiveClientCount(advisorId: string): Promise<number> {
    const thirtyDaysAgo = subDays(new Date(), 30);
    
    // @ts-ignore - Prisma property 'client' generation sync issue
    const activeClients = await db.client.count({
        where: {
            advisorId: advisorId,
            simulations: {
                some: {
                    updatedAt: {
                        gte: thirtyDaysAgo
                    }
                }
            }
        }
    });

    return activeClients;
}

/**
 * Enforces B2B Plan limits for client creation.
 */
export async function canCreateClient(advisorId: string, role: Role, tier: Tier): Promise<boolean> {
    if (role === 'ADMIN') return true; // Admins bypass creation limits
    if (role !== 'ADVISOR') return false;
    
    const plan = getPlan(role, tier);
    const activeCount = await getActiveClientCount(advisorId);
    
    return activeCount < (plan.limits.activeClients || 0);
}
