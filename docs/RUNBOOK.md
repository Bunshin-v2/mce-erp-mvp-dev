# Operational Runbook
**System:** MCE Command Center

## 1. Deployment
### 1.1 Vercel Deployment
The frontend is deployed on Vercel.
- **Trigger:** Push to `main` branch.
- **Env Vars:** Ensure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` are set.

### 1.2 Database Migrations
Migrations are managed via SQL files in the root directory.
- **Run Order:** `master_setup.sql` -> `extended_setup.sql` -> `tenders_setup.sql` -> `resources_setup.sql` -> `compliance_update.sql`.
- **Command:** Run manually in Supabase SQL Editor.

## 2. User Management
### 2.1 Promoting a User
1. Go to **Settings > Team & Access**.
2. Find the user.
3. Change Role dropdown (e.g., Staff -> Executive).
4. System updates `role_tier_map` instantly.

### 2.2 Revoking Access
1. Block user in Clerk Dashboard.
2. OR Change role to "Suspended" in Settings.

## 3. Incident Response
### 3.1 "Access Denied" Errors
- Check user's Tier in `profiles` table.
- Verify RLS policy on the target table.

### 3.2 "Data Stagnation" Alert
- This means a project hasn't been updated in 7 days.
- **Action:** PM must log a progress update or a note.

## 4. Backup & Recovery
- **Database:** Supabase manages daily PITR (Point-in-Time Recovery).
- **Documents:** Supabase Storage is replicated.
