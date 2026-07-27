$dataJs = Get-Content 'data.js' -Raw -Encoding UTF8

# Extract JSON object from data.js
# data.js starts with 'const APP_DATA = '
$jsonStr = $dataJs -replace '^\s*const\s+APP_DATA\s*=\s*', '' -replace ';\s*$', ''

# In PowerShell, we can convert json to object
try {
    $appData = $jsonStr | ConvertFrom-Json
    Write-Host "Successfully parsed APP_DATA!"

    $allNews = @()

    $categories = @("formula 1", "motogp", "haberler")
    foreach ($cat in $categories) {
        $catObj = $appData."$cat"
        if ($catObj -and $catObj.news) {
            foreach ($n in $catObj.news) {
                $allNews += [PSCustomObject]@{
                    cat = $cat
                    id = $n.id
                    title = $n.title
                    date = $n.date
                    img = $n.img
                    content = $n.content
                }
            }
        }
    }

    Write-Host "Total news articles found: $($allNews.Count)"
    $allNews | Select-Object cat, id, title | Select-Object -First 10 | ForEach-Object {
        Write-Host "[$($_.cat)] ID $($_.id): $($_.title)"
    }
} catch {
    Write-Host "Error parsing data.js JSON: $_"
}
