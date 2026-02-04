-- GLOBAL AUDIT SHIELD (v2.0 Compliance)
-- Purpose: Ensures 100% traceability for all data mutations across critical ERP modules.

CREATE OR REPLACE FUNCTION audit_all_changes()
RETURNS TRIGGER AS $$
DECLARE
    entity_id_val TEXT;
    old_data JSONB;
    new_data JSONB;
    target_type TEXT;
BEGIN
    -- Determine Entity Type based on Table Name
    target_type := TG_TABLE_NAME;
    
    IF (TG_OP = 'DELETE') THEN
        old_data := to_jsonb(OLD);
        entity_id_val := COALESCE(old_data->>'id', old_data->>'ID');
        
        INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, diff)
        VALUES (
            'SYSTEM_DAEMON', -- Future: add current_user_id
            TG_OP,
            target_type,
            entity_id_val,
            jsonb_build_object('old', old_data, 'new', null)
        );
        RETURN OLD;
    ELSE
        new_data := to_jsonb(NEW);
        old_data := to_jsonb(OLD);
        entity_id_val := COALESCE(new_data->>'id', new_data->>'ID');

        INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, diff)
        VALUES (
            'SYSTEM_DAEMON',
            TG_OP,
            target_type,
            entity_id_val,
            jsonb_build_object('old', old_data, 'new', new_data)
        );
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 1. Apply to Tenders
DROP TRIGGER IF EXISTS trigger_audit_tenders ON public.tenders;
CREATE TRIGGER trigger_audit_tenders AFTER INSERT OR UPDATE OR DELETE ON public.tenders FOR EACH ROW EXECUTE FUNCTION audit_all_changes();

-- 2. Apply to Invoices
DROP TRIGGER IF EXISTS trigger_audit_invoices ON public.invoices;
CREATE TRIGGER trigger_audit_invoices AFTER INSERT OR UPDATE OR DELETE ON public.invoices FOR EACH ROW EXECUTE FUNCTION audit_all_changes();

-- 3. Apply to Unified Tasks
DROP TRIGGER IF EXISTS trigger_audit_tasks ON public.tasks;
CREATE TRIGGER trigger_audit_tasks AFTER INSERT OR UPDATE OR DELETE ON public.tasks FOR EACH ROW EXECUTE FUNCTION audit_all_changes();

-- 4. Apply to Purchase Orders (Iron Dome)
DROP TRIGGER IF EXISTS trigger_audit_po ON public.purchase_orders;
CREATE TRIGGER trigger_audit_po AFTER INSERT OR UPDATE OR DELETE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION audit_all_changes();
