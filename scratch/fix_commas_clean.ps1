$path = (Resolve-Path "data.js").Path
$utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

$fixedLines = [System.Collections.Generic.List[string]]::new()
$commaFixCount = 0

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $nextLine = if ($i + 1 -lt $lines.Length) { $lines[$i + 1] } else { "" }

    # Check if this line is a status line
    if ($line.Contains('"status":')) {
        $indent = $line.Substring(0, $line.IndexOf('"status"'))
        $suffix = if ($nextLine.Trim().StartsWith('"') -or $nextLine.Trim().StartsWith('{') -or $nextLine.Trim().StartsWith('[')) { "," } else { "" }

        if ($line.Contains("Tamamland")) {
            $line = $indent + '"status": "Tamamlandı"' + $suffix
        } elseif ($line.Contains("radaki")) {
            $line = $indent + '"status": "Sıradaki"' + $suffix
        } elseif ($line.Contains("İptal") -or $line.Contains("Iptal")) {
            $line = $indent + '"status": "İptal"' + $suffix
        }
    } else {
        # Check general missing commas
        if ($line -match '"[a-zA-Z0-9_]+"\s*:\s*".*?"$' -and $nextLine -match '^\s*"[a-zA-Z0-9_]+"\s*:') {
            $line = $line + ","
            $commaFixCount++
        }
    }

    $fixedLines.Add($line)
}

[System.IO.File]::WriteAllLines($path, $fixedLines, $utf8NoBOM)

Write-Host "Fixed missing commas count: $commaFixCount"
