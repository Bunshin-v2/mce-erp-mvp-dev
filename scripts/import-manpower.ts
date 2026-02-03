// scripts/import-manpower.ts
// Usage: npx ts-node scripts/import-manpower.ts <path-to-csv>

import * as fs from 'fs';
import { getSupabaseAdmin } from '../lib/supabase';

const supabase = getSupabaseAdmin();

if (!supabase) {
  console.error('Failed to initialize admin client');
  process.exit(1);
}

interface ManpowerRow {
  Project: string;
  Role: string;
  Discipline: string;
  StartDate: string; // YYYY-MM-DD
  EndDate: string;
  Quantity: string;
}

async function importManpower(filePath: string) {
  console.log(`🚀 Starting Manpower Import from: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const rows = raw.split('\n').slice(1).map(r => r.split(',')); // Simple CSV parse

  for (const row of rows) {
    if (row.length < 5) continue;
    const [project, role, discipline, start, end, qty] = row.map(c => c?.trim());

    if (!project || !role) continue;

    console.log(`Processing: ${role} for ${project}...`);

    // 1. Upsert Position
    const { data: posData, error: posError } = await (supabase as any)
      .from('manpower_positions')
      .upsert({ title: role, discipline: discipline || 'General' } as any, { onConflict: 'title' })
      .select()
      .single();

    if (posError) {
      console.error(`Error upserting position ${role}:`, posError.message);
      continue;
    }

    // 2. Find Project ID (Mock lookup based on name match)
    const { data: projData } = await (supabase as any)
      .from('projects_master')
      .select('id')
      .ilike('PROJECT_NAME', `%${project}%`)
      .maybeSingle();

    if (!projData) {
      console.warn(`⚠️ Project not found for: ${project}. Skipping requirement.`);
      continue;
    }

    // 3. Insert Requirement
    const { error: reqError } = await (supabase as any)
      .from('manpower_requirements')
      .insert({
        project_id: (projData as any).id,
        position_id: (posData as any).id,
        start_date: start,
        end_date: end,
        quantity: parseInt(qty) || 1,
        status: 'open'
      } as any);

    if (reqError) console.error(`Failed to insert requirement: ${reqError.message}`);
  }

  console.log("✅ Import Sequence Completed.");
}

// Run if called directly
const args = process.argv.slice(2);
if (args.length > 0) {
  importManpower(args[0]);
} else {
  console.log("Please provide a CSV file path.");
}
