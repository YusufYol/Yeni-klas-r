$path = (Resolve-Path "style.css").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    if ($line -match "standings" -or $line -match "pilots" -or $line -match "team" -or $line -match "results") {
        $start = [Math]::Max(0, $i - 2)
        $end = [Math]::Min($lines.Length - 1, $i + 5)
        Write-Host "--- Line $($i+1) ---"
        for ($j = $start; $j -le $end; $j++) {
            Write-Host "$($j+1): $($lines[$j])"
        }
    }
}
