# Spel bib – digitale wandel-game Bibliotheek Eeklo

Een game waarin deelnemers digitaal door de bibliotheek van Eeklo wandelen en onderweg opdrachten uitvoeren. De game draait in de browser (pc, tablet, gsm), zonder installatie.

## Hoe het in elkaar zit: een gebouw met lagen erboven

Het **gebouw** is de basis: rondwandelen door de bib. Een **laag** is een spel of activiteit bovenop dat gebouw. Nu is er één laag (50 jaar bib met Boek-E). Later kan er bijvoorbeeld een laag komen voor anderstalige volwassenen, op hetzelfde gebouw, zonder dat het gebouw of het eerste spel verandert.

| Wat | Waar | Wie |
|---|---|---|
| Het gebouw: model, vloer, rekken, ramen, wandelen | `game/gebouw` | de gebouw-bouwer |
| Laag "50 jaar bib": Boek-E, de fiches, de opdrachten | `game/lagen/50-jaar` | de spel-bouwer |
| Een volgende laag | `game/lagen/<naam>` (start vanuit `_sjabloon`) | de spel-bouwer |

Een laag kiezen in de browser: `index.html?laag=50-jaar`. Zonder keuze start de standaardlaag.

## Mappen

| Map | Wat zit erin |
|---|---|
| `bronmateriaal/sketchup` | Het SketchUp-model van de bib (.skp, en een export als .glb) |
| `bronmateriaal/plattegronden` | Plattegronden per verdieping (pdf of afbeelding) |
| `bronmateriaal/fotos` | Foto's per verdieping. Zet de verdieping in de bestandsnaam, bv. `gelijkvloers_balie.jpg` |
| `game/gebouw` | **Het gebouw.** `gebouw-data.js` (vloer, rekken, ramen, grenzen), `model/bib.glb`, en de code om te wandelen |
| `game/lagen` | **De spellen.** `lijst.js` is het overzicht van de lagen |
| `game/lagen/50-jaar` | Laag 1: `fiches` (de acht fiches, elk een tekstbestand), `opdrachten.js` (intro, einde, foto's), `img` (foto's), `boek-e` (het personage), `laag.js` (de code) |
| `game/lagen/_sjabloon` | Een lege laag om een nieuwe mee te beginnen |

## Samenwerken: GitHub

De gedeelde versie van het project staat op GitHub, in een **privé-repo** (`bibeekloformulieren-create/bib-spel`). Elk werkt in een eigen kopie op de eigen computer, met het eigen Claude-account. OneDrive komt er niet meer bij kijken.

**Elke werkdag, in twee zinnen aan Claude:**

| Wanneer | Wat je zegt | Wat Claude doet |
|---|---|---|
| Begin | "Haal de laatste versie op." | Haalt het werk van je collega binnen en vertelt wat er veranderd is. |
| Einde | "Bewaar mijn werk en deel het." | Maakt een versie met een korte beschrijving en zet die op GitHub. |

Wil je terug naar een eerdere versie? Zeg het gewoon: "Ga terug naar de versie van gisteren." Er gaat niets verloren: elke bewaarde versie blijft in de geschiedenis.

## Werkafspraken (belangrijk!)

1. **Elk in je eigen gebied.** Wie aan het gebouw werkt, blijft in `game/gebouw`. Wie aan een spel werkt, blijft in `game/lagen`. Zo botsen jullie wijzigingen bijna nooit.
2. **Begin elke werkdag met "Haal de laatste versie op", en eindig met "Bewaar mijn werk en deel het".** Anders werk je op een oude versie, en dat geeft later gedoe.
3. **Elk logboek houdt zijn eigen gebied bij.** Het gebouw in `logboek/gebouw.md`, de lagen in `logboek/lagen.md`. Heb je iets nodig van de ander? Zet het daar, dik gedrukt.
4. **Gaat er iets mis bij het delen?** Claude zegt het in gewone taal. Doe niets forceren en vraag het aan je collega. Verwijder zelf niets.
5. **Alles wat Claude moet weten, staat in de map** (`CLAUDE.md`, `OVERDRACHT.md`, het logboek). Jullie accounts delen geen geheugen of gesprekken.

## Werken met Claude

Open de map `bib-spel` in Claude (Cowork of Claude Code). Claude leest dan automatisch `CLAUDE.md` en weet waar het project over gaat en welke afspraken er zijn. Werkt Claude in `game/gebouw` of `game/lagen`, dan leest het daar ook de afspraken voor die map. Je kunt gewoon in het Nederlands vragen wat je wilt, bijvoorbeeld:

- "Voeg een opdracht toe bij de leeshoek op de eerste verdieping."
- "Maak de wandelsnelheid wat trager."
- "Maak een nieuwe laag voor anderstalige volwassenen, op hetzelfde gebouw."
- "Zet een testversie online zodat ik ze kan delen."

## Logboek

| Gebied | Bestand |
|---|---|
| Het gebouw | `logboek/gebouw.md` |
| De lagen | `logboek/lagen.md` |
| Alles tot 12-10-2026 (OneDrive-tijd) | `logboek/geschiedenis.md` |

## Het 3D-model plaatsen

1. Zet het model als `game/gebouw/model/bib.glb`. Staat het er niet, dan toont het gebouw een tijdelijke zaal.
2. Geef in SketchUp (voor het exporteren) aan waar dingen liggen: een kleine groep of component met de naam `start` (waar je begint), en per spel eigen punten, zoals `fiche-1` … `fiche-8` voor de fiches of `plek-<naam>` voor iets anders. Het gebouw leest die namen uit het model en geeft ze aan de lagen.
3. Staat het model in inch of centimeter? Pas dan `schaal` aan in `game/gebouw/gebouw-data.js`.
4. Teksten en vragen van laag 50-jaar aanpassen: open het bestand van de fiche in Kladblok, bv. `game/lagen/50-jaar/fiches/fiche-3.txt`. Uitleg in `game/lagen/50-jaar/fiches/HANDLEIDING.md`. Bekijken kan met `start-spel.bat`.
5. Test: start `game/lokale-server.ps1` en ga naar http://localhost:8765/ (dat brengt je naar `game/index.html`). Met `?test` achter het adres kun je in de console `bibTest.ga(3)` typen om naar fiche 3 te springen.
