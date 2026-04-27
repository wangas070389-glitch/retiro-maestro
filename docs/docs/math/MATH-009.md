# MATH-009: Inverse Calculation & Fiscal Formalization

## 1. Inverse Solver ($P \to S, T$)
The pension function $f(W, S, A)$ is non-linear but piecewise monotone. To find the required salary $S_{req}$ for a target $P_{target}$:

$$S_{req} = \frac{P_{target}}{factor(W, A) \cdot decreebonus}$$

Where $factor(W, A)$ encapsulates the basic amount + increments for a fixed age and week count.

### Solver Algorithm (Heuristic)
1.  **Baseline**: Calculate $P_{base}$ with current weeks and salary.
2.  **Delta**: If $P_{target} > P_{base}$, calculate the required percentage increase.
3.  **Salary Cap Protection**: 
    $$S_{calc} = \min(S_{req}, 25 \cdot UMA)$$
4.  **Temporal Extension**: If $S_{calc} = 25 \cdot UMA$ and result is still below target, increment $T$ (Time) until $P_{target}$ is reached or $T=5$.

## 2. Fiscal Modeling (ISR)
The monthly tax $T_{month}$ for a pension $P$ is calculated as:

$$T_{month} = ISR( \max(0, P - 15 \cdot UMA) )$$

*   **Exemption**: $15 \cdot UMA \approx \$53,000$ (Monthly).
*   **Net Pension**: $P_{net} = P - T_{month}$.

## 3. Inflation Compounding
Future Modalidad 40 costs $C_t$ for year $t$:
$$C_t = S \times rate_t \times (1 + i)^t$$
Where $i = 0.04$ (Inflation estimate) and $rate_t$ is the graduated IMSS cost.

---
## ⚖️ Sovereignty & Authority Ledger
| Metric | Value |
| :--- | :--- |
| **Document ID** | [MATH-009-PARITY] |
| **Security Rank** | Tier 5 (Actuarial) |
