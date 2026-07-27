$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

$dottedIChar = [char]0x0130  # İ
$dotlessIChar = [char]0x0131 # ı

$garbledCount = 0
$dottedICount = 0

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $num = $i + 1

    if ($line.Contains("Tamamland") -and -not $line.Contains("Tamamlandı") -and -not $line.Contains("Tamamlandi")) {
        Write-Host "Garbled status at L${num}: $($line.Trim())"
        $garbledCount++
    }

    if ($num -le 8335 -and $line.Contains($dottedIChar)) {
        Write-Host "Dotted I at L${num}: $($line.Trim())"
        $dottedICount++
    }
}

Write-Host "Total Garbled Statuses: $garbledCount"
Write-Host "Total Dotted I in F1/MotoGP: $dottedICount"
