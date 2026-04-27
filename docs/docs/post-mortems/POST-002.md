# POST-002: Sovereign Unification & Fragmented UX Remediation

## 📅 Timeline: February 2026
**Issue**: Fragmentation of the user experience due to the coexistence of a standalone "Laboratory" and a primary "Dashboard". Experimental tools (ISR, Retroactive, Loan) were isolated, leading to "data silos" and user confusion.

## 🔍 Root Cause
The Laboratory was initially designed as a low-risk sandbox. However, as the actuarial engine matured, the "sandbox" became the primary area of interest for professional users, while the Dashboard remained too "inertial". This created a split state where users had to jump between pages to complete a single forensic plan.

## 🛠️ Resolution (ADR-021)
1.  **Consolidation**: Decommissioned `laboratory/page.tsx` and moved all logic into interactive sections within `dashboard/page.tsx`.
2.  **State Unification**: Integrated "injectable weeks" directly into the main calculation flow.
3.  **Forensic Sello**: Activated the `DossierBuilder` to seal Simulations directly from the Dashboard, removing the need for a separate "Save to Lab" step.

## 💡 Lessons Learned
- **Aesthetic Sovereignty**: A "Sandbox" shouldn't look like a different app. High-stakes tools belong in the primary command center.
- **State Propagation**: Real-time feedback loops (e.g., seeing pension change as you buy retroactive weeks) are more powerful than static sandboxes.
- **Documentation Debt**: Technical debt in the `PensionEngine` interface was exposed during the unification (ISR insertion).
