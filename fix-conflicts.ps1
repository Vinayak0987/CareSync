# Fix all merge conflicts by removing conflict markers
$files = @(
    "src\components\dashboard\DashboardHome.tsx",
    "src\components\dashboard\QuickVitalsLog.tsx", 
    "src\components\dashboard\NextAppointment.tsx",
    "server\models\User.js"
)

foreach ($file in $files) {
    $path = "E:\MCCC\care-connect-hub\$file"
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        
        # Remove all merge conflict markers and their content
        $content = $content -replace "<<<<<<< HEAD[\r\n]+", ""
        $content = $content -replace "=======[\r\n]+", ""
        $content = $content -replace ">>>>>>> [a-f0-9]+[\r\n]+", ""
        
        Set-Content $path $content -NoNewline
        Write-Host "Fixed: $file" -ForegroundColor Green
    }
}

# Delete package-lock.json (will be regenerated)
$lockFile = "E:\MCCC\care-connect-hub\server\package-lock.json"
if (Test-Path $lockFile) {
    Remove-Item $lockFile
    Write-Host "Deleted package-lock.json (will regenerate)" -ForegroundColor Yellow
}

Write-Host "`nAll merge conflicts resolved!" -ForegroundColor Cyan
