$culture = [System.Globalization.CultureInfo]::InvariantCulture
$nameMap = [System.Collections.Generic.Dictionary[string, string]]::new([System.StringComparer]::Ordinal)

function Add-Map ($from, $to) {
    if (-not $nameMap.ContainsKey($from)) {
        $nameMap.Add($from, $to)
    }
}

Add-Map "MAX VERSTAPPEN #3" "Max Verstappen #3"

function Convert-TitleCaseString ($str) {
    if (-not $str) { return $str }
    if ($nameMap.ContainsKey($str)) {
        return $nameMap[$str]
    }
    return "NOT_FOUND"
}

$test = "MAX VERSTAPPEN #3"
Write-Host "Result: '$(Convert-TitleCaseString $test)'"
