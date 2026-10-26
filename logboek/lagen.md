# Logboek: de lagen (`game/lagen`)

Wie aan een spel werkt, schrijft hier wat er veranderd is. Zet de naam van de laag erbij. Nieuwste onderaan.
Heb je iets nodig van het gebouw? Zet het hier, dik gedrukt, zodat de gebouw-bouwer het ziet.

| Datum | Laag | Wie | Wat |
|---|---|---|---|
| 12-10-2026 | - | Claude | Start van dit logboek. De stand van laag 50-jaar staat in `logboek/geschiedenis.md`. |
| 12-10-2026 | - | Claude | Repo `bib-spel` staat nu online op GitHub (privé, `bibeekloformulieren-create`), `koendebbaut` is collaborator. Werkwijze: "Haal de laatste versie op" en "Bewaar mijn werk en deel het". Tip bij een time-out (408) bij een grote push: `git config http.postBuffer 524288000`. |
| 26-10-2026 | 50-jaar | Claude | **Nieuwe intro**: één welkomscherm met START-knop, daarna loopt Boek-E automatisch de bib in (4,5 s animatie) met uitlegballonnen over de besturing. De vier schuifjes zijn weg. |
| 26-10-2026 | 50-jaar | Claude | **Alle 8 fiches herschreven** voor kinderen, op basis van brochure en tentoonstellingspanelen 50 jaar bib. Fiche 1: vonkjes en lekdak toegevoegd. Fiche 4: omgezet naar invul-berekening (350 kg). Fiche 5: volledig nieuw — politie aan de deur + boete uitrekenen. Fiche 6: zomerse chip-studenten als kijkpunt. Fiche 7: omgezet naar alfabet-sorteren (volgorde). Fiche 8: volledig nieuw — slaapfeest Riebedebieb (45 kinderen, griezelverhalen). Lift-verhaal en lekdak-anekdotes toegevoegd. |
| 26-10-2026 | 50-jaar | Claude | **Fiches zijn nu losse tekstbestanden** in `game/lagen/50-jaar/fiches/` (`fiche-1.txt` ... `fiche-8.txt`), zelf aan te passen in Kladblok, zonder Claude. Inlezen via nieuw `fiches-laden.js` (staat in `lijst.js` na `opdrachten.js`); fouten tonen een rood vak in het spel. De fiches zijn uit `opdrachten.js` gehaald (die bevat nog intro, einde, foto's, plekken). Inhoud van de acht fiches is ongewijzigd (gecontroleerd: identiek). Sjablonen `_sjabloon-*.txt` en `HANDLEIDING.md` erbij. Het gebouw is niet aangeraakt. (`start-spel.bat` in de hoofdmap is van de gebouw-bouwer en blijft zoals het was.) |
