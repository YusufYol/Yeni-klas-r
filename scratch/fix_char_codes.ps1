$path = (Resolve-Path "data.js").Path
$utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

# 201 (É) -> 233 (é)
# 220 (Ü) -> 252 (ü)
# 209 (Ñ) -> 241 (ñ)

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    if ($line.Contains("Sergio P")) {
        $line = $line.Replace([char]201, [char]233)
    }
    if ($line.Contains("Nico H")) {
        $line = $line.Replace([char]220, [char]252)
    }
    if ($line.Contains("Maverick Vi")) {
        $line = $line.Replace([char]209, [char]241)
    }
    $lines[$i] = $line
}

[System.IO.File]::WriteAllLines($path, $lines, $utf8NoBOM)
Write-Host "Replaced char codes 201->233, 220->252, 209->241."
