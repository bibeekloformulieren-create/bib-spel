/* ALGEMENE TEKSTEN VAN DE LAAG "50 JAAR BIB"
   ------------------------------------------------------------------
   Hier staan de intro, het einde, de foto's en de plekken van de fiches.
   De FICHES zelf (kijken, raden, leren) staan in de map "fiches", elk in een eigen tekstbestand.
   Lees daar  fiches/HANDLEIDING.md.

   Pas hier gewoon de tekst tussen de aanhalingstekens aan en bewaar het bestand.
   Let op: laat de aanhalingstekens, komma's en haakjes staan.
*/
window.SPELDATA = {

  /* Beatrijs is directeur cultuur. Haar toestemming om haar naam te gebruiken is nog niet bevestigd.
     Wil je haar niet noemen? Zet bij "directeur" bv. "de directeur". */
  directeur: "Beatrijs",

  intro: [
    "De bib van Eeklo viert haar 50ste verjaardag!",
    "{directeur}, onze directeur, vroeg mij om het archief op orde te brengen. Maar tijdens de verbouwing van het gelijkvloers zijn al mijn fiches uit de kast gevallen.",
    "Help jij me zoeken? Ga op pad, los de vragen op en ontdek het verhaal van onze bib!",
    "Foutje? Geen probleem, probeer gewoon opnieuw. Heb je hulp nodig? Tik op 'Tip'. Ouders mogen natuurlijk meehelpen!"
  ],

  einde: {
    zin: "Alle zes terug, en jullie weten nu veel meer over de bib. {directeur} stelde me nog één vraag, en die geef ik door aan jullie.",
    vraag: "Hoe zal onze bibliotheek er in 2076 uitzien?",
    voet: "Dit blijft op je toestel. Er wordt niets verstuurd."
  },

  /* Waar de balie staat: [x, z] — de speler kan daar de brochure bekijken. */
  baliePlek: [-9, -32],

  /* Waar de fiches liggen in het echte model: [x, z] in meters (zoals op de plattegrond met raster).
     Staat er in het model een punt met de naam fiche-1 ... fiche-8, dan wint dat punt. */
  fichePlekken: {
    1: [-11.15, -33.30], 2: [-9.0, -33.0], 3: [-10.5, -31.5], 4: [-11.60, -36.15], 5: [-9, -28], 6: [-1.05, -26.60], 7: [-11.25, -29.65], 8: [-8.3, -24.2]
  },

  /* Staat op "true": bij elke fiche staat een paneel met een foto in de zaal. Staat uit: de foto's
     horen niet bij die plekken, ze zitten in "Oude foto's". */
  panelenInZaal: false,

  categorieen: {
    gebouw:  { naam: "Het gebouw", kleur: "#0b5d68" },
    werking: { naam: "Hoe de bib werkt", kleur: "#d9601f" }
  },

  /* ---------------------- OUDE FOTO'S (los van het spel) ----------------------
     Onderschriften komen uit de brochure en de tentoonstellingspanelen. Een foto toevoegen:
     zet het bestand in de map img (naast dit bestand) en schrijf hier een regel bij. */
  fotoGroepen: {
    toen:    "De bib van toen",
    gebouw:  "Het gebouw",
    werking: "Hoe de bib werkt"
  },
  fotos: [
    { groep: "toen",    src: "img/molenstraat.jpg",        onderschrift: "De Molenstraat in de beginjaren." },
    { groep: "toen",    src: "img/balie-1988.jpg",         onderschrift: "De balie in 1988: midden in de zaal, onder de vide." },
    { groep: "toen",    src: "img/lege-rekken.jpg",        onderschrift: "1995: de drie nieuwe verdiepingen zijn klaar. Eerst staan de rekken nog leeg." },
    { groep: "toen",    src: "img/gevulde-rekken.jpg",     onderschrift: "Even later zijn de rekken tot de nok gevuld." },
    { groep: "toen",    src: "img/klasuitleen.jpg",        onderschrift: "Klasuitleen: de hele klas kiest samen nieuwe boeken." },
    { groep: "toen",    src: "img/boekenbus.jpg",          onderschrift: "De Boekenbus in de refter: klas per klas kiezen de kinderen een boek." },
    { groep: "gebouw",  src: "img/gestript.jpg",           onderschrift: "Het huis tijdens de verbouwing: alles eruit." },
    { groep: "gebouw",  src: "img/staalskelet.jpg",        onderschrift: "Het stalen skelet van de vide." },
    { groep: "gebouw",  src: "img/bekisting-ruit.jpg",     onderschrift: "De bekisting van de vide tijdens de bouw." },
    { groep: "gebouw",  src: "img/vide-plafond.jpg",       onderschrift: "De opening in het plafond." },
    { groep: "gebouw",  src: "img/vide-reling.jpg",        onderschrift: "De vide, klaar." },
    { groep: "gebouw",  src: "img/zolder.jpg",             onderschrift: "De oude houten balken op de zolder bleven staan." },
    { groep: "gebouw",  src: "img/vide-van-boven.jpg",     onderschrift: "De balie, gezien vanuit de vide." },
    { groep: "gebouw",  src: "img/trap-tussenverdiep.jpg", onderschrift: "Vanaf de trap zie je de hele bibliotheek: één open ruimte, over verschillende verdiepingen." },
    { groep: "gebouw",  src: "img/voorgevel.jpg",          onderschrift: "De voorgevel van de bib in de Molenstraat." },
    { groep: "werking", src: "img/catalogus-1990.jpg",     onderschrift: "Het eerste zoekscherm: zoeken op titel, schrijver of trefwoord, zonder nog één fiche aan te raken." },
    { groep: "werking", src: "img/balie-computer.jpg",     onderschrift: "Uitlenen aan de balie, nu met de computer erbij." },
    { groep: "werking", src: "img/zelfuitleen-nu.jpg",     onderschrift: "Zelf uitlenen, vandaag." },
    { groep: "werking", src: "img/beschrijven.jpg",        onderschrift: "Een medewerker beschrijft nieuwe boeken." },
    { groep: "werking", src: "img/wegzetten.jpg",          onderschrift: "Boeken terug op hun plaats zetten." },
    { groep: "werking", src: "img/donderdagmarkt.jpg",     onderschrift: "Versleten boeken worden verkocht, onder meer op de donderdagmarkt." },
    { groep: "werking", src: "img/cd-bakken.jpg",          onderschrift: "Bladeren door de cd-bakken, per genre genummerd." },
    { groep: "werking", src: "img/zadenbib.jpg",           onderschrift: "Een boek, een cd… en een zakje zaadjes: sinds 2014 leen je in de bib ook zaden." },
    { groep: "werking", src: "img/afhaalpunt.jpg",         onderschrift: "Het afhaalpunt aan de nooddeur van de veranda (2020)." },
    { groep: "werking", src: "img/digispreekuur.jpg",      onderschrift: "Het digispreekuur: vrijwilligers helpen bij digitale vragen." }
  ]

  /* De acht fiches staan niet meer hier. Elke fiche is een eigen tekstbestand in de map "fiches"
     (fiche-1.txt, fiche-2.txt, ...). Uitleg: fiches/HANDLEIDING.md. Ze worden ingelezen door fiches-laden.js. */
};
