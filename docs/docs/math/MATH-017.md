# MATH-017: Mathematical Model for Progressive Modalidad 40 Rates and Persona Rules

This document formalizes the mathematical and boolean logic rules governing progressive contribution rates for Modalidad 40 and dynamic user persona classification.

## 1. Progressive Modalidad 40 Rate Table (Article 218)

Under the Mexican Social Security Law, the employer-employee contribution rate for Modalidad 40 increases progressively each calendar year starting in 2023. Prior to 2023, the rate was flat.

### 1.1 Progressive Rate Formula
Let $Y$ be the calendar year of the payment. The total contribution percentage $R(Y)$ is defined as:

$$R(Y) = \begin{cases} 
      10.075\% & Y \le 2022 \\
      10.075\% + (Y - 2022) \times 1.096\% & 2023 \le Y \le 2029 \\
      18.800\% & Y \ge 2030 
   \end{cases}$$

### 1.2 Table of Rates ($2022 \to 2030$)

| Year ($Y$) | Contribution Rate $R(Y)$ |
| :--- | :--- |
| $\le 2022$ | 10.075% |
| 2023 | 11.171% |
| 2024 | 12.267% |
| 2025 | 13.363% |
| 2026 | 14.459% |
| 2027 | 15.555% |
| 2028 | 16.651% |
| 2029 | 17.747% |
| $\ge 2030$ | 18.800% |

### 1.3 Monthly Payment Calculation
For a simulated daily contribution salary $SBC_{sim}$ and monthly days $D_m$ (where $D_m$ is determined per month e.g., 30, 31, or 28), the monthly payment amount $P_{month}$ is:

$$P_{month} = SBC_{sim} \times D_m \times R(Y)$$

---

## 2. Dynamic User Persona Classification Rules

The classifier dynamically partitions users into 5 distinct diagnostic profiles based on current age ($Age$), active employment status ($Active \in \{\text{true}, \text{false}\}$), contributed weeks ($Weeks$), and date of last job termination ($TermDate$).

### 2.1 Rights Conservation Calculation (Vigencia)
Let $V_{weeks}$ be the conservation period in weeks:
$$V_{weeks} = \frac{Weeks}{4}$$

Let $T_{elapsed}$ be the number of weeks elapsed since $TermDate$ to the current date.
The rights conservation status is defined as:
$$\text{RightsActive} = \begin{cases} 
      \text{true} & T_{elapsed} < V_{weeks} \\
      \text{false} & T_{elapsed} \ge V_{weeks} 
   \end{cases}$$

### 2.2 Persona Classification Gates

* **Grupo 1: En edad de jubilación, cotizando (Activo)**
  $$\text{Gate}_1 = (Age \ge 60) \land (Active == \text{true})$$
  *Focus*: Comparing immediate retirement vs M40 strategy.

* **Grupo 2: En edad de jubilación, dado de baja (Inactivo)**
  $$\text{Gate}_2 = (Age \ge 60) \land (Active == \text{false})$$
  *Focus*: Vigilance of Rights Conservation. If $\text{RightsActive} == \text{false}$, prescribe reactivating for 52 weeks.

* **Grupo 3: Joven / Acumulación, cotizando (Activo)**
  $$\text{Gate}_3 = (Age < 60) \land (Active == \text{true})$$
  *Focus*: Continuous week accumulation, planning M40 at age 55.

* **Grupo 4: Joven / Acumulación, dado de baja (Inactivo)**
  $$\text{Gate}_4 = (Age < 60) \land (Active == \text{false})$$
  *Focus*: Monitoring depletion rate of rights conservation to avoid expiration before reaching age 60.

* **Grupo 5: Insuficiente / Sin Información**
  $$\text{Gate}_5 = (Weeks < 500) \lor (\text{Basic Ley 73 requirements not met})$$
  *Focus*: Compliance checklist (needs 500 weeks, first register before July 1st 1997, age $\ge 60$).
