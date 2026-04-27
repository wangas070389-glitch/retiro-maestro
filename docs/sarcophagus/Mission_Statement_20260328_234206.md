# Mission Statement: Administrative Tier Override (SaaS Bypass)

## Mission
To grant authoritative power to the System Administrator, enabling them to manually mutate the commercial tier of any registered user (from `FREE` to `GOLD` and vice versa) directly from the centralized Admin Portal, effectively granting infinite usage without requiring an external Stripe payment gateway.

## Functional Scope
* The `/admin/users` Dashboard MUST render an explicit "Tier" UI toggle, select menu, or action button next to each user record in the management table.
* The backend MUST provide a secure Server Action (e.g., `updateUserTierAction`) that mutates the `tier` parameter in the Prisma DB.
* This Server Action MUST forcefully verify that the executing session possesses `role: "ADMIN"` before permitting the payload update, ensuring strict vertical privilege escalation constraints.
* The frontend must optimistically refresh its state so the Admin instantly sees the tier transition.

## Anti-Objectives
* DO NOT construct custom Stripe checkouts or financial webhooks. This is purely a database write override for internal access management.
* DO NOT allow standard `USER`s or B2B `ADVISOR`s to mutate their own tiers. Only the `ADMIN` identity can execute this action.
* DO NOT alter the core multi-scenario engine or calculations. This epic strictly impacts gating/commercial metadata.
