$path = (Resolve-Path "data.js").Path
$utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

$dottedIChar = [char]0x0130  # İ
$dotlessIChar = [char]0x0131 # ı
$dotlessIStr = $dotlessIChar.ToString()
$dottedIStr = $dottedIChar.ToString()

$newLines = [System.Collections.Generic.List[string]]::new()
$fixedStatusCount = 0
$fixedDottedICount = 0

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $num = $i + 1

    # 1. Fix calendar status garbled strings in both F1 & MotoGP
    if ($line.Contains('"status":')) {
        if ($line.Contains("Tamamland") -and -not $line.Contains('"status": "Tamamlandı"') -and -not $line.Contains('"status": "Tamamlandi"')) {
            $line = '                "status": "Tamamlandı"'
            $fixedStatusCount++
        }
        if ($line.Contains("radaki") -and -not $line.Contains('"status": "Sıradaki"') -and -not $line.Contains('"status": "Siradaki"')) {
            $line = '                "status": "Sıradaki"'
            $fixedStatusCount++
        }
    }

    # 2. Fix dotted İ -> I in F1 & MotoGP pilot, team names, standings, results, and titles (lines 1 to 8335)
    if ($num -le 8335) {
        if ($line.Contains($dottedIStr)) {
            # In pilot, team names, standings, results, and titles, change uppercase İ to I
            $line = $line.Replace($dottedIStr, "I")
            $fixedDottedICount++
        }
    }

    $newLines.Add($line)
}

[System.IO.File]::WriteAllLines($path, $newLines, $utf8NoBOM)

Write-Host "Fixed status strings count: $fixedStatusCount"
Write-Host "Fixed dotted İ to I count: $fixedDottedICount"
