import { getSupabaseAdmin } from '../lib/supabase';

const supabase = getSupabaseAdmin();

if (!supabase) {
  console.error('Failed to initialize admin client');
  process.exit(1);
}

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
  const { error: pError } = await (supabase as any).from('projects_master').insert(PROJECTS as any);
  if (pError) console.error('Error seeding projects:', pError);

  console.log('🌱 Seeding Invoices...');
  const { error: iError } = await (supabase as any).from('invoices').insert(INVOICES as any);
  if (iError) console.error('Error seeding invoices:', iError);

  console.log('🌱 Seeding Documents...');
  const { error: dError } = await (supabase as any).from('documents').insert([
    { title: 'Main Consultancy Agreement', category: 'CONTRACT', status: 'Approved' },
    { title: 'HSE Monthly Audit', category: 'SAFETY', status: 'Review' },
    { title: 'Trade License 2026', category: 'COMPLIANCE', status: 'Approved' }
  ] as any);
  if (dError) console.error('Error seeding documents:', dError);

  console.log('✅ Seeding Complete. Dashboard should now show real data.');
}

seed();
