$path = (Resolve-Path "style.css").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match "text-transform") {
        # print previous 10 lines to see selector
        $start = [Math]::Max(0, $i - 10)
        Write-Host "--- Line $($i+1): $($lines[$i]) ---"
        for ($j = $start; $j -le $i; $j++) {
            Write-Host "$($j+1): $($lines[$j])"
        }
    }
}
