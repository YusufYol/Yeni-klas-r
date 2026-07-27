$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

$rhUnmapped = [System.Collections.Generic.List[string]]::new()

for ($i = 1637; $i -lt 8073; $i++) {
    $line = $lines[$i]
    $num = $i + 1

    # Check resultsHistory lines (lines 1638..4324 for F1, lines 5443..8073 for MotoGP)
    if (($num -ge 1638 -and $num -le 4324) -or ($num -ge 5443 -and $num -le 8073)) {
        if ($line -match '"(pilot|team)":\s*"(.*?)"') {
            $key = $matches[1]
            $val = $matches[2]
            # Check if value is uppercase or contains dotted İ
            if ($val -cmatch '[A-Z]{4,}' -or $val.Contains("İ")) {
                $rhUnmapped.Add("L${num} ($key): $val")
            }
        }
    }
}

Write-Host "resultsHistory uppercase / dotted I lines count: $($rhUnmapped.Count)"
foreach ($r in ($rhUnmapped | Select-Object -First 30)) {
    Write-Host $r
}
