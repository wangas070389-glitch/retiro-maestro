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
    [0.01,       746.04,      0.00,     0.0192],
    [746.05,     6332.05,     14.32,    0.0640],
    [6332.06,    11128.01,    371.83,   0.1088],
    [11128.02,   12935.82,    893.63,   0.1600],
    [12935.83,   15487.71,    1182.88,  0.1792],
    [15487.72,   31236.49,    1640.18,  0.2136],
    [31236.50,   49233.00,    4005.46,  0.2352],
    [49233.01,   93993.90,    8235.20,  0.3000],
    [93993.91,   125325.20,   21663.57, 0.3200],
    [125325.21,  375975.61,   31689.59, 0.3400],
    [375975.62,  Infinity,    116890.70,0.3500],
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
