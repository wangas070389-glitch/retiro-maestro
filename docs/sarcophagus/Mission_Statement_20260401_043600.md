# Mission Statement: Sovereign Monetization Consolidation (Deep Blue Phase)

## 🎯 Unified Mission
To resolve the systemic "Monetization Schism" by deprecating the legacy `GOLD` tier and consolidating all project lifecycles into the definitive **Hybrid B2B2C Model**. This ensures that both Citizens (B2C) and Advisors (B2B) operate under a single, unified, and conflict-free authorization engine that eliminates technical debt and payment logic collision.

---

## 🛠️ Functional Scope (System Requirements)

1.  **Legacy Deprecation**: Complete removal of the `GOLD` tier from the codebase, replacing it with the granular Citizen (`STRATEGY`, `DOSSIER`) and Advisor (`STARTER`, `GROWTH`, `PRO`) tiers.
2.  **Schema & Logic Synchronization**: 
    - Updating `prisma/schema.prisma` comments to reflect the definitive tiers.
    - Synchronizing `lib/config/pricing.ts` as the sole source of truth.
    - Updating `lib/trial-guard.ts` and `access-control.ts` to recognize the new hierarchy.
3.  **UI Unification**:
    - Purging all legacy "Gold" references from the Admin "Super Tablero" and Portfolio pages.
    - Implementing the single, definitively designed `ProductPaywall.tsx` as the only payment interface.
4.  **Payment Guardrails**: Updating `monetization-actions.ts` to strictly validate `Role-Tier` compatibility during the upgrade process.

---

## 🛑 Anti-Objectives
*   **NO Symmetric Tiers**: `GOLD` is a dead concept. Do not attempt to map it to a new tier; migrate it to the current B2C/B2B models.
*   **NO Redundant Paywalls**: Delete all components that do not align with the `ProductPaywall` architecture.

---
*Authored by @pm.*
