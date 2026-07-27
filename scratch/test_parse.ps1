$dataJs = Get-Content 'data.js' -Raw -Encoding UTF8

# Cut dataJs at "const CIRCUITS_DB"
$appDataRaw = $dataJs -split "const CIRCUITS_DB" | Select-Object -First 1

# Remove 'const APP_DATA =' at beginning and trailing semicolon / whitespace
$jsonStr = $appDataRaw -replace '^\s*const\s+APP_DATA\s*=\s*', '' -replace ';\s*$', ''

try {
    $appData = $jsonStr | ConvertFrom-Json
    Write-Host "Success parsing JSON! Keys found: $($appData.PSObject.Properties.Name -join ', ')"
} catch {
    Write-Host "JSON Parse Error: $_"
}
