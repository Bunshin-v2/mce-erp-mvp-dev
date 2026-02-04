-- FIX: Robust Audit Trigger for Project Changes
-- Uses JSONB extraction to bypass direct identifier casing issues

CREATE OR REPLACE FUNCTION audit_project_changes()
RETURNS TRIGGER AS $$
DECLARE
    entity_id_val TEXT;
    old_data JSONB;
    new_data JSONB;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        old_data := to_jsonb(OLD);
        entity_id_val := COALESCE(old_data->>'id', old_data->>'ID');
        
        INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, diff)
        VALUES (
            'SYSTEM_AGENT',
            TG_OP,
            'PROJECT',
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
            'SYSTEM_AGENT',
            TG_OP,
            'PROJECT',
            entity_id_val,
            jsonb_build_object('old', old_data, 'new', new_data)
        );
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Re-attach trigger
DROP TRIGGER IF EXISTS trigger_audit_project_changes ON projects_master;
CREATE TRIGGER trigger_audit_project_changes
AFTER INSERT OR UPDATE OR DELETE ON projects_master
FOR EACH ROW EXECUTE FUNCTION audit_project_changes();