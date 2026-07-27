$dataJs = Get-Content 'data.js' -Raw -Encoding UTF8
$appDataRaw = ($dataJs -split "const CIRCUITS_DB")[0].Trim()

$firstBrace = $appDataRaw.IndexOf('{')
$lastBrace = $appDataRaw.LastIndexOf('}')

$jsonStr = $appDataRaw.Substring($firstBrace, $lastBrace - $firstBrace + 1)

try {
    $appData = $jsonStr | ConvertFrom-Json
    Write-Host "SUCCESS PARSING APP_DATA!"
    Write-Host "Categories: $($appData.PSObject.Properties.Name -join ', ')"
    Write-Host "Haberler articles: $($appData.haberler.news.Count)"
} catch {
    Write-Host "Error parsing JSON: $_"
}
