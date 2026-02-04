# PowerShell script to replace blue colors with zinc colors in TypeScript/TSX files
# This script performs safe, targeted replacements for dark mode blue color removal

$rootPath = "c:\Users\t1glish\Downloads\nexus-construct-erp (2)"

# Define replacement patterns (blue -> zinc)
$replacements = @(
    @{ Pattern = 'text-blue-300'; Replacement = 'text-zinc-300' },
    @{ Pattern = 'text-blue-400'; Replacement = 'text-zinc-400' },
    @{ Pattern = 'text-blue-500'; Replacement = 'text-zinc-500' },
    @{ Pattern = 'bg-blue-300'; Replacement = 'bg-zinc-500' },
    @{ Pattern = 'bg-blue-400'; Replacement = 'bg-zinc-600' },
    @{ Pattern = 'bg-blue-500'; Replacement = 'bg-zinc-700' },
    @{ Pattern = 'bg-blue-600'; Replacement = 'bg-zinc-700' },
    @{ Pattern = 'border-blue-300'; Replacement = 'border-zinc-500' },
    @{ Pattern = 'border-blue-400'; Replacement = 'border-zinc-500' },
    @{ Pattern = 'border-blue-500'; Replacement = 'border-zinc-500' },
    @{ Pattern = 'border-blue-600'; Replacement = 'border-zinc-600' },
    @{ Pattern = 'from-blue-500'; Replacement = 'from-zinc-600' },
    @{ Pattern = 'from-blue-600'; Replacement = 'from-zinc-700' },
    @{ Pattern = 'to-blue-500'; Replacement = 'to-zinc-600' },
    @{ Pattern = 'to-blue-600'; Replacement = 'to-zinc-700' },
    @{ Pattern = 'hover:bg-blue-500'; Replacement = 'hover:bg-zinc-600' },
    @{ Pattern = 'hover:bg-blue-600'; Replacement = 'hover:bg-zinc-700' },
    @{ Pattern = 'hover:text-blue-300'; Replacement = 'hover:text-zinc-300' },
    @{ Pattern = 'hover:text-blue-400'; Replacement = 'hover:text-zinc-400' },
    @{ Pattern = 'hover:text-blue-500'; Replacement = 'hover:text-zinc-500' },
    @{ Pattern = 'hover:border-blue-500'; Replacement = 'hover:border-zinc-500' },
    @{ Pattern = 'group-hover:text-blue-300'; Replacement = 'group-hover:text-zinc-300' },
    @{ Pattern = 'group-hover:text-blue-400'; Replacement = 'group-hover:text-zinc-400' },
    @{ Pattern = 'group-hover:text-blue-500'; Replacement = 'group-hover:text-zinc-500' },
    @{ Pattern = 'focus-within:text-blue-500'; Replacement = 'focus-within:text-zinc-400' },
    @{ Pattern = 'focus:border-blue-500'; Replacement = 'focus:border-zinc-500' },
    @{ Pattern = 'bg-blue-500/10'; Replacement = 'bg-zinc-500/10' },
    @{ Pattern = 'bg-blue-500/20'; Replacement = 'bg-zinc-500/20' },
    @{ Pattern = 'bg-blue-600/10'; Replacement = 'bg-zinc-600/10' },
    @{ Pattern = 'border-blue-500/20'; Replacement = 'border-zinc-500/20' },
    @{ Pattern = 'border-blue-500/30'; Replacement = 'border-zinc-500/30' },
    @{ Pattern = 'shadow-blue-600/20'; Replacement = 'shadow-zinc-700/20' },
    @{ Pattern = 'shadow-\[0_0_20px_rgba\(37,99,235,0\.4\)\]'; Replacement = 'shadow-[0_0_20px_rgba(113,113,122,0.4)]' },
    @{ Pattern = 'shadow-\[0_0_20px_rgba\(37,99,235,0\.3\)\]'; Replacement = 'shadow-[0_0_20px_rgba(113,113,122,0.3)]' },
    @{ Pattern = 'shadow-\[0_0_15px_rgba\(37,99,235,0\.3\)\]'; Replacement = 'shadow-[0_0_15px_rgba(113,113,122,0.3)]' },
    @{ Pattern = 'shadow-\[0_0_10px_rgba\(56,189,248,0\.2\)\]'; Replacement = 'shadow-[0_0_10px_rgba(113,113,122,0.2)]' },
    @{ Pattern = 'shadow-\[0_0_8px_rgba\(59,130,246,0\.8\)\]'; Replacement = 'shadow-[0_0_8px_rgba(113,113,122,0.8)]' }
)

# Files to process (specific components with blue colors)
$filesToProcess = @(
    "components\dashboard\StrategicVolumeChart.tsx",
    "components\dashboard\RiskHeatmapV2.tsx",
    "components\dashboard\NotificationsPanel.tsx",
    "components\ui\FinancialMetricCard.tsx",
    "components\tasks\TaskListView.tsx",
    "components\tasks\TasksDashboard.tsx",
    "components\tasks\TaskCategoriesView.tsx",
    "components\tenders\TenderChecklistTracker.tsx",
    "components\settings\TeamManagement.tsx",
    "components\projects\ProjectDetail.tsx",
    "components\projects\FinancialSummary.tsx",
    "components\pages\IntegrationsPage.tsx",
    "components\pages\ProjectsPage.tsx",
    "components\pages\ReportsPage.tsx",
    "components\pages\SettingsPage.tsx",
    "components\pages\ProfilePage.tsx",
    "components\pages\FieldOperationsPage.tsx"
)

Write-Host "Starting blue color removal process..." -ForegroundColor Cyan
Write-Host "Root path: $rootPath" -ForegroundColor Gray
Write-Host ""

$totalChanges = 0

foreach ($file in $filesToProcess) {
    $fullPath = Join-Path $rootPath $file
    
    if (Test-Path $fullPath) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        
        $content = Get-Content $fullPath -Raw
        $originalContent = $content
        $fileChanges = 0
        
        foreach ($replacement in $replacements) {
            $pattern = $replacement.Pattern
            $newValue = $replacement.Replacement
            
            if ($content -match $pattern) {
                $matches = ([regex]::Matches($content, $pattern)).Count
                $content = $content -replace $pattern, $newValue
                $fileChanges += $matches
                Write-Host "  ✓ Replaced '$pattern' -> '$newValue' ($matches occurrences)" -ForegroundColor Green
            }
        }
        
        if ($fileChanges -gt 0) {
            Set-Content -Path $fullPath -Value $content -NoNewline
            $totalChanges += $fileChanges
            Write-Host "  Saved $fileChanges changes to file" -ForegroundColor Cyan
        } else {
            Write-Host "  No changes needed" -ForegroundColor Gray
        }
        
        Write-Host ""
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Blue color removal complete!" -ForegroundColor Green
Write-Host "Total replacements made: $totalChanges" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
