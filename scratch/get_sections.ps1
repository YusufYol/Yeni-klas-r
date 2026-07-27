$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match '"(pilots|teams|standings)"\s*:') {
        Write-Host "L$($i+1): $($lines[$i].Trim())"
    }
}
