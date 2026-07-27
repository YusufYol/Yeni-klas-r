$path = (Resolve-Path "data.js").Path
$utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
$text = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# 1. Fix garbled UTF-8 sequences in calendar statuses and strings
$text = $text -replace 'TamamlandÄ±', 'Tamamlandı'
$text = $text -replace 'TamamlandÃ„Â±', 'Tamamlandı'
$text = $text -replace 'SÄ±radaki', 'Sıradaki'
$text = $text -replace 'SÃ„Â±radaki', 'Sıradaki'
$text = $text -replace 'Antrenman Seansi', 'Antrenman Seansı'
$text = $text -replace 'Siralama Turlari', 'Sıralama Turları'
$text = $text -replace 'Sprint Yarişi', 'Sprint Yarışı'
$text = $text -replace 'Isinma Turlari', 'Isınma Turları'
$text = $text -replace 'Yariş', 'Yarış'

# Save fixed text back
[System.IO.File]::WriteAllText($path, $text, $utf8NoBOM)

# 2. Read line by line to process F1 and MotoGP sections (lines 1 to 8335)
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)
$dottedIChar = [char]0x0130 # İ
$newLines = [System.Collections.Generic.List[string]]::new()

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $num = $i + 1

    # In F1 and MotoGP sections (lines 1 to 8335), fix uppercase dotted İ in pilot names, team names, standings, and titles
    if ($num -le 8335) {
        # Check if line contains "name":, "pilot":, "team":, "title":, "gp":
        if ($line -match '"(name|pilot|team|title|gp|driver)":') {
            # Replace İ with I in pilot, team, and title strings
            $line = $line.Replace($dottedIChar.ToString(), "I")
        }
    }

    $newLines.Add($line)
}

[System.IO.File]::WriteAllLines($path, $newLines, $utf8NoBOM)
Write-Host "Successfully fixed garbled calendar statuses and replaced dotted İ in F1/MotoGP pilot/team names!"
