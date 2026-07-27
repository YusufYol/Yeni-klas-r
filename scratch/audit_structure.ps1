$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

# Print lines around 1020..1040, 1630..1650, 4320..4335, 5440..5455, 8070..8085, 8330..8345
function Print-Range ($start, $end) {
    Write-Host "=== Lines $start to $end ==="
    for ($i = $start - 1; $i -lt $end -and $i -lt $lines.Length; $i++) {
        Write-Host "$($i+1): $($lines[$i])"
    }
}

Print-Range 1020 1040
Print-Range 1630 1650
Print-Range 4320 4335
Print-Range 5440 5455
Print-Range 8070 8085
Print-Range 8330 8345
