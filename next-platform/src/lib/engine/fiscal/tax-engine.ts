import anchors from '../../data/legal-anchors.json';

export interface TaxResult {
    grossPension: number;
    exemptionAmount: number;
    taxableIncome: number;
    estimatedTax: number;
    netPension: number;
    isTaxable: boolean;
}

export class TaxEngine {
    /**
     * Calculates ISR for Ley 73 Pension based on 2026 UMA values.
     * Logic ported from prototype_retiromaestro73.txt
     */
    static calculateISR(grossPension: number): TaxResult {
        const UMA_DIARIA = anchors.uma_2026;
        const UMA_MENSUAL = UMA_DIARIA * 30.4;
        const EXENCION_UMAS = 15;

        const exemptionAmount = UMA_MENSUAL * EXENCION_UMAS;
        const taxableIncome = Math.max(0, grossPension - exemptionAmount);

        let estimatedTax = 0;

        // Simplified ISR brackets from prototype for parity
        if (taxableIncome > 0) {
            if (taxableIncome < 10000) {
                estimatedTax = taxableIncome * 0.10;
            } else if (taxableIncome < 20000) {
                estimatedTax = 1000 + (taxableIncome - 10000) * 0.15;
            } else {
                estimatedTax = 3500 + (taxableIncome - 20000) * 0.30;
            }
        }

        return {
            grossPension,
            exemptionAmount,
            taxableIncome,
            estimatedTax,
            netPension: grossPension - estimatedTax,
            isTaxable: taxableIncome > 0
        };
    }
}
