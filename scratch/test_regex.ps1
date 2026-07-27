$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

for ($i = 804; $i -lt 820; $i++) {
    $line = $lines[$i]
    $num = $i + 1
    if ($line -match '"(name|pilot|team)"\s*:\s*"(.*?)"') {
        Write-Host "L${num}: Key='$($matches[1])', Val='$($matches[2])'"
    }
}
