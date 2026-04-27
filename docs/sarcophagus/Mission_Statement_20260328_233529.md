# Mission Statement: B2B2C Advisor Code & Client Discount Gateway

## Mission
To construct a B2B2C referral gateway allowing standard Users to bind their accounts to a specific Professional Advisor via an "Advisor Code" during or after onboarding, unlocking a subsidized annual platform management fee ($200 MXN instead of $499 MXN) to view their advisor-managed pension projections.

## Functional Scope
* The system MUST generate and expose a unique "Advisor Code" (e.g., short referral string) within the Advisor's dashboard/profile.
* The `/register` flow MUST include an optional input field for "Código de Asesor" when registering as a Standard User.
* The backend Auth Action MUST validate the Advisor Code against existing Advisor accounts and, if matched, establish the foreign key relationship (`advisorId` on the User schema).
* The paywall and pricing UI MUST read the `advisorId` existence on the user's session. If bound to an advisor, the annual fee requirement must drop from $499 MXN to $200 MXN.
* The Client Dashboard MUST allow the client to view the projections and PDF dossiers previously saved or calculated by their Advisor.

## Anti-Objectives
* DO NOT build a complex multi-tenant hierarchy; standard one-to-many relationship (`Advisor` -> `User[]`) using Prisma's existing fields is sufficient.
* DO NOT manage real money transactions or webhooks (Stripe/Paypal) in this epic, this is strictly a pricing logic and DB state mutation.
* DO NOT allow Advisors to see other Advisors' clients. Isolation rules apply strictly between bound clusters.
