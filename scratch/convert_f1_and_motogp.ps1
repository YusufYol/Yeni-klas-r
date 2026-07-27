$path = (Resolve-Path "data.js").Path
$utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

# Unicode characters
$c_u_umlaut  = [char]0x00FC  # ü
$c_e_acute   = [char]0x00E9  # é
$c_n_tilde   = [char]0x00F1  # ñ
$c_dotless_i = [char]0x0131  # ı
$c_g_breve   = [char]0x011F  # ğ
$c_dotted_I  = [char]0x0130  # İ

$hulkenberg = "Nico H" + $c_u_umlaut + "lkenberg #27"
$perez      = "Sergio P" + $c_e_acute + "rez #11"
$toprak     = "Toprak Razgat" + $c_dotless_i + "lo" + $c_g_breve + "lu #7"
$vinales    = "Maverick Vi" + $c_n_tilde + "ales #12"

$nameMap = [System.Collections.Generic.Dictionary[string, string]]::new([System.StringComparer]::Ordinal)

function Add-Map ($from, $to) {
    if (-not $nameMap.ContainsKey($from)) {
        $nameMap.Add($from, $to)
    }
}

# F1 Pilots
Add-Map "MAX VERSTAPPEN #3" "Max Verstappen #3"
Add-Map "ISACK HADJAR #6" "Isack Hadjar #6"
Add-Map "LEWIS HAMILTON #44" "Lewis Hamilton #44"
Add-Map "CHARLES LECLERC #16" "Charles Leclerc #16"
Add-Map "LANDO NORRIS #1" "Lando Norris #1"
Add-Map "OSCAR PIASTRI #81" "Oscar Piastri #81"
Add-Map "GEORGE RUSSELL #63" "George Russell #63"
Add-Map "ANDREA KIMI ANTONELLI #12" "Andrea Kimi Antonelli #12"
Add-Map "FERNANDO ALONSO #14" "Fernando Alonso #14"
Add-Map "LANCE STROLL #18" "Lance Stroll #18"
Add-Map "PIERRE GASLY #10" "Pierre Gasly #10"
Add-Map "FRANCO COLAPINTO #43" "Franco Colapinto #43"
Add-Map "ALEXANDER ALBON #23" "Alexander Albon #23"
Add-Map "CARLOS SAINZ JR. #55" "Carlos Sainz Jr. #55"
Add-Map "LIAM LAWSON #30" "Liam Lawson #30"
Add-Map "ARVID LINDBLAD #41" "Arvid Lindblad #41"
Add-Map "OLIVER BEARMAN #87" "Oliver Bearman #87"
Add-Map "ESTEBAN OCON #31" "Esteban Ocon #31"
Add-Map "NICO HÜLKENBERG #27" $hulkenberg
Add-Map "NICO HULKENBERG #27" $hulkenberg
Add-Map "GABRIEL BORTOLETO #5" "Gabriel Bortoleto #5"
Add-Map "VALTTERI BOTTAS #77" "Valtteri Bottas #77"
Add-Map "SERGIO PÉREZ #11" $perez
Add-Map "SERGIO PEREZ #11" $perez

# F1 Teams
Add-Map "ORACLE RED BULL RACING" "Oracle Red Bull Racing"
Add-Map "SCUDERIA FERRARI HP" "Scuderia Ferrari HP"
Add-Map "MERCEDES-AMG PETRONAS F1 TEAM" "Mercedes-AMG Petronas F1 Team"
Add-Map "Mercedes-AMG PETRONAS F1 Team" "Mercedes-AMG Petronas F1 Team"
Add-Map "MCLAREN F1 TEAM" "McLaren F1 Team"
Add-Map "MCLAREN FORMULA 1 TEAM" "McLaren Formula 1 Team"
Add-Map "ASTON MARTIN ARAMCO F1 TEAM" "Aston Martin Aramco F1 Team"
Add-Map "BWT ALPINE F1 TEAM" "BWT Alpine F1 Team"
Add-Map "WILLIAMS RACING" "Williams Racing"
Add-Map "VISA CASH APP RB F1 TEAM" "Visa Cash App RB F1 Team"
Add-Map "HAAS F1 TEAM" "Haas F1 Team"
Add-Map "AUDI F1 TEAM" "Audi F1 Team"
Add-Map "CADILLAC F1 TEAM" "Cadillac F1 Team"
Add-Map "CADILLAC FORMULA 1 TEAM" "Cadillac Formula 1 Team"

# MotoGP Pilots
Add-Map "JORGE MARTIN #89" "Jorge Martin #89"
Add-Map "AI OGURA #79" "Ai Ogura #79"
Add-Map "MARC MARQUEZ #93" "Marc Marquez #93"
Add-Map "MARCO BEZZECCHI #72" "Marco Bezzecchi #72"
Add-Map "FABIO DI GIANNANTONIO #49" "Fabio Di Giannantonio #49"
Add-Map "RAUL FERNANDEZ #25" "Raul Fernandez #25"
Add-Map "PEDRO ACOSTA #37" "Pedro Acosta #37"
Add-Map "FRANCESCO BAGNAIA #63" "Francesco Bagnaia #63"
Add-Map "ALEX MARQUEZ #73" "Alex Marquez #73"
Add-Map "LUCA MARINI #10" "Luca Marini #10"
Add-Map "FERMIN ALDEGUER #54" "Fermin Aldeguer #54"
Add-Map "ENEA BASTIANINI #23" "Enea Bastianini #23"
Add-Map "BRAD BINDER #33" "Brad Binder #33"
Add-Map "FABIO QUARTARARO #20" "Fabio Quartararo #20"
Add-Map "DIOGO MOREIRA #11" "Diogo Moreira #11"
Add-Map "FRANCO MORBIDELLI #21" "Franco Morbidelli #21"
Add-Map "JOHANN ZARCO #5" "Johann Zarco #5"
Add-Map "JOAN MIR #36" "Joan Mir #36"
Add-Map "ALEX RINS #42" "Alex Rins #42"
Add-Map "JACK MILLER #43" "Jack Miller #43"
Add-Map "MAVERICK VIÑALES #12" $vinales
Add-Map "MAVERICK VINALES #12" $vinales
Add-Map "IKER LECUONA #27" "Iker Lecuona #27"
Add-Map "AUGUSTO FERNANDEZ #47" "Augusto Fernandez #47"
Add-Map "CAL CRUTCHLOW #35" "Cal Crutchlow #35"
Add-Map "JONAS FOLGER #94" "Jonas Folger #94"
Add-Map "MICHELE PIRRO #51" "Michele Pirro #51"

# MotoGP Teams
Add-Map "APRILIA RACING" "Aprilia Racing"
Add-Map "TRACKHOUSE RACING" "Trackhouse Racing"
Add-Map "DUCATI LENOVO TEAM" "Ducati Lenovo Team"
Add-Map "PERTAMINA ENDURO VR46" "Pertamina Enduro VR46"
Add-Map "RED BULL KTM FACTORY RACING" "Red Bull KTM Factory Racing"
Add-Map "BK8 GRESINI RACING MOTOGP" "BK8 Gresini Racing MotoGP"
Add-Map "REPSOL HONDA TEAM" "Repsol Honda Team"
Add-Map "RED BULL KTM TECH3" "Red Bull KTM Tech3"
Add-Map "CASTROL HONDA LCR" "Castrol Honda LCR"
Add-Map "MONSTER ENERGY YAMAHA MOTOGP TEAM" "Monster Energy Yamaha MotoGP Team"
Add-Map "MONSTER ENERGY YAMAHA MOTOGP" "Monster Energy Yamaha MotoGP"
Add-Map "PRIMA PRAMAC YAMAHA MOTOGP" "Prima Pramac Yamaha MotoGP"
Add-Map "YAMAHA FACTORY RACING" "Yamaha Factory Racing"

$newLines = [System.Collections.Generic.List[string]]::new()
$changedCount = 0

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $num = $i + 1

    # F1 pilots/teams/standings (804..1221)
    # F1 resultsHistory (1638..4324)
    # MotoGP pilots/teams (4604..4838)
    # MotoGP resultsHistory (5443..8073)
    # MotoGP standings (8074..8335)
    $isTargetLine = ($num -ge 804 -and $num -le 1221) -or
                    ($num -ge 1638 -and $num -le 4324) -or
                    ($num -ge 4604 -and $num -le 4838) -or
                    ($num -ge 5443 -and $num -le 8335)

    if ($isTargetLine -and $line -match '"(name|pilot|team)"\s*:\s*"(.*?)"') {
        $key = $matches[1]
        $val = $matches[2]

        if ($val -notlike "Resimler/*" -and $val -notlike "http*" -and $val -notlike "Cuma:*" -and $val -notlike "Cumartesi:*" -and $val -notlike "Pazar:*") {
            $newVal = $val
            if ($nameMap.ContainsKey($val)) {
                $newVal = $nameMap[$val]
            }

            # MotoGP standings requirement: replace 'İ' with 'I' while preserving other Turkish characters
            if ($num -ge 8074 -and $num -le 8335) {
                $newVal = $newVal.Replace($c_dotted_I.ToString(), "I")
            }

            if ($newVal -cne $val) {
                $line = $line.Replace("`"$val`"", "`"$newVal`"")
                $changedCount++
                Write-Host "L${num} ($key): '$val' => '$newVal'"
            }
        }
    }

    $newLines.Add($line)
}

[System.IO.File]::WriteAllLines($path, $newLines, $utf8NoBOM)
Write-Host "`nSuccessfully transformed and saved $changedCount lines in data.js!"
