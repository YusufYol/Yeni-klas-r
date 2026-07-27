$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

$val = "MAX VERSTAPPEN #3"
$dict = [System.Collections.Generic.Dictionary[string, string]]::new([System.StringComparer]::Ordinal)
$dict["MAX VERSTAPPEN #3"] = "Max Verstappen #3"

Write-Host "Contains key: $($dict.ContainsKey($val))"
Write-Host "Value: '$($dict[$val])'"

$line = $lines[807] # Line 808
Write-Host "Line 808: '$line'"
if ($line -match '^\s*"(name|pilot|team)"\s*:\s*"(.*?)"(\s*,?)$') {
    Write-Host "Matched: key='$($matches[1])', val='$($matches[2])'"
    Write-Host "Lookup: '$($dict[$matches[2]])'"
}
