$dataJs = Get-Content 'data.js' -Raw -Encoding UTF8

# Parse using PowerShell or simple Regex scan on relevant JSON subsections
# Let's find index of "formula 1" and "motogp" in data.js

$lines = Get-Content 'data.js' -Encoding UTF8
$inF1 = $false
$inMotoGP = $false
$inNews = $false

$f1Matches = @()
$motogpMatches = @()

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $lineNum = $i + 1

    if ($line -match '"haberler":') {
        $inNews = $true
        $inF1 = $false
        $inMotoGP = $false
    }
    if ($line -match '"formula 1":') {
        $inNews = $false
        $inF1 = $true
        $inMotoGP = $false
    }
    if ($line -match '"motogp":') {
        $inNews = $false
        $inF1 = $false
        $inMotoGP = $true
    }

    if ($line -match '[ıİ]') {
        if ($inF1) {
            $f1Matches += "L${lineNum}: $($line.Trim())"
        }
        elseif ($inMotoGP) {
            $motogpMatches += "L${lineNum}: $($line.Trim())"
        }
    }
}

Write-Host "=== F1 MATCHES ($($f1Matches.Count)) ==="
$f1Matches | Select-Object -First 50 | ForEach-Object { Write-Host $_ }

Write-Host "`n=== MOTOGP MATCHES ($($motogpMatches.Count)) ==="
$motogpMatches | Select-Object -First 50 | ForEach-Object { Write-Host $_ }
