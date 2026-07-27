$data = Get-Content 'data.js' -Raw -Encoding UTF8

# Find line ranges for F1 and MotoGP sections or inspect properties
$lines = Get-Content 'data.js' -Encoding UTF8

$inF1 = $false
$inMotoGP = $false
$inNews = $false

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $lineNum = $i + 1

    if ($line -match '"haberler":') {
        $inNews = $true
    }
    if ($line -match '"formula 1":') {
        $inNews = $false
        $inF1 = $true
    }
    if ($line -match '"motogp":') {
        $inNews = $false
        $inMotoGP = $true
    }

    if (-not $inNews) {
        if ($line -match '[ıİ]') {
            Write-Host "L${lineNum}: $($line.Trim())"
        }
    }
}
