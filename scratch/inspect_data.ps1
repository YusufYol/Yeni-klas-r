$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

Write-Host "Total lines read: $($lines.Length)"

$garbledLines = [System.Collections.Generic.List[string]]::new()
$dottedILines = [System.Collections.Generic.List[string]]::new()

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $num = $i + 1

    # Check garbled utf8 characters (like TamamlandÄ±)
    if ($line.Contains("Ä") -or $line.Contains("Å")) {
        $garbledLines.Add("L${num}: $($line.Trim())")
    }

    # Check dotted İ in lines 1 to 8335 (F1 and MotoGP data)
    if ($num -le 8335 -and $line.Contains("İ")) {
        $dottedILines.Add("L${num}: $($line.Trim())")
    }
}

Write-Host "Garbled lines count: $($garbledLines.Count)"
foreach ($g in ($garbledLines | Select-Object -First 30)) {
    Write-Host $g
}

Write-Host "Dotted I lines in F1/MotoGP count: $($dottedILines.Count)"
foreach ($d in ($dottedILines | Select-Object -First 30)) {
    Write-Host $d
}
