---
id: STRAT-031
title: Sovereign Profile Management
status: proposed
date: 2026-02-25
tags: [profile, identity, security]
---

# Sovereign Profile Management (STRAT-031)

## Executive Summary
This strategy defines the architectural and operational approach for empowering users to manage their personal cryptographic identities within the platform. By introducing the "Mi Perfil" interface, users will gain the autonomy to securely update their basic information (Name, Email) and cycle their authentication keys (Passwords), reinforcing the platform's core tenet of Sovereign Identity.

## Vision & Objectives
1. **Autonomy over Identity:** Users must possess a dedicated, intuitive interface to seamlessly alter their contact vectors and display names.
2. **Cryptographic Key Cycling:** Empower users to voluntarily rotate their passwords without requiring administrative intervention, mitigating the risk of compromised static credentials.
3. **Session Integrity:** Ensure that profile mutations dynamically reflect across the active NextAuth session and frontend layouts immediately upon execution.

## Core Mechanics
1. **Twin-Panel Layout:** The `/profile` interface will adopt a bifurcated structure:
   - *Panel 1 (General Information):* Facilitates the mutation of `name` and `email`.
   - *Panel 2 (Key Management):* Facilitates password rotation, requiring the previous password as an authorization gate.
2. **Zero-Trust Validation:** All payload mutations originating from the Client Component must be rigorously verified by Server Actions, guaranteeing the user is only modifying their own `User ID` row in the database.
3. **Graceful Error Handling:** If an email is already occupied by another tenant, or if the current password check fails during key rotation, the backend will reject the action and return a localized, non-crashing error state to the UI.

## Integration Path
This strategy directly integrates with `auth.ts` and the Prisma schema outlined in previous chapters, utilizing `bcrypt` for all downstream password hashing procedures. 
