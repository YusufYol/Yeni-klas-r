$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

Write-Host "Line 934: $($lines[933])"
$bytes = [System.Text.Encoding]::UTF8.GetBytes($lines[933])
Write-Host "Bytes: $($bytes -join ' ')"
