-- MODULE 8: RFQ DELTA GATE
-- Purpose: Detect changes in tender documents and enforce re-validation

CREATE TABLE IF NOT EXISTS public.tender_rfq_versions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tender_id uuid REFERENCES public.tenders(id) ON DELETE CASCADE,
    document_id uuid REFERENCES public.documents(id),
    
    file_hash text NOT NULL, -- SHA-256 or similar fingerprint
    version_number integer DEFAULT 1,
    
    status text DEFAULT 'pending_review', -- pending_review, cleared
    reviewed_by uuid REFERENCES public.profiles(id),
    reviewed_at timestamptz,
    
    created_at timestamptz DEFAULT now()
);

-- Add state column to tenders to track if a delta is blocking it
ALTER TABLE public.tenders ADD COLUMN IF NOT EXISTS rfq_delta_blocked boolean DEFAULT false;

-- RLS
ALTER TABLE public.tender_rfq_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View RFQ Versions" ON public.tender_rfq_versions FOR SELECT TO authenticated USING (true);
