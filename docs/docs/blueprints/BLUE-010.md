# BLUE-010: Server-Side System Blueprint

## C4 Model: Container View

```mermaid
C4Container
    title Container Diagram for Retiro Maestro V2 (Server-First)

    Person(user, "Retiree / Planner", "Uses the simulation tools")

    Container_Boundary(app_boundary, "Retiro Maestro Platform") {
        Container(web_client, "Web Client", "React / Zustand", "Interactive UI, Sliders, Escalera Visualization")
        Container(next_server, "Next.js Server", "Node.js / Server Actions", "Auth, Validation, PDF Generation, API")
        ContainerDb(database, "Sovereign DB", "PostgreSQL", "Stores User Profiles, Simulations, and Strategies")
    }

    Rel(user, web_client, "Interacts with", "HTTPS")
    Rel(web_client, next_server, "Submits Data / Requests Save", "Server Actions / RPC")
    Rel(next_server, database, "Persists State", "Prisma / SQL")
    Rel(next_server, web_client, "Returns Verified Data", "JSON")
```

## Component Architecture

### 1. `src/app` (Next.js Router)
*   `layout.tsx`: Root layout, providers (Auth, Theme).
*   `page.tsx`: Landing / Marketing.
*   `dashboard/page.tsx`: Protected simulation view (Server Component).

### 2. `lib` (Shared Core)
*   `engine/`: The core `PensionEngine` logic (Shared).
*   `db/`: Prisma client instantiations.
*   `utils/`: Formatting and helpers.

### 3. `actions` (Server Entry Poins)
*   `calculate.ts`: Server-side run of the engine.
*   `saveSimulation.ts`: Writes to DB.
*   `generateLegalDoc.ts`: Server-side PDF generation.

## Data Flow
1.  **Input**: User adjusts slider in `web_client`.
2.  **Feedback**: `web_client` updates UI instantly (Client Engine).
3.  **Commit**: User clicks "Save Strategy".
4.  **Transport**: Data sent via Server Action to `next_server`.
5.  **Verify**: `next_server` re-runs calculation to verify integrity.
6.  **Persist**: `next_server` writes to `database`.
7.  **Confirm**: UI receives "Saved" confirmation with a durable ID.
