$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $num = $i + 1
    if ($line -match '^\s*"([a-zA-Z0-9_ ]+)"\s*:\s*\[') {
        Write-Host "Array at line ${num}: $($matches[1])"
    }
}
