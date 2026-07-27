$lines = [System.IO.File]::ReadAllLines((Resolve-Path "style.css").Path, [System.Text.Encoding]::UTF8)

for ($i = 0; $i -lt 100; $i++) {
    if ($lines[$i] -match 'text-transform') {
        Write-Host "L$($i+1): $($lines[$i].Trim())"
        for ($j = -3; $j -le 3; $j++) {
            if ($i + $j -ge 0 -and $i + $j -lt $lines.Length) {
                Write-Host "   [$($i+$j+1)]: $($lines[$i+$j].Trim())"
            }
        }
    }
}
