$path = (Resolve-Path "data.js").Path
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

# Import mappings from audit_mappings.ps1 logic
$allKnownMap = @{
    # F1 Pilots
    "MAX VERSTAPPEN #3" = "Max Verstappen #3"
    "ISACK HADJAR #6" = "Isack Hadjar #6"
    "LEWIS HAMILTON #44" = "Lewis Hamilton #44"
    "CHARLES LECLERC #16" = "Charles Leclerc #16"
    "LANDO NORRIS #1" = "Lando Norris #1"
    "OSCAR PIASTRI #81" = "Oscar Piastri #81"
    "GEORGE RUSSELL #63" = "George Russell #63"
    "ANDREA KIMI ANTONELLI #12" = "Andrea Kimi Antonelli #12"
    "FERNANDO ALONSO #14" = "Fernando Alonso #14"
    "LANCE STROLL #18" = "Lance Stroll #18"
    "PIERRE GASLY #10" = "Pierre Gasly #10"
    "FRANCO COLAPINTO #43" = "Franco Colapinto #43"
    "ALEXANDER ALBON #23" = "Alexander Albon #23"
    "CARLOS SAINZ JR. #55" = "Carlos Sainz Jr. #55"
    "LIAM LAWSON #30" = "Liam Lawson #30"
    "ARVID LINDBLAD #41" = "Arvid Lindblad #41"
    "OLIVER BEARMAN #87" = "Oliver Bearman #87"
    "ESTEBAN OCON #31" = "Esteban Ocon #31"
    "NICO HULKENBERG #27" = "Nico Hülkenberg #27"
    "NICO HÜLKENBERG #27" = "Nico Hülkenberg #27"
    "GABRIEL BORTOLETO #5" = "Gabriel Bortoleto #5"
    "VALTTERI BOTTAS #77" = "Valtteri Bottas #77"
    "SERGIO PÉREZ #11" = "Sergio Pérez #11"
    "SERGIO PEREZ #11" = "Sergio Pérez #11"

    # F1 Teams
    "ORACLE RED BULL RACING" = "Oracle Red Bull Racing"
    "SCUDERIA FERRARI HP" = "Scuderia Ferrari HP"
    "MERCEDES-AMG PETRONAS F1 TEAM" = "Mercedes-AMG Petronas F1 Team"
    "MCLAREN F1 TEAM" = "McLaren F1 Team"
    "ASTON MARTIN ARAMCO F1 TEAM" = "Aston Martin Aramco F1 Team"
    "BWT ALPINE F1 TEAM" = "BWT Alpine F1 Team"
    "WILLIAMS RACING" = "Williams Racing"
    "VISA CASH APP RB F1 TEAM" = "Visa Cash App RB F1 Team"
    "HAAS F1 TEAM" = "Haas F1 Team"
    "AUDI F1 TEAM" = "Audi F1 Team"
    "CADILLAC F1 TEAM" = "Cadillac F1 Team"

    # MotoGP Pilots
    "JORGE MARTIN #89" = "Jorge Martin #89"
    "AI OGURA #79" = "Ai Ogura #79"
    "MARC MARQUEZ #93" = "Marc Marquez #93"
    "MARCO BEZZECCHI #72" = "Marco Bezzecchi #72"
    "FABIO DI GIANNANTONIO #49" = "Fabio Di Giannantonio #49"
    "RAUL FERNANDEZ #25" = "Raul Fernandez #25"
    "PEDRO ACOSTA #37" = "Pedro Acosta #37"
    "FRANCESCO BAGNAIA #63" = "Francesco Bagnaia #63"
    "ALEX MARQUEZ #73" = "Alex Marquez #73"
    "LUCA MARINI #10" = "Luca Marini #10"
    "FERMIN ALDEGUER #54" = "Fermin Aldeguer #54"
    "ENEA BASTIANINI #23" = "Enea Bastianini #23"
    "BRAD BINDER #33" = "Brad Binder #33"
    "FABIO QUARTARARO #20" = "Fabio Quartararo #20"
    "DIOGO MOREIRA #11" = "Diogo Moreira #11"
    "FRANCO MORBIDELLI #21" = "Franco Morbidelli #21"
    "JOHANN ZARCO #5" = "Johann Zarco #5"
    "JOAN MIR #36" = "Joan Mir #36"
    "ALEX RINS #42" = "Alex Rins #42"
    "JACK MILLER #43" = "Jack Miller #43"
    "Toprak Razgatlıoğlu #7" = "Toprak Razgatlıoğlu #7"
    "MAVERICK VIÑALES #12" = "Maverick Viñales #12"
    "IKER LECUONA #27" = "Iker Lecuona #27"
    "AUGUSTO FERNANDEZ #47" = "Augusto Fernandez #47"
    "CAL CRUTCHLOW #35" = "Cal Crutchlow #35"
    "JONAS FOLGER #94" = "Jonas Folger #94"
    "MICHELE PIRRO #51" = "Michele Pirro #51"

    # MotoGP Teams
    "APRILIA RACING" = "Aprilia Racing"
    "TRACKHOUSE RACING" = "Trackhouse Racing"
    "DUCATI LENOVO TEAM" = "Ducati Lenovo Team"
    "PERTAMINA ENDURO VR46" = "Pertamina Enduro VR46"
    "RED BULL KTM FACTORY RACING" = "Red Bull KTM Factory Racing"
    "BK8 GRESINI RACING MOTOGP" = "BK8 Gresini Racing MotoGP"
    "REPSOL HONDA TEAM" = "Repsol Honda Team"
    "RED BULL KTM TECH3" = "Red Bull KTM Tech3"
    "CASTROL HONDA LCR" = "Castrol Honda LCR"
    "MONSTER ENERGY YAMAHA MOTOGP TEAM" = "Monster Energy Yamaha MotoGP Team"
    "MONSTER ENERGY YAMAHA MOTOGP" = "Monster Energy Yamaha MotoGP"
    "PRIMA PRAMAC YAMAHA MOTOGP" = "Prima Pramac Yamaha MotoGP"
    "YAMAHA FACTORY RACING" = "Yamaha Factory Racing"
}

$unmapped = [System.Collections.Generic.List[string]]::new()

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    $num = $i + 1

    # Only inspect pilots, teams, standings lines (not news array lines)
    if (($num -ge 804 -and $num -le 1220) -or ($num -ge 8074 -and $num -le 8335)) {
        if ($line -match '"(name|pilot|team)":\s*"(.*?)"') {
            $key = $matches[1]
            $val = $matches[2]
            if (-not $allKnownMap.ContainsKey($val) -and $val -ne "Toprak Razgatlıoğlu #7") {
                $unmapped.Add("L${num} ($key): $val")
            }
        }
    }
}

Write-Host "Unmapped lines count: $($unmapped.Count)"
foreach ($u in $unmapped) {
    Write-Host $u
}
