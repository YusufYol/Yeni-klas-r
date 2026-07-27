$dataJs = Get-Content 'data.js' -Raw -Encoding UTF8

# Regex to match news objects inside "news": [ ... ]
$pattern = '(?s)\{\s*"id":\s*(\d+),\s*"title":\s*"(.*?)",\s*"cat":\s*"(.*?)",\s*"date":\s*"(.*?)",\s*"content":\s*"(.*?)",\s*"img":\s*"(.*?)"'

$matches = [regex]::Matches($dataJs, $pattern)
Write-Host "Matched news count: $($matches.Count)"

$newsList = [System.Collections.Generic.List[PSCustomObject]]::new()

foreach ($m in $matches) {
    $newsList.Add([PSCustomObject]@{
        id = [int]$m.Groups[1].Value
        title = $m.Groups[2].Value
        cat = $m.Groups[3].Value
        date = $m.Groups[4].Value
        content = $m.Groups[5].Value
        img = $m.Groups[6].Value
    })
}

Write-Host "Extracted $($newsList.Count) news items cleanly!"
if ($newsList.Count -gt 0) {
    Write-Host "Sample 1: ID=$($newsList[0].id), Title=$($newsList[0].title), Cat=$($newsList[0].cat)"
    Write-Host "Sample last: ID=$($newsList[-1].id), Title=$($newsList[-1].title), Cat=$($newsList[-1].cat)"
}
