$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

Write-Host "=== F1 Pilots (Lines 804 to 830) ==="
for ($i = 804; $i -le 830; $i++) {
    Write-Host "$($i+1): $($lines[$i])"
}

Write-Host "`n=== F1 Standings Pilots (Lines 1029 to 1050) ==="
for ($i = 1029; $i -le 1050; $i++) {
    Write-Host "$($i+1): $($lines[$i])"
}

Write-Host "`n=== MotoGP Standings Pilots (Lines 8074 to 8095) ==="
for ($i = 8074; $i -le 8095; $i++) {
    Write-Host "$($i+1): $($lines[$i])"
}
