$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

Write-Host "=== Searching for SERGIO PEREZ / MAVERICK VINALES ==="
for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    if ($line -match "SERGIO" -or $line -match "MAVERICK" -or $line -match "PEREZ" -or $line -match "PÉREZ" -or $line -match "VINALES" -or $line -match "VIÑALES") {
        Write-Host "L$($i+1): $line"
    }
}

Write-Host "`n=== Searching for dotted 'İ' in ALL Standings (F1 & MotoGP) ==="
# F1 standings: approx lines 1029..1221
# MotoGP standings: approx lines 8074..8335
for ($i = 1028; $i -le 1221; $i++) {
    $line = $lines[$i]
    if ($line.Contains([char]0x0130)) {
        Write-Host "F1 Standings L$($i+1): $line"
    }
}
for ($i = 8073; $i -le 8335; $i++) {
    $line = $lines[$i]
    if ($line.Contains([char]0x0130)) {
        Write-Host "MotoGP Standings L$($i+1): $line"
    }
}
