$path = (Resolve-Path "data.js").Path
$utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

# Characters
$c_u_umlaut  = [char]0x00FC  # ü
$c_e_acute   = [char]0x00E9  # é
$c_n_tilde   = [char]0x00F1  # ñ
$c_E_acute   = [char]0x00C9  # É
$c_N_tilde   = [char]0x00D1  # Ñ
$c_U_umlaut  = [char]0x00DC  # Ü

$perez_correct     = "Sergio P" + $c_e_acute + "rez #11"
$hulkenberg_correct = "Nico H" + $c_u_umlaut + "lkenberg #27"
$vinales_correct   = "Maverick Vi" + $c_n_tilde + "ales #12"

$perez_bad      = "Sergio P" + $c_E_acute + "rez #11"
$hulkenberg_bad = "Nico H" + $c_U_umlaut + "lkenberg #27"
$vinales_bad    = "Maverick Vi" + $c_N_tilde + "ales #12"

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    if ($line.Contains($perez_bad)) {
        $lines[$i] = $line.Replace($perez_bad, $perez_correct)
        Write-Host "L$($i+1): Fixed Sergio Pérez"
    }
    if ($line.Contains($hulkenberg_bad)) {
        $lines[$i] = $line.Replace($hulkenberg_bad, $hulkenberg_correct)
        Write-Host "L$($i+1): Fixed Nico Hülkenberg"
    }
    if ($line.Contains($vinales_bad)) {
        $lines[$i] = $line.Replace($vinales_bad, $vinales_correct)
        Write-Host "L$($i+1): Fixed Maverick Viñales"
    }
}

[System.IO.File]::WriteAllLines($path, $lines, $utf8NoBOM)
Write-Host "Saved fixed accents in data.js."
