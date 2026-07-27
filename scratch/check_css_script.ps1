$css = Get-Content "style.css" -Raw
$script = Get-Content "script.js" -Raw
$admin = Get-Content "admin.html" -Raw
$index = Get-Content "index.html" -Raw

Write-Host "=== style.css text-transform occurrences ==="
$css -split "`n" | Where-Object { $_ -match "text-transform" } | ForEach-Object { Write-Host $_ }

Write-Host "`n=== script.js text-transform occurrences ==="
$script -split "`n" | Where-Object { $_ -match "text-transform" -or $_ -match "toUpperCase" -or $_ -match "toLowerCase" } | ForEach-Object { Write-Host $_ }

Write-Host "`n=== admin.html text-transform / uppercase occurrences ==="
$admin -split "`n" | Where-Object { $_ -match "text-transform" -or $_ -match "toUpperCase" -or $_ -match "toLowerCase" } | ForEach-Object { Write-Host $_ }
