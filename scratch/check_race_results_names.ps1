$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

$dottedI = [char]0x0130 # İ
$dotlessI = [char]0x0131 # ı

Write-Host "Checking all pilot/team entries in calendar race results..."

for ($i = 0; $i -lt 8335; $i++) {
    $line = $lines[$i]
    $num = $i + 1
    if ($line -match '"(pilot|team|winner|driver|constructor)":') {
        if ($line.Contains($dottedI.ToString()) -or $line.Contains($dotlessI.ToString())) {
            if ($line.Contains("Toprak Razgat") -or $line.Contains("Milli")) { continue }
            Write-Host "L${num}: $($line.Trim())"
        }
    }
}
