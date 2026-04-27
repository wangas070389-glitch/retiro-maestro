# STRAT-013: Narciso UX Evolution

## Proprietary Strategy
**Status**: DRAFT
**Owner**: Antigravity
**Date**: 2026-02-18

## 1. Executive Summary
The "Retiro Maestro Ley 73" prototype (`prototype_retiromaestro73.txt`) represents the target state for the **Sovereign Interface**. It introduces advanced separate modules ("Laboratory" and "Authority") and a refined visual language that goes beyond the current Dashboard.

This strategy defines the roadmap to evolve the current Next.js application into the full **Sovereign Suite**, bridging the gap between the current "Calculator" state and the "Comprehensive Retirement Operating System" shown in the prototype.

## 2. The "Sovereign Gap"
| Module | Current State | Target State (Prototype) |
| :--- | :--- | :--- |
| **Dashboard** | Basic Inputs & Cards | integrated "Escalera" Projection & Status Badges |
| **Laboratory** | *Missing* | **Tax Calculator (ISR)**, **Retroactive Payment**, **Loan Simulator** |
| **Authority** | *Missing* | **Document Generator** (Alta M40, Renuncia), **Payment Calendar** |
| **Visuals** | Basic Tailwind | Rich `Lucide` Icons, `Badge` System, Deep Blue Branding |

## 3. Strategic Pillars

### Pillar A: The Trinity Architecture
The application layout will be restructured into three distinct domains (as defined in the prototype's navigation):
1.  **Command (Dashboard)**: High-level overview, "Escalera", and primary Strategy Cards.
2.  **Laboratory (Tools)**: Interactive simulators for ISR, Retroactive payments, and Family composition.
3.  **Authority (Docs)**: Official document generation and legal feedback.

### Pillar B: Component Atomicity
We will adopt the granular UI patterns from the prototype:
-   **Smart Cards**: Standardized containers with consistent padding/shadows.
-   **Status Badges**: `success`, `warning`, `danger` badges for instant visual feedback.
-   **Interactive Sliders**: For "What-If" scenarios in the Laboratory (e.g., changing Tax brackets or Retroactive months).

## 4. Execution Roadmap (Phase 6+)
1.  **ADR-013**: Formalize the "Trinity Module" architecture.
2.  **Component Library Expansion**: Port `Card`, `Badge` and `Lucide` icon set from prototype.
3.  **Module Implementation**:
    -   **Phase 6.1**: **The Laboratory** (Implement `TaxEngine` UI and `Retroactive` UI).
    -   **Phase 6.2**: **The Authority** (Implement Document Templates & Generators).
    -   **Phase 6.3**: **Dashboard Refinement** (Integrate "Escalera" visualization).

## 5. Success Metrics
-   **Feature Parity**: 100% implementation of Prototype features (Tax, Retro, Docs).
-   **Visual Fidelity**: 1:1 match with the provided "Deep Blue" / "Clean White" aesthetic.
