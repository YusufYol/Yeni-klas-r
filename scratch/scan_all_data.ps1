$lines = Get-Content 'data.js' -Encoding UTF8
for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    if ($line -match '[ıİ]') {
        $num = $i + 1
        Write-Host "L${num}: $($line.Trim())"
    }
}
