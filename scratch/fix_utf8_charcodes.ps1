$path = (Resolve-Path "data.js").Path
$utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

$dotlessI = ([char]0x0131).ToString()
$tamamlandi = "Tamamland" + $dotlessI
$siradaki = "S" + $dotlessI + "radaki"

$fixedLines = [System.Collections.Generic.List[string]]::new()
$count = 0

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]

    if ($line.Contains('"status":')) {
        $hasComma = $line.TrimEnd().EndsWith(",")
        $indent = $line.Substring(0, $line.IndexOf('"status"'))
        $comma = if ($hasComma) { "," } else { "" }

        if ($line.Contains("Tamamland")) {
            $line = $indent + '"status": "' + $tamamlandi + '"' + $comma
            $count++
        } elseif ($line.Contains("radaki")) {
            $line = $indent + '"status": "' + $siradaki + '"' + $comma
            $count++
        }
    }

    $fixedLines.Add($line)
}

[System.IO.File]::WriteAllLines($path, $fixedLines, $utf8NoBOM)
Write-Host "Fixed statuses count: $count"
