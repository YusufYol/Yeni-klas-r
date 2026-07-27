$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

$dottedI = [char]0x0130 # İ
$dotlessI = [char]0x0131 # ı

Write-Host "=== CHECKING F1 & MOTOGP PILOTS & TEAMS FOR DOTTED İ AND DOTLESS ı ==="
for ($i = 0; $i -lt 8335; $i++) {
    $line = $lines[$i]
    $num = $i + 1
    if ($line -match '"(name|pilot|team)":') {
        if ($line.Contains($dottedI.ToString()) -or $line.Contains($dotlessI.ToString())) {
            Write-Host "L${num}: $($line.Trim())"
        }
    }
}
