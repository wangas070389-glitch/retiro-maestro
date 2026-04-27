# Mission Statement: Native Role Allocation (B2B SaaS Onboarding)

## Mission
To empower the Registration Gateway for New Visitors by dynamically allocating their intrinsic identity (Standard User vs. B2B Advisor) upon sign-up, instantly configuring their environment boundaries and commercial paths.

## Functional Scope
* The `/register` UI must possess an explicit selector allowing a user to register either as a Standard User or a B2B Advisor.
* The backend Auth Action must securely intercept this payload and write the corresponding Enum or String (`USER` | `ADVISOR`) to the PostgreSQL / SQLite standard Prisma database payload upon creation.
* The system must subsequently trigger the designated `trialSimulationsUsed` schema safely based on the role to synchronize the SaaS gating mechanisms created in previous cycles.

## Anti-Objectives
* DO NOT alter the core login schemas for existing legacy users.
* DO NOT overcomplicate the form with multiple redundant fields or heavy onboarding forms (keep it as a frictionless one-click role selector).
* DO NOT manage Stripe integrations or payment webhooks at this stage; this is purely an identity definition gate.
