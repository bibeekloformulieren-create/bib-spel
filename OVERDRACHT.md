# Overdracht: welkom bij het bib-spel

Dit bestand is voor wie nieuw aanhaakt (of voor het Claude-account van een collega). Het zegt wat het project is, wat er al staat, wie waar werkt en wat Claude moet weten.
Alles wat hier staat is ook in de map te vinden; dit is de korte weg erheen.

## Wat is dit?

Een spel in de browser (pc, tablet, gsm, zonder installatie) waarin je digitaal door de **Bibliotheek van Eeklo** wandelt. Het is gebouwd uit twee delen:

- **Het gebouw**: een 3D-versie van de bib waarin je kunt rondlopen. Dit is de basis.
- **Lagen**: spellen of activiteiten bovenop dat gebouw. De eerste laag is voor **50 jaar bib**: Boek-E, het archiefpoppetje, helpt je acht fiches terug te vinden en opdrachten op te lossen. Later kunnen er andere lagen bijkomen (bijvoorbeeld voor anderstalige volwassenen), op hetzelfde gebouw.

## Wie werkt waar?

| Wie (GitHub) | Werkt in | Gaat over |
|---|---|---|
| `bibeekloformulieren-create` | `game/lagen` | de spellen: Boek-E, opdrachten, teksten, nieuwe lagen |
| `koendebbaut` | `game/gebouw` | het gebouw: het SketchUp-model, vloer, rekken, ramen, wandelen |

Houd je aan je eigen map. Heb je iets nodig van de ander? Zet het in je logboek (`logboek/gebouw.md` of `logboek/lagen.md`), dik gedrukt.

## Zo begin je (eerste keer, voor wie nog niet meewerkt)

1. **GitHub-account.** Je hebt er een (`koendebbaut`). Aanvaard de uitnodiging voor de repo `bibeekloformulieren-create/bib-spel`: je krijgt een e-mail van GitHub, of ga naar https://github.com/bibeekloformulieren-create/bib-spel en klik op *Accept invitation*.
2. **Git installeren** (eenmalig): https://git-scm.com/download/win, alle standaardkeuzes laten staan.
3. **De map ophalen** (eenmalig). Open PowerShell en typ:
   ```
   git clone https://github.com/bibeekloformulieren-create/bib-spel.git C:\Projecten\bib-spel
   ```
   Je wordt gevraagd in te loggen op GitHub in de browser; doe dat met je eigen account.
   Zet de map **niet** in OneDrive, Dropbox of een andere gesynchroniseerde map.
4. **Naam voor je versies** (eenmalig). In PowerShell, met je eigen naam en e-mailadres:
   ```
   git config --global user.name "Jouw naam"
   git config --global user.email "jouw@adres.be"
   ```
5. Open de map `C:\Projecten\bib-spel` in Claude (Cowork of Claude Code), met je eigen account.
6. Claude leest nu automatisch `CLAUDE.md`. Je kunt meteen in het Nederlands vragen wat je wilt.
7. Wil je het spel zien? Start `game/lokale-server.ps1` (rechtermuisknop, *Uitvoeren met PowerShell*) en ga naar http://localhost:8765/.

**Handig als eerste bericht aan Claude:**

> Lees `OVERDRACHT.md`, `CLAUDE.md` en `logboek/gebouw.md`. Vertel me in eenvoudige taal waar het project nu staat en wat de volgende stappen zijn voor het gebouw (de map `game/gebouw`).

## Afspraken

- **Begin elke werkdag met "Haal de laatste versie op"** en eindig met **"Bewaar mijn werk en deel het"**. Claude doet de rest.
- **Elk in je eigen gebied**: gebouw of lagen. Zo botsen jullie wijzigingen bijna nooit.
- **Schrijf in je eigen logboek** (`logboek/gebouw.md` of `logboek/lagen.md`) wat je gedaan hebt, ook als het klein is.
- **Gaat er iets mis bij het delen?** Claude legt het uit in gewone taal. Niets forceren, niets zelf verwijderen: vraag het aan de ander.
- **Wat Claude moet weten, moet in deze map staan.** Jullie accounts delen geen geheugen en geen gesprekken. Een afspraak die alleen in een gesprek staat, bestaat voor de ander niet.
- **Het gebouw kent de lagen niet; een laag raakt het gebouw niet aan.** Mist een laag iets dat het gebouw zou moeten kunnen? Voeg het toe aan de lijst `window.Gebouw` (onderaan `game/gebouw/gebouw.js`), algemeen genoeg voor elke laag, en gebruik het daarna in de laag.

## Wat Claude moet weten over de inhoud

- **Doelgroep van laag 50-jaar:** kinderen en hun ouders. Eenvoudige taal, korte zinnen, geen straf bij een fout antwoord.
- **Beatrijs Hollebosch** is in de praktijk de bibliothecaris van Eeklo, officiële titel: **directeur cultuur**. Ze schreef het voorwoord van de brochure. In Boek-E's dialoog gewoon "Beatrijs" (of "onze bibliothecaris"); in een colofon of credits de officiële titel. **Haar toestemming om haar naam in het spel te gebruiken is nog niet bevestigd.** De naam staat op één plek (`directeur` bovenaan `game/lagen/50-jaar/opdrachten.js`), zodat ze snel te vervangen is.
- **Geen verzonnen citaten.** Alleen wat iemand zelf schreef of zei, uit de brochure, de panelen of de gesprekken.
- **De teksten komen uit de eigen bronnen:** de brochure 50 jaar bib, de tentoonstellingspanelen en gesprekken (bijvoorbeeld met Willy Bultynck over de bouw). Bij elke fiche staat in `opdrachten.js` onder `bron` waar het vandaan komt.
- **Boek-E** is een oranje archiefpoppetje met een vest en een naamkaartje "BOEK-E". Het karakterblad staat in `game/lagen/50-jaar/boek-e/karakterblad.html`.
- **Voortgang** wordt alleen op het toestel van de speler bewaard (`localStorage`). Er wordt niets verstuurd.

## Waar staat het project nu?

Gedaan:
- Het echte SketchUp-model (`game/gebouw/model/bib.glb`) staat in het spel. De spelers wandelen rond; vloer, plafond, een koffiehoek met kubuskasten en twee ramen zijn erbij gebouwd, omdat het model die niet heeft.
- Laag 50-jaar is speelbaar: Boek-E, acht fiches (kijk, raad, leer), 25 oude foto's, overzicht, einde met de vraag over 2076.
- Alle 8 fiches zijn bereikbaar vanaf de ingang.

Nog open voor het gebouw (`game/gebouw`):
- **Punten in SketchUp:** geef kleine groepen of componenten de namen `start`, `fiche-1` … `fiche-8`, zodat de plekken uit het model komen in plaats van uit de lijst `fichePlekken`. Welke fiche waar hoort, staat in `game/lagen/50-jaar/fiche-plekken.md`.
- **Deuren:** er zijn geen deuren in het model. Nu is alleen de ingangsdeur doorloopbaar (aangewezen op een screenshot, `deur` in `gebouw-data.js`). Teken in SketchUp deuren als openingen, of geef ze een eigen naam.
- **Rekken en meubels:** alleen de koffiehoek is nagebouwd. De overige rekken (boeken, dvd, spellen) zijn nog niet gemaakt; de gegokte posities staan als geheugensteun in `rekkenGok`, maar worden niet getoond. Gebruik de plattegrond met raster (`bronmateriaal/plattegronden`).
- **Ramen en gevel:** alleen twee ramen in de noordgevel staan er.
- **Hoekjes:** enkele kleine hoekjes achter de balie en de kast zijn niet bereikbaar. Controleer of dat zo bedoeld is.

Nog open voor de lagen (`game/lagen`):
- De naam van Beatrijs bevestigen met haarzelf.
- Een testversie online zetten om te delen.
- Eventuele nieuwe lagen (start vanuit `game/lagen/_sjabloon`).

## Waar vind ik wat?

| Ik zoek… | Dan kijk ik in |
|---|---|
| de teksten en vragen van de fiches | `game/lagen/50-jaar/opdrachten.js` |
| kleur en plek van vloer, rekken, ramen | `game/gebouw/gebouw-data.js` |
| het 3D-model | `game/gebouw/model/bib.glb` (bron: `bronmateriaal/sketchup`) |
| wat er veranderd is en wanneer | `logboek/gebouw.md`, `logboek/lagen.md` (en `logboek/geschiedenis.md` voor vroeger) |
| de regels voor het gebouw | `game/gebouw/CLAUDE.md` |
| de regels en het sjabloon voor lagen | `game/lagen/CLAUDE.md` en `game/lagen/_sjabloon/laag.js` |
