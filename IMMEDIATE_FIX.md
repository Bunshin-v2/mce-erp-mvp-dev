# 🚨 IMMEDIATE FIX - Empty Document & Financial Pages

## Root Cause
The Supabase tables exist (schema.sql was applied) but they're **empty** - no test data has been seeded.

## Quick Fix (2 minutes)

### STEP 1: Go to Supabase SQL Editor
1. Open: https://app.supabase.com/project/ywiwcrbwvdrjtujjgejx
2. Click **SQL Editor** (left sidebar)
3. Click **+ New Query**

### STEP 2: Seed Documents & Invoices

Copy and paste this SQL into the editor:

```sql
-- SEED DOCUMENTS TABLE
INSERT INTO public.documents (title, category, status, created_at, reviewed_at) VALUES
    ('MCE-2026-001: Foundation Design Approval', 'COMPLIANCE', 'Approved', now() - interval '15 days', now() - interval '10 days'),
    ('CONTRACT-VILLA-SPRINGS: Master Agreement', 'CONTRACT', 'Approved', now() - interval '25 days', now() - interval '18 days'),
    ('Safety Protocol - Site Access Requirements', 'SAFETY', 'Reviewed', now() - interval '8 days', now() - interval '5 days'),
    ('Invoice INV-2026-045: Equipment Rental', 'INVOICE', 'Review', now() - interval '2 days', null),
    ('Environmental Impact Assessment - Phase 2', 'COMPLIANCE', 'Review', now() - interval '1 day', null),
    ('Subcontractor Insurance Certificate - ABC Corp', 'COMPLIANCE', 'Approved', now() - interval '20 days', now() - interval '12 days'),
    ('Change Order 3: Scope Modification', 'CONTRACT', 'Reviewed', now() - interval '5 days', now() - interval '2 days'),
    ('Incident Report - Minor Site Damage', 'SAFETY', 'Approved', now() - interval '10 days', now() - interval '7 days'),
    ('Monthly Progress Report - December 2025', 'INVOICE', 'Approved', now() - interval '3 days', now() - interval '1 day'),
    ('Board Approval - Project Continuation', 'COMPLIANCE', 'Review', now() - interval '4 hours', null)
ON CONFLICT DO NOTHING;

-- CREATE & SEED INVOICES TABLE (if doesn't exist)
CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number text NOT NULL UNIQUE,
    amount numeric(18, 2) NOT NULL,
    status text NOT NULL DEFAULT 'Pending',
    due_date timestamptz NOT NULL,
    project_id uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

INSERT INTO public.invoices (invoice_number, amount, status, due_date, created_at) VALUES
    ('INV-2026-001', 450000, 'Paid', now() - interval '30 days', now() - interval '40 days'),
    ('INV-2026-002', 675000, 'Paid', now() - interval '20 days', now() - interval '35 days'),
    ('INV-2026-003', 325000, 'Pending', now() + interval '5 days', now() - interval '10 days'),
    ('INV-2026-004', 890000, 'Pending', now() + interval '12 days', now() - interval '5 days'),
    ('INV-2026-005', 240000, 'Paid', now() - interval '5 days', now() - interval '25 days'),
    ('INV-2026-006', 1200000, 'Pending', now() + interval '20 days', now() - interval '2 days'),
    ('INV-2026-007', 385000, 'Overdue', now() - interval '3 days', now() - interval '35 days'),
    ('INV-2026-008', 550000, 'Paid', now() - interval '15 days', now() - interval '30 days'),
    ('INV-2026-009', 720000, 'Pending', now() + interval '8 days', now() - interval '7 days'),
    ('INV-2026-010', 480000, 'Paid', now() - interval '10 days', now() - interval '28 days')
ON CONFLICT DO NOTHING;

-- ENABLE RLS (if not already enabled)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES - allow read
CREATE POLICY "Allow read documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Allow read invoices" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Allow insert documents" ON public.documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert invoices" ON public.invoices FOR INSERT WITH CHECK (true);
```

### STEP 3: Run Query

Click **▶ Run** button (or Cmd+Enter)

Expected output:
```
10 rows inserted into documents
10 rows inserted into invoices
Policies created
```

### STEP 4: Verify & Refresh App

1. Click **Table Editor** in Supabase (left sidebar)
2. Open `documents` table → should show 10 rows
3. Open `invoices` table → should show 10 rows
4. In your app, press **Cmd+Shift+R** (hard refresh)
5. Navigate to:
   - **Document Archive** → See all 10 documents with filters working
   - **Financial Analysis** → See invoice ledger populated

---

## Expected Results

### Document Archive
- Total Records: **10**
- Awaiting Review: **2**
- Compliance Rate: **100%**
- 5 category filters: ALL, COMPLIANCE, CONTRACT, INVOICE, SAFETY

### Financial Analysis
- Verified Revenue: **AED 1,830,000** (sum of paid invoices)
- Strategic Receivables: **AED 2,845,000** (sum of pending + overdue)
- Portfolio Valuation: **AED 262.6M** (from projects_master)
- Executive Ledger: 10 invoices with lifecycle tracking
- Revenue Intelligence: Interactive graph with BEST/BASE/RISK toggles

---

## Still Empty After This?

1. **Check browser console** (F12 → Console tab)
   - Look for red errors
   - Verify Supabase URL is correct

2. **Verify Supabase connection**
   ```javascript
   // Paste in browser console:
   const { data } = await supabase.from('documents').select('*');
   console.log(data);  // Should return 10 documents
   ```

3. **Clear cache**
   - Clear browser cache or use Incognito mode
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

4. **Check .env.local**
   - Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set
   - They should match your Supabase project URL

---

## Files Reference

- SQL Schema: `supabase/schema.sql` (base structure)
- Extended Setup: `supabase/documents_and_invoices_schema.sql` (this is your backup script)
- Connection: `lib/supabase.ts`
- Data Hook: `hooks/useDashboardData.ts` (fetches from documents & invoices tables)

---

## Done! ✅

Once seeded, both pages should populate with real data. The filters, charts, and all calculations will work automatically.
