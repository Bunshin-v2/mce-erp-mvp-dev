# Step 3: Verify Deployment

Ensure all systems are nominal by following this checklist.

### 1. Observability Check
1. Start the application (`npm run dev`).
2. Navigate to `/admin/health`.
3. Verify that **Database**, **AI Core**, and **Neural Alarms** all show a **Nominal** status.

### 2. Security (RBAC) Test
1. Log in as a user with a `staff` role.
2. Attempt to edit a project or tender.
3. The UI should block the action, and any direct API attempts should return a `403 Forbidden` error via RLS.

### 3. Intelligence (RAG) Test
1. Open the Command Palette (**⌘K**).
2. Type a natural language query about an uploaded document.
3. Verify that results appear in the **Neural Intelligence Results** section with proper citations.

### 4. Alarm Engine Test
1. Manually trigger a sweep in the SQL Editor:
   ```sql
   SELECT sweep_alarm_rules();
   ```
2. Check the `alerts` table for any new entries based on your existing project deadlines.

---
🎯 **Deployment Complete.** Your Nexus ERP is now hardened and autonomous.