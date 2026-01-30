# Supabase Setup Guide - Morgan ERP

## Why Empty Modules?

The Document Archive and Financial Analysis pages show empty states because their core tables don't exist in Supabase.

---

## Setup Instructions

### Step 1: Connect to Supabase Console

1. Go to: https://app.supabase.com
2. Select project: **ywiwcrbwvdrjtujjgejx** (from `.env.local`)
3. Navigate to **SQL Editor**

### Step 2: Create Master Schema

Run these SQL scripts **in this exact order**:

#### 1. Projects & Tenders (if not exists)
```sql
-- Run: supabase/master_setup.sql
```

#### 2. Documents & Invoices (NEW - CRITICAL)
```sql
-- Copy and paste entire contents of:
-- supabase/documents_and_invoices_schema.sql
```

This creates:
- **documents** table with 10 test records
- **invoices** table with 10 test records
- Indexes for performance
- RLS policies for security

#### 3. Alerts & Audit Logs (if not exists)
```sql
-- Run: supabase/audit_fix_schema.sql
```

### Step 3: Verify Tables Exist

In **Supabase Console**, go to **Table Editor** and verify:

- ✅ `projects_master` (33+ records expected)
- ✅ `documents` (10 test records from seeding)
- ✅ `invoices` (10 test records from seeding)
- ✅ `alerts` (created but may be empty)
- ✅ `tenders` (created from master_setup.sql)
- ✅ `agent_activity` (audit trail)
- ✅ `audit_logs` (system logs)

### Step 4: Test the Connection

Run in your browser console:

```javascript
// Should return data
const { data } = await supabase.from('documents').select('*').limit(5);
console.log('Documents:', data.length); // Should show 10

const { data: invoices } = await supabase.from('invoices').select('*').limit(5);
console.log('Invoices:', invoices.length); // Should show 10
```

### Step 5: Restart Dev Server

```bash
npm run dev
```

Navigate to:
- **Document Archive** → Should show 10 documents with filters
- **Financial Analysis** → Should show invoice ledger with data

---

## What Each Table Does

### Documents Table
Stores document artifacts with workflow status:
- **Category**: COMPLIANCE, CONTRACT, INVOICE, SAFETY
- **Status**: Review, Reviewed, Approved, Rejected
- **storage_path**: Link to file in Supabase Storage

### Invoices Table
Stores financial entries:
- **status**: Pending, Paid, Overdue
- **amount**: AED value
- **due_date**: Payment deadline

### Projects Master Table
Stores enterprise projects (from master_setup.sql):
- Contract values, timelines, risk ratings
- Compliance status, delivery targets

---

## Troubleshooting

### Still Empty?
1. Check `.env.local` has correct VITE_SUPABASE_URL and key
2. Verify tables exist in Supabase Console
3. Check browser console for SQL errors
4. Clear browser cache and reload

### Permission Denied?
Enable anonymous access in Supabase:
- Go to **Authentication → Policies**
- Ensure `Allow read documents` policy is active
- Verify RLS policies are enabled

### Only Projects Show But Not Documents?
1. Run the `documents_and_invoices_schema.sql` script
2. Check Supabase **SQL Editor** for errors
3. Verify `documents` table exists in **Table Editor**

---

## File References

- `.env.local` - Supabase credentials
- `supabase/documents_and_invoices_schema.sql` - Create docs/invoices (NEW)
- `supabase/master_setup.sql` - Create projects/tenders
- `lib/supabase.ts` - Client initialization
- `hooks/useDashboardData.ts` - Data fetching logic

---

## Expected Results After Setup

### Document Archive Page
- Total Records: **10**
- Awaiting Review: **2**
- Compliance Rate: **100%**
- Storage Usage: **1.24 GB**
- Grid shows all 10 documents with filter buttons active

### Financial Analysis Page
- Verified Revenue (Invoices Paid): **AED 1,830,000**
- Strategic Receivables (Pending): **AED 2,845,000**
- Portfolio Valuation: **AED 262.6M** (from projects)
- Executive Ledger: Shows invoice lifecycle with risk delta
- Revenue Intelligence: Toggles between BEST, BASE, RISK scenarios

---

## Support

If issues persist:
1. Check network tab - verify Supabase API calls return 200
2. Check browser console for TypeScript errors
3. Verify `.env.local` is loaded (check `import.meta.env` in dev tools)
4. Check Supabase project status (not suspended)
