$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

$l955 = $lines[954] # Line 955
Write-Host "Line 955: '$l955'"
for ($i=0; $i -lt $l955.Length; $i++) {
    Write-Host "[$i] '$($l955[$i])' = $([int][char]$l955[$i])"
}
