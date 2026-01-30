
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { logger } from './lib/logger';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  logger.error('Missing Supabase env vars', {});
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProjects() {
  logger.info('Fetching projects_master', {});
  const { data, error } = await supabase.from('projects_master').select('*');

  if (error) {
    logger.error('Error fetching projects', { error: error.message });
    return;
  }

  logger.info('Found projects', { count: data?.length });
  if (data && data.length > 0) {
    logger.info('Sample project (first item)', { sample: data[0] });

    // Check for nulls in critical fields
    const badProjects = data.filter(p => !p.project_name || !p.id);
    if (badProjects.length > 0) {
        logger.warn('Projects have missing name or ID', { count: badProjects.length, projects: badProjects.map(p => ({ id: p.id, name: p.project_name })) });
    }
  } else {
    logger.info('No projects found', {});
  }
}

checkProjects();
