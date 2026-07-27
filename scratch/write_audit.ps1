$scriptContent = @'
$lines = Get-Content 'data.js' -Encoding UTF8

Write-Host "=== GARBLED STRINGS ==="
for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    if ($line -match 'Tamamland|Sradak|Ä|Å') {
        Write-Host "L$($i+1): $($line.Trim())"
    }
}

Write-Host "`n=== DOTTED CAPITAL İ IN F1 & MOTOGP ==="
for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $lineNum = $i + 1
    if ($lineNum -le 8335 -and $line -match 'İ') {
        Write-Host "L${lineNum}: $($line.Trim())"
    }
}
'@

$utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path -Path ".").Path + "\scratch\audit_and_fix_issues.ps1", $scriptContent, $utf8NoBOM)
