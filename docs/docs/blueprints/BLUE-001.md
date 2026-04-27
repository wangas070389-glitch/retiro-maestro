# 🏗️ Blueprint: Retiro Maestro Core

Architecture design for the deterministic pension projection engine and its associated auditing layers.

## C4 Model
*   **Context (L1)**: Mexican workers (Users) providing IMSS statements. Integration with legal databases for UMA/SMDF anchors.
*   **Container (L2)**:
    *   **Actuarial Engine**: A pure TypeScript service implementing MATH-001.
    *   **Sentinel Audit Store**: Append-only ledger of calculated projections.
    *   **Digital Twin Frontend**: Visual time-series representation of retirement scenarios.

## Topology & Gravity Well
*   **Dependency Flow**: `UI Layer` (Edge) → `Projection Logic` (Core) → `Actuarial Tables` (Bedrock).
*   **Gravity Well**: All state flows into the **Immutable Projection Record**.

## Anatomy & Boundaries
*   **Vertical Slices**:
    *   `/data`: Legal anchors (UMA, SMDF, INPC).
    *   `/engine`: The deterministic formula implementation.
    *   `/ui/scenarios`: Component-based scenario visualization.
*   **Table Sovereignty**: 
    *   `ProjectionsMetaData`: Owned by Audit service.
    *   `ActuarialFactors`: Owned by Legal sync service.

## Agentic Manifest
```json
{
  "project": "Retiro Maestro Engine",
  "tools": [
    {
      "name": "calculate_pension",
      "describe": "Deterministic engine implementing IMSS Ley 73. Requires Weeks, Salary, and Age.",
      "parameters": ["weeks", "salary_prom", "birth_date", "wives_count", "children_count"]
    }
  ]
}
```