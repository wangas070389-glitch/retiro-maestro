# MATH-012: ISR Pension Tax Algorithm (Mexican Fiscal Basis)

## 1. Objective
To mathematically define the deduction of Mexican Income Tax (ISR) from the Gross Pension ($P_{gross}$) to derive the Net Pension ($P_{net}$).

## 2. Theoretical Basis (Art. 93 LSS)
Pensions in Mexico enjoy a tax exemption of up to **15 times the UMA** (Unidad de Medida y Actualización).

## 3. Variables
- $P_{gross}$: Gross Monthly Pension.
- $UMA$: 115.34 (Base 2026).
- $D_{monthly}$: 30.4 (Strictly calibrated to standard SAT day count).
- $E_{threshold}$: Exemption Threshold.
- $Taxable$: $P_{gross} - E_{threshold}$.

## 4. The Exemption Equation
$$E_{threshold} = UMA \times 15 \times D_{monthly}$$
For 2026:
$$E_{threshold} = 115.34 \times 15 \times 30.4 \approx \$52,595.04$$

## 5. Tax Bracket Calculation (Simplified 2026 Projection)
If $Taxable > 0$:
- If $Taxable < \$10,000$: $Tax = Taxable \times 0.10$
- If $Taxable < \$20,000$: $Tax = \$1,000 + (Taxable - \$10,000) \times 0.15$
- Else: $Tax = \$2,500 + (Taxable - \$20,000) \times 0.30$ (Estimated)

## 6. Implementation
The `PensionEngine.calculateISR` method implements this piecewise linear function to provide forensic financial transparency.
