$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

$line808 = $lines[807]
Write-Host "Line 808 raw: '$line808'"

if ($line808 -match '^\s*"(name|pilot|team)"\s*:\s*"(.*?)"(\s*,?)$') {
    $val = $matches[2]
    Write-Host "Extracted val: '$val'"
    Write-Host "Val Length: $($val.Length)"
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($val)
    Write-Host "Val Bytes: $($bytes -join ' ')"
}

$mapKey = "MAX VERSTAPPEN #3"
$mapBytes = [System.Text.Encoding]::UTF8.GetBytes($mapKey)
Write-Host "MapKey Bytes: $($mapBytes -join ' ')"
