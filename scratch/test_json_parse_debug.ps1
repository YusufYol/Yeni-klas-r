$dataJs = Get-Content 'data.js' -Raw -Encoding UTF8
$appDataRaw = ($dataJs -split "const CIRCUITS_DB")[0].Trim()

$firstBrace = $appDataRaw.IndexOf('{')
$lastBrace = $appDataRaw.LastIndexOf('}')
$jsonStr = $appDataRaw.Substring($firstBrace, $lastBrace - $firstBrace + 1)

# Write jsonStr to temporary file to inspect or parse
$utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path ".").Path + "\scratch\appdata_temp.json", $jsonStr, $utf8NoBOM)

try {
    $appData = Get-Content "scratch/appdata_temp.json" -Raw -Encoding UTF8 | ConvertFrom-Json
    Write-Host "Success parsing JSON!"
} catch {
    Write-Host "JSON error: $_"
}
