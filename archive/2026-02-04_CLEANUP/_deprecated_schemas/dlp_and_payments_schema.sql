
-- Invoices Table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id),
    invoice_number TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'overdue')) DEFAULT 'draft',
    due_date DATE NOT NULL,
    paid_date DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add DLP end date to projects table
ALTER TABLE projects ADD COLUMN dlp_end_date DATE;

-- RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to see invoices for their projects" ON invoices FOR SELECT USING (TRUE); -- Simplified for demo
