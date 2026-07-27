$lines = Get-Content 'data.js' -Encoding UTF8

Write-Host "=== GARBLED STRINGS ==="
for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    if ($line -match 'Tamamland|Sradak|Ã„|Ã…') {
        Write-Host "L$($i+1): $($line.Trim())"
    }
}

Write-Host "`n=== DOTTED CAPITAL Ä° IN F1 & MOTOGP ==="
for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $lineNum = $i + 1
    if ($lineNum -le 8335 -and $line -match 'Ä°') {
        Write-Host "L${lineNum}: $($line.Trim())"
    }
}