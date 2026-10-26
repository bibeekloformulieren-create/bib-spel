/* LIJST VAN LAGEN
   ------------------------------------------------------------------
   Het gebouw (map `gebouw`) is de basis. Elke laag is een eigen spel of activiteit bovenop dat gebouw.
   Een laag woont in een eigen map in `lagen` en staat hier in de lijst.

   Een laag kiezen:  game/index.html?laag=50-jaar
   Zonder keuze start de laag waar  standaard: true  staat.

   Velden:
     naam      hoe de laag heet (voor ons)
     map       waar de laag woont (eindigt op /)
     css       stijlbestanden, in deze volgorde, vanaf de map van de laag
     scripts   scriptbestanden, in deze volgorde, vanaf de map van de laag
               (eerst hulpbestanden en teksten, het laatste is het hoofdbestand van de laag)

   Een nieuwe laag beginnen: kopieer de map `_sjabloon`, geef ze een nieuwe naam en zet ze hier bij.
*/
window.LAGEN = {

  '50-jaar': {
    naam: '50 jaar bib Eeklo (Boek-E en de acht fiches)',
    map: 'lagen/50-jaar/',
    standaard: true,
    css: ['boek-e/boek-e.css', 'laag.css'],
    scripts: ['boek-e/boek-e.js', 'opdrachten.js', 'fiches-laden.js', 'laag.js']
  },

  'tentoonstelling': {
    naam: 'Tentoonstelling: de negen panelen van 50 jaar bib',
    map: 'lagen/tentoonstelling/',
    css: ['laag.css'],
    scripts: ['panelen.js', 'laag.js']
  },

  '_sjabloon': {
    naam: 'Lege laag om mee te beginnen (alleen wandelen)',
    map: 'lagen/_sjabloon/',
    css: [],
    scripts: ['laag.js']
  }

};
