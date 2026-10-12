# Het gebouw (de basis)

Je werkt aan het 3D-gebouw waarin elke laag (elk spel) speelt. Dit is de basis: alles hier moet werken zonder dat er een spel op staat.

## Wat hier hoort
- Het model (`model/bib.glb`) en wat het model niet heeft: vloer, plafond, rekken, ramen (gegevens in `gebouw-data.js`).
- Wandelen, botsing, camera, besturing (stick, toetsen, tikken), zoom, weergave.
- Het neutrale poppetje en de manier waarop een laag er een eigen poppetje kan opzetten.

## Wat hier NIET hoort
- Opdrachten, fiches, vragen, scores, voortgang, verhaal, een personage zoals Boek-E, teksten van een spel.
- Verwijzingen naar een bepaalde laag. Het gebouw kent de lagen niet.

## De lijst voor lagen is een afspraak
`window.Gebouw` (onderaan `gebouw.js`) is het enige wat lagen van het gebouw gebruiken. De lagen worden door iemand anders gebouwd.
- Verander of verwijder bestaande onderdelen van die lijst niet zonder het te melden in `logboek/gebouw.md` (dik gedrukt, zodat de laag-bouwer het ziet). Toevoegen mag.
- Voeg alleen toe wat voor elke laag nuttig kan zijn.
- Zet bij elk nieuw onderdeel een korte uitleg in de lijst en in `lagen/_sjabloon/laag.js`.

## Na elke wijziging
1. Start `game/lokale-server.ps1` en open `http://localhost:8765/?test`.
2. Controleer: geen foutmeldingen in de console, `bibTest.bereik(-13, -34)` geeft nog `cellen` rond 4800 en bevat de zaal.
3. Open ook `?laag=_sjabloon`: het gebouw moet alleen werken, zonder 50-jaar.
4. Logboek bijwerken in `logboek/gebouw.md`.

## Punten in het model
Een groep of component in SketchUp met precies deze naam wordt een punt voor de lagen (`Gebouw.punten`):
`start`, `fiche-1` … `fiche-8`, of `plek-<naam>` (bv. `plek-leeshoek`). Nieuwe soorten benoemde punten voeg je toe in `laadModel` in `gebouw.js`.
