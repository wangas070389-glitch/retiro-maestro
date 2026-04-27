# STRAT-010: Server-First Architecture & Sovereign Persistence

## 1. Mission Statement
To **Elevate Retiro Maestro** from a client-side simulation to a **Sovereign Digital Platform** by implementing a **Server-First Architecture** (Next.js 14+) and **Immutable Persistence Layer** (PostgreSQL), ensuring data integrity, session continuity, and alignment with the **GenericContext-Geminis** mandate for "Real Money" infrastructure.

## 2. Technical Justification
*   **Security**: Computation logic (`PensionEngine`) must move to the server to prevent client-side manipulation of "Real Money" projections.
*   **Persistence**: Users need to save multiple scenarios ("Inercial", "Rampa", "Topado") and return to them later. LocalStorage is insufficient for "Sovereign" data.
*   **Performance**: React Server Components (RSC) will reduce the client bundle size by offloading the heavy Actuarial Engine and PDF Generation libraries to the server.

## 3. Architecture Stack
*   **Framework**: Next.js 14+ (App Router)
*   **Database**: PostgreSQL 16 (via Docker or Neon)
*   **ORM**: Prisma or Drizzle (Type-Safe Database Access)
*   **Auth**: NextAuth.js v5 (Stateless Sessions) / Iron Session
*   **Styling**: Tailwind CSS (Existing) + Shadcn UI (Server Compatible)

## 4. Migration Strategy (The "Strangler Fig" Pattern)
1.  **Initialize**: Create `src/app` (Next.js) alongside `src/pages` (Vite).
2.  **Migrate Logic**: Move `src/engine` to `src/lib/engine` (Server-Side safe).
3.  **Refactor Components**: Convert `StrategyCards`, `Escalera`, etc., to use Server Actions for data fetching.
4.  **Database Schema**: Define `User`, `Simulation`, `Strategy` tables.
5.  **Cutover**: Switch entry point from `main.tsx` (Vite) to `layout.tsx` (Next.js).

## 5. Key Deliverables
*   **Server Action Registry**: `actions/calculatePension.ts`, `actions/saveStrategy.ts`.
*   **Database Schema**: `schema.prisma` with relational integrity.
*   **Secure Session**: Encrypted user cookies for session persistence.
*   **API Parity**: Endpoints that match the current local calculation outputs.

## 6. Risk Analysis (Red Team)
*   **Latency**: Server round-trips for real-time sliders (Escalera) might feel sluggish. *Mitigation: Optimistic UI updates.*
*   **Complexity**: Managing DB state vs Client state. *Mitigation: Use URL Search Params as the "Source of Truth" for shared simulations.*

---
## ⚖️ Sovereignty & Authority Ledger
| Metric | Value |
| :--- | :--- |
| **Strategy ID** | [STRAT-010] |
| **Security Tier** | Tier 1 (Infrastructure) |
| **Protocol Scope** | P31 (Server-First), P9 (Immutable) |
