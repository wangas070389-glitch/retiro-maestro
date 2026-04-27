# Mission Statement: Super-Persona Authorization (Admin-Advisor Synergy)

## 🎯 Unified Mission
To dissolve the functional silos between system administration and professional advisory by implementing a recursive authorization model where the `ADMIN` role acts as a functional superset of the `ADVISOR` role, enabling administrators to manage the platform and their own client portfolios within a single unified experience.

---

## 🛠️ Functional Scope (System Requirements)

1.  **Privilege Inheritance**: Refactoring the RBAC (Role-Based Access Control) layer to ensure `checkUserAccess('ADVISOR')` returns `true` for any user with the `ADMIN` role.
2.  **Unified Navigation**: Dynamic rendering of the Sidebar to include "Mis Clientes" and "Simulador Pro" for both Advisor and Admin personas.
3.  **Relational Compatibility**: Ensuring `User.advisorId` and `Client.advisorId` can resolve to a User with the `ADMIN` role without breaking relational integrity.
4.  **Action Parity**: Granting `ADMIN` users access to all `advisor-actions.ts` functions (claiming leads, managing clients, generating professional reports).

---

## 🛑 Anti-Objectives
*   **NO Symmetric Inheritance**: Advisors MUST NOT gain Admin privileges. The hierarchy is strictly unidirectional.
*   **NO Database Schema Changes**: This must be achieved through logic abstraction in the Edge/Core boundary, not a migration of the `Role` enum if possible.

---
*Authored by @pm.*
