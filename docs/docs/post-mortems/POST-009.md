---
id: POST-009
title: Empowering the Individual Actor
status: published
date: 2026-02-25
tags: [post-mortem, ux, autonomy]
---

# Empowering the Individual Actor (POST-009)

## The Catalyst
Following the transition to the "Gated Sanctuary" model (POST-008), the platform became heavily reliant on the `ADMIN` role for practically all user lifecycle events. Administrators had to manually approve access (`isApproved`), manage suspensions (`isBlocked`), and, crucially, override forgotten passwords via the Super Tablero. This created an administrative bottleneck and stripped autonomy from the standard `USER` tier regarding basic identity tracking.

## The Strategy Shift
To counterbalance the heavy centralization of the Gated Sanctuary, we initiated the Sovereign Profile Management (STRAT-031) feature. This initiative deliberately delegates specific, low-risk data mutations (Name, Email, Password) back to individual users via a dedicated `/profile` Client interface.

## Lessons Learned
1. **The Cost of Centralization:** While locking down registration was a necessary defensive maneuver against algorithmic theft, failing to provide a localized settings panel meant standard users felt trapped within the system, requiring admin help merely to correct a typo in their display name.
2. **Server Action Decoupling:** We realized that combining the identity actions (`updateProfileInfoAction`, `updatePasswordAction`) with the administrative actions (`admin-actions.ts`) was an anti-pattern. By decoupling them into `user-actions.ts` (ADR-033), we ensured that lateral movement attacks were impossible; a standard user simply has no execution path to administrative logic.
3. **Session Rehydration:** We learned during the Super Tablero implementation that NextAuth requires explicit mapping of custom schema columns into the JWT. Ensuring `role` and `tier` are mapped correctly allows the frontend to intelligently route users to `/profile` while rendering `/admin` tools solely for authorized personnel.
