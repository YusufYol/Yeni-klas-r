$path = (Resolve-Path "script.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    if ($line -match 'standings|puan|table|pilot|team') {
        Write-Host "L$($i+1): $($line.Trim())"
    }
}
