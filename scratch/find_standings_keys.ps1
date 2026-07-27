$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

for ($i = 0; $i -lt 4500; $i++) {
    $line = $lines[$i]
    if ($line -match '"(standings|puan|pilots|teams|drivers|constructors|pilot|takim)"\s*:') {
        Write-Host "L$($i+1): $($line.Trim())"
    }
}
