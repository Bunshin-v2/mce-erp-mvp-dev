-- FIX: Structural Integrity & Table Linkage (v2)
-- Ensures project_id columns exist before linking to projects_master

-- 1. Ensure project_id exists in Documents
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='project_id') THEN
        ALTER TABLE public.documents ADD COLUMN "project_id" uuid;
    END IF;
END $$;

-- 2. Ensure project_id exists in Invoices
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='project_id') THEN
        ALTER TABLE public.invoices ADD COLUMN "project_id" uuid;
    END IF;
END $$;

-- 3. Establish Foreign Keys for Documents
ALTER TABLE public.documents 
DROP CONSTRAINT IF EXISTS fk_documents_project;

ALTER TABLE public.documents
ADD CONSTRAINT fk_documents_project 
FOREIGN KEY (project_id) 
REFERENCES public.projects_master(id)
ON DELETE SET NULL;

-- 4. Establish Foreign Keys for Invoices
ALTER TABLE public.invoices 
DROP CONSTRAINT IF EXISTS fk_invoices_project;

ALTER TABLE public.invoices
ADD CONSTRAINT fk_invoices_project 
FOREIGN KEY (project_id) 
REFERENCES public.projects_master(id)
ON DELETE SET NULL;

-- 5. Finalize Analytics Tables
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number text UNIQUE,
    total_amount numeric(18,2),
    remaining_balance numeric(18,2),
    status text,
    project_id uuid REFERENCES public.projects_master(id),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id text NOT NULL,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id text NOT NULL,
    diff jsonb,
    created_at timestamptz DEFAULT now()
);