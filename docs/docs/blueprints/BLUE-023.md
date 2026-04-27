# BLUE-023: Inertial Reporting Engine

## 1. Architectural Overview
The Inertial Reporting system is a specialized pipeline within the `Authority` module that consumes a "frozen" snapshot of the `PensionEngine`'s calculation and emits a legally formatted PDF (Acta Inercial).

## 2. Component Diagram
```mermaid
graph TD
    A[Dashboard Input] --> B[PensionEngine.calculate]
    B --> C[PensionEngine.calculateProjection - inercial]
    C --> D[RetirementReport Props]
    D --> E[@react-pdf/renderer]
    E --> F[Acta_Inercial.pdf]
    B --> G[Sovereign State Handshake]
    G --> H[Prisma DB - Strategy ID: INERCIAL]
```

## 3. Data Schema
The "Inercial" projection differs from standard strategies by enforcing:
- `investment = 0`
- `salary_growth = 0` (unless otherwise requested for inflation)
- `is_ongoing_work = true/false` (Toggle logic: If true, weeks accumulate. If false, weeks remain static for "point-in-time" forensic snapshots).

## 4. Implementation Details

### PensionEngine Extension
- **Static vs Dynamic**: The `calculateProjection` engine supports a toggle for ongoing work. When `is_ongoing_work` is disabled, the simulation maintains the initial week count across all future years.
- **Tax Integrity (ISR)**: The engine now includes a `calculateISR` method that applies Mexican tax laws (15 UMA exemption) to provide both **Gross** and **Net** pension amounts, ensuring financial transparency.

### Dashboard Unification
The Dashboard now integrates tools previously in the isolated "Laboratory":
- **Retroactive Simulator**: Allows injecting buy-back weeks into the main calculation.
- **Cargas Familiares**: Dynamic inputs for Hijos and Padres affect the pension percentage immediately.

## 5. Security & Verification
- **Adversarial Integrity**: The "Inercial" report must be un-editable within the Dashboard after generation to prevent "hallucinated" baselines.
- **Veto Check**: If a user attempts to generate an "Inercial" report with weeks higher than their current authenticated count (without proving ongoing work), the Sentinel (P17) should flag it.
