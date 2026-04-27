# Mission Statement: Sidebar Navigation Lexical Sync

## Mission
To harmonize the application's Information Architecture (IA) by renaming the outdated "Historial" navigation link in the global sidebar to accurately reflect the high-value "Legal / Auditoría" module it currently serves.

## Functional Scope
* The global Application Sidebar (e.g., `AppSidebar.tsx` or `Sidebar.tsx`) MUST be updated.
* The navigation object rendering the `/dashboard/history` or `/history` (or whichever route corresponds to the target screen) MUST have its display `label` string mutated from "Historial" to "Auditoría Legal" or "Legal & Auditoría", ensuring visual consistency with the heavy, institutional branding of that specific screen.
* The navigational icon (currently returning a clock or history log, presumably) SHOULD be swapped out for a more appropriate icon like a Scale (`Scale` / `Gavel` / `ShieldCheck`) from the `lucide-react` library if deemed necessary.

## Anti-Objectives
* DO NOT alter the actual Next.js physical page route (e.g., if it's currently at `/history`, leave the URL as `/history` to avoid breaking incoming bookmarks).
* DO NOT modify the internal structure of the Audit page itself; this is strictly a superficial navigational correction.
