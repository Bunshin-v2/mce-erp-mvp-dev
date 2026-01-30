import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ywiwcrbwvdrjtujjgejx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3aXdjcmJ3dmRyanR1ampnZWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMTY5MjgsImV4cCI6MjA4NDU5MjkyOH0.RO_rfMk2Klrpm9qZyU62Un0Ypvnb4giocLSx1s7MROM'
);

const PROJECTS = [
  { project_name: 'New Corniche Hospital', project_code: 'NCH-001', contract_value_excl_vat: 57000000, project_status: 'Construction', completion_percent: 75, delivery_risk_rating: 'Low' },
  { project_name: 'Tawazun Industrial Park', project_code: 'TIP-004', contract_value_excl_vat: 13573000, project_status: 'Active', completion_percent: 74, delivery_risk_rating: 'Medium' },
  { project_name: 'Abu Dhabi Stem Cell', project_code: 'ADS-102', contract_value_excl_vat: 36249549, project_status: 'Ongoing', completion_percent: 45, delivery_risk_rating: 'Critical' },
  { project_name: 'Al Kheiran Villa', project_code: 'AKV-202', contract_value_excl_vat: 3266300, project_status: 'Ongoing', completion_percent: 45, delivery_risk_rating: 'High' },
  { project_name: 'AD Police Saadiyat', project_code: 'ADP-991', contract_value_excl_vat: 1215976, project_status: 'Construction', completion_percent: 45, delivery_risk_rating: 'Low' },
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
