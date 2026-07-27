$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

$l808 = $lines[807] # Line 808
if ($l808 -match '"name":\s*"(.*?)"') {
    $val = $matches[1]
    Write-Host "Val: '$val'"
    Write-Host "Length: $($val.Length)"
    for ($k=0; $k -lt $val.Length; $k++) {
        Write-Host "[$k] '$($val[$k])' = $([int][char]$val[$k])"
    }
}
