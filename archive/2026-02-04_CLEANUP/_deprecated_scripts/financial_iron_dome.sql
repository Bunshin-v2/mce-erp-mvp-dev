-- MODULE 2.4: FINANCIAL IRON DOME
-- Purpose: Double-entry verification to prevent over-billing

-- 1. Purchase Orders ( The Source of Truth)
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects(id),
    po_number text NOT NULL UNIQUE,
    vendor_name text NOT NULL,
    total_amount numeric NOT NULL,
    remaining_balance numeric NOT NULL,
    status text DEFAULT 'active', -- active, closed, exhausted
    created_at timestamptz DEFAULT now()
);

-- 2. Invoice Validation Trigger
CREATE OR REPLACE FUNCTION validate_invoice_against_po()
RETURNS TRIGGER AS $$
DECLARE
    po_balance numeric;
BEGIN
    -- Get current PO balance
    SELECT remaining_balance INTO po_balance
    FROM public.purchase_orders
    WHERE po_number = NEW.po_reference;

    -- If PO doesn't exist, flag it
    IF po_balance IS NULL THEN
        RAISE EXCEPTION 'Iron Dome Block: Invalid PO Reference';
    END IF;

    -- If Invoice > Balance, Block it
    IF NEW.amount > po_balance THEN
        RAISE EXCEPTION 'Iron Dome Block: Invoice exceeds PO Remaining Balance (Attempted: %, Available: %)', NEW.amount, po_balance;
    END IF;

    -- Update PO Balance
    UPDATE public.purchase_orders
    SET remaining_balance = remaining_balance - NEW.amount
    WHERE po_number = NEW.po_reference;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach Trigger (Uncomment when ready to enforce)
-- CREATE TRIGGER check_invoice_limit
-- BEFORE INSERT ON public.invoices
-- FOR EACH ROW EXECUTE FUNCTION validate_invoice_against_po();
