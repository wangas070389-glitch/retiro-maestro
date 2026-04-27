# Mission Statement: Retiro Maestro — Hybrid Monetization Refactor

## 🎯 Unified Mission
To provide a hybrid, decision-first monetization infrastructure for Mexican pensioners (**B2C**) and professional advisors (**B2B**) by translating IMSS Ley 73 complexity into actionable financial growth, secured by tiered access and cryptographic integrity.

---

## 💰 Monetization Architecture

### 1. Citizen Segment (B2C - One-Time Payments)
| Tier | Name | Price (MXN) | Value Prop | Key Features |
| :--- | :--- | :--- | :--- | :--- |
| **FREE** | Básico | $0 | Awareness | Basic calculation, No strategies |
| **PAID 1** | Estrategia | $590 | Optimization | ROI Comparison, Strategy Cards, Deep Dive |
| **PAID 2** | Dossier | $1,490 | Authority | PDF Export, SHA-256 integrity, Legal-grade report |

### 2. Advisor Segment (B2B - Recurring Monthly)
| Plan | Price (MXN/mo) | Client Limit | Value Prop | Feature Set |
| :--- | :--- | :--- | :--- | :--- |
| **STARTER**| $990 | 5 Active | Practice Growth | Full Sim + Strategy, 150/extra client |
| **GROWTH** | $1,990 | 20 Active | Scale | Dossier Exports, Branding, 150/extra client |
| **PRO** | $3,990 | Unlimited | Institutional | Advanced Comp, Priority Support, White Label |

**"Active Client" Definition**: Any client with at least one simulation saved or updated in the last 30 days.

---

## 🛠️ Functional Scope (System Requirements)

1.  **State-Aware Feature Gating**: Centralized control of ROI Engine, Inverse Designer, and PDF generation based on User Role and Tier.
2.  **Dynamic Paywalls**: Inline interception of restricted features with contextual upgrade paths (Strategy $590 vs Dossier $1490).
3.  **Advisor CRM & Usage Tracking**: Hard enforcement of active client limits and usage-based billing logic.
4.  **Forensic Integrity Layer**: Generation of SHA-256 integrity bundles for the Dossier tier.
5.  **Executive Recommendation Layer**: Authority-driven high-end UI block for premium results analysis.

---

## 🛑 Anti-Objectives
*   **NO** bypassing of server-side gates; UI visibility is a fallback, but the Server Action MUST enforce data return.
*   **NO** "Citizen" accounts managing multi-client leads (Reserved for Advisors).
*   **NO** unlimited client creation for the Starter/Growth B2B tiers.

---
*Authored by @pm.*
