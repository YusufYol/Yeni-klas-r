$path = (Resolve-Path "data.js").Path
$utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

# Culture invariant for case conversions
$culture = [System.Globalization.CultureInfo]::InvariantCulture

# Comprehensive mapping dictionary with Ordinal (case-sensitive) comparison
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
Add-Map "NICO HÜLKENBERG #27" "Nico Hülkenberg #27"
Add-Map "NICO HULKENBERG #27" "Nico Hülkenberg #27"
Add-Map "GABRIEL BORTOLETO #5" "Gabriel Bortoleto #5"
Add-Map "VALTTERI BOTTAS #77" "Valtteri Bottas #77"
Add-Map "SERGIO PÉREZ #11" "Sergio Pérez #11"
Add-Map "SERGIO PEREZ #11" "Sergio Pérez #11"

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
Add-Map "Toprak Razgatlıoğlu #7" "Toprak Razgatlıoğlu #7"
Add-Map "TOPRAK RAZGATLIOĞLU #7" "Toprak Razgatlıoğlu #7"
Add-Map "MAVERICK VIÑALES #12" "Maverick Viñales #12"
Add-Map "MAVERICK VINALES #12" "Maverick Viñales #12"
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

function Convert-TitleCaseString ($str) {
    if (-not $str) { return $str }
    if ($nameMap.ContainsKey($str)) {
        return $nameMap[$str]
    }
    
    $words = $str -split ' '
    $res = foreach ($w in $words) {
        if ($w -match '^#\d+$') {
            $w
        } elseif ($w -eq "JR.") {
            "Jr."
        } elseif ($w -eq "F1" -or $w -eq "HP" -or $w -eq "BWT" -or $w -eq "RB" -or $w -eq "KTM" -or $w -eq "BK8" -or $w -eq "VR46" -or $w -eq "LCR" -or $w -eq "AMG") {
            $w
        } else {
            if ($w.Contains("-")) {
                $sub = $w -split '-'
                $subFixed = foreach ($s in $sub) {
                    if ($s -eq "AMG" -or $s -eq "F1" -or $s -eq "RB" -or $s -eq "BWT") { $s }
                    else {
                        if ($s.Length -gt 1) { $s.Substring(0,1).ToUpper($culture) + $s.Substring(1).ToLower($culture) }
                        else { $s.ToUpper($culture) }
                    }
                }
                $subFixed -join '-'
            } else {
                if ($w.Length -gt 1) {
                    $w.Substring(0,1).ToUpper($culture) + $w.Substring(1).ToLower($culture)
                } else {
                    $w.ToUpper($culture)
                }
            }
        }
    }
    return $res -join ' '
}

$newLines = [System.Collections.Generic.List[string]]::new()
$changedCount = 0

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $num = $i + 1

    # Target lines in F1 and MotoGP sections (exclude news articles)
    $isTargetLine = ($num -ge 804 -and $num -le 1221) -or
                    ($num -ge 1638 -and $num -le 4324) -or
                    ($num -ge 4604 -and $num -le 4838) -or
                    ($num -ge 5443 -and $num -le 8335)

    if ($isTargetLine -and $line -match '^\s*"(name|pilot|team)"\s*:\s*"(.*?)"(\s*,?)$') {
        $key = $matches[1]
        $val = $matches[2]
        $comma = $matches[3]
        $indent = $line.Substring(0, $line.IndexOf('"'))

        if ($val -notlike "Resimler/*" -and $val -notlike "http*") {
            $newVal = Convert-TitleCaseString $val

            # Special requirement for MotoGP standings: replace 'İ' with 'I' while preserving other Turkish characters
            if ($num -ge 8074 -and $num -le 8335) {
                $newVal = $newVal.Replace([char]0x0130, 'I')
            }

            if ($newVal -ne $val) {
                $line = "${indent}`"${key}`": `"${newVal}`"${comma}"
                $changedCount++
                Write-Host "L${num} ($key): '$val' => '$newVal'"
            }
        }
    }

    $newLines.Add($line)
}

Write-Host "`nTotal lines transformed: $changedCount"
