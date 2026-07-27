$dataJs = Get-Content 'data.js' -Raw -Encoding UTF8
$dataJs = $dataJs -replace 'Toprak Razgatlioglu', 'Toprak Razgatlıoğlu'
Set-Content -Path 'data.js' -Value $dataJs -Encoding UTF8
Write-Host "Restored Toprak Razgatlıoğlu in data.js!"
