$path = (Resolve-Path "data.js").Path
$utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

$fixedLines = [System.Collections.Generic.List[string]]::new()
$fixedStatusCount = 0

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]

    if ($line.Contains('"status":')) {
        $hasComma = $line.TrimEnd().EndsWith(",")
        $indent = $line.Substring(0, $line.IndexOf('"status"'))
        $comma = if ($hasComma) { "," } else { "" }

        if ($line.Contains("Tamamland")) {
            $line = $indent + '"status": "Tamamlandı"' + $comma
            $fixedStatusCount++
        } elseif ($line.Contains("radaki")) {
            $line = $indent + '"status": "Sıradaki"' + $comma
            $fixedStatusCount++
        }
    }

    $fixedLines.Add($line)
}

[System.IO.File]::WriteAllLines($path, $fixedLines, $utf8NoBOM)
Write-Host "Cleaned garbled statuses count: $fixedStatusCount"
