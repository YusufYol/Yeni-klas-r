$content = Get-Content "index.html" -Raw -Encoding UTF8
$lines = $content -split "`n"
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match "MERCEDES" -or $lines[$i] -match "RED BULL" -or $lines[$i] -match "VERSTAPPEN" -or $lines[$i] -match "MARTIN") {
        Write-Host "Line $($i+1): $($lines[$i].Trim())"
    }
}
