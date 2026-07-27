$files = @("style.css", "index.html", "script.js", "admin.html")

foreach ($file in $files) {
    if (Test-Path $file) {
        $lines = [System.IO.File]::ReadAllLines((Resolve-Path $file).Path, [System.Text.Encoding]::UTF8)
        for ($i = 0; $i -lt $lines.Length; $i++) {
            if ($lines[$i] -match 'text-transform') {
                Write-Host "${file} L$($i+1): $($lines[$i].Trim())"
            }
        }
    }
}
