# Mission Statement: Paywall Enforcement & Lead Gen Injection in Legal Panel

## Mission
To enforce monetization tiers across the Legal & Audit Panel by hard-locking strategic compliance features behind the Gold/Premium subscription layer, while simultaneously injecting a direct Lead Generation pipeline ("Solicitar Asesor") for organic free-tier users.

## Functional Scope
*   **Feature Lockout (Paywall):** All operational zones inside `/authority` (Generador de Escritos, Calendario Inteligente, Dossier Soberano, Oracle Pulse) must be visually locked (disabled state or overlaid with a lock) if the session user's tier is `FREE`.
*   **Visual Teasing:** Free users must be able to *see* the tools' value proposition and interface, but interacting with them should be blocked, nudging them towards the specific Upgrade flow natively.
*   **B2C Lead Generation Pipeline:** Inside `/authority`, if `user.role === 'USER'` and `session.user.advisorId` is null, render a prominent action boundary to "Solicitar un Asesor". This will feed directly into the B2B2C Auction Engine, pushing the user into the `PENDING_INTERNAL` pool for routing.

## Anti-Objectives
*   **No Total Obfuscation:** Do not completely hide the Legal features with `if (tier !== 'GOLD') return null`. The UI must render the tools in a "Locked" state to serve as an ambient, continuous up-sell mechanic.
*   **No Duplicate Auction Logic:** Do not rewrite the core Matchmaking SLA engine. Rely entirely on the existing routing infrastructure built during Epic 17.
