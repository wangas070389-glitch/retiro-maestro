# STRAT-030: Admin User Control Panel (Super Tablero)

## Vision
Retiro Maestro has transitioned from an open platform to a strictly gated expert-tier application. To enforce operational security and exclusivity, the platform requires a centralized **Admin User Control Panel**. This "Super Tablero" will serve as the command center for system administrators to actively manage the lifecycle of every user identity within the system.

## Objectives
1. **Gatekeeping (Manual Authorization):** Move away from auto-approval. New registrations will be placed in a "pending" state until an Administrator manually approves them.
2. **Access Control (Blocking/Banning):** Provide administrators with a "kill switch" to immediately revoke access for malicious or inactive users without deleting their cryptographic forensic history.
3. **Identity Recovery (Password Reset):** Allow administrators to directly reset or assign temporary passwords for users who lose access, mitigating the need for complex email-based SMTP recovery flows.
4. **Visibility:** Provide a comprehensive table view of all platform users, their roles, tiers, and current status.

## Core Features
- **User Dashboard (`/admin/users`):** A strictly RBAC-protected route accessible only by `role === 'ADMIN'`.
- **Action Matrix:** 
  - Approve User
  - Block/Unblock User
  - Reset Password (direct mutation)
  - Change Role (User/Admin)
  - Change Tier (Free/Gold/Sovereign)

## Red Team Considerations (RED-019)
- **Self-Lockout:** An admin must never be able to block themselves or demote their own role to prevent catastrophic system lockouts.
- **Audit Trails:** Password resets performed by an admin should ideally be logged or generate an explicit notification to maintain forensic integrity.
- **Route Protection:** Both the UI route and the underlying Server Actions must double-verify the `ADMIN` role from the JWT token.
