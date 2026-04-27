# Mission Statement: Administrative User Deletion (Lifecycle Management)

## 🎯 Unified Mission
To empower administrators with the absolute authority to purge user identities and their associated data from the "Super Tablero" ecosystem, ensuring a clean, sovereign state and total lifecycle control for the Retiro Maestro platform.

---

## 🛠️ Functional Scope (System Requirements)

1.  **Administrative Deletion UI**: Integration of a "Delete" (Basura/Eliminar) action within the "Admin Usuarios" table.
2.  **Destructive Server Action**: Implementation of a high-privilege `deleteUserAction` that purges user records (and cascading dependencies like Simulations) from the database.
3.  **Fail-Safe Confirmation**: Mandatory double-opt-in confirmation modal with visual "Danger" state to prevent accidental identity loss.
4.  **Authorization Hard-Gate**: Server-side enforcement ensuring ONLY users with the `ADMIN` role can execute this destructive primitive.

---

## 🛑 Anti-Objectives
*   **NO Self-Destruction**: The system MUST NOT allow an active administrator to delete their own account.
*   **NO Soft-Deletes**: This is a request for data purging, not archival. Records must be removed from the physical ledger.
*   **NO Bulk Deletion**: At this stage, deletion remains a 1-to-1 operation to maintain auditability.

---
*Authored by @pm.*
