# De lagen (de spellen)

Elke map hier is een eigen spel of activiteit bovenop het gebouw (`../gebouw`). Voorbeelden: `50-jaar` (Boek-E en acht fiches) en later bijvoorbeeld een laag voor anderstalige volwassenen.

## Regels
- Een laag woont in één map. Alles van de laag staat daar: code, teksten, afbeeldingen, kleuren, het personage, de opslag van de voortgang.
- Raak `../gebouw` niet aan. Mist je laag iets? Vraag aan de bouwer van het gebouw om het toe te voegen aan `window.Gebouw` (algemeen, voor elke laag bruikbaar), of meld het in `logboek/lagen.md` (dik gedrukt, zodat de gebouw-bouwer het ziet).
- Een laag gebruikt van het gebouw alleen `window.Gebouw`. De lijst met wat kan staat in `_sjabloon/laag.js`.
- Lagen kennen elkaar niet. Gebruik geen bestanden of namen uit een andere laag. Wat twee lagen delen (bv. een personage) hoort in het gebouw als het over wandelen gaat, anders: kopieer het.
- Bewaar voortgang op de eigen sleutel in `localStorage`, met de naam van de laag erin (bv. `bib50-gevonden`), zodat lagen elkaars voortgang niet overschrijven.
- Paden naar eigen bestanden maak je in `laag.js` klaar met het pad van het script zelf (zie `bron()` in `50-jaar/laag.js`), want de pagina staat niet in de map van de laag.

## Een nieuwe laag beginnen
1. Kopieer `_sjabloon` naar een nieuwe map met een korte naam (bv. `anderstalig`).
2. Zet de laag in `lijst.js`.
3. Open `http://localhost:8765/game/index.html?laag=<naam>`.
4. Houd teksten en vragen in een apart bestand met gewone tekst (zoals `50-jaar/opdrachten.js`), zodat ze zonder programmeerkennis aan te passen zijn.
5. Logboek bijwerken in `logboek/lagen.md`.

## Wat is er al
| Laag | Wat |
|---|---|
| `50-jaar` | Boek-E, acht fiches (kijk, raad, leer), oude foto's. Opdrachten in `opdrachten.js`. |
| `_sjabloon` | Leeg: alleen wandelen. Beginpunt voor een nieuwe laag. |
