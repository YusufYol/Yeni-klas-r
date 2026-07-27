$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

$dottedI = [char]0x0130 # İ
$dotlessI = [char]0x0131 # ı

Write-Host "Checking all pilot/team/standings names in data.js lines 1 to 8335..."

for ($i = 0; $i -lt 8335; $i++) {
    $line = $lines[$i]
    $num = $i + 1
    
    # Exclude Turkish national athletes ("milli sporcularımız") section which is usually lines 4425-4760 or checked
    if ($line -match '"(name|pilot|team)":') {
        # Check if line contains dotted İ or dotless ı
        if ($line.Contains($dottedI.ToString()) -or $line.Contains($dotlessI.ToString())) {
            # Skip Toprak Razgatlıoğlu or Milli Sporcular
            if ($line.Contains("Toprak Razgat") -or $line.Contains("Milli") -or $line.Contains("Türkkan") -or $line.Contains("Çetinkaya") -or $line.Contains("Işık")) {
                continue
            }
            Write-Host "L${num}: $($line.Trim())"
        }
    }
}
