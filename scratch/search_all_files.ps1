$files = Get-ChildItem -Path . -Include *.js,*.html,*.css -Recurse | Where-Object { $_.FullName -notlike "*scratch*" -and $_.FullName -notlike "*node_modules*" }

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    if ($content -match "MAX VERSTAPPEN" -or $content -match "RED BULL RACING" -or $content -match "JORGE MARTIN" -or $content -match "APRILIA RACING" -or $content -match "MERCEDES-AMG") {
        Write-Host "Found in: $($file.FullName)"
    }
}
