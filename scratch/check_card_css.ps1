$lines = [System.IO.File]::ReadAllLines((Resolve-Path "style.css").Path, [System.Text.Encoding]::UTF8)

for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match '\.(pilot-card-name|team-card-name|podium-card|pilot-card-team)') {
        Write-Host "L$($i+1): $($lines[$i].Trim())"
        for ($j = 1; $j -le 8; $j++) {
            if ($i + $j -lt $lines.Length) {
                Write-Host "   +$($j): $($lines[$i+$j].Trim())"
            }
        }
    }
}
