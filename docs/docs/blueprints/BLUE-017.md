# BLUE-017: Inverse UI Component Architecture

## 🧬 Component: InverseDesign

The InverseDesign component is a high-performance interactive panel that bridges the gap between user intent and actuarial reality.

## 🔄 Data Flow
1. **User Input (`targetPension`)**: Controlled via massive input, slider, or quick-select reference points ($20k, $30k, Max). Re-triggers calculation loop on change.
2. **Denominational Factor**: Calculated once per render based on projected weeks and age factors.
   - `Factor = 365 * Bracket_Rate * Age_Factor * Family_Factor * 1.11`
3. **Required SBC**: `(Target_Pension * 12) / Denominational_Factor`
4. **Validation (Viability)**: SBC is capped at `min(calculated, 25 * UMA)`. If impossible under current law, the `isPossible` flag triggers a strict warning banner.
5. **Differential Comparison**: Automatically subtracts current inertial pension from `targetPension` to show the exact improvement step.
6. **M40 Investment**: Prioritized as the dominant KPI. Calculated as `Capped_SBC * 30.416 * 0.14438 (2026 Rate)`.

## 🎨 Design Tokens & Hierarchy
- **Primary Layout**: 2-Column Split (Left: Input & Context, Right: Actionable Plan).
- **KPI Hierarchy**: 
  1. `Inversión Mensual` (Largest size, `text-6xl text-emerald-400`).
  2. `Duración Estimada` (Months).
  3. `Salario Diario` and `UMAs` (Secondary Technicals).
- **Background**: `bg-[#0b0f1a]` with ambient blurs for a premium SaaS feel.
- **Microcopy**: Transformational and authoritative ("Define tu meta y descubre exactamente...").

## 💾 Persistence
Strategies saved via `InverseDesign` are flagged as `type: "CUSTOM"` in the database to distinguish them from standard strategy cards.
