# Retiro Maestro: Plataforma Soberana (Next.js Edition)

**Version 2.0 - Server-First Architecture**

## Overview
Retiro Maestro has been migrated from a Client-Side SPA (Vite) to a robust **Next.js 14+ Server-First Application**. This architecture ensures data sovereignty, secure authentication, and immutable record-keeping for pension strategies.

### Key Pillars
1.  **Sovereign Identity**: Secure Authentication via `NextAuth.js`.
2.  **Sovereign Logic**: Server-Side execution of the `PensionEngine` (no client-side logic tampering).
3.  **Sovereign Record**: User data and strategies are persisted in a secure Postgres database (via Prisma).

## Architecture

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | Core Application & Routing |
| **Logic** | Server Actions | Private execution of Actuarial Math |
| **Database** | PostgreSQL (via Prisma) | Persistent Storage for Users & Strategies |
| **Auth** | NextAuth v5 (Beta) | Secure Sessions & Credential Management |
| **Styling** | Tailwind CSS (Narciso) | "High-Contrast / Cleared" Design System |

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

1.  Navigate to the platform directory:
    ```bash
    cd next-platform
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Initialize Database (Local SQLite for Dev):
    ```bash
    npx prisma generate
    npx prisma db push
    ```

4.  Start the Development Server:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000)

## Features Implemented (Phase 1-3)

-   [x] **Server-Side Pension Engine**: Migrated `pension-engine.ts` to secure API layer.
-   [x] **Authentication**: Login/Register flows with bcrypt password hashing.
-   [x] **Dashboard**: Protected route displaying user stats ("Sovereign Identity").
-   [x] **Interactive Tools**:
    -   **Inverse Design**: Calculate required salary for a target pension.
    -   **Strategy Cards**: Compare "Rampa" vs "Topado" strategies with real-time tax calculation.
-   [x] **Persistence**: Save strategies directly to the database ("Expediente Soberano").

## Project Structure

```
next-platform/
├── prisma/                 # Database Schema (SQLite/Postgres)
├── src/
│   ├── actions/            # Server Actions (Secure Logic)
│   │   ├── auth-actions.ts
│   │   ├── calculate-pension.ts
│   │   └── save-strategy.ts
│   ├── app/                # App Router (Pages & Layouts)
│   ├── components/         # Client Components (Interactive UI)
│   │   ├── inverse-design.tsx
│   │   └── strategy-cards.tsx
│   └── lib/                # Shared Logic (Engines)
│       ├── db.ts           # Prisma Client Singleton
│       └── engine/         # Actuarial & Tax Engines
```

## Next Steps

- [ ] Deploy to Vercel/Docker
- [ ] Implement Admin Dashboard
- [ ] Connect Real-Time UMA API
