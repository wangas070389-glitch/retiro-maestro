/**
 * Pricing & Monetization Config - Retiro Maestro
 * Sovereign Source of Truth for Tiers, Features and Limits.
 * Unified B2C (One-Time) and B2B (Recurring) logic.
 */
import pricingData from './pricing-data.json';

export type Role = 'USER' | 'ADVISOR' | 'ADMIN';
export type Tier = 'FREE' | 'STRATEGY' | 'DOSSIER' | 'STARTER' | 'GROWTH' | 'PRO';

export interface PlanLimit {
    activeClients?: number;
    extraClientFee?: number;
}

export interface PricingPlan {
    id: Tier;
    name: string;
    price: number;
    billing: 'one-time' | 'monthly';
    features: string[];
    allowedFeatures: {
        pensionBasic: boolean;
        roiOptimizer: boolean;
        inverseDesign: boolean;
        pdfExport: boolean;
        integrityBundle: boolean;
        branding: boolean;
        multiClient: boolean;
    };
    limits: PlanLimit;
}

export const PRICING_CONFIG = pricingData as Record<Role, Partial<Record<Tier, PricingPlan>>>;

export function getPlan(role: Role, tier: Tier): PricingPlan {
    const roleConfig = PRICING_CONFIG[role] || PRICING_CONFIG.USER;
    const plan = roleConfig[tier] || roleConfig.FREE || PRICING_CONFIG.USER.FREE;
    return plan as PricingPlan;
}
