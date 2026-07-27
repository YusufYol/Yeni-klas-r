$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

Write-Host "Total lines: $($lines.Length)"

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $num = $i + 1
    if ($line -match '^\s*"([a-zA-Z0-9 1-9]+)"\s*:\s*\{') {
        Write-Host "Line ${num}: $($matches[1])"
    }
}
