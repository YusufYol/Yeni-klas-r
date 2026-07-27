$dottedI = [char]0x0130 # İ
$dotlessI = [char]0x0131 # ı

function ConvertTo-StandardUpperI ($str) {
    if (-not $str) { return $str }
    $res = $str.Replace($dottedI.ToString(), 'I').Replace('i', 'I').Replace($dotlessI.ToString(), 'I')
    return $res.ToUpperInvariant()
}

$val = "Andrea Kimi Antonelli #12"
$newVal = ConvertTo-StandardUpperI $val

Write-Host "val = '$val'"
Write-Host "newVal = '$newVal'"
Write-Host "Are they equal? $($val -eq $newVal)"
