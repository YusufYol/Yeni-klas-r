$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

Write-Host "=== MOTOGP STANDINGS PILOTS (Lines 8074 to 8265) ==="
for ($i = 8074; $i -lt 8265; $i++) {
    if ($lines[$i] -match '"name":\s*"(.*?)"' -or $lines[$i] -match '"team":\s*"(.*?)"') {
        $val = $matches[1]
        $chars = ($val.ToCharArray() | ForEach-Object { "$_ (0x{0:X4})" -f [int]$_ }) -join ", "
        Write-Host "$($i+1): '$val'"
    }
}

Write-Host "`n=== MOTOGP STANDINGS TEAMS (Lines 8266 to 8335) ==="
for ($i = 8265; $i -lt 8335; $i++) {
    if ($lines[$i] -match '"name":\s*"(.*?)"') {
        $val = $matches[1]
        Write-Host "$($i+1): '$val'"
    }
}
