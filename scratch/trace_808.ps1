$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

$nameMap = [System.Collections.Generic.Dictionary[string, string]]::new([System.StringComparer]::Ordinal)
$nameMap.Add("MAX VERSTAPPEN #3", "Max Verstappen #3")

$line = $lines[807] # Line 808
Write-Host "Line 808: '$line'"

if ($line -match '"(name|pilot|team)"\s*:\s*"(.*?)"') {
    $key = $matches[1]
    $val = $matches[2]
    Write-Host "Key: '$key'"
    Write-Host "Val: '$val'"
    Write-Host "Contains key: $($nameMap.ContainsKey($val))"
    if ($nameMap.ContainsKey($val)) {
        $newVal = $nameMap[$val]
        Write-Host "NewVal: '$newVal'"
        Write-Host "Is different: $($newVal -ne $val)"
    }
}
