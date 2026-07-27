$path = (Resolve-Path "data.js").Path
$utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

$fixedLines = [System.Collections.Generic.List[string]]::new()
$commaFixCount = 0

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $nextLine = if ($i + 1 -lt $lines.Length) { $lines[$i + 1] } else { "" }

    # If this line has a property like "status": "..." or "isoDate": "..."
    # and does NOT end with a comma ',', and the next line has another property like "sessions": or "results": or another key
    if ($line -match '"[a-zA-Z0-9_]+"\s*:\s*".*?"$' -and $nextLine -match '"[a-zA-Z0-9_]+"\s*:') {
        Write-Host "Missing comma at line $($i + 1): $($line.Trim())"
        $line = $line + ","
        $commaFixCount++
    }

    # Also clean up any remaining garbled status strings with proper trailing comma if needed
    if ($line -match '"status"\s*:\s*"Tamamland.*?"') {
        $indent = $line.Substring(0, $line.IndexOf('"'))
        $hasComma = $line.TrimEnd().EndsWith(",")
        $line = $indent + '"status": "Tamamlandı"' + (if ($hasComma) { "," } else { "" })
    }

    $fixedLines.Add($line)
}

[System.IO.File]::WriteAllLines($path, $fixedLines, $utf8NoBOM)

Write-Host "Fixed missing commas count: $commaFixCount"
