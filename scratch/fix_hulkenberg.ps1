$path = (Resolve-Path "data.js").Path
$utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

# Line 934 is index 933
$uUmlaut = [char]0x00FC
$target = "Nico H" + $uUmlaut + "lkenberg #27"

for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match '"name":\s*"NICO HULKENBERG #27"') {
        $lines[$i] = $lines[$i].Replace("NICO HULKENBERG #27", $target)
        Write-Host "Updated line $($i+1) to $target"
    }
}

[System.IO.File]::WriteAllLines($path, $lines, $utf8NoBOM)
Write-Host "data.js saved successfully."
