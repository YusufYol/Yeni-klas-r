$path = (Resolve-Path "data.js").Path
$utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
$text = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Replace garbled status strings cleanly
$text = $text -replace 'TamamlandÄ±', 'Tamamlandı'
$text = $text -replace 'TamamlandÃ„Â±', 'Tamamlandı'
$text = $text -replace 'SÄ±radaki', 'Sıradaki'
$text = $text -replace 'SÃ„Â±radaki', 'Sıradaki'

[System.IO.File]::WriteAllText($path, $text, $utf8NoBOM)
Write-Host "Successfully fixed garbled text in data.js!"
