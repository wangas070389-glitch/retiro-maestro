# MATH-008: Adversarial Edge Case Matrix

Formalizing the boundary conditions for automated stress-testing.

## 1. Boundary Probe Matrix ($P_{edge}$)

| Metric | Min Boundary | Max Boundary | Extreme/Fuzz |
| :--- | :--- | :--- | :--- |
| **Weeks ($W$)** | 500 (Min) | 2750 (~52 yrs) | 99999 |
| **Age ($A$)** | 60 (Min) | 100 (Actuarial) | -1 or 200 |
| **Salary ($S$)** | SMDF ($>200$) | 25 UMA ($<2600$) | 0.01 or 1e9 |
| **Allowance ($f$)** | 0.8 / 0.1 | 1.0 (Ley 73) | 0.0 |

## 2. Logical Invariants ($I$)

The engine must strictly adhere to the following inequalities:
1. **Monotonicity of Weeks**: 
   $$\frac{\partial P}{\partial W} \geq 0$$
   *Increasing weeks must never decrease the pension.*

2. **Monotonicity of Salary**: 
   $$\frac{\partial P}{\partial S} \geq 0$$
   *Increasing salary must never decrease the pension.*

3. **Cap Invariant**:
   $$P \leq S \cdot factor \cdot decree$$
   *The pension cannot mathematically exceed its base salary inputs after decree adjustments.*

## 3. Fuzzing distribution ($F$)
Input generation follows a Poisson distribution for realistic values, with "Spikes" at boundary conditions:
* $S \in \{SMDF, 25 \cdot UMA, 25 \cdot UMA + 0.01\}$
* $W \in \{500, 501, 2750\}$

---
## ⚖️ Sovereignty & Authority Ledger
| Metric | Value |
| :--- | :--- |
| **Document ID** | [018db58e-MATH-008-b1d4-f6a1f9f87dec] |
| **Consensus State** | [APPROVED] |
