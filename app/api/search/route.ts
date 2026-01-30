
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter "q" is required.' }, { status: 400 });
    }

    const supabase = await createClient();

    const [
        { data: tenders, error: tendersError },
        { data: projects, error: projectsError },
        { data: documents, error: documentsError }
    ] = await Promise.all([
        supabase.from('tenders').select('id, title, ref').ilike('title', `%${query}%`),
        supabase.from('projects_master').select('id, project_name, project_code').ilike('project_name', `%${query}%`),
        supabase.from('documents').select('id, title').ilike('title', `%${query}%`)
    ]);
    
    if (tendersError || projectsError || documentsError) {
        logger.error('SEARCH_API_FAILURE', { tendersError, projectsError, documentsError });
        return NextResponse.json({ error: 'An error occurred during search.' }, { status: 500 });
    }

    return NextResponse.json({ tenders, projects, documents });
}
