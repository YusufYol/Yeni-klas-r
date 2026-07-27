$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

# Title Case conversion helper
function Convert-ToTitleCase ($name) {
    if (-not $name) { return $name }
    
    # Split by spaces or hyphens, but preserve hyphens and # tags
    # Example: "MERCEDES-AMG PETRONAS F1 TEAM" -> "Mercedes-AMG Petronas F1 Team"
    # Example: "MAX VERSTAPPEN #3" -> "Max Verstappen #3"
    # Example: "CARLOS SAINZ JR. #55" -> "Carlos Sainz Jr. #55"
    
    # We can handle known acronyms or standard rules
    # Standard title casing:
    $words = $name -split ' '
    $newWords = foreach ($w in $words) {
        if ($w -match '^#\d+$') {
            $w
        } elseif ($w -eq "F1" -or $w -eq "HP" -or $w -eq "BWT" -or $w -eq "RB" -or $w -eq "KTM" -or $w -eq "BK8" -or $w -eq "VR46" -or $w -eq "LCR" -or $w -eq "AMG" -or $w -eq "JR.") {
            $w
        } elseif ($w -contains "-") {
            # e.g. MERCEDES-AMG -> Mercedes-AMG
            $sub = $w -split '-'
            $subFixed = foreach ($s in $sub) {
                if ($s -eq "AMG" -or $s -eq "F1" -or $s -eq "RB" -or $s -eq "BWT") { $s }
                else {
                    if ($s.Length -gt 1) { $s.Substring(0,1).ToUpper() + $s.Substring(1).ToLower() }
                    else { $s.ToUpper() }
                }
            }
            $subFixed -join '-'
        } else {
            if ($w.Length -gt 1) {
                $w.Substring(0,1).ToUpper() + $w.Substring(1).ToLower()
            } else {
                $w.ToUpper()
            }
        }
    }
    return $newWords -join ' '
}

# Test on F1 pilots
Write-Host "=== TEST F1 PILOTS CONVERSION ==="
for ($i = 804; $i -lt 960; $i++) {
    if ($lines[$i] -match '"name":\s*"(.*?)"') {
        $orig = $matches[1]
        $tc = Convert-ToTitleCase $orig
        Write-Host "$orig => $tc"
    }
}

Write-Host "`n=== TEST F1 TEAMS CONVERSION ==="
for ($i = 960; $i -lt 1028; $i++) {
    if ($lines[$i] -match '"name":\s*"(.*?)"') {
        $orig = $matches[1]
        $tc = Convert-ToTitleCase $orig
        Write-Host "$orig => $tc"
    }
}
