# PowerShell script to generate static HTML pages for all news articles and build sitemap.xml

$baseUrl = "https://racingnewstr.com"
$today = (Get-Date).ToString("yyyy-MM-dd")

# 1. Read data.js and index.html
$dataJs = Get-Content 'data.js' -Raw -Encoding UTF8
$indexTemplate = Get-Content 'index.html' -Raw -Encoding UTF8

# Cut dataJs at "const CIRCUITS_DB"
$appDataRaw = $dataJs -split "const CIRCUITS_DB" | Select-Object -First 1
$jsonStr = $appDataRaw -replace '^\s*const\s+APP_DATA\s*=\s*', '' -replace ';\s*$', ''

try {
    $appData = $jsonStr | ConvertFrom-Json
} catch {
    Write-Host "Error parsing data.js: $_"
    exit 1
}

$allNews = @()
$sitemapUrls = [System.Collections.Generic.List[string]]::new()

# Helper for XML escaping
function Escape-Xml ($str) {
    if (-not $str) { return "" }
    return $str.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace('"', "&quot;").Replace("'", "&apos;")
}

# Helper for HTML escaping
function Escape-Html ($str) {
    if (-not $str) { return "" }
    return [System.Net.WebUtility]::HtmlEncode($str)
}

# Base URLs in sitemap
$basePages = @(
    "",
    "news/formula%201",
    "news/motogp",
    "news/haberler",
    "pilots/formula%201",
    "pilots/motogp",
    "pilots/milli%20sporcular%C4%B1m%C4%B1z",
    "teams/formula%201",
    "teams/motogp",
    "calendar/formula%201",
    "calendar/motogp",
    "standings/formula%201",
    "standings/motogp",
    "about",
    "privacy",
    "terms",
    "contact"
)

foreach ($page in $basePages) {
    $url = if ($page -eq "") { "$baseUrl/" } else { "$baseUrl/$page" }
    $priority = if ($page -eq "") { "1.0" } else { "0.8" }
    $sitemapUrls.Add("    <url>`n        <loc>$url</loc>`n        <lastmod>$today</lastmod>`n        <changefreq>daily</changefreq>`n        <priority>$priority</priority>`n    </url>")
}

# Process all categories for news articles
$categories = @("formula 1", "motogp", "haberler")

foreach ($catKey in $categories) {
    $catData = $appData."$catKey"
    if ($catData -and $catData.news) {
        foreach ($newsItem in $catData.news) {
            $allNews += [PSCustomObject]@{
                cat = $catKey
                id = $newsItem.id
                title = $newsItem.title
                date = $newsItem.date
                img = $newsItem.img
                content = $newsItem.content
            }

            $catSlug = $catKey
            $newsId = $newsItem.id
            $relPath = "news-detail/$catSlug/$newsId"

            # Create folder news-detail/cat/id
            $dirPath = "news-detail/$catSlug/$newsId"
            if (-not (Test-Path $dirPath)) {
                New-Item -ItemType Directory -Path $dirPath -Force | Out-Null
            }

            # Generate meta tags
            $pageTitle = Escape-Html "$($newsItem.title) - Racing News Türkiye"
            
            $summary = $newsItem.content
            if ($summary -like "*<br>*") {
                $summary = ($summary -split "<br>")[0]
            } elseif ($summary.Length -gt 160) {
                $summary = $summary.Substring(0, 160) + "..."
            }
            $summaryClean = Escape-Html ($summary -replace '<[^>]+>', '')

            $imgUrl = if ($newsItem.img) { "$baseUrl/$($newsItem.img)" } else { "$baseUrl/Resimler/Logo/Racing News TR Logo.jpeg" }
            $articleUrl = "$baseUrl/$relPath"

            # Static article HTML body
            $staticBody = @"
<article class="news-detail-static" style="padding: 25px; max-width: 900px; margin: 0 auto; color: #fff;">
    <h1 style="font-size: 2.2rem; font-weight: 800; margin-bottom: 12px; color: #ffffff;">$(Escape-Html $newsItem.title)</h1>
    <div style="font-size: 0.95rem; color: #aaa; margin-bottom: 20px;">
        <span>Tarih: $(Escape-Html $newsItem.date)</span> &nbsp;|&nbsp; <span>Kategori: $(Escape-Html $catKey.ToUpper())</span>
    </div>
    $(if ($newsItem.img) { "<div style='margin-bottom: 25px;'><img src='/$(Escape-Html $newsItem.img)' alt='$(Escape-Html $newsItem.title)' style='width: 100%; max-height: 450px; object-fit: cover; border-radius: 12px;'></div>" } else { "" })
    <div class="news-content-text" style="font-size: 1.1rem; line-height: 1.8; color: #ddd;">
        $($newsItem.content)
    </div>
</article>
"@

            # Insert static body & Open Graph tags into index.html copy
            $html = $indexTemplate

            # Replace title
            $html = $html -replace '<title>.*?</title>', "<title>$pageTitle</title>"

            # Replace meta description
            $html = $html -replace '<meta name="description"\s+content=".*?">', "<meta name=`"description`" content=`"$summaryClean`">"

            # Open Graph meta tags
            $ogMeta = @"
    <meta property="og:title" content="$pageTitle">
    <meta property="og:description" content="$summaryClean">
    <meta property="og:image" content="$imgUrl">
    <meta property="og:url" content="$articleUrl">
    <meta property="og:type" content="article">
"@
            $html = $html -replace '</head>', "$ogMeta`n</head>"

            # Replace main content area
            $html = [regex]::Replace($html, '(<main id="main-content" class="content-area">)[\s\S]*?(</main>)', "$`1`n$staticBody`n$`2")

            # Fix relative asset paths in subfolder static pages
            $html = $html -replace 'href="manifest.json"', 'href="/manifest.json"'
            $html = $html -replace 'href="Resimler/', 'href="/Resimler/'

            # Save static HTML file
            $utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
            [System.IO.File]::WriteAllText((Resolve-Path -Path $dirPath).Path + "\index.html", $html, $utf8NoBOM)

            # Add to sitemap
            $encodedRelPath = [System.Uri]::EscapeUriString($relPath)
            $sitemapUrls.Add("    <url>`n        <loc>$baseUrl/$encodedRelPath</loc>`n        <lastmod>$today</lastmod>`n        <changefreq>weekly</changefreq>`n        <priority>0.7</priority>`n    </url>")
        }
    }
}

# 2. Write sitemap.xml
$sitemapXml = @"
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
$($sitemapUrls -join "`n")
</urlset>
"@

$utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path -Path ".").Path + "\sitemap.xml", $sitemapXml, $utf8NoBOM)
Write-Host "Generated sitemap.xml with $($sitemapUrls.Count) URLs!"
Write-Host "Generated $($allNews.Count) static news detail HTML pages in news-detail/!"
