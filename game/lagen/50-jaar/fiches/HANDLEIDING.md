# Handleiding: de fiches zelf aanpassen

Elke fiche is een gewoon tekstbestand in deze map: `fiche-1.txt` tot en met `fiche-8.txt`.
Je past ze aan in **Kladblok**. Je hebt daar geen Claude en geen programmeerkennis voor nodig.

## 1. Een fiche aanpassen (het dagelijkse werk)

1. Ga in Verkenner naar `C:\Projecten\bib-spel\game\lagen\50-jaar\fiches`.
2. Rechtermuisknop op bijvoorbeeld `fiche-3.txt` > **Openen met** > **Kladblok**. (Niet Word.)
3. Pas de tekst aan. Bewaar met **Ctrl + S**.
4. Wil je het meteen zien? Dubbelklik in de hoofdmap op **`start-spel.bat`**. Er opent een zwart venster (de server: laat het open) en het spel opent in je browser. Na elke wijziging druk je op **F5** in de browser.
5. Tevreden? Dubbelklik op **`deel.bat`** en typ als beschrijving iets als `Lagen: tekst van fiche 3 aangepast`. Je collega krijgt het dan.

**Klopt er iets niet?** Dan zie je bovenaan het spel een **rood vak** dat zegt in welk bestand en op welke regel het misgaat. Verbeter het, bewaar, en druk op F5.

## 2. Zo ziet een fiche eruit

```
nummer: 2
categorie: gebouw
soort: keuze
titel: Verborgen plekken
waar: Bij de trap of de balie.
tip: De naam zegt hoe je erin moet: je moet kruipen.
boeke-goed: Een kruipkelder. Onder je voeten, en niemand komt er nog in.
boeke-fout: Nee. Denk aan iets onder de grond.

[kijkpunten]
- Eerste korte zin bij de foto's.
- Tweede korte zin bij de foto's.

[beelden]
img/gestript.jpg | Het huis tijdens de verbouwing.
img/zolder.jpg | De oude houten balken op de zolder.

[vraag]
Onder het gelijkvloers is een ruimte waar niemand bij kan. Wat is het?

[antwoorden]
* Een kruipkelder
- Een geheime lift
- Een zwembad

[leer]
- Eerste "Wist je dat?".
- Tweede "Wist je dat?".
```

Bovenaan staan regels met de vorm `naam: tekst`. Daaronder volgen de **kopjes tussen [vierkante haken]**. Laat de kopjes en de dubbele punten staan. Regels die met `#` beginnen worden genegeerd: je kunt er eigen notities mee zetten.

| Onderdeel | Wat het is |
|---|---|
| `nummer` | Het nummer van de fiche. Elk nummer mag maar één keer voorkomen. Niet veranderen bij een bestaande fiche. |
| `categorie` | `gebouw` (blauwgroen) of `werking` (oranje). |
| `soort` | Het soort vraag: `keuze`, `meerdere`, `volgorde` of `invul`. Zie punt 3. |
| `titel` | De titel van de fiche. |
| `waar` | Voor ons: op welke echte plek in de bib de fiche hoort. |
| `tip` | De hulpzin bij de knop *Tip*. |
| `boeke-goed` / `boeke-fout` | Wat Boek-E zegt bij een goed of fout antwoord. |
| `zoek-opdracht` | (mag je weglaten) Een opdracht om iets in de echte bib te zoeken. |
| `bron` | (mag je weglaten) Voor ons: waar de informatie vandaan komt. |
| `plek` | (mag je weglaten) Een voorlopige plek in het model. Laat staan zoals het is. |
| `[kijkpunten]` | 2 of 3 korte zinnen bij de foto's. Elke zin begint met `- `. |
| `[beelden]` | De foto's: `img/bestand.jpg \| onderschrift`. Het streepje `\|` staat tussen de bestandsnaam en het onderschrift. |
| `[vraag]` | De vraag zelf. |
| `[antwoorden]` | De antwoorden. Zie punt 3. |
| `[leer]` | De "Wist je dat?"-zinnen die achteraf verschijnen. Elke zin begint met `- `. |

Een lange zin mag je over meerdere regels verdelen. Een regel die niet met `- ` begint, hoort bij de zin erboven.

## 3. De vier soorten vraag

**keuze: één goed antwoord.** Zet een `*` voor het goede antwoord en een `-` voor de andere. Er mag maar één `*` staan.
```
[antwoorden]
* Een ruit
- Een cirkel
- Een driehoek
```

**meerdere: meerdere goede antwoorden.** Zet een `*` voor elk goed antwoord. Wil je dat er minstens een bepaald aantal gekozen wordt, zet dan bovenaan `minimaal: 2`.

**volgorde: dingen in de juiste volgorde zetten.** Schrijf ze in de **juiste** volgorde. Het spel husselt ze zelf. Met een jaartal of woord ervoor krijg je een tijdlijn:
```
[antwoorden]
1976 | De bib opent in een klein pand
1988 | Verhuizing naar het grote huis
2026 | Het gelijkvloers wordt heringericht
```
Zonder jaartallen schrijf je gewoon `- tekst`. Doe het bij alle regels of bij geen enkele.

**invul: iets intypen.** In plaats van `[antwoorden]` gebruik je het kopje `[velden]`. Elke regel is `vraag | goed antwoord / ander goed antwoord`:
```
[velden]
In welk jaar ging de bib open? | 1976
Hoe heet de straat? | Molenstraat / de molenstraat
```

## 4. Een foto toevoegen of wisselen

1. Zet de foto (bij voorkeur `.jpg`, niet te groot) in de map `game\lagen\50-jaar\img`.
2. Schrijf in de fiche onder `[beelden]` een regel: `img/mijnfoto.jpg | Onderschrift`.
3. Gebruik geen spaties of accenten in de bestandsnaam (dus `zolder-balken.jpg`).

## 5. Een nieuwe fiche maken

1. Kopieer in deze map een sjabloon: `_sjabloon-keuze.txt`, `_sjabloon-meerdere.txt`, `_sjabloon-volgorde.txt` of `_sjabloon-invul.txt`.
2. Geef de kopie het eerstvolgende nummer, bijvoorbeeld **`fiche-9.txt`**. Nummer niet overslaan: het spel stopt bij het eerste ontbrekende nummer.
3. Pas de tekst aan en zet bij `nummer:` hetzelfde getal als in de bestandsnaam.
4. De **plek in de bib** van een nieuwe fiche moet nog worden ingesteld. Dat gebeurt in `opdrachten.js` (bij `fichePlekken`) of in het 3D-model (een punt `fiche-9`). Vraag dat aan Claude of aan je collega die het gebouw bouwt.
5. De intro en het einde zeggen nog "acht fiches". Pas die tekst aan in `opdrachten.js`.

## 6. Een fiche verwijderen

Verwijder altijd de **laatste** fiche (bijvoorbeeld `fiche-8.txt`). Wil je een fiche uit het midden weg, vraag het dan aan Claude: dan moeten de nummers en plekken meeschuiven.

## 7. Veelgemaakte fouten

- **Opgeslagen als Word of met een vreemde extensie.** Het bestand moet `fiche-N.txt` blijven heten, bewaard als gewone tekst (Kladblok doet dat vanzelf).
- **De `*` bij `keuze` vergeten of twee keer gezet.** Het rode vak meldt het.
- **De dubbele punt of het kopje in vierkante haken weggehaald.** Zet het terug.
- **Je ziet niets veranderen.** Druk op **Ctrl + F5** in de browser.
- **Rood vak "Ik kan de fiches niet lezen".** Open het spel via `start-spel.bat`, niet door op `index.html` te dubbelklikken.

## 8. Wanneer heb je Claude nodig?

Voor de tekst van de fiches niet. Wel voor: een nieuwe soort vraag, de plek van een fiche in het gebouw, of iets dat niet werkt zoals je verwacht. Zeg dan: "Lees `fiches/HANDLEIDING.md` en help me met fiche 3."
