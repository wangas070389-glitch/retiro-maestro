# 🏗️ Blueprint: Digital Twin Simulation Platform

Structural design for the interactive A/B scenario testing dashboard.

## C4 Model
*   **Context (L1)**: User interacting with sliders to explore "What-If" retirement scenarios.
*   **Container (L2)**:
    *   **Simulation Manager (Zustand)**: Orchestrates scenario state.
    *   **Scenario Comparison View**: Grid layout for A/B side-by-side metrics.
    *   **Actuarial Plotter**: Time-series visualization of pension growth vs investment costs.

## Topology & Gravity Well
*   **Dependency Flow**: `UI Sliders` → `State Store` → `Deterministic Engine` (MATH-001) → `Projection Ledger`.
*   **Gravity Well**: The **ROI Breakeven Point** ($T_{be}$) is the central metric everything flows into.

## Anatomy & Boundaries
*   **Vertical Slices**:
    *   `/simulation/inputs`: Debounced slider logic and legal cap enforcement.
    *   `/simulation/comparison`: Logic for diffing two `PensionResult` objects.
    *   `/charts`: Durable visualization components using standard scales.
*   **Table Sovereignty**: 
    *   `LocalScenarios`: Transient state owned by the client session.
    *   `SavedProjections`: Persistent state owned by the User Ledger.

## Agentic Manifest
```json
{
  "project": "Retiro Maestro Simulation",
  "tools": [
    {
      "name": "compare_scenarios",
      "describe": "Diffs two pension engine results to show delta in monthly income and ROI.",
      "parameters": ["scenario_a", "scenario_b"]
    },
    {
      "name": "enforce_legal_caps",
      "describe": "Caps inputs based on current UMA/SMDF levels (e.g., max 25 UMAs).",
      "parameters": ["salary_input", "uma_anchor"]
    }
  ]
}
```
