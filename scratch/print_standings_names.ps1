$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

Write-Host "=== F1 STANDINGS PILOTS ==="
for ($i = 1029; $i -lt 1164; $i++) {
    if ($lines[$i] -match '"name":') { Write-Host $lines[$i].Trim() }
}

Write-Host "`n=== F1 STANDINGS TEAMS ==="
for ($i = 1164; $i -lt 1220; $i++) {
    if ($lines[$i] -match '"name":') { Write-Host $lines[$i].Trim() }
}

Write-Host "`n=== MOTOGP STANDINGS PILOTS ==="
for ($i = 8074; $i -lt 8265; $i++) {
    if ($lines[$i] -match '"name":') { Write-Host $lines[$i].Trim() }
}

Write-Host "`n=== MOTOGP STANDINGS TEAMS ==="
for ($i = 8266; $i -lt 8334; $i++) {
    if ($lines[$i] -match '"name":') { Write-Host $lines[$i].Trim() }
}
