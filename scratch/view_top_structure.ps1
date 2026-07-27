$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

Write-Host "=== F1 TOP STRUCTURE ==="
for ($i = 0; $i -lt 100; $i++) {
    Write-Host "L$($i+1): $($lines[$i])"
}

Write-Host "`n=== MOTOGP TOP STRUCTURE ==="
for ($i = 4320; $i -lt 4420; $i++) {
    Write-Host "L$($i+1): $($lines[$i])"
}
