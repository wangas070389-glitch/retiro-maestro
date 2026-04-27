# BLUE-030: Admin Command Center Data Flow & UI

## 1. Interface Layer (`src/app/(main)/admin/users/page.tsx`)
A dedicated dashboard route protected by the Server layout middleware. If a non-admin attempts to access this, they will be redirected to `/dashboard` or receive a 404.

### Components
- **User Matrix Table:** Displays all non-deleted users.
  - Columns: `Name`, `Email`, `Role`, `Tier`, `Status (Approved/Blocked)`, `Actions`.
- **Status Badges:** 
  - `Pending`: Gray/Yellow.
  - `Approved`: Emerald.
  - `Blocked`: Red.
- **Action Menu (Dropdown/Icons):**
  - Toggle Approval
  - Toggle Block
  - Trigger "Reset Password" Modal

### "Reset Password" Modal
A client-side modal that prompts the admin to type a new temporary password for the selected user. It triggers the `resetUserPasswordAction`.

## 2. Server Actions (`src/actions/admin-actions.ts`)

```typescript
// 1. Fetch Users
export async function getAllUsersAction(): Promise<User[]>

// 2. Toggle Authorization
export async function toggleUserApprovalAction(userId: string, isApproved: boolean)

// 3. Toggle Block
export async function toggleUserBlockAction(userId: string, isBlocked: boolean)

// 4. Reset Password
export async function resetUserPasswordAction(userId: string, newPasswordPlain: string)

// 5. Change Role/Tier
export async function modifyUserClearanceAction(userId: string, role: string, tier: string)
```

## 3. Middleware / Auth Guard
The `auth.ts` configuration (or layout middleware) must be updated to check the new `isApproved` and `isBlocked` flags. If a user successfully inputs their password but `isApproved == false` or `isBlocked == true`, the session must be rejected with an appropriate error message (e.g., "Account pending admin approval" or "Account suspended").
