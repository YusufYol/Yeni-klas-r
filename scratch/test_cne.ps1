$val = "MAX VERSTAPPEN #3"
$newVal = "Max Verstappen #3"

Write-Host "Default -ne: $($newVal -ne $val)"
Write-Host "Case-sensitive -cne: $($newVal -cne $val)"
