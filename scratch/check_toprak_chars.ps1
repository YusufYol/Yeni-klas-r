$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

function Show-Chars ($lineNum) {
    $line = $lines[$lineNum - 1]
    Write-Host "Line ${lineNum}: $line"
    for ($i = 0; $i -lt $line.Length; $i++) {
        $c = $line[$i]
        if ([int]$c -gt 127) {
            Write-Host ("  Char at pos {0}: '{1}' U+{2:X4}" -f $i, $c, [int]$c)
        }
    }
}

Show-Chars 4725
Show-Chars 8218
