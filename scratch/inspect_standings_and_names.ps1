$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

Write-Host "=== F1 Standings Pilots (Lines 1030 to 1165) ==="
for ($i = 1029; $i -le 1164; $i++) {
    $line = $lines[$i]
    if ($line -match '"(name|team)":\s*"(.*?)"') {
        $key = $matches[1]
        $val = $matches[2]
        if ($val -cmatch '[A-Z]{4,}' -or $val.Contains([char]0x0130)) {
            Write-Host "L$($i+1) ($key): $val"
        }
    }
}

Write-Host "`n=== F1 Standings Teams (Lines 1166 to 1221) ==="
for ($i = 1165; $i -le 1220; $i++) {
    $line = $lines[$i]
    if ($line -match '"name":\s*"(.*?)"') {
        $val = $matches[1]
        if ($val -cmatch '[A-Z]{4,}' -or $val.Contains([char]0x0130)) {
            Write-Host "L$($i+1) (name): $val"
        }
    }
}

Write-Host "`n=== MotoGP Standings Pilots (Lines 8075 to 8265) ==="
for ($i = 8074; $i -le 8264; $i++) {
    $line = $lines[$i]
    if ($line -match '"(name|team)":\s*"(.*?)"') {
        $key = $matches[1]
        $val = $matches[2]
        if ($val -cmatch '[A-Z]{4,}' -or $val.Contains([char]0x0130)) {
            Write-Host "L$($i+1) ($key): $val"
        }
    }
}

Write-Host "`n=== MotoGP Standings Teams (Lines 8266 to 8335) ==="
for ($i = 8265; $i -le 8334; $i++) {
    $line = $lines[$i]
    if ($line -match '"name":\s*"(.*?)"') {
        $val = $matches[1]
        if ($val -cmatch '[A-Z]{4,}' -or $val.Contains([char]0x0130)) {
            Write-Host "L$($i+1) (name): $val"
        }
    }
}
