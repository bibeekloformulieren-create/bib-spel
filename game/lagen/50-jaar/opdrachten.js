/* OPDRACHTEN VAN DE LAAG "50 JAAR BIB"
   ------------------------------------------------------------------
   Dit bestand bevat alle teksten en vragen. Je hoeft niet te kunnen programmeren:
   pas gewoon de tekst tussen de aanhalingstekens aan en bewaar het bestand.
   Let op: laat de aanhalingstekens, komma's en haakjes staan.

   Elke fiche loopt in drie stappen:
     1 KIJK   foto's en een paar korte punten (wat moet je weten)
     2 RAAD   de vraag
     3 LEER   "Wist je dat?" met de uitleg. Blijft staan tot het kind verdergaat.

   Velden van een fiche:
     categorie  "gebouw" of "werking"
     waar       op welke echte plek in de bib hoort deze fiche? (zie ook fiche-plekken.md)
     kijkPunten korte zinnen bij de foto's (bij voorkeur 2 of 3)
     beelden    foto's, met onderschrift (bestanden staan in de map img naast dit bestand)
     kijk       (niet verplicht) een opdracht om iets in de echte bib te zoeken
     soort      keuze | meerdere | volgorde | invul
     leer       de "Wist je dat?"-punten
     bron       alleen voor ons: waar komt het vandaan?
   Bij soort "volgorde" kun je "jaren" meegeven: die verschijnen als tijdlijn bij LEER.
*/
window.SPELDATA = {

  /* Beatrijs is directeur cultuur. Haar toestemming om haar naam te gebruiken is nog niet bevestigd.
     Wil je haar niet noemen? Zet bij "directeur" bv. "de directeur". */
  directeur: "Beatrijs",

  intro: [
    "Hoi. Ik ben Boek-E. Ik werk in de bib van Eeklo. De bib bestaat 50 jaar.",
    "{directeur}, de directeur van de bib, vroeg me het archief op orde te brengen. Toen werd het gelijkvloers verbouwd en vielen mijn fiches uit de kast.",
    "Er zijn er acht. De blauwgroene gaan over het gebouw en de oranje over hoe de bib werkt. Zoek ze, bekijk ze, los de vraag op en leer iets bij.",
    "Fout? Probeer opnieuw, er is geen straf. Een tip nodig? Tik op Tip. Ouders mogen meehelpen."
  ],

  einde: {
    zin: "Alle acht terug, en jullie weten nu veel meer over de bib. {directeur} stelde me nog één vraag, en die geef ik door aan jullie.",
    vraag: "Hoe zal onze bibliotheek er in 2076 uitzien?",
    voet: "Dit blijft op je toestel. Er wordt niets verstuurd."
  },

  /* Waar de fiches liggen in het echte model: [x, z] in meters (zoals op de plattegrond met raster).
     Staat er in het model een punt met de naam fiche-1 ... fiche-8, dan wint dat punt. */
  fichePlekken: {
    1: [-9, -31], 2: [-4.5, -31], 3: [-11.4, -31.2], 4: [-9.5, -34.3],
    5: [-1.9, -22], 6: [-6.5, -30], 7: [-13, -28], 8: [-8.4, -25]
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
  ],

  fiches: [

    /* ------------------------- HET GEBOUW ------------------------- */

    { id: 1, categorie: "gebouw", bron: "Brochure 50 jaar bib, Deel 1-3",
      titel: "Een huis dat meegroeide",
      waar: "Bij de voorgevel / ingang van de bib.",
      plek: [0, 4],
      kijkPunten: [
        "In het voorjaar van 1976 ging de bib open in een leegstaand pand in de Molenstraat 40.",
        "Vier kleine bibliotheken waren één bib geworden. Het pand was een bescheiden plek met weinig ruimte.",
        "Daarna groeide de bib mee: een nieuw huis, extra verdiepingen en een veranda."
      ],
      beelden: [
        { src: "img/molenstraat.jpg", onderschrift: "De Molenstraat in de beginjaren: fietsen tegen de gevel." },
        { src: "img/voorgevel.jpg", onderschrift: "De voorgevel van de bib in de Molenstraat." }
      ],
      soort: "volgorde",
      vraag: "Zet de verhuizingen en uitbreidingen in de juiste volgorde.",
      items: [
        "De bib opent in een leegstaand pand in de Molenstraat 40",
        "Verhuizing naar het verbouwde huis Van Brabandt",
        "Drie nieuwe verdiepingen erbij",
        "Een glazen veranda in de binnentuin",
        "Het gelijkvloers wordt heringericht"
      ],
      jaren: ["1976", "1988", "1995", "2006", "2026"],
      tip: "Begin bij het kleine pand. Het nieuwste staat het laatst: dat is dit jaar.",
      boekeGoed: "Dat klopt. Elke keer was er meer plek nodig.",
      boekeFout: "Net niet. Denk eerst aan het kleine pand en eindig bij dit jaar.",
      leer: [
        "Op zaterdag 20 februari 1988 gingen de deuren van het nieuwe gebouw open. Het was een verbouwd herenhuis: huis Van Brabandt.",
        "De drie nieuwe verdiepingen van 1995 zijn samen 360 vierkante meter groot.",
        "De veranda kreeg een groendak. In die tijd was dat een heel nieuw idee."
      ]
    },

    { id: 2, categorie: "gebouw", bron: "Gesprek Willy Bultynck, Details bouw bibliotheek Eeklo",
      titel: "Verborgen plekken",
      waar: "Bij de trap of de balie (de kruipkelder ligt eronder).",
      plek: [-9.5, 5.5],
      kijkPunten: [
        "In 1986 werd het oude herenhuis helemaal leeggehaald. Wie beneden stond, kon tot onder het dak kijken.",
        "Willy Bultynck werkte mee aan de verbouwing. Hij kent de geheimen van het gebouw."
      ],
      beelden: [
        { src: "img/gestript.jpg", onderschrift: "Het huis tijdens de verbouwing: alles eruit." },
        { src: "img/zolder.jpg", onderschrift: "De oude houten balken op de zolder bleven staan." }
      ],
      soort: "keuze",
      vraag: "Onder het gelijkvloers is een ruimte waar niemand meer bij kan. Wat is het?",
      opties: ["Een kruipkelder", "Een geheime lift", "Een kamer achter de balie", "Een zwembad"],
      goed: 0,
      tip: "De naam zegt hoe je erin moet: je moet kruipen.",
      boekeGoed: "Een kruipkelder. Onder je voeten, en niemand komt er nog in.",
      boekeFout: "Nee. Denk aan iets onder de grond waar je op handen en voeten door moet.",
      leer: [
        "Onder het gelijkvloers ligt een kruipkelder. Je kunt er niet meer in.",
        "Op de derde verdieping staat een valse wand. Erachter zie je nog de oude dakstructuur.",
        "De oorspronkelijke muren lopen niet helemaal evenwijdig met de voorgevel. Extra muurtjes verbergen dat."
      ]
    },

    { id: 3, categorie: "gebouw", bron: "Paneel 3 - De verbouwing, Opdracht 3",
      titel: "De rode draad",
      waar: "Op een plek waar je de ruitvorm ziet: schuine vloertegels of onder de vide.",
      plek: [-4, -6],
      kijkPunten: [
        "Het hele gebouw is rond één vorm gebouwd. Je ziet hem op de foto's.",
        "Ook de vloeren en het plafond liggen schuin, onder 45 graden."
      ],
      kijk: "Zoek in de bib twee plekken waar je die vorm ziet. Kijk naar beneden en omhoog.",
      beelden: [
        { src: "img/bekisting-ruit.jpg", onderschrift: "De bekisting van de vide tijdens de bouw." },
        { src: "img/vide-plafond.jpg", onderschrift: "De opening in het plafond." }
      ],
      soort: "keuze",
      vraag: "Welke vorm is het?",
      opties: ["Een cirkel", "Een ruit", "Een driehoek", "Een ster"],
      goed: 1,
      tip: "Een vierkant dat op een hoek staat.",
      boekeGoed: "Een ruit. Willy noemt die schuine lijnen de rode draad.",
      boekeFout: "Nee. Denk aan een vierkant dat op een hoek staat.",
      leer: [
        "De vloertegels liggen onder 45 graden. De plafonds hebben ook schuine lijnen.",
        "Willy noemt die 45 graden de rode draad: je vindt ze in de vloer, het plafond, de vide en de gedenkplaat.",
        "Wie goed zoekt, ziet de ruit ook terug in de vide."
      ]
    },

    { id: 4, categorie: "gebouw", bron: "Gesprek Willy Bultynck, Details bouw bibliotheek Eeklo",
      titel: "Zonder kraan",
      waar: "Onder of bij de vide (het stalen skelet).",
      plek: [5, -5.8],
      kijkPunten: [
        "Aan dit gebouw kon geen kraan. Alles moest met de hand, met een takel en met veel geduld.",
        "De takel was gemaakt om motoren uit auto's te tillen. Hij mocht officieel 950 kilo dragen."
      ],
      beelden: [
        { src: "img/staalskelet.jpg", onderschrift: "Het stalen skelet van de vide." },
        { src: "img/vide-reling.jpg", onderschrift: "De vide, klaar." }
      ],
      soort: "keuze",
      vraag: "Hoeveel kilo hesen ze er in werkelijkheid mee, bij het zwaarste stuk?",
      opties: ["500 kilo", "950 kilo", "1.300 kilo", "5.000 kilo"],
      goed: 2,
      tip: "Het is meer dan wat de takel officieel kon, maar minder dan een vrachtwagen.",
      boekeGoed: "1.300 kilo. Ongeveer een kleine auto, zonder kraan.",
      boekeFout: "Dat klopt niet. Het is meer dan 950, maar veel minder dan een vrachtwagen.",
      leer: [
        "Het zwaarste stuk woog ongeveer 1.300 kilo: zo veel als een kleine auto.",
        "Voor stenen en mortel gebruikten ze een fietswiel met een ketting.",
        "De vloeren zijn gemaakt om 300 kilo per vierkante meter te dragen. Boeken zijn zwaar."
      ]
    },

    /* ----------------------- HOE DE BIB WERKT ----------------------- */

    { id: 5, categorie: "werking", bron: "Paneel 5 - Zo werkt de bib (Spoor 3)",
      titel: "De weg van een boek",
      waar: "Bij de balie, of waar nieuwe boeken binnenkomen.",
      plek: [-7, 0.3],
      kijkPunten: [
        "Een boek staat niet zomaar in het rek. Het heeft eerst een hele reis gemaakt.",
        "Sommige stappen doet een medewerker, andere doe jij zelf."
      ],
      beelden: [
        { src: "img/beschrijven.jpg", onderschrift: "Een medewerker beschrijft nieuwe boeken." },
        { src: "img/wegzetten.jpg", onderschrift: "Boeken terug op hun plaats zetten." }
      ],
      soort: "volgorde",
      vraag: "Zet de reis van een boek in de juiste volgorde.",
      items: [
        "De bib kiest het boek uit, samen met andere bibs",
        "Het boek krijgt een beschrijving in de computer",
        "Een lener zoekt het boek op de gsm of computer",
        "De lener scant het boek zelf en neemt het mee",
        "Is het boek versleten? Dan wordt het verkocht"
      ],
      jaren: ["Kiezen", "Beschrijven", "Vinden", "Lenen", "Afvoeren"],
      tip: "Eerst moet het boek er zijn. Daarna kan het gezocht en geleend worden. Op het eind is het versleten.",
      boekeGoed: "Kiezen, beschrijven, vinden, lenen, afvoeren. Zo reist een boek.",
      boekeFout: "Net niet. Het boek moet er eerst zijn voor iemand het kan zoeken.",
      leer: [
        "Sinds 2016 kopen 14 bibliotheken in het Meetjesland samen boeken aan. Dat geeft korting.",
        "Elk boek krijgt één beschrijving die voor heel Vlaanderen geldt. Zoek je een boek dat Eeklo niet heeft? Dan laat je het overkomen uit een andere bib.",
        "Versleten boeken worden verkocht, onder meer op de donderdagmarkt. Met het geld worden lessen Nederlands betaald voor nieuwkomers."
      ]
    },

    { id: 6, categorie: "werking", bron: "Paneel 5; Anekdotes bib medewerkers (Taggen)",
      titel: "Hoe weet het toestel wat je neemt?",
      waar: "Bij het zelfuitleentoestel.",
      plek: [7, 0.3],
      kijkPunten: [
        "Aan het zelfuitleentoestel leg je je boeken neer. Meteen toont het scherm wat je meeneemt.",
        "Niemand scant iets met de hand. En toch weet het toestel welk boek het is."
      ],
      kijk: "Zoek het toestel waar je zelf je boeken uitleent.",
      beelden: [
        { src: "img/zelfuitleen-nu.jpg", onderschrift: "Zelf uitlenen, vandaag." },
        { src: "img/balie-computer.jpg", onderschrift: "Uitlenen aan de balie, jaren negentig." }
      ],
      soort: "keuze",
      vraag: "Hoe herkent het toestel je boek?",
      opties: ["Door een chip in het boek", "Met een camera die de kaft ziet", "Een medewerker kijkt mee op een scherm", "Het toestel weegt het boek"],
      goed: 0,
      tip: "Er zit iets onzichtbaars in elk boek, cd en dvd. Het werkt met radiogolven.",
      boekeGoed: "Een chip. Radiogolven lezen hem, zonder dat je het ziet.",
      boekeFout: "Nee. Er zit iets in het boek dat het toestel kan lezen.",
      leer: [
        "In de zomer van 2012 plakten studenten een chip in elk boek, elke cd en elke dvd van de bib. Boek per boek.",
        "In februari 2013 begon de zelfuitleen. De medewerkers hebben sindsdien meer tijd om je te helpen.",
        "Vroeger zat in elk boek een boekkaart in een papieren zakje met je naam. Wie te laat was, kreeg een rode stip op het zakje."
      ]
    },

    { id: 7, categorie: "werking", bron: "Anekdotes bib medewerkers (Wijsneus, Bibliotheekstem)",
      titel: "Waar stond dat boek?",
      waar: "Aan de trap. De jeugdafdeling is boven, dus de fiche ligt onderaan de trap.",
      plek: [10, 5.5],
      kijkPunten: [
        "In de bib staan duizenden boeken. Elk boek heeft zijn eigen plek.",
        "Neem je er één uit het rek, dan blijft er een gat. Daar is een slim trucje voor."
      ],
      beelden: [
        { src: "img/gevulde-rekken.jpg", onderschrift: "Elk boek heeft zijn plek." },
        { src: "img/klasuitleen.jpg", onderschrift: "Een klas kiest samen nieuwe boeken." }
      ],
      soort: "keuze",
      vraag: "Wat zet je in de plaats van een boek dat je meeneemt?",
      opties: ["Een wijsneus", "Een bladwijzer", "Een sticker", "Niets, dat is niet nodig"],
      goed: 0,
      tip: "Het klinkt als een slim iemand, maar het is een figuurtje.",
      boekeGoed: "Een wijsneus. Dan weet iedereen waar het boek hoort.",
      boekeFout: "Nee. Het is een figuurtje dat in het rek staat tot het boek terug is.",
      leer: [
        "Op de jeugdafdeling ligt een doos met wijsneuzen. Neem je een boek, zet dan een wijsneus op de plek. Zo wordt het rek geen slagveld.",
        "Een jongen deed dat zonder dat iemand het vroeg. De les van de rondleiding was goed aangekomen.",
        "In de bib praat je zachtjes. Dat noemen kinderen de bibliotheekstem."
      ]
    },

    { id: 8, categorie: "werking", bron: "Paneel 5 tijdstrook; Brochure Deel 2-5",
      titel: "Wat kun je allemaal lenen?",
      waar: "Bij de cd- en dvd-wand, of de zadenbib.",
      plek: [0, -1],
      kijkPunten: [
        "Vroeger leende je alleen boeken en tijdschriften. Dat is lang geleden.",
        "In vijftig jaar kwam er van alles bij. Sommige dingen zijn je misschien nooit opgevallen."
      ],
      beelden: [
        { src: "img/cd-bakken.jpg", onderschrift: "De cd-bakken van de bib." },
        { src: "img/zadenbib.jpg", onderschrift: "De zadenbib: zaadjes lenen." }
      ],
      soort: "volgorde",
      vraag: "Wanneer kon je dit voor het eerst lenen? Zet ze van oud naar nieuw.",
      items: [
        "De eerste 2.000 cd's",
        "Zaadjes om te planten",
        "Gratis e-boeken",
        "Films streamen met Cinébib"
      ],
      jaren: ["1996", "2014", "2020", "2022"],
      tip: "Cd's zijn het oudst. Streamen is het nieuwst.",
      boekeGoed: "Cd's, zaadjes, e-boeken, films. Mijn kast wordt steeds langer.",
      boekeFout: "Bijna. Denk: wat bestond eerst, cd's of streamen?",
      leer: [
        "In 1996 kon je ook een cd-i-speler lenen. Dat is een toestel waar bijna niemand meer van heeft gehoord.",
        "Wie zaadjes leent, brengt na een jaar zaadjes van zijn eigen oogst terug.",
        "Sinds 2024 heb je met één lidkaart toegang tot meer dan twintig bibliotheken en uitleenposten in het Meetjesland en tot meer dan 300.000 boeken. Boetes bestaan niet meer."
      ]
    }

  ]
};
