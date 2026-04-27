# BLUE-022: Multi-Tenant Data Persistence

## 1. Overview
Schema and isolation design for the SaaS multi-user environment.

## 2. Database Schema (Prisma)
```prisma
model User {
  id            String       @id @default(cuid())
  email         String       @unique
  name          String?
  role          Role         @default(USER)
  subscriptions Subscription[]
  simulations   Simulation[]
}

model Simulation {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  input_json      String   // Normalized inputs
  result_json     String   // Signed results
  integrity_hash  String   // SHA-256 (ADR-004)
  is_forensic     Boolean  @default(false)
  createdAt       DateTime @default(now())
}
```

## 3. Isolation Layer
- **Middleware**: Every Prisma call in a Server Action must be wrapped in a `withTenant` function that injects the `userId` from the session.
- **RLS (Postgres)**: Implementation of `CREATE POLICY` to ensure that even at the SQL level, users cannot see each other's simulations.

## 4. Export Protocol (Protocol 23)
-   Users can request a "Full Sovereign Export" (zip) containing their `User` metadata and all `Simulation` records as individual `ForensicBundles`.

## 5. Metadata
- **Status**: PROPOSED
- **Strategy**: STRAT-021
- **Domain**: Data-Layer
