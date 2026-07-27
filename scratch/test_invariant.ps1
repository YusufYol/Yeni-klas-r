$culture = [System.Globalization.CultureInfo]::InvariantCulture

function To-TitleCaseInvariant ($str) {
    if (-not $str) { return $str }
    
    # Check known team names / special cases
    $knownTeams = @{
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
        "APRILIA RACING" = "Aprilia Racing"
        "TRACKHOUSE RACING" = "Trackhouse Racing"
        "DUCATI LENOVO TEAM" = "Ducati Lenovo Team"
        "PERTAMINA ENDURO VR46" = "Pertamina Enduro VR46"
        "PERTAMINA ENDURO VR46 RACING TEAM" = "Pertamina Enduro VR46 Racing Team"
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

    if ($knownTeams.ContainsKey($str)) {
        return $knownTeams[$str]
    }

    # Custom word processing with InvariantCulture
    $words = $str -split ' '
    $resultWords = foreach ($w in $words) {
        if ($w -match '^#\d+$') {
            $w
        } elseif ($w -eq "JR.") {
            "Jr."
        } elseif ($w -eq "F1" -or $w -eq "HP" -or $w -eq "BWT" -or $w -eq "RB" -or $w -eq "KTM" -or $w -eq "BK8" -or $w -eq "VR46" -or $w -eq "LCR" -or $w -eq "AMG") {
            $w
        } else {
            # Convert first char to upper invariant, rest to lower invariant
            if ($w.Length -gt 1) {
                $first = $w.Substring(0,1).ToUpper($culture)
                $rest = $w.Substring(1).ToLower($culture)
                $first + $rest
            } else {
                $w.ToUpper($culture)
            }
        }
    }
    return $resultWords -join ' '
}

# Test on F1 Pilots
$f1Pilots = @(
    "MAX VERSTAPPEN #3",
    "ISACK HADJAR #6",
    "LEWIS HAMILTON #44",
    "CHARLES LECLERC #16",
    "LANDO NORRIS #1",
    "OSCAR PIASTRI #81",
    "GEORGE RUSSELL #63",
    "ANDREA KIMI ANTONELLI #12",
    "FERNANDO ALONSO #14",
    "LANCE STROLL #18",
    "PIERRE GASLY #10",
    "FRANCO COLAPINTO #43",
    "ALEXANDER ALBON #23",
    "CARLOS SAINZ JR. #55",
    "LIAM LAWSON #30",
    "ARVID LINDBLAD #41",
    "OLIVER BEARMAN #87",
    "ESTEBAN OCON #31",
    "NICO HULKENBERG #27",
    "NICO HÜLKENBERG #27",
    "GABRIEL BORTOLETO #5",
    "VALTTERI BOTTAS #77",
    "SERGIO PÉREZ #11"
)

foreach ($p in $f1Pilots) {
    Write-Host "$p => $(To-TitleCaseInvariant $p)"
}
