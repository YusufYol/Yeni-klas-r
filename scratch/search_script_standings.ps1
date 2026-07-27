$path = (Resolve-Path "script.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    if ($line -match "standings" -or $line -match "renderPilotsTable" -or $line -match "renderTeamsTable" -or $line -match "İ" -or $line -match "toUpperCase") {
        Write-Host "L$($i+1): $($line.Trim())"
    }
}
