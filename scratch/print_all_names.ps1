$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

Write-Host "=== FORMULA 1 PILOTS (Line 805) ==="
for ($i = 804; $i -lt 960; $i++) {
    if ($lines[$i] -match '"name":\s*"(.*?)"') { Write-Host $matches[1] }
}

Write-Host "`n=== FORMULA 1 TEAMS (Line 961) ==="
for ($i = 960; $i -lt 1028; $i++) {
    if ($lines[$i] -match '"name":\s*"(.*?)"') { Write-Host $matches[1] }
}

Write-Host "`n=== FORMULA 1 STANDINGS PILOTS (Line 1030) ==="
for ($i = 1029; $i -lt 1163; $i++) {
    if ($lines[$i] -match '"name":\s*"(.*?)"') { Write-Host $matches[1] }
}

Write-Host "`n=== FORMULA 1 STANDINGS TEAMS (Line 1164) ==="
for ($i = 1163; $i -lt 1220; $i++) {
    if ($lines[$i] -match '"name":\s*"(.*?)"') { Write-Host $matches[1] }
}

Write-Host "`n=== MOTOGP PILOTS (Line 4604) ==="
for ($i = 4603; $i -lt 4759; $i++) {
    if ($lines[$i] -match '"name":\s*"(.*?)"') { Write-Host $matches[1] }
}

Write-Host "`n=== MOTOGP TEAMS (Line 4760) ==="
for ($i = 4759; $i -lt 4838; $i++) {
    if ($lines[$i] -match '"name":\s*"(.*?)"') { Write-Host $matches[1] }
}

Write-Host "`n=== MOTOGP STANDINGS PILOTS (Line 8075) ==="
for ($i = 8074; $i -lt 8265; $i++) {
    if ($lines[$i] -match '"name":\s*"(.*?)"') { Write-Host $matches[1] }
}

Write-Host "`n=== MOTOGP STANDINGS TEAMS (Line 8266) ==="
for ($i = 8265; $i -lt 8334; $i++) {
    if ($lines[$i] -match '"name":\s*"(.*?)"') { Write-Host $matches[1] }
}
