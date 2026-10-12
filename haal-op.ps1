# Haal de laatste versie op van GitHub. Veilig: je eigen wijzigingen blijven bewaard.
# Gebruik: rechtermuisknop op dit bestand > "Uitvoeren met PowerShell".
Set-Location $PSScriptRoot

function Stop-MetBericht($tekst) {
    Write-Host ""
    Write-Host $tekst -ForegroundColor Yellow
    Read-Host "Druk op Enter om te sluiten"
    exit 1
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Stop-MetBericht "Git is niet geinstalleerd. Zie OVERDRACHT.md, 'Zo begin je'."
}

# Een achtergebleven slotbestand opruimen, maar alleen als er geen git draait.
$slot = Join-Path $PSScriptRoot ".git\index.lock"
if (Test-Path $slot) {
    if (Get-Process git -ErrorAction SilentlyContinue) {
        Stop-MetBericht "Er draait nog een git-proces. Wacht even en probeer opnieuw."
    }
    Remove-Item $slot -Force
    Write-Host "Oud slotbestand opgeruimd."
}

$oud = git rev-parse HEAD
$bewaard = $false
if (git status --porcelain) {
    git stash push --include-untracked -m "haal-op automatisch" | Out-Null
    $bewaard = $true
    Write-Host "Je niet-bewaarde wijzigingen staan even opzij."
}

git pull --rebase
$gelukt = ($LASTEXITCODE -eq 0)
if (-not $gelukt) {
    if (Test-Path ".git\rebase-merge") { git rebase --abort }
    if (Test-Path ".git\rebase-apply") { git rebase --abort }
}

if ($bewaard) {
    git stash pop
    if ($LASTEXITCODE -ne 0) {
        Stop-MetBericht "Je wijzigingen konden niet terug worden gezet. Ze staan veilig in 'git stash list'. Vraag het aan Claude."
    }
}

if (-not $gelukt) {
    Stop-MetBericht "Ophalen is niet gelukt (geen verbinding, niet ingelogd, of een conflict). Er is niets kwijt. Vraag het aan Claude."
}

$nieuw = git rev-parse HEAD
Write-Host ""
if ($oud -eq $nieuw) {
    Write-Host "Je zit al op de laatste versie." -ForegroundColor Green
} else {
    Write-Host "Nieuw sinds je vorige stand:" -ForegroundColor Green
    git log "$oud..$nieuw" --pretty=format:"- %an: %s" --name-only
}
Write-Host ""
Read-Host "Klaar. Druk op Enter om te sluiten"
