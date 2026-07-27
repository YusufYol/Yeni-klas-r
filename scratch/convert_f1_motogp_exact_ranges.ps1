$path = (Resolve-Path "data.js").Path
$utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

$dottedI = [char]0x0130 # İ
$dotlessI = [char]0x0131 # ı

function ConvertTo-StandardUpperI ($str) {
    if (-not $str) { return $str }
    if ($str -match 'Toprak Razgat' -or $str -match 'Türkkan' -or $str -match 'Çetinkaya' -or $str -match 'Volkan Işık') {
        return $str
    }
    $res = $str.Replace($dottedI.ToString(), 'I').Replace('i', 'I').Replace($dotlessI.ToString(), 'I')
    return $res.ToUpperInvariant()
}

$fixedLines = [System.Collections.Generic.List[string]]::new()
$fixedCount = 0

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $num = $i + 1

    if (($num -ge 805 -and $num -le 1220) -or ($num -ge 8074 -and $num -le 8335)) {
        if ($line -match '"(name|pilot|team)"\s*:\s*"(.*?)"') {
            $key = $matches[1]
            $val = $matches[2]
            
            if ($val -notlike "Resimler/*" -and $val -notlike "http*") {
                $newVal = ConvertTo-StandardUpperI $val
                if ($val -cne $newVal) {
                    $target = '"' + $val + '"'
                    $replacement = '"' + $newVal + '"'
                    $line = $line.Replace($target, $replacement)
                    $fixedCount++
                }
            }
        }
    }

    $fixedLines.Add($line)
}

[System.IO.File]::WriteAllLines($path, $fixedLines, $utf8NoBOM)
Write-Host "Successfully converted $fixedCount F1 and MotoGP standings names to uppercase with standard I!"
