/**
 * Pricing & Monetization Config - Retiro Maestro
 * Sovereign Source of Truth for Tiers, Features and Limits.
 * Unified B2C (One-Time) and B2B (Recurring) logic.
 */

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

export const PRICING_CONFIG: Record<Role, Partial<Record<Tier, PricingPlan>>> = {
    USER: {
        FREE: {
            id: 'FREE',
            name: 'Consulta Gratuita',
            price: 0,
            billing: 'one-time',
            features: [
                'Cálculo básico de tu pensión IMSS',
                'Estimación bajo Ley del Seguro Social 1973',
                'Un escenario de jubilación'
            ],
            allowedFeatures: {
                pensionBasic: true,
                roiOptimizer: false,
                inverseDesign: false,
                pdfExport: false,
                integrityBundle: false,
                branding: false,
                multiClient: false
            },
            limits: {}
        },
        STRATEGY: {
            id: 'STRATEGY',
            name: 'Mi Mejor Pensión',
            price: 590,
            billing: 'one-time',
            features: [
                'Compara cuánto ganarías con Modalidad 40',
                'Descubre tu mejor edad para jubilarte',
                'Calcula cuánto invertir y cuánto recuperas',
                'Múltiples escenarios personalizados'
            ],
            allowedFeatures: {
                pensionBasic: true,
                roiOptimizer: true,
                inverseDesign: true,
                pdfExport: false,
                integrityBundle: false,
                branding: false,
                multiClient: false
            },
            limits: {}
        },
        DOSSIER: {
            id: 'DOSSIER',
            name: 'Expediente Completo',
            price: 1490,
            billing: 'one-time',
            features: [
                'Todo lo de "Mi Mejor Pensión"',
                'Descarga tu reporte en PDF oficial',
                'Documento con validación de integridad',
                'Respaldo legal para tu trámite ante el IMSS'
            ],
            allowedFeatures: {
                pensionBasic: true,
                roiOptimizer: true,
                inverseDesign: true,
                pdfExport: true,
                integrityBundle: true,
                branding: false,
                multiClient: false
            },
            limits: {}
        }
    },
    ADVISOR: {
        STARTER: {
            id: 'STARTER',
            name: 'Asesor Starter',
            price: 990,
            billing: 'monthly',
            features: ['Gestión de Clientes', 'Plan Estrategia Full'],
            allowedFeatures: {
                pensionBasic: true,
                roiOptimizer: true,
                inverseDesign: true,
                pdfExport: false,
                integrityBundle: false,
                branding: false,
                multiClient: true
            },
            limits: { activeClients: 5, extraClientFee: 150 }
        },
        GROWTH: {
            id: 'GROWTH',
            name: 'Asesor Growth',
            price: 1990,
            billing: 'monthly',
            features: ['Dossier Exports', 'Personalización Básica'],
            allowedFeatures: {
                pensionBasic: true,
                roiOptimizer: true,
                inverseDesign: true,
                pdfExport: true,
                integrityBundle: true,
                branding: true,
                multiClient: true
            },
            limits: { activeClients: 20, extraClientFee: 150 }
        },
        PRO: {
            id: 'PRO',
            name: 'Asesor Pro',
            price: 3990,
            billing: 'monthly',
            features: ['Unlimited Clients', 'Marca Blanca Full'],
            allowedFeatures: {
                pensionBasic: true,
                roiOptimizer: true,
                inverseDesign: true,
                pdfExport: true,
                integrityBundle: true,
                branding: true,
                multiClient: true
            },
            limits: { activeClients: 999999 }
        }
    },
    ADMIN: {
        FREE: {
            id: 'FREE',
            name: 'Admin',
            price: 0,
            billing: 'one-time',
            features: ['All Access'],
            allowedFeatures: {
                pensionBasic: true,
                roiOptimizer: true,
                inverseDesign: true,
                pdfExport: true,
                integrityBundle: true,
                branding: true,
                multiClient: true
            },
            limits: {}
        }
    }
};

export function getPlan(role: Role, tier: Tier): PricingPlan {
    const roleConfig = PRICING_CONFIG[role] || PRICING_CONFIG.USER;
    const plan = roleConfig[tier] || roleConfig.FREE || PRICING_CONFIG.USER.FREE;
    return plan as PricingPlan;
}
