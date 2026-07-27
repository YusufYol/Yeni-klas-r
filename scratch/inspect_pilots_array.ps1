$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

Write-Host "=== F1 Pilots Array (Lines 805 to 960) ==="
for ($i = 804; $i -le 960; $i++) {
    $line = $lines[$i]
    if ($line -match '"(name|team)":\s*"(.*?)"') {
        $key = $matches[1]
        $val = $matches[2]
        if ($val -cmatch '[A-Z]{4,}' -or $val.Contains([char]0x0130)) {
            Write-Host "L$($i+1) ($key): $val"
        }
    }
}

Write-Host "`n=== MotoGP Pilots Array (Lines 4604 to 4750) ==="
for ($i = 4603; $i -le 4750; $i++) {
    $line = $lines[$i]
    if ($line -match '"(name|team)":\s*"(.*?)"') {
        $key = $matches[1]
        $val = $matches[2]
        if ($val -cmatch '[A-Z]{4,}' -or $val.Contains([char]0x0130)) {
            Write-Host "L$($i+1) ($key): $val"
        }
    }
}
