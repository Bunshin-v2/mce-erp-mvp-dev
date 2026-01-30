
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

function convertToCSV(data: any[]) {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => 
                JSON.stringify(row[header], (_, value) => value === null ? '' : value)
            ).join(',')
        )
    ];
    return csvRows.join('\n');
}

export async function GET() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('tenders').select('*');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const csvData = convertToCSV(data);
    
    return new Response(csvData, {
        status: 200,
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="tenders_export.csv"`,
        },
    });
}
