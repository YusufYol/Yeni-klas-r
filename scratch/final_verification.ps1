$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

Write-Host "=========================================="
Write-Host "      FINAL DATA AUDIT & VERIFICATION     "
Write-Host "=========================================="

# 1. Check MotoGP Standings (Lines 8074..8335) for dotted 'İ'
$motogpStandingsDottedI = 0
$motogpTurkishI = 0

for ($i = 8073; $i -le 8334; $i++) {
    $line = $lines[$i]
    if ($line -match '"(name|team)":\s*"(.*?)"') {
        $val = $matches[2]
        if ($val.Contains([char]0x0130)) { # Capital İ
            $motogpStandingsDottedI++
            Write-Host "WARNING: Found dotted 'İ' in MotoGP standings line $($i+1): $val"
        }
        if ($val.Contains([char]0x0131)) { # Dotless ı
            $motogpTurkishI++
            Write-Host "VERIFIED: Preserved Turkish 'ı' in MotoGP standings line $($i+1): $val"
        }
    }
}

Write-Host "`nMotoGP Standings Dotted 'İ' count: $motogpStandingsDottedI (Expected: 0)"
Write-Host "MotoGP Standings Turkish 'ı' count: $motogpTurkishI (e.g. Toprak Razgatlıoğlu #7)"

# 2. Check F1 Pilots Casing (Lines 805..960)
Write-Host "`n--- Sample F1 Pilots ---"
for ($i = 805; $i -le 830; $i++) {
    if ($lines[$i] -match '"(name|team)":\s*"(.*?)"') {
        Write-Host "Line $($i+1): $($matches[1]) = '$($matches[2])'"
    }
}

# 3. Check MotoGP Pilots Casing (Lines 4604..4750)
Write-Host "`n--- Sample MotoGP Pilots ---"
for ($i = 4604; $i -le 4630; $i++) {
    if ($lines[$i] -match '"(name|team)":\s*"(.*?)"') {
        Write-Host "Line $($i+1): $($matches[1]) = '$($matches[2])'"
    }
}

Write-Host "`n=========================================="
Write-Host "Audit completed successfully."
