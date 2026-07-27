$path = (Resolve-Path "data.js").Path
$utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

$dottedI = [char]0x0130 # İ
$dotlessI = [char]0x0131 # ı

function Format-NameUpper ($name) {
    if (-not $name) { return $name }
    # Skip Turkish national athletes
    if ($name -match 'Toprak Razgat' -or $name -match 'Türkkan' -or $name -match 'Çetinkaya' -or $name -match 'Volkan Işık') {
        return $name
    }
    
    # Replace dotted İ with I, lowercase i with I, lowercase ı with I
    # We do standard uppercase conversion without turning i into İ
    $result = $name.Replace($dottedI.ToString(), 'I')
    $result = $result.Replace('i', 'I')
    $result = $result.Replace($dotlessI.ToString(), 'I')
    return $result.ToUpperInvariant()
}

$fixedLines = [System.Collections.Generic.List[string]]::new()
$inNews = $false
$fixedCount = 0

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]

    # Track if we are inside a "news": [ block
    if ($line -match '"news"\s*:\s*\[') {
        $inNews = $true
    }
    # Check end of news array (usually line starting with ] or ],)
    if ($inNews -and ($line -match '^\s*\]\s*,?' -or $line -match '"calendar"\s*:' -or $line -match '"pilots"\s*:')) {
        $inNews = $false
    }

    # Only process if NOT in news array and line matches "name": "...", "pilot": "...", or "team": "..."
    if (-not $inNews -and $line -match '^\s*"(name|pilot|team)"\s*:\s*"(.*?)"(\s*,?)$') {
        $key = $matches[1]
        $val = $matches[2]
        $comma = $matches[3]
        $indent = $line.Substring(0, $line.IndexOf('"'))

        # Exclude file paths or URLs like "Resimler/..." or "http..."
        if ($val -notlike "Resimler/*" -and $val -notlike "http*" -and $val -notlike "*.png" -and $val -notlike "*.jpg") {
            $newVal = Format-NameUpper $val
            if ($newVal -ne $val) {
                $line = "${indent}`"${key}`": `"${newVal}`"${comma}"
                $fixedCount++
            }
        }
    }

    $fixedLines.Add($line)
}

[System.IO.File]::WriteAllLines($path, $fixedLines, $utf8NoBOM)
Write-Host "Converted $fixedCount pilot/team names in F1 & MotoGP to uppercase with standard I!"
