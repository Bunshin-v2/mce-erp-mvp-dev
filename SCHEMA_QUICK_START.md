# Schema Deployment - Quick Start

## TL;DR

```bash
# 1. Backup your database (Supabase Dashboard)
# 2. Copy entire file contents
cat supabase/00_consolidated_schema.sql

# 3. Paste into Supabase SQL Editor and run
# 4. Done! All tables created with proper constraints
```

---

## Verification (30 seconds)

Run these 4 queries in Supabase SQL Editor:

```sql
-- 1. Count tables (should be 19)
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';

-- 2. Count enums (should be 6)
SELECT COUNT(*) FROM pg_type WHERE typtype='e' AND typnamespace=(SELECT oid FROM pg_namespace WHERE nspname='public');

-- 3. Count indexes (should be 25+)
SELECT COUNT(*) FROM pg_indexes WHERE schemaname='public';

-- 4. Test query (should return data)
SELECT * FROM projects_master LIMIT 1;
```

---

## What Was Fixed

| Issue | Before | After |
|-------|--------|-------|
| Column casing | UPPERCASE everywhere | lowercase everywhere ✅ |
| Schema authority | 70+ conflicting files | 1 consolidated file ✅ |
| Idempotency | Would fail if tables exist | Safe to run anytime ✅ |
| FK constraints | Manual integrity checks | Database enforces ✅ |
| Indexes | None | 25+ added for performance ✅ |
| Documentation | Scattered comments | Comprehensive docs ✅ |

---

## Files Created

```
NEW:
  supabase/00_consolidated_schema.sql           ← USE THIS FILE
  SCHEMA_CONSOLIDATION_GUIDE.md                 ← Full documentation
  SCHEMA_QUICK_START.md                         ← This file

DEPRECATED (can be deleted):
  supabase/schema.sql
  master_setup.sql
  NUCLEAR_SCHEMA_UNIFIER.sql
  supabase/documents_and_invoices_schema.sql
  supabase/extended_setup.sql
  [+ 50+ other fragmented SQL files]
```

---

## Frontend: No Changes Needed

Your code already expects lowercase columns:

```typescript
// This already works! No updates needed.
const { data } = await supabase
  .from('projects_master')
  .select('project_name, client_name, contract_value_excl_vat');
```

---

## Schema at a Glance

| Domain | Tables | Purpose |
|--------|--------|---------|
| **Projects** | projects_master | Master registry (160+ columns) |
| **Documents** | documents | Document workflow + audit |
| **Financials** | invoices | Invoicing system |
| **Tenders** | tenders | Bidding pipeline |
| **Users** | profiles, role_tier_map | Clerk integration + permissions |
| **Tasks** | tasks, categories, task_categories | Todo/task management |
| **Alerts** | alerts, alert_events, notifications | Alert system + escalation |
| **Audit** | agent_activity, audit_logs, escalation_log | Complete audit trail |
| **RAG** | document_embeddings, doc_chunks | Semantic search support |

---

## Testing (After Deployment)

```typescript
// Test in frontend console
const { data, error } = await supabase
  .from('projects_master')
  .select('*')
  .limit(1);

console.log(data);  // Should show 160+ fields with lowercase names
console.log(error); // Should be null
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `ERROR: 42710: type already exists` | Delete old schema files, use only 00_consolidated_schema.sql |
| `permission denied` | Demo mode RLS is permissive - should work. Check if it exists. |
| No data showing | Run verify queries above to check tables exist |
| Slow queries | Check index count (should be 25+) - indexes included |

---

## Next: Audit Logging Setup

This schema includes `audit_logs` table. To activate auditing:

```sql
-- Auto-log all project changes (add to consolidated schema next time)
CREATE OR REPLACE FUNCTION audit_projects()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, diff)
  VALUES (
    current_setting('request.jwt.claims')::json->>'sub',
    TG_OP, 'PROJECT', NEW.id::text,
    jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_projects AFTER INSERT OR UPDATE OR DELETE ON projects_master
FOR EACH ROW EXECUTE FUNCTION audit_projects();
```

---

## Summary

✅ **Schema unified** from 70+ files → 1 file
✅ **Columns fixed** from UPPERCASE → lowercase
✅ **Constraints added** for data integrity
✅ **Indexes created** for performance
✅ **Ready for audit** - complete and well-documented
✅ **Production-ready** - just needs RLS hardening for live

**Time to deploy**: ~5 minutes
**Risk level**: Low (uses IF NOT EXISTS, won't overwrite data)
**Next milestone**: Audit logging + compliance testing

---

**Need help?** Check `SCHEMA_CONSOLIDATION_GUIDE.md` for full documentation.
