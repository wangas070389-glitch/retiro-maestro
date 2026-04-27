# MATH-002: Modalidad 40 ROI & Breakeven Analytics

Formalizing the investment math for the "Voluntary Incorporation to the Mandatory Regime" (Modalidad 40) under IMSS Ley 73.

## 1. Investment Model ($M_{40}$)

The investment is calculated based on the selected UMA multiplier ($m$) and the number of months invested ($t$).

### 1.1 Monthly Cost ($C_{mo}$)
$$C_{mo} = (UMA_{year} \cdot m) \cdot \text{Rate}_{year}$$
*   **Rate**: The percentage rate increases every year from 11.166% (2023) to 18.800% (2030) as per the 2020 reform.

### 1.2 Total Investment ($C_{total}$)
$$C_{total} = \sum_{i=1}^{t} (C_{mo, i} \cdot (1 + \pi)^i)$$
*   $\pi$: Estimated monthly inflation (INPC).

## 2. ROI & Breakeven Metrics

### 2.1 The Pension Jump ($\Delta P$)
$$\Delta P = P_{high} - P_{low}$$
*   $P_{high}$: Pension calculated with $M_{40}$ (higher SBC and more weeks).
*   $P_{low}$: Pension without $M_{40}$ investment.

### 2.2 Static Breakeven ($T_{be}$)
The number of months required to recover the nominal investment:
$$T_{be} = \frac{C_{total}}{\Delta P}$$

### 2.3 Life Expectancy Weighted ROI ($ROI_{life}$)
Calculated over the estimated life expectancy ($L_{exp}$) for the retiree:
$$ROI_{life} = \frac{\sum_{j=1}^{L_{exp} - Age} (\Delta P \cdot (1 + \pi)^j) - C_{total}}{C_{total}} \cdot 100$$

## 3. Real-World Corrections

### 3.1 Retention/Recovery of Rights
The engine must verify if the worker's rights are "Conservados" (Rights Retention). If not, the investment must prioritize a 52-week re-activation period before the $M_{40}$ logic applies.

### 3.2 UMA Escalation
Simulations must account for the annual increase of the UMA value (typically ~3.5% to 5%) to avoid underestimating future costs.

---
## ⚖️ Sovereignty & Authority Ledger
| Metric | Value |
| :--- | :--- |
| **Document ID** | [018db58e-MATH-M40-b1d4-f6a1f9f87dec] |
| **Consensus State** | [APPROVED] |
| **Mathematical Basis** | [Ley del Seguro Social (1973) + 2020 Reform] |
