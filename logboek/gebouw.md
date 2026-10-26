# Logboek: het gebouw (`game/gebouw`)

Wie aan het gebouw werkt, schrijft hier wat er veranderd is. Nieuwste onderaan.
Heb je iets nodig van de lagen, of verander je iets aan `window.Gebouw` waar een laag mee werkt? Zet het hier, dik gedrukt.

| Datum | Wie | Wat |
|---|---|---|
| 12-10-2026 | Claude | Start van dit logboek. De stand van het gebouw staat in `logboek/geschiedenis.md` (rond 11-10-2026: omgebouwd naar gebouw + lagen). |
| 12-10-2026 | Claude | Repo `bib-spel` staat nu online op GitHub (privé), `koendebbaut` is collaborator. Ophalen: zie `OVERDRACHT.md`, "Zo begin je". Tip bij een time-out (408) bij een grote clone of push: `git config --global http.postBuffer 524288000`. |
| 26-10-2026 | Claude (account van de lagen-bouwer, werkt even in het gebouw) | Schaal: nieuwe instelling `spelerSchaal` in `gebouw-data.js` (nu 0,8): poppetje, wandelsnelheid, oogpunt en cameraafstand zijn kleiner, zodat het gebouw groter voelt. Model, botsing en plaatsen ongewijzigd; `window.Gebouw` ongewijzigd. Zet op 1 voor de oude maat. |
| 26-10-2026 | Claude | Algemeen: `start-spel.bat` toegevoegd in de hoofdmap: dubbelklikken start de testserver en opent het spel in de browser (met `?test`). |
| 26-10-2026 | Claude | In `?test`-modus staat links onderaan een balkje met x, z en kijkrichting, zodat screenshots meteen zeggen waar ze genomen zijn. Verder niets aan `window.Gebouw` gewijzigd. |
| 26-10-2026 | Claude | Glazen zaal (veranda) naar foto nagebouwd: nieuwe lijst `meubels` in `gebouw-data.js` (fauteuils, poefs, salontafel, hoge tafel met krukken, ficus), nieuwe vloer `tegel-groot` voor de zaal (x -12,2 tot -6,0; z -21,6 tot -15,6), en de zone dvd-gang stopt nu bij z -21,6 (ze liep door tot in de zaal). Plekken en richting zijn een eerste schatting. `window.Gebouw` niet gewijzigd. |
| 26-10-2026 | Claude | Glazen zaal aangepast na uitleg: zithoek rechts (west) als je de zaal in kijkt, hoge tafel over de hele breedte achteraan met 6 zwarte krukken. |
| 26-10-2026 | Claude | Glazen zaal: twee aaneengeschoven werktafels met 8 witte stoelen toegevoegd aan de oostkant (nieuwe soorten `tafel` en `stoel` in `meubels`). `window.Gebouw` niet gewijzigd. |
| 26-10-2026 | Claude | Glazen zaal: meubels opnieuw gemaakt naar de foto's (ronde fauteuilschaal met draadframe, tonvormige poefs, salontafel met ring, krukken met schaalrug en slee, witte schaalstoelen met schuine houten poten, klaptafels met wieltjes, volle ficus) en anders geplaatst: hoge tafel 4,15 m met 6 krukken langs het zuidglas, zithoek in de westhoek, werktafels met 8 stoelen in het oosten. Nieuw in `meubels`: soorten `tafel` en `stoel`. `window.Gebouw` niet gewijzigd. |
| 26-10-2026 | Claude | Meubels zelf verplaatsen: met `&bewerk` achter het adres (of dubbelklik op `meubels-verplaatsen.bat`) kun je meubels in de glazen zaal aanklikken, slepen en draaien (R), en met "Kopieer plekken" de nieuwe plekken aan Claude geven. Alleen een hulpmiddel; zonder `&bewerk` verandert er niets. `window.Gebouw` niet gewijzigd. |
| 26-10-2026 | Claude | Werktafels: nu drie tafels van 1,6 x 0,8 m (twee met de lange kanten tegen elkaar, samen 1,6 x 1,6 m, en een derde dwars aan het uiteinde), met 8 stoelen. |
| 26-10-2026 | Claude | Glazen zaal: de plekken en richtingen die de gebruiker met `&bewerk` zelf heeft gezet (26 meubels) staan nu vast in `gebouw-data.js`. Bereikbaarheid gecontroleerd (zaal en fiches bereikbaar). |
| 26-10-2026 | Claude | Hoge tafel nu over de hele breedte van de glazen zaal (5,9 m), 6 krukken gelijk verdeeld op 1 m van elkaar. |
