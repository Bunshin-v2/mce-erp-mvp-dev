/**
 * Beautiful HTML Report Generator
 * Creates professional, print-friendly reports matching MCE design system
 */

export interface ReportData {
  source: 'PROJECTS' | 'TENDERS' | 'FINANCIALS';
  title: string;
  generatedAt: Date;
  data: any[];
  columns: string[];
  summary?: {
    totalCount: number;
    activeCount: number;
    totalValue?: number;
    statusBreakdown?: Record<string, number>;
  };
}

export function generateHTMLReport(report: ReportData): string {
  const timestamp = report.generatedAt.toLocaleString('en-AE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const statusColors: Record<string, string> = {
    'Active': '#10b981',
    'Completed': '#3b82f6',
    'Paused': '#f59e0b',
    'Rejected': '#ef4444',
    'Approved': '#10b981',
    'Review': '#f59e0b',
    'Reviewed': '#3b82f6',
    'Pending': '#f59e0b',
    'Won': '#10b981',
    'Lost': '#ef4444'
  };

  const getStatusColor = (status: string) => {
    return statusColors[status] || '#6b7280';
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCE Report - ${report.source} - ${timestamp}</title>
    <style>
        :root {
            --primary: #333999;
            --accent: #33CCCC;
            --accent-dark: #20B2AA;
            --danger: #ef4444;
            --success: #10b981;
            --warning: #f59e0b;
            --info: #3b82f6;

            --bg-primary: #0f172a;
            --bg-secondary: #1e293b;
            --bg-elevated: #334155;

            --text-primary: #f1f5f9;
            --text-secondary: #cbd5e1;
            --text-tertiary: #94a3b8;

            --border: rgba(255, 255, 255, 0.1);
            --border-light: rgba(255, 255, 255, 0.05);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
        }

        .report-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        /* Header */
        .report-header {
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 2px solid var(--border);
        }

        .logo-section {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
        }

        .logo-icon {
            font-size: 28px;
            font-weight: 900;
            color: var(--accent);
            letter-spacing: -1px;
        }

        .logo-text {
            font-size: 24px;
            font-weight: 900;
            color: var(--text-primary);
            letter-spacing: -0.02em;
        }

        .report-title {
            font-size: 36px;
            font-weight: 900;
            color: var(--text-primary);
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: -0.02em;
            line-height: 1.1;
        }

        .report-meta {
            display: flex;
            gap: 24px;
            margin-top: 16px;
            flex-wrap: wrap;
        }

        .meta-item {
            font-size: 13px;
            color: var(--text-tertiary);
        }

        .meta-label {
            color: var(--text-secondary);
            font-weight: 600;
            display: block;
            margin-bottom: 2px;
        }

        .meta-value {
            color: var(--accent);
            font-weight: 700;
            font-size: 14px;
        }

        /* Summary Cards */
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 40px;
        }

        .summary-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s ease;
        }

        .summary-card:hover {
            border-color: var(--accent);
            background: var(--bg-elevated);
        }

        .card-label {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--text-tertiary);
            letter-spacing: 0.05em;
            margin-bottom: 8px;
            display: block;
        }

        .card-value {
            font-size: 28px;
            font-weight: 900;
            color: var(--accent);
            line-height: 1.1;
            letter-spacing: -0.02em;
        }

        .card-subtext {
            font-size: 12px;
            color: var(--text-tertiary);
            margin-top: 8px;
        }

        /* Data Table */
        .table-section {
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 40px;
        }

        .table-header {
            padding: 20px;
            border-bottom: 1px solid var(--border);
            background: var(--bg-elevated);
        }

        .table-title {
            font-size: 18px;
            font-weight: 700;
            color: var(--text-primary);
        }

        .table-wrapper {
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }

        thead {
            background: var(--bg-elevated);
        }

        th {
            padding: 16px 20px;
            text-align: left;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.05em;
            border-bottom: 1px solid var(--border);
        }

        td {
            padding: 14px 20px;
            border-bottom: 1px solid var(--border-light);
            color: var(--text-secondary);
        }

        tbody tr {
            transition: background 0.2s ease;
        }

        tbody tr:hover {
            background: var(--bg-elevated);
        }

        tbody tr:last-child td {
            border-bottom: none;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            white-space: nowrap;
        }

        .status-badge.active {
            background: rgba(16, 185, 129, 0.15);
            color: #10b981;
        }

        .status-badge.completed {
            background: rgba(59, 130, 246, 0.15);
            color: #3b82f6;
        }

        .status-badge.pending,
        .status-badge.review {
            background: rgba(245, 158, 11, 0.15);
            color: #f59e0b;
        }

        .status-badge.rejected,
        .status-badge.lost {
            background: rgba(239, 68, 68, 0.15);
            color: #ef4444;
        }

        .status-badge.approved {
            background: rgba(16, 185, 129, 0.15);
            color: #10b981;
        }

        /* Footer */
        .report-footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid var(--border);
            text-align: center;
            color: var(--text-tertiary);
            font-size: 12px;
        }

        /* Print Styles */
        @media print {
            body {
                background: white;
                color: #333;
            }

            :root {
                --bg-primary: white;
                --bg-secondary: #f8f9fa;
                --bg-elevated: #f1f3f5;
                --text-primary: #333;
                --text-secondary: #666;
                --text-tertiary: #999;
                --border: #ddd;
                --border-light: #eee;
            }

            .report-container {
                max-width: 100%;
                padding: 20px;
            }

            summary-card:hover {
                border-color: initial;
            }

            table tr {
                page-break-inside: avoid;
            }

            .print-hide {
                display: none;
            }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .report-title {
                font-size: 24px;
            }

            .summary-grid {
                grid-template-columns: 1fr;
            }

            table {
                font-size: 12px;
            }

            th, td {
                padding: 10px 12px;
            }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <!-- Header -->
        <div class="report-header">
            <div class="logo-section">
                <span class="logo-icon">M<span style="color: #ef4444;">.</span></span>
                <span class="logo-text">Morgan</span>
            </div>

            <h1 class="report-title">${report.source.replace(/_/g, ' ')} Report</h1>

            <div class="report-meta">
                <div class="meta-item">
                    <span class="meta-label">Generated</span>
                    <span class="meta-value">${timestamp}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Records</span>
                    <span class="meta-value">${report.data.length}</span>
                </div>
                ${report.summary?.totalValue ? `
                <div class="meta-item">
                    <span class="meta-label">Total Value</span>
                    <span class="meta-value">AED ${report.summary.totalValue.toLocaleString('en-AE', { maximumFractionDigits: 0 })}</span>
                </div>
                ` : ''}
            </div>
        </div>

        <!-- Summary Cards -->
        ${report.summary ? `
        <div class="summary-grid">
            <div class="summary-card">
                <span class="card-label">Total Records</span>
                <div class="card-value">${report.summary.totalCount}</div>
                <span class="card-subtext">${report.summary.activeCount} active</span>
            </div>
            ${report.summary.totalValue ? `
            <div class="summary-card">
                <span class="card-label">Total Value</span>
                <div class="card-value">AED ${(report.summary.totalValue / 1000000).toFixed(1)}M</div>
                <span class="card-subtext">Portfolio value</span>
            </div>
            ` : ''}
        </div>
        ` : ''}

        <!-- Data Table -->
        <div class="table-section">
            <div class="table-header">
                <h2 class="table-title">Report Data</h2>
            </div>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            ${report.columns.map(col => `<th>${col}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${report.data.map(row => `
                        <tr>
                            ${report.columns.map((col, idx) => {
                                const value = Object.values(row)[idx];
                                let cellHTML = '';

                                // Check if it's a status field
                                if (typeof value === 'string' && ['Active', 'Completed', 'Paused', 'Rejected', 'Approved', 'Review', 'Reviewed', 'Won', 'Lost', 'Pending'].includes(value)) {
                                    const statusClass = value.toLowerCase().replace(/\s+/g, '');
                                    cellHTML = `<span class="status-badge ${statusClass}">${value}</span>`;
                                } else {
                                    cellHTML = String(value || '--');
                                }

                                return `<td>${cellHTML}</td>`;
                            }).join('')}
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Footer -->
        <div class="report-footer">
            <p>MCE Command Center • Executive Intelligence System</p>
            <p>This report contains confidential information. Do not distribute without authorization.</p>
        </div>
    </div>

    <script>
        // Print functionality
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                window.print();
            }
        });
    </script>
</body>
</html>
  `;
}

/**
 * Download HTML report as file
 */
export function downloadHTMLReport(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * View HTML report in new tab using safe DOM methods
 */
export function viewHTMLReport(html: string, title: string) {
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.open();
    newWindow.document.write(html);
    newWindow.document.close();
    newWindow.document.title = title;
  }
}
