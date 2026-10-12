# Bewaar je werk en deel het via GitHub. Dubbelklik op deel.bat.
Set-Location $PSScriptRoot

function Stop-MetBericht($tekst, $kleur = 'Yellow') {
    Write-Host ""
    Write-Host $tekst -ForegroundColor $kleur
    Read-Host "Druk op Enter om te sluiten"
    exit
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Stop-MetBericht "Git is niet geinstalleerd. Zie OVERDRACHT.md, 'Zo begin je'."
}

$slot = Join-Path $PSScriptRoot ".git\index.lock"
if (Test-Path $slot) {
    if (Get-Process git -ErrorAction SilentlyContinue) {
        Stop-MetBericht "Er draait nog een git-proces. Wacht even en probeer opnieuw."
    }
    Remove-Item $slot -Force
}

# Naam voor de versie, eenmalig
if (-not (git config user.name)) {
    $naam = Read-Host "Je naam (eenmalig)"
    $mail = Read-Host "Je e-mailadres (eenmalig)"
    git config --global user.name $naam
    git config --global user.email $mail
}

$wijz = git status --porcelain
if (-not $wijz) {
    Write-Host "Er zijn geen nieuwe wijzigingen om te bewaren."
} else {
    Write-Host "Dit wordt bewaard:" -ForegroundColor Cyan
    git status --short
    Write-Host ""
    $tekst = Read-Host "Korte beschrijving, begin met 'Gebouw:' of 'Lagen:' (Enter = 'Wijzigingen')"
    if (-not $tekst) { $tekst = "Wijzigingen" }
    git add -A
    git commit -m $tekst
    if ($LASTEXITCODE -ne 0) { Stop-MetBericht "Bewaren is niet gelukt. Er is niets kwijt. Vraag het aan Claude." }
}

git pull --rebase
if ($LASTEXITCODE -ne 0) {
    if (Test-Path ".git\rebase-merge") { git rebase --abort }
    if (Test-Path ".git\rebase-apply") { git rebase --abort }
    Stop-MetBericht "Je werk is bewaard op je pc, maar delen lukte niet: er is een conflict of geen verbinding. Er is niets kwijt. Vraag het aan Claude."
}

git push
if ($LASTEXITCODE -ne 0) { Stop-MetBericht "Je werk is bewaard op je pc, maar het delen lukte niet. Probeer later opnieuw of vraag het aan Claude." }

Stop-MetBericht "Klaar: je werk is bewaard en gedeeld." 'Green'
