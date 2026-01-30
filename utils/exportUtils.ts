/**
 * CSV Export Utility with Security Hardening
 * Prevents CSV Formula Injection (Excel Injection) by escaping sensitive prefixes.
 */

export const safeExportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;

    // Get headers from first object keys
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvRows = [];
    
    // Add Header row
    csvRows.push(headers.join(','));

    // Add Data rows with Injection Prevention
    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header] === null || row[header] === undefined ? '' : String(row[header]);
            
            // ESCAPE FORMULA INJECTION:
            // If the value starts with =, +, -, or @, prefix it with a single quote '
            // This is a mandatory requirement for MCE Compliance (v2.0).
            const escaped = val.replace(/^([=+\-@])/, "'$1");
            
            // Handle commas in values by wrapping in quotes
            return `"${escaped.replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
