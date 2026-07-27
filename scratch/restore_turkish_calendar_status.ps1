$dataJs = Get-Content 'data.js' -Raw -Encoding UTF8

# Restore status strings in Turkish
$dataJs = $dataJs -replace '"status": "Siradaki"', '"status": "Sıradaki"'
$dataJs = $dataJs -replace '"status": "Tamamlandi"', '"status": "Tamamlandı"'

Set-Content -Path 'data.js' -Value $dataJs -Encoding UTF8
Write-Host "Restored Turkish calendar status strings in data.js!"
