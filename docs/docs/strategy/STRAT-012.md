# STRAT-012: Narciso Fidelity Restoration

## Proprietary Strategy
**Status**: ACTIVE
**Owner**: Antigravity
**Date**: 2026-02-18

## 1. Executive Summary
The migration to Next.js (`STRAT-010`) successfully secured the application's logic and data. However, a "Technical Gap" has emerged in the visual presentation. The current "Full Dark Mode" implementation lacks the premium, high-contrast "Hybrid" aesthetic of the original Narciso V32 prototype.

This strategy mandates the **Visual Restoration** of the application to match the prototype's fidelity while retaining the new server-side security.

## 2. The "Narciso Gap"
| Element | Prototype (Target) | Current Platform (Gap) |
| :--- | :--- | :--- |
| **Theme** | **Hybrid** (Light Canvas / Dark Command) | Full Dark Mode |
| **Canvas** | `Slate-50` (Clean, Paper-like) | `Slate-900` (Crypto-like) |
| **Cards** | White with complex shadows & gradients | Dark Slate with simple borders |
| **Typography** | High-contrast Slate-900/600 | Low-contrast White/Slate-400 |

## 3. Strategic Pillars

### Pillar A: The "Sovereign Executive" Aesthetic
The user constitutes a "Sovereign Executive." The interface must feel like a high-end financial instrument (Bloomberg Terminal meets Private Banking), not a generic crypto dashboard.
-   **Light Mode Canvas**: Signals clarity, transparency, and "official" documentation.
-   **Dark Mode Sidebar**: Signals the "Command Center" or "Engine" controls.

### Pillar B: Visual Continuity
The user must not feel they have "lost" features during the migration. If the prototype had a specific gradient or shadow, the production app must replicate it 1:1 using Tailwind utility classes.

## 4. Execution Roadmap
1.  **ADR-012**: Formalize the "Hybrid Theme" decision.
2.  **Global Reset**: Switch `globals.css` to Light Mode base.
3.  **Component Restoration**: Refactor `Dashboard`, `StrategyCards`, and `InverseDesign` to support the Hybrid theme.
4.  **Visual Verification**: Side-by-side comparison with legacy screenshots.

## 5. Success Metrics
-   **User Approval**: "Looks like before" (Qualitative).
-   **Lighthouse Accessibility**: >95 (Contrast ratios are better in high-contrast light mode).
