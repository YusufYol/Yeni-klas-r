$lines = Get-Content 'data.js' -Encoding UTF8

$garbled = @()
$dottedI = @()

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $num = $i + 1

    if ($line.Contains("Tamamland") -or $line.Contains("Sradak") -or $line.Contains("Ä") -or $line.Contains("Å")) {
        $garbled += "L${num}: $($line.Trim())"
    }

    if ($num -le 8335 -and $line.Contains("İ")) {
        $dottedI += "L${num}: $($line.Trim())"
    }
}

Write-Host "=== GARBLED COUNT: $($garbled.Count) ==="
$garbled | Select-Object -First 30 | ForEach-Object { Write-Host $_ }

Write-Host "`n=== DOTTED I IN F1/MOTOGP COUNT: $($dottedI.Count) ==="
$dottedI | Select-Object -First 30 | ForEach-Object { Write-Host $_ }
