$path = (Resolve-Path "admin.html").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    if ($line -match "pilot" -or $line -match "team" -or $line -match "standings" -or $line -match "toUpperCase" -or $line -match "toLowerCase") {
        Write-Host "Line $($i+1): $($line.Trim())"
    }
}
