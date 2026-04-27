# Mission Statement: Dual-Persona Monetization & UX Alignment

## Mission
To reconstruct the Profile and Legal interface layouts to respect the strict roles of organic Users vs professional Advisors, ensuring contextual monetization messaging and eliminating feature leakage.

## Functional Scope
*   **Role-Based Profile Context:** Modify the `/profile` UI so organic Users (`USER` role) do not see the "Identidad Marca Blanca" configuration meant for B2B Advisors. The profile must be clean and contextual to the user's own data.
*   **Monetization Relocation:** Extract the "Escalamiento Institucional" (Upgrade to Gold) section out of the "Panel Legal & Auditoría" (`/authority`) and strictly embed it within the `/profile` interface for all roles.
*   **Dynamic Up-Sell Copy:** The relocated Up-Sell section in `/profile` must natively read the session role:
    *   If `USER`: Showcase the B2C SaaS value proposition (e.g., "Licencia Premium Anual", private calculations, direct assignments).
    *   If `ADVISOR`: Showcase the B2B SaaS value proposition (e.g., "Licencia Institucional Gold", white-label reports, CRM expansion).
*   **Purified Legal Panel:** The `/authority` panel must remain strictly a functional workspace for document generation and compliance, completely omitting billing marketing.

## Anti-Objectives
*   **No Gateway Mutations:** Do not alter the Stripe billing mechanisms or backend upgrade actions. This is solely a DOM/UI conditional restructuring phase.
*   **Schema Stability:** Do not alter the `User` or `Subscription` records. Rely exclusively on the existing `session.user.role` to branch the UI trees.
