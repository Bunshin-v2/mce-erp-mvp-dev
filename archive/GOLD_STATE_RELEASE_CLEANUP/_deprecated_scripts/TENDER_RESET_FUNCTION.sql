-- TENDER CHECKLIST RESET FUNCTION
-- Purpose: Allow Managers (L3/L4) to wipe a specific tender's checklist and start over.

CREATE OR REPLACE FUNCTION reset_tender_checklist(target_tender_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as admin
SET search_path = public
AS $$
BEGIN
    -- Delete all requirement nodes for the specific tender
    DELETE FROM public.tender_requirements
    WHERE tender_id = target_tender_id;
END;
$$;
