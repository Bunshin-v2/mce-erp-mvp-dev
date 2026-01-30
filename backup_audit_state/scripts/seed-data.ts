import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ywiwcrbwvdrjtujjgejx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3aXdjcmJ3dmRyanR1ampnZWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMTY5MjgsImV4cCI6MjA4NDU5MjkyOH0.RO_rfMk2Klrpm9qZyU62Un0Ypvnb4giocLSx1s7MROM'
);

const PROJECTS = [
  { PROJECT_NAME: 'New Corniche Hospital', PROJECT_CODE: 'NCH-001', CONTRACT_VALUE_EXCL_VAT: 57000000, PROJECT_STATUS: 'Construction', COMPLETION_PERCENT: 75, DELIVERY_RISK_RATING: 'Low' },
  { PROJECT_NAME: 'Tawazun Industrial Park', PROJECT_CODE: 'TIP-004', CONTRACT_VALUE_EXCL_VAT: 13573000, PROJECT_STATUS: 'Active', COMPLETION_PERCENT: 74, DELIVERY_RISK_RATING: 'Medium' },
  { PROJECT_NAME: 'Abu Dhabi Stem Cell', PROJECT_CODE: 'ADS-102', CONTRACT_VALUE_EXCL_VAT: 36249549, PROJECT_STATUS: 'Ongoing', COMPLETION_PERCENT: 45, DELIVERY_RISK_RATING: 'Critical' },
  { PROJECT_NAME: 'Al Kheiran Villa', PROJECT_CODE: 'AKV-202', CONTRACT_VALUE_EXCL_VAT: 3266300, PROJECT_STATUS: 'Ongoing', COMPLETION_PERCENT: 45, DELIVERY_RISK_RATING: 'High' },
  { PROJECT_NAME: 'AD Police Saadiyat', PROJECT_CODE: 'ADP-991', CONTRACT_VALUE_EXCL_VAT: 1215976, PROJECT_STATUS: 'Construction', COMPLETION_PERCENT: 45, DELIVERY_RISK_RATING: 'Low' },
];

const INVOICES = [
  { invoice_number: 'INV-2026-001', amount: 450000, status: 'Paid', due_date: '2026-01-15' },
  { invoice_number: 'INV-2026-002', amount: 125000, status: 'Sent', due_date: '2026-02-01' },
  { invoice_number: 'INV-2026-003', amount: 890000, status: 'Overdue', due_date: '2025-12-20' },
  { invoice_number: 'INV-2026-004', amount: 32000, status: 'Draft', due_date: '2026-02-15' },
];

async function seed() {
  console.log('🌱 Seeding Projects...');
  const { error: pError } = await supabase.from('projects_master').insert(PROJECTS);
  if (pError) console.error('Error seeding projects:', pError);

  console.log('🌱 Seeding Invoices...');
  const { error: iError } = await supabase.from('invoices').insert(INVOICES);
  if (iError) console.error('Error seeding invoices:', iError);

  console.log('🌱 Seeding Documents...');
  const { error: dError } = await supabase.from('documents').insert([
    { title: 'Main Consultancy Agreement', category: 'CONTRACT', status: 'Approved' },
    { title: 'HSE Monthly Audit', category: 'SAFETY', status: 'Review' },
    { title: 'Trade License 2026', category: 'COMPLIANCE', status: 'Approved' }
  ]);
  if (dError) console.error('Error seeding documents:', dError);

  console.log('✅ Seeding Complete. Dashboard should now show real data.');
}

seed();
