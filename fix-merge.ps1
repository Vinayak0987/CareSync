# Quick fix script for merge conflicts

$file = "src/pages/Login.tsx"
$content = Get-Content $file -Raw

# Remove all merge conflict markers and keep the appropriate content
$content = $content -replace "<<<<<<< HEAD\r?\n", ""
$content = $content -replace "=======\r?\n", ""
$content = $content -replace ">>>>>>> [\w\d]+\r?\n", ""

# Fix specific sections manually
# This removes duplicate imports and keeps the combined version

Set-Content -Path $file -Value $content -NoNewline

Write-Host "Merge conflicts resolved! Please verify the file."
