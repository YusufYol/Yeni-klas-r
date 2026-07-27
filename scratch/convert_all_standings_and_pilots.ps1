$path = (Resolve-Path "data.js").Path
$utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

$dottedI = [char]0x0130 # İ
$dotlessI = [char]0x0131 # ı

function Format-NameUpper ($name) {
    if (-not $name) { return $name }
    if ($name -match 'Toprak Razgat' -or $name -match 'Türkkan' -or $name -match 'Çetinkaya' -or $name -match 'Volkan Işık') {
        return $name
    }
    
    $result = $name.Replace($dottedI.ToString(), 'I')
    $result = $result.Replace('i', 'I')
    $result = $result.Replace($dotlessI.ToString(), 'I')
    return $result.ToUpperInvariant()
}

$fixedLines = [System.Collections.Generic.List[string]]::new()
$fixedCount = 0

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $num = $i + 1

    # Apply ONLY outside news block (e.g. lines 1..20, lines 350..1250 for F1, lines 4420..8335 for MotoGP)
    # Check if line is inside news: news array starts around line 20 and ends around line 350 for F1, line 4380..4420 for MotoGP
    # We can safely test if the line has "name": "...", "pilot": "...", or "team": "..." and is NOT a news title or author or content!
    
    if ($line -match '^\s*"(name|pilot|team)"\s*:\s*"(.*?)"(\s*,?)$') {
        $key = $matches[1]
        $val = $matches[2]
        $comma = $matches[3]
        $indent = $line.Substring(0, $line.IndexOf('"'))

        # Only process pilot and team names (not news titles, images, author names, or calendar session names like "Cuma...")
        if ($val -notlike "Resimler/*" -and $val -notlike "http*" -and $val -notlike "Cuma:*" -and $val -notlike "Cumartesi:*" -and $val -notlike "Pazar:*" -and $val -notlike "*Grand Prix*" -and $val -notlike "*Yarış*" -and $val -notlike "*Antrenman*") {
            # Check if this line is part of pilots, teams, standings, or results
            if ($num -lt 20 -or ($num -gt 350 -and $num -lt 1250) -or ($num -gt 4420 -and $num -lt 8335)) {
                $newVal = Format-NameUpper $val
                if ($newVal -ne $val) {
                    $line = "${indent}`"${key}`": `"${newVal}`"${comma}"
                    $fixedCount++
                }
            }
        }
    }

    $fixedLines.Add($line)
}

[System.IO.File]::WriteAllLines($path, $fixedLines, $utf8NoBOM)
Write-Host "Converted $fixedCount pilot, team, and standings names in F1 & MotoGP to uppercase with standard I!"
