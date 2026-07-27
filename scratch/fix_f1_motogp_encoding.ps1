$dataJs = Get-Content 'data.js' -Raw -Encoding UTF8

# Replace garbled Toprak strings first
$dataJs = $dataJs -replace 'Toprak RazgatıoÄŸlu', 'Toprak Razgatlioglu'
$dataJs = $dataJs -replace 'Toprak Razgatlıoğlu', 'Toprak Razgatlioglu'

# Split into lines
$lines = Get-Content 'data.js' -Encoding UTF8
$newLines = [System.Collections.Generic.List[string]]::new()

$inF1 = $false
$inMotoGP = $false
$inNews = $false
$f1Depth = 0
$motogpDepth = 0

# We want to normalize character encoding (ı -> i, İ -> I) in F1 and MotoGP sections (pilots, teams, standings, calendar, resultsHistory)
# except news content if desired, or in F1 & MotoGP non-news objects.
# Let's inspect line ranges: F1 non-news starts at "pilots": [ (line 805) up to line 4324.
# MotoGP non-news starts at "pilots": [ (line 4604) up to line 8335.

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $lineNum = $i + 1

    # Check if we are inside non-news F1 (805-4324) or non-news MotoGP (4604-8335)
    $isF1NonNews = ($lineNum -ge 805 -and $lineNum -le 4324)
    $isMotoGPNonNews = ($lineNum -ge 4604 -and $lineNum -le 8335)

    if ($isF1NonNews -or $isMotoGPNonNews) {
        # Perform replacements on this line
        $updatedLine = $line -replace 'ı', 'i' -replace 'İ', 'I'
        $newLines.Add($updatedLine)
    } else {
        $newLines.Add($line)
    }
}

$result = $newLines -join "`r`n"
Set-Content -Path 'data.js' -Value $result -Encoding UTF8
Write-Host "Updated data.js successfully!"
