$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

for ($i = 1029; $i -lt 1050; $i++) {
    Write-Host "L$($i+1): '$($lines[$i])'"
}
