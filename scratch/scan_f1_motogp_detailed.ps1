$lines = Get-Content 'data.js' -Encoding UTF8

Write-Host "=== F1 (lines 805 to 4324) ==="
for ($i = 804; $i -lt 4324; $i++) {
    $line = $lines[$i]
    if ($line -match '[ıİ]') {
        Write-Host "L$($i+1): $($line.Trim())"
    }
}

Write-Host "`n=== MOTOGP (lines 4604 to 8335) ==="
for ($i = 4603; $i -lt 8335; $i++) {
    $line = $lines[$i]
    if ($line -match '[ıİ]') {
        Write-Host "L$($i+1): $($line.Trim())"
    }
}

Write-Host "`n=== TRACK DETAILS (lines 8868+) ==="
for ($i = 8867; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    if ($line -match '[ıİ]') {
        Write-Host "L$($i+1): $($line.Trim())"
    }
}
