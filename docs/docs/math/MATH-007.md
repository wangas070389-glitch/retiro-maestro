# MATH-007: ROI & Breakeven Formalization

Mathematical specifications for the ROI Intelligence layer.

## 1. Graduated Cost Function ($C(y)$)

The cost $C$ for a given year $y$ depends on the SBC multiplier ($m$) and the reform rate $R_y$:

$$R_y = \begin{cases} 
0.11166 & \text{for } 2023 \\
0.12256 & \text{for } 2024 \\
0.13347 & \text{for } 2025 \\
\dots \\
0.18800 & \text{for } 2030+ 
\end{cases}$$

$$C(y, m) = (SBC_{m}) \cdot R_y$$

## 2. Recovery Index ($R_{idx}$)

The month $M$ where the cumulative benefit exceeds the cumulative cost:

$$\sum_{i=1}^M \text{Pension}(i) \geq \sum_{j=1}^{\text{Invest\_Months}} C(j)$$

## 3. Total Return on Investment ($ROI_{total}$)

$$ROI_{total} = \frac{\text{Net Wealth Gain}_{85}}{\text{Total Investment Cost}}$$

## 4. Opportunity Cost ($O_c$)

$$O_c = \text{Total Investment} \cdot (1 + r_{cetes})^t$$
*   Where $r_{cetes}$ is the risk-free rate (e.g., 11% annual).

---
## ⚖️ Sovereignty & Authority Ledger
| Metric | Value |
| :--- | :--- |
| **Document ID** | [018db58e-MATH-007-b1d4-f6a1f9f87dec] |
| **Consensus State** | [APPROVED] |
