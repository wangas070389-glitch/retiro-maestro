# 🧮 MATH-001: IMSS Ley 73 Pension Logic

This document formalizes the deterministic logic for calculating pensions under the 1973 Social Security Law, as per the 2013 Reference Manual.

## 1. Core Variables Dictionary

| Symbol | Description | Data Source |
| :--- | :--- | :--- |
| $SBC_{prom}$ | average daily salary (last 250 weeks) | IMSS Statement |
| $SC$ | Total weeks contributed (Semanas Cotizadas) | IMSS Statement |
| $SMDF$ | Minimum Daily Wage (Distrito Federal 2011/current anchor) | Legal Archive |
| $n$ | Salary multiplier relative to SMDF ($n = SBC_{prom} / SMDF$) | Calculated |
| $PCB$ | Base Cuantía Percentage | Table 4.1 |
| $APCB$ | Annual Increment Percentage | Table 4.1 |
| $AgeFactor$ | Retirement age percentage ($60 \to 75\%$, $65 \to 100\%$) | Table 4.2 |

## 2. Base Calculation (Article 167)

The basic daily cuantía is determined by the number of years exceeded beyond the initial 500 weeks:

### 2.1 Calculate Excess Years ($N_{ex}$)
$$N_{ex} = \text{round}\left(\frac{SC - 500}{52}\right)$$
*Rounding Rules (Protocol 6):*
* $< 0.25 \to 0$
* $0.25 \text{ to } 0.50 \to 0.5$
* $> 0.50 \to 1.0$

*Strict Actuarial Logic (Parity Fix)*: For strategies modeled under Modalidad 40 (`strategyType === 'modalidad40'`), the total weeks ($SC$) explicitly includes future simulation weeks `(TargetAge - CurrentAge) * 52`, regardless of whether `is_ongoing_work` is false. This represents the explicit voluntary contribution time acquired under M40.

### 2.2 Core Formula
$$C_{daily\_base} = \left( PCB + (N_{ex} \times APCB) \right) \times SBC_{prom}$$

## 3. Adjustments and Allowances

### 3.1 Age Factor (Article 171)
$$C_{adjusted} = C_{daily\_base} \times AgeFactor(Age)$$
* $60$ years $\to 75\%$
* $61$ years $\to 80\%$
* $62$ years $\to 85\%$
* $63$ years $\to 90\%$
* $64$ years $\to 95\%$
* $65$ years $\to 100\%$

### 3.2 Family Allowances (Asignaciones Familiares)
The pension is increased by a percentage of the calculated amount:
* **Wife/Concubine**: $+15\%$
* **Each Child (<16/25 years)**: $+10\%$
* **Parents (if dependent)**: $+10\%$
* **Help for Solitude (if no dependents)**: $+15\%$

$$C_{total} = C_{adjusted} \times (1 + \sum \text{Allowances})$$

## 4. Minimum/Maximum Envelopes
* **Minimum**: Must be $\geq 100\%$ of SMDF (Article 168).
* **Maximum**: capped at 25 SMDF for contribution, but resulting pension has its own ceiling based on the $PCB/APCB$ results.
* **Decree Adjustment (1.11 Factor)**: Per the simulator logic (Sheet1!F38), the calculated pension is multiplied by a **1.11** factor as per legal decree.

## 5. Actuarial Tables

### 5.1 Table 4.1: Cuantía Coefficients (Article 167)
Determined by the salary multiplier $n$ (SBC / SMDF). verified against `TblPorcentajesLey73` (sheet6.xml):

| Group ($n$) | Base Cuantía ($PCB$) | Annual Increment ($APCB$) |
| :--- | :--- | :--- |
| 0 to 1.0 | 80.00% | 0.5630% |
| 1.01 to 1.25 | 77.11% | 0.8140% |
| 1.26 to 1.50 | 58.18% | 1.1780% |
| 1.51 to 1.75 | 49.23% | 1.4300% |
| 1.76 to 2.00 | 42.67% | 1.6150% |
| 2.01 to 2.25 | 37.65% | 1.7560% |
| 2.26 to 2.50 | 33.68% | 1.8680% |
| 2.51 to 2.75 | 30.48% | 1.9580% |
| 2.76 to 3.00 | 27.83% | 2.0330% |
| 3.01 to 3.25 | 25.60% | 2.0960% |
| 3.26 to 3.50 | 23.70% | 2.1490% |
| 3.51 to 3.75 | 22.07% | 2.1950% |
| 3.76 to 4.00 | 20.65% | 2.2350% |
| 4.01 to 4.25 | 19.39% | 2.2710% |
| 4.26 to 4.50 | 18.32% | 2.3020% |
| 4.51 to 4.75 | 17.30% | 2.3300% |
| 4.76 to 5.00 | 16.41% | 2.3550% |
| 5.01 to 5.25 | 15.61% | 2.3770% |
| 5.26 to 5.50 | 14.88% | 2.3980% |
| 5.51 to 5.75 | 14.22% | 2.4160% |
| 5.76 to 6.00 | 13.62% | 2.4330% |
| 6.01 to 25.00 | 13.00% | 2.4500% |

---
## ⚖️ Sovereignty & Authority Ledger
| Metric | Value |
| :--- | :--- |
| **Document ID** | [018db58e-MATH-7373-b1d4-f6a1f9f87dec] |
| **Consensus State** | [APPROVED] |
| **Verification Agent** | [Sentinel-P17] |