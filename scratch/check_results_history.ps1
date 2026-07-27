$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

Write-Host "=== F1 ResultsHistory sample (line 1638+) ==="
for ($i = 1638; $i -lt 1700; $i++) {
    if ($lines[$i] -match '"pilot":\s*"(.*?)"' -or $lines[$i] -match '"team":\s*"(.*?)"') {
        Write-Host "$($i+1): $($lines[$i].Trim())"
    }
}

Write-Host "`n=== MotoGP ResultsHistory sample (line 5443+) ==="
for ($i = 5443; $i -lt 5505; $i++) {
    if ($lines[$i] -match '"pilot":\s*"(.*?)"' -or $lines[$i] -match '"team":\s*"(.*?)"') {
        Write-Host "$($i+1): $($lines[$i].Trim())"
    }
}
