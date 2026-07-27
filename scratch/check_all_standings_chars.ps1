$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

$c_dotted_I = [char]0x0130 # İ

Write-Host "=== F1 Standings Lines 1029..1221 ==="
for ($i = 1028; $i -le 1220; $i++) {
    $line = $lines[$i]
    if ($line.Contains($c_dotted_I.ToString())) {
        Write-Host "L$($i+1): $line"
    }
}

Write-Host "`n=== MotoGP Standings Lines 8074..8335 ==="
for ($i = 8073; $i -le 8334; $i++) {
    $line = $lines[$i]
    if ($line.Contains($c_dotted_I.ToString())) {
        Write-Host "L$($i+1): $line"
    }
}
