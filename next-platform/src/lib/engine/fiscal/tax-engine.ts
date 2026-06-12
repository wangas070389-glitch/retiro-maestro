import anchors from '../../data/legal-anchors.json' with { type: 'json' };

export interface TaxResult {
    grossPension: number;
    exemptionAmount: number;
    taxableIncome: number;
    estimatedTax: number;
    netPension: number;
    isTaxable: boolean;
}

/**
 * Official SAT ISR Monthly Brackets (Art. 96 LISR — 2025/2026 Tarifa Mensual).
 * Each row: [lowerLimit, upperLimit, fixedFee, rateOverExcess]
 * Source: DOF Annexo 8 de la Resolución Miscelánea Fiscal.
 */
const ISR_MONTHLY_BRACKETS: [number, number, number, number][] = [
    [0.01,       844.59,      0.00,     0.0192],
    [844.60,     7168.51,     16.22,    0.0640],
    [7168.52,    12598.02,    420.95,   0.1088],
    [12598.03,   14644.64,    1011.68,  0.1600],
    [14644.65,   17533.64,    1339.14,  0.1792],
    [17533.65,   35362.83,    1856.84,  0.2136],
    [35362.84,   55736.68,    5665.16,  0.2352],
    [55736.69,   106410.50,   10457.09, 0.3000],
    [106410.51,  141880.66,   25659.23, 0.3200],
    [141880.67,  425641.99,   37009.69, 0.3400],
    [425642.00,  Infinity,    133488.54,0.3500],
];

export class TaxEngine {
    /**
     * Calculates ISR for Ley 73 Pension based on official SAT monthly brackets.
     * Pensions are exempt up to 15 UMAs monthly (Art. 93, fracción IV LISR).
     */
    static calculateISR(grossPension: number): TaxResult {
        const UMA_DIARIA = anchors.uma_2026;
        const UMA_MENSUAL = UMA_DIARIA * 30.4;
        const EXENCION_UMAS = 15;

        const exemptionAmount = UMA_MENSUAL * EXENCION_UMAS;
        const taxableIncome = Math.max(0, grossPension - exemptionAmount);

        let estimatedTax = 0;

        if (taxableIncome > 0) {
            // Find the applicable bracket
            for (const [lower, upper, fixedFee, rate] of ISR_MONTHLY_BRACKETS) {
                if (taxableIncome >= lower && taxableIncome <= upper) {
                    estimatedTax = fixedFee + (taxableIncome - lower + 0.01) * rate;
                    break;
                }
            }
        }

        return {
            grossPension,
            exemptionAmount,
            taxableIncome,
            estimatedTax: Math.max(0, Math.round(estimatedTax * 100) / 100),
            netPension: grossPension - Math.max(0, Math.round(estimatedTax * 100) / 100),
            isTaxable: taxableIncome > 0
        };
    }
}
