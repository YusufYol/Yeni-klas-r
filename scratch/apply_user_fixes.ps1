$path = (Resolve-Path "data.js").Path
$utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

# Characters
$c_u_umlaut   = [char]0x00FC  # ü
$c_e_acute    = [char]0x00E9  # é
$c_n_tilde    = [char]0x00F1  # ñ
$c_E_acute    = [char]0x00C9  # É
$c_N_tilde    = [char]0x00D1  # Ñ
$c_U_umlaut   = [char]0x00DC  # Ü
$c_dotted_I   = [char]0x0130  # İ

$perez_upper1 = "SERGIO P" + $c_E_acute + "REZ #11"
$perez_upper2 = "SERGIO PEREZ #11"
$perez_target = "Sergio P" + $c_e_acute + "rez #11"

$vinales_upper1 = "MAVERICK VI" + $c_N_tilde + "ALES #12"
$vinales_upper2 = "MAVERICK VINALES #12"
$vinales_target  = "Maverick Vi" + $c_n_tilde + "ales #12"

$hulkenberg_upper1 = "NICO H" + $c_U_umlaut + "LKENBERG #27"
$hulkenberg_upper2 = "NICO HULKENBERG #27"
$hulkenberg_target = "Nico H" + $c_u_umlaut + "lkenberg #27"

$changedCount = 0

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $num = $i + 1

    # 1. Target specific pilot name fixes
    if ($line.Contains($perez_upper1) -or $line.Contains($perez_upper2)) {
        $line = $line.Replace($perez_upper1, $perez_target).Replace($perez_upper2, $perez_target)
        $changedCount++
        Write-Host "L${num}: Fixed Sergio Perez => $perez_target"
    }

    if ($line.Contains($vinales_upper1) -or $line.Contains($vinales_upper2)) {
        $line = $line.Replace($vinales_upper1, $vinales_target).Replace($vinales_upper2, $vinales_target)
        $changedCount++
        Write-Host "L${num}: Fixed Maverick Vinales => $vinales_target"
    }

    if ($line.Contains($hulkenberg_upper1) -or $line.Contains($hulkenberg_upper2)) {
        $line = $line.Replace($hulkenberg_upper1, $hulkenberg_target).Replace($hulkenberg_upper2, $hulkenberg_target)
        $changedCount++
        Write-Host "L${num}: Fixed Nico Hulkenberg => $hulkenberg_target"
    }

    # 2. Standings Tables Dotted 'İ' replacement
    $isStandingsLine = ($num -ge 1029 -and $num -le 1221) -or ($num -ge 8074 -and $num -le 8335)
    if ($isStandingsLine -and $line -match '"(name|pilot|team)"\s*:\s*"(.*?)"') {
        $val = $matches[2]
        if ($val.Contains($c_dotted_I.ToString())) {
            $newVal = $val.Replace($c_dotted_I.ToString(), "I")
            $line = $line.Replace("`"$val`"", "`"$newVal`"")
            $changedCount++
            Write-Host "L${num} Standings: '$val' => '$newVal'"
        }
    }

    $lines[$i] = $line
}

[System.IO.File]::WriteAllLines($path, $lines, $utf8NoBOM)
Write-Host "`nSuccessfully applied user fixes. Total modifications: $changedCount"
