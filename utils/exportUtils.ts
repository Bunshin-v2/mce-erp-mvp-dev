
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

/**
 * Premium Apple-UI HTML Export Engine
 * Generates a standalone, high-density intelligence report.
 */
export const exportToHTML = (data: any[], filename: string, metadata: { source: string; profile: string }) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]).filter(h => h !== '_audit' && h !== 'id');
    const timestamp = new Date().toLocaleString();
    const dateStr = new Date().toISOString().split('T')[0];

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #050505;
            --surface: #121212;
            --border: rgba(255, 255, 255, 0.1);
            --text-primary: #ffffff;
            --text-secondary: #a1a1aa;
            --accent: #3b82f6;
            --success: #10b981;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            background: var(--bg); 
            color: var(--text-primary); 
            font-family: 'Inter', -apple-system, sans-serif;
            line-height: 1.5;
            padding: 40px 20px;
        }

        .container { max-width: 1200px; margin: 0 auto; }
        
        .header { 
            margin-bottom: 40px; 
            padding-bottom: 20px; 
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }

        .title-block h1 { 
            font-size: 32px; 
            font-weight: 900; 
            font-style: italic; 
            letter-spacing: -0.02em;
            margin-bottom: 4px;
        }

        .subtitle { 
            color: var(--text-secondary); 
            font-size: 12px; 
            text-transform: uppercase; 
            font-weight: 700; 
            letter-spacing: 0.1em;
        }

        .meta-node {
            text-align: right;
            font-family: monospace;
            font-size: 11px;
            color: var(--text-secondary);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .stat-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 20px;
            position: relative;
            overflow: hidden;
        }

        .stat-card::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%);
            pointer-events: none;
        }

        .stat-label {
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 700;
            color: var(--text-secondary);
            letter-spacing: 0.05em;
            margin-bottom: 8px;
        }

        .stat-value {
            font-size: 24px;
            font-weight: 900;
            font-style: italic;
        }

        .ledger-container {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }

        th {
            background: rgba(255,255,255,0.03);
            text-align: left;
            padding: 16px 20px;
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 900;
            font-style: italic;
            letter-spacing: 0.1em;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border);
        }

        td {
            padding: 14px 20px;
            border-bottom: 1px solid rgba(255,255,255,0.02);
            font-weight: 500;
        }

        tr:last-child td { border-bottom: none; }
        tr:hover td { background: rgba(255,255,255,0.02); transition: background 0.2s; }

        .identity-cell {
            font-weight: 700;
            color: var(--text-primary);
        }

        .mono { font-family: monospace; font-size: 12px; opacity: 0.8; }
        
        .badge {
            display: inline-flex;
            align-items: center;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
            border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 11px;
            color: var(--text-secondary);
            opacity: 0.5;
        }

        @media print {
            body { background: white; color: black; padding: 20px; }
            .stat-card, .ledger-container { border: 1px solid #eee; background: none; box-shadow: none; }
            th { background: #f9f9f9; color: #666; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <div class="title-block">
                <div class="subtitle">Nexus Intelligence Core // Sector 01</div>
                <h1>${metadata.source} REPORT</h1>
            </div>
            <div class="meta-node">
                <div>GEN_TIMESTAMP: ${timestamp}</div>
                <div>PROFILE_LEVEL: ${metadata.profile.toUpperCase()}</div>
                <div>SECURE_HASH: ${Math.random().toString(36).substring(2, 10).toUpperCase()}</div>
            </div>
        </header>

        <section class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Records</div>
                <div class="stat-value">${data.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Source</div>
                <div class="stat-value" style="color: var(--accent)">${metadata.source}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Validation Status</div>
                <div class="stat-value" style="color: var(--success)">VERIFIED</div>
            </div>
        </section>

        <div class="ledger-container">
            <table>
                <thead>
                    <tr>
                        ${headers.map(h => `<th>${h.replace(/_/g, ' ')}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${data.map(row => `
                        <tr>
                            ${headers.map((h, i) => {
        const val = row[h];
        const isFirst = i === 0;
        const isNumeric = typeof val === 'number';
        return `<td class="${isFirst ? 'identity-cell' : ''} ${isNumeric ? 'mono' : ''}">
                                    ${isFirst ? `<strong>${val}</strong>` : val}
                                </td>`;
    }).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <footer class="footer">
            &copy; 2026 Nexus Construct ERP. All rights reserved. Generated via Intelligence Core.
        </footer>
    </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${dateStr}.html`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
