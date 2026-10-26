# Projectcontext voor Claude

Browsergame voor de Bibliotheek Eeklo: spelers wandelen door een 3D-versie van de bib. Twee collega's van Stad Eeklo werken eraan, elk met een eigen Claude-account en op een eigen computer, via een gedeelde privé-repo op GitHub (`bibeekloformulieren-create/bib-spel`). Eén bouwt het gebouw, de ander de spellen erboven. Dit project staat NIET in OneDrive (git en OneDrive samen beschadigen de git-gegevens): werk alleen in de lokale kopie.

Nieuw in het project of een ander account? Lees eerst `OVERDRACHT.md`: wie waar werkt, wat Claude over de inhoud moet weten (o.a. hoe Beatrijs genoemd wordt) en wat nog openstaat.

## De opbouw: een gebouw met lagen erboven

```
game/
  index.html          startpagina; kiest de laag (…/index.html?laag=50-jaar)
  gebouw/             DE BASIS: het 3D-gebouw en het wandelen. Geen spel, geen opdrachten.
  lagen/
    lijst.js          welke lagen er zijn
    50-jaar/          laag 1: Boek-E en de acht fiches (50 jaar bib)
    _sjabloon/        lege laag om een nieuwe te beginnen
bronmateriaal/        SketchUp, plattegronden, foto's (ruw materiaal)
```

**De regel:** het gebouw weet niets van de lagen; een laag raakt het gebouw niet aan.
- Wil je iets in een laag dat het gebouw niet kan? Voeg het toe aan de lijst `window.Gebouw` in `game/gebouw/gebouw.js` (klein, algemeen, nuttig voor élke laag) en gebruik het daarna in de laag. Knip nooit laagspecifieke dingen in het gebouw.
- Alles wat bij één spel hoort (opdrachten, teksten, het poppetje, kleuren van het spel, opslag van de voortgang) staat in de map van die laag.
- Alles wat bij het gebouw zelf hoort (model, vloer, rekken, ramen, botsing, camera, besturing) staat in `game/gebouw/`.
- Meer regels staan in `game/gebouw/CLAUDE.md` en `game/lagen/CLAUDE.md`; die lees je vanzelf als je daar werkt.

## Afspraken
- Communiceer in het Nederlands, in eenvoudige taal. De gebruikers zijn geen programmeurs.
- Laat `bronmateriaal/` ongemoeid, behalve om exports toe te voegen.
- Opdrachten zijn data, geen code. Voor `50-jaar` staat elke fiche in een eigen tekstbestand (`game/lagen/50-jaar/fiches/fiche-1.txt` ... `fiche-8.txt`), door de gebruiker zelf in Kladblok aan te passen; de uitleg staat in `game/lagen/50-jaar/fiches/HANDLEIDING.md`. Intro, einde en foto's staan in `opdrachten.js`. Vraagt de gebruiker om een tekst van een fiche te wijzigen: pas dan alleen dat ene `.txt`-bestand aan (lees niet de hele laag) en verwijs naar de handleiding, zodat ze het de volgende keer zelf kunnen.
- Werk na afloop het logboek van je gebied bij met een korte regel over wat er veranderd is: `logboek/gebouw.md` voor `game/gebouw`, `logboek/lagen.md` voor `game/lagen`. `logboek/geschiedenis.md` is het oude logboek en wordt niet meer aangevuld.
- Wie zit er aan het gebouw, wie aan de lagen? Dat staat in `OVERDRACHT.md`. Werk niet in het gebied van de ander zonder het te melden in het logboek.

## Delen via GitHub (voor Claude)
De gebruikers zijn geen programmeurs en zeggen alleen zinnen als deze. Doe de git-handelingen zelf, en leg het resultaat uit in gewone taal.
- **"Haal de laatste versie op"**: draai eerst `haal-op.ps1` in de projectmap (`powershell -ExecutionPolicy Bypass -File haal-op.ps1`); de gebruiker kan ook gewoon dubbelklikken op `haal-op.bat` (ophalen) of `deel.bat` (bewaren en delen); dat doet alles hieronder in één keer, ook met niet-bewaarde wijzigingen. Lukt het niet omdat je in een omgeving zit zonder GitHub-toegang (cloudsessie, fout "could not read Username"): probeer niet opnieuw en laat geen `index.lock` achter. Zeg dat de gebruiker rechtermuisknop op `haal-op.ps1` > *Uitvoeren met PowerShell* kan kiezen, of Claude lokaal op de pc kan openen. Handmatig komt het hierop neer: `git status`. Staan er niet-bewaarde wijzigingen, zeg dat en bewaar ze eerst (zie hieronder) of vraag wat te doen. Dan `git pull --rebase`. Vertel kort wat er nieuw is (`git log` sinds de vorige stand), gegroepeerd per gebied (gebouw of lagen).
- **"Bewaar mijn werk en deel het"**: `git status` en `git diff --stat` bekijken, `git add` van de eigen wijzigingen, een korte Nederlandse beschrijving als commit-bericht, dan `git pull --rebase` en `git push`. Vermeld in het bericht welk gebied (gebouw of laag). Controleer dat het logboek van het gebied bijgewerkt is, en zet er anders een regel bij.
- **Terug naar een eerdere versie**: maak een nieuwe versie die de oude toestand herstelt (`git revert` of de bestanden van die versie terugzetten). Herschrijf nooit de geschiedenis.
- **Nooit**: `git push --force`, `git reset --hard` op werk dat niet bewaard is, of bestanden van de ander overschrijven. Bij een conflict: stop, leg uit welke bestanden het zijn en wie ze wijzigde (`git log`), en vraag wat de gebruiker wil.
- **Wat niet in de repo hoort**: wachtwoorden, tokens, persoonlijke gegevens van bezoekers. Staat er iets van dien aard tussen de wijzigingen, vraag eerst.
- Staat er een bestand van het gebied van de ander in de wijzigingen? Meld dat vóór je het bewaart.

## Technische richting
- Statische webpagina zonder build-stap (HTML + JavaScript, Three.js r128 via CDN), zodat ze overal werkt en makkelijk online te zetten is.
- Het 3D-model komt uit SketchUp (`bronmateriaal/sketchup`), omgezet naar glTF/GLB, en staat in `game/gebouw/model/bib.glb`.
- Besturing: WASD/pijltjes + muis op pc, joystick op het scherm voor tablet en gsm.
- Testen: dubbelklik op `start-spel.bat` (start `game/lokale-server.ps1` en opent http://localhost:8765/). Met `?test` achter het adres staat `bibTest` in de console (bijvoorbeeld `bibTest.bereik(-13, -34)`). Na elke wijziging aan het gebouw: controleer dat de fiches van laag 50-jaar nog bereikbaar zijn.
