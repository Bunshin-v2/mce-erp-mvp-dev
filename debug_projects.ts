
import { getSupabaseClient } from './lib/supabase';
import { logger } from './lib/logger';

const supabase = getSupabaseClient();

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
