$path = (Resolve-Path "style.css").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match "text-transform:\s*uppercase") {
        $start = [Math]::Max(0, $i - 4)
        Write-Host "--- Line $($i+1) ---"
        for ($j = $start; $j -le $i; $j++) {
            Write-Host "L$($j+1): $($lines[$j])"
        }
    }
}
