$dataJs = Get-Content 'data.js' -Raw -Encoding UTF8

$lines = Get-Content 'data.js' -Encoding UTF8

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    if ($line -match '^\s*"[a-zA-Z0-9 _-]+"\s*:\s*[{[]') {
        Write-Host "L$($i+1): $($line.Trim())"
    }
}
