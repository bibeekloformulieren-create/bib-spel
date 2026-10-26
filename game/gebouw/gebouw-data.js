/* GEBOUW-DATA · alles wat bij het gebouw zelf hoort
   ------------------------------------------------------------------
   Dit is de basis onder elk spel: het 3D-model van de bib, de vloer, de rekken, de ramen.
   Hier staat NIETS over opdrachten, fiches of een spel. Dat zit in de lagen (map `lagen`).
   Alle plaatsen zijn in meters, zoals op de plattegrond met raster
   (bronmateriaal/plattegronden/plattegrond-met-raster.png).
*/
window.GEBOUWDATA = {

  /* Het model uit SketchUp (SimLab-export): meters, Y omhoog, geen vloer. */
  model: { url: 'model/bib.glb', schaal: 1 },

  /* Hoe groot de speler is ten opzichte van het gebouw. 1 = echte menselijke maat; kleiner (bv. 0.8) laat het gebouw groter voelen.
     Past poppetje, wandelsnelheid, oogpunt en cameraafstand aan; het gebouw zelf en alle plaatsen blijven ongewijzigd. */
  spelerSchaal: 0.8,

  /* Alles buiten dit vak (losse voorwerpen) wordt verborgen, en je kunt er niet buiten wandelen. */
  grens: { xmin: -15.6, xmax: 1.2, zmin: -38.2, zmax: -13.4 },

  /* De glazen ingangsdeur tussen inkom en zaal. Dit is de enige doorloopbare glazen plek. */
  deur: { xmin: -12.4, xmax: -11.2, zmin: -33.4, zmax: -31.8 },

  /* Waar de speler begint (in de glazen inkom, kijkend naar het oosten, de zaal in).
     Staat er in het model een punt met de naam "start", dan wint dat. */
  start: [-13, -34],
  startRichting: -Math.PI / 2,

  /* Een punt in de zaal dat bereikbaar moet zijn (voor de bereikbaarheidstest). */
  testpunt: [-9, -30],

  /* Uiterlijk van vloer en plafond (kleurcodes). Pas aan en ververs de pagina. */
  look: {
    vloerTegel:    "#5f5753",   // de kleine donkere tegels (gang naar de veranda)
    vloerVoeg:     "#c4beb5",   // de voegen ertussen
    vloerGlad:     "#8d8f93",   // de gladde grijze vloer (inkom, balie)
    vloerTegelLicht: "#a8857a", // roze-bruine tegels (o.a. bij het digipunt)
    vloerVoegLicht:  "#7f8a8c",
    plafondLat:    "#d7c6a0",   // houten latten
    plafondSpleet: "#4a4338",
    /* Vloerzones. Overal is de vloer glad grijs, behalve in deze vakken.
       type: "tegel-donker", "tegel-licht", "tapijt" of "glad".  x: [van, tot]  z: [van, tot] */
    zones: [
      { naam: "dvd-gang", type: "tegel-klein", x: [-11.0, -7.0], z: [-27.0, -21.6] },
      { naam: "loper naar de glazen zaal", type: "loper", x: [-9.8, -8.5], z: [-26.8, -21.6] },
      { naam: "digipunt", type: "tegel-licht",  x: [-8.5, -3.5],  z: [-31.5, -27.0] },
      { naam: "koffiehoek", type: "tapijt",     x: [-7.6, -1.9],  z: [-37.4, -31.8] },
      { naam: "kleuterhoek", type: "parket", x: [-3.45, 0.0], z: [-31.8, -18.1] },
      { naam: "glazen zaal", type: "tegel-groot", x: [-12.2, -6.0], z: [-21.6, -15.6] }
    ]
  },

  /* Rekken en kasten. Het model bevat er geen; hier zet je ze neer.
     soort:  "boeken", "dvd", "spel" of "kubus" (witte kubuskast met houten kader)
     kijkt:  naar welke kant de voorkant wijst: "oost", "west", "zuid" of "noord"
     lengte: in meter.  x en z: het midden.  hoogte: in meter (niet verplicht).
     De koffiehoek is nagebouwd uit de render en de plek van de witte kast bij de balie. */
  rekken: [
    { naam: "kubuskast koffiehoek 1", soort: "kubus", x: -2.45, z: -36.45, lengte: 1.7, hoogte: 2.0, kijkt: "west" },
    { naam: "kubuskast koffiehoek 2", soort: "kubus", x: -2.45, z: -34.95, lengte: 1.3, hoogte: 1.6, kijkt: "west" }
  ],

  /* Meubels (stoelen, tafels, planten). soort: "rek" (textuur dvd/boeken/spel), "rodetoren", "tijdschriftrek", "radiator", "vuilbak", "fauteuil", "poef", "tafel-rond", "tafel-hoog", "tafel" (werktafel), "stoel", "kruk" of "plant".
     kijkt: waar de voorkant naartoe wijst (bij een fauteuil: waar je naar kijkt als je erin zit).  kleur: "0xRRGGBB" (niet verplicht).
     Glazen zaal (veranda): nagebouwd naar een foto; zithoek rechts (west) als je de zaal in kijkt, hoge tafel over de hele breedte achteraan (zuid). */
  meubels: [
    /* hoge tafel over de hele breedte langs het zuidglas, 6 zwarte krukken op 1 m van elkaar */
    { naam: "hoge tafel", soort: "tafel-hoog", x: -8.2, z: -15.95, lengte: 5.9 },
    { naam: "kruk 1", soort: "kruk", x: -6.75, z: -16.5, kijkt: "zuid" },
    { naam: "kruk 2", soort: "kruk", x: -7.41, z: -16.5, kijkt: "zuid" },
    { naam: "kruk 3", soort: "kruk", x: -8.07, z: -16.5, kijkt: "zuid" },
    { naam: "kruk 4", soort: "kruk", x: -8.73, z: -16.5, kijkt: "zuid" },
    { naam: "kruk 5", soort: "kruk", x: -9.39, z: -16.5, kijkt: "zuid" },
    { naam: "kruk 6", soort: "kruk", x: -10.05, z: -16.5, kijkt: "zuid" },
    /* zithoek in de westhoek: blauwe fauteuil tegen het glas, ficus erachter */
    { naam: "fauteuil blauw", soort: "fauteuil", x: -11.2, z: -17.75, kijkt: "noord", kleur: 0x1f6f7a, hoek: 130 },
    { naam: "ficus",          soort: "plant",    x: -11.9, z: -18.3,  hoogte: 2.3 },
    { naam: "fauteuil oker",  soort: "fauteuil", x: -9.85, z: -19.4,  kijkt: "west",  kleur: 0xc98a1a, hoek: 245 },
    { naam: "fauteuil roest", soort: "fauteuil", x: -11.5, z: -20.55,  kijkt: "oost",  kleur: 0xb4502f, hoek: 50 },
    { naam: "salontafel",     soort: "tafel-rond", x: -10.8, z: -19.8, breed: 0.6 },
    { naam: "poef 1", soort: "poef", x: -11.5, z: -19.1 },
    { naam: "poef 2", soort: "poef", x: -10.55, z: -18.15 },
    { naam: "poef 3", soort: "poef", x: -10.45, z: -20.5 },
    /* gang naar de glazen zaal (dvd-gang): dvd-rekken aan de oostkant, hoge kasten aan de westkant, rode toren, raamnissen met radiatoren.
       Plekken door de gebruiker zelf gezet met &bewerk. */
    { naam: "dvd-rek oost",     soort: "rek", textuur: "dvd", x: -7.9, z: -25.25, lengte: 1.4, hoogte: 1.85, kijkt: "west" },
    { naam: "dvd-rek oost kopie 2",     soort: "rek", textuur: "dvd", x: -7.9, z: -26.6, lengte: 1.4, hoogte: 1.85, kijkt: "west" },
    { naam: "dvd-rek oost kopie 3",     soort: "rek", textuur: "dvd", x: -7.9, z: -28.0, lengte: 1.4, hoogte: 1.85, kijkt: "west" },
    { naam: "rode toren",        soort: "rodetoren", x: -9.5, z: -28.5, kijkt: "noord" },
    { naam: "hoge kast west",  soort: "rek", textuur: "boeken", x: -10.8, z: -25.95, lengte: 1, hoogte: 2.1, kijkt: "oost" },
    { naam: "hoge kast west kopie 2",  soort: "rek", textuur: "boeken", x: -10.8, z: -26.8, lengte: 1, hoogte: 2.1, kijkt: "oost" },
    { naam: "hoge kast west kopie 1",  soort: "rek", textuur: "boeken", x: -10.8, z: -24.95, lengte: 1, hoogte: 2.1, kijkt: "oost" },
    { naam: "radiator links",    soort: "radiator", x: -10.02, z: -22.5, lengte: 1, kijkt: "oost" },
    { naam: "radiator rechts",   soort: "radiator", x: -8.33,  z: -22.5, lengte: 1, kijkt: "west" },
    { naam: "vuilbak 1",         soort: "vuilbak", x: -8.5, z: -23.2 },
    { naam: "vuilbak 2",         soort: "vuilbak", x: -8.5, z: -22.8, kleur: 0x4aa6d8 },
    /* drie werktafels (1,6 x 0,8 m): twee met de lange kanten tegen elkaar (samen 1,6 x 1,6 m) en een derde dwars aan het uiteinde, met 8 witte stoelen */
    { naam: "werktafel 1", soort: "tafel", x: -7.15, z: -19.65, lengte: 1.6, breed: 0.8, kijkt: "oost" },
    { naam: "werktafel 2", soort: "tafel", x: -7.55, z: -18.5, lengte: 1.6, breed: 0.8, kijkt: "zuid" },
    { naam: "werktafel 3", soort: "tafel", x: -7.95, z: -19.65, lengte: 1.6, breed: 0.8, kijkt: "west" },
    { naam: "stoel w1", soort: "stoel", x: -8.5, z: -20, kijkt: "oost" },
    { naam: "stoel w2", soort: "stoel", x: -8.5, z: -19.3, kijkt: "oost" },
    { naam: "stoel w3", soort: "stoel", x: -7.95, z: -17.85, kijkt: "noord" },
    { naam: "stoel o1", soort: "stoel", x: -6.6, z: -20, kijkt: "west" },
    { naam: "stoel o2", soort: "stoel", x: -6.6, z: -19.25, kijkt: "west" },
    { naam: "stoel o3", soort: "stoel", x: -7.1, z: -17.85, kijkt: "noord" },
    { naam: "stoel n1", soort: "stoel", x: -8, z: -20.65, kijkt: "zuid" },
    { naam: "stoel n2", soort: "stoel", x: -7.15, z: -20.7, kijkt: "zuid" },
    /* digipunt: twee groepen van vier witte bureaus rond een stroomzuil, roze stoelen, laptops (naar foto) */
    { naam: "digipunt 1 stoel w1", soort: "stoel", x: -6.95, z: -28.15, kleur: 0xd9aaa4, kijkt: "oost" },
    { naam: "digipunt 1 stoel w2", soort: "stoel", x: -7.0, z: -27.5, kleur: 0xd9aaa4, kijkt: "oost" },
    { naam: "digipunt 2 bureau w1", soort: "tafel", x: -5.95, z: -28.6, lengte: 0.9, breed: 0.5, kleur: 0xf4f2ee, kijkt: "zuid" },
    { naam: "digipunt 2 stoel w1", soort: "stoel", x: -5.95, z: -29.1, kleur: 0xd9aaa4, kijkt: "zuid" },
    { naam: "digipunt 2 laptop w1", soort: "laptop", x: -5.95, z: -28.65, kijkt: "noord", hoogte: 0.75 },
    { naam: "digipunt 2 bureau o1", soort: "tafel", x: -4.7, z: -28.6, lengte: 0.9, breed: 0.5, kleur: 0xf4f2ee, kijkt: "noord" },
    { naam: "digipunt 2 stoel o1", soort: "stoel", x: -4.65, z: -27.6, kleur: 0xd9aaa4, kijkt: "noord" },
    { naam: "digipunt 2 laptop o1", soort: "laptop", x: -4.7, z: -28.6, kijkt: "noord", hoogte: 0.75 },
    { naam: "digipunt 2 bureau w2", soort: "tafel", x: -5.95, z: -28.05, lengte: 0.9, breed: 0.5, kleur: 0xf4f2ee, kijkt: "zuid" },
    { naam: "digipunt 2 stoel w2", soort: "stoel", x: -4.7, z: -29.1, kleur: 0xd9aaa4, kijkt: "zuid" },
    { naam: "digipunt 2 laptop w2", soort: "laptop", x: -5.9, z: -28.05, kijkt: "zuid", hoogte: 0.75 },
    { naam: "digipunt 2 bureau o2", soort: "tafel", x: -4.7, z: -28.0, lengte: 0.9, breed: 0.5, kleur: 0xf4f2ee, kijkt: "noord" },
    { naam: "digipunt 2 stoel o2", soort: "stoel", x: -5.95, z: -27.6, kleur: 0xd9aaa4, kijkt: "noord" },
    { naam: "digipunt 2 laptop o2", soort: "laptop", x: -4.7, z: -28.0, kijkt: "zuid", hoogte: 0.75 },
    /* koffiehoek (naar foto): zwarte kast met houten blad en koffiemachine tegen een oranje bakstenen muur, recht voor de plek x -3,0 z -28,6 */
    { naam: "baksteenmuur koffiehoek", soort: "paneel", kleur: 0xa07555, x: -2.5, z: -29.99, lengte: 2.2, hoogte: 2.5, kijkt: "zuid" },
    { naam: "muur koffiehoek rechts", soort: "paneel", x: -1.86, z: -29.45, lengte: 1.2, hoogte: 2.6, kijkt: "west", kleur: 0xa07555 },
    { naam: "muur koffiehoek zuid", soort: "paneel", x: -1.08, z: -28.95, lengte: 1.5, hoogte: 2.6, kijkt: "zuid", kleur: 0xa07555 },
    { naam: "koffiebalie", soort: "koffiebalie", x: -2.55, z: -29.7, lengte: 1.7, kijkt: "zuid" },
    /* kleuterhoek: lange smalle zaal in het oosten. Oranje muur links (oost), ramen rechts (west), houten vloer, groene bladeren, lage rekken op wieltjes, witte boekenbakken */
    { naam: "oranje muur oost", soort: "paneel", x: 0.05, z: -22.65, lengte: 8.4, hoogte: 2.8, kijkt: "west", kleur: 0xe8960c, hoek: 273.5 },
    { naam: "blad 1", soort: "blad", x: -0.18, z: -19.0, lengte: 1.5, hoogte: 2.5, kijkt: "west" },
    { naam: "blad 2", soort: "blad", x: -0.18, z: -20.2, lengte: 1.3, hoogte: 2.35, kijkt: "west" },
    { naam: "blad 3", soort: "blad", x: -0.18, z: -21.3, lengte: 1.2, hoogte: 2.45, kijkt: "west" },
    { naam: "blad 4", soort: "blad", x: -0.18, z: -22.4, lengte: 1.0, hoogte: 2.4, kijkt: "west" },
    { naam: "blad 5", soort: "blad", x: -0.18, z: -23.4, lengte: 1.1, hoogte: 2.5, kijkt: "west" },
    { naam: "blad 6", soort: "blad", x: -0.18, z: -24.4, lengte: 0.9, hoogte: 2.45, kijkt: "west" },
    { naam: "blad 7", soort: "blad", x: -0.18, z: -25.3, lengte: 0.8, hoogte: 2.4, kijkt: "west" },
    { naam: "blad 8", soort: "blad", x: -0.18, z: -18.5, lengte: 1.6, hoogte: 2.55, kijkt: "west" },
    { naam: "laag rek oost 1", soort: "laagrek", x: -0.1, z: -21.75, lengte: 0.95, kijkt: "west", hoek: 273.5 },
    { naam: "laag rek oost 2", soort: "laagrek", x: -0.15, z: -22.65, lengte: 0.95, kijkt: "west", hoek: 273.5 },
    { naam: "laag rek oost 3", soort: "laagrek", x: -0.25, z: -24.2, lengte: 0.95, kijkt: "west", hoek: 274 },
    { naam: "laag rek oost 4", soort: "laagrek", x: -0.35, z: -25.05, lengte: 0.95, kijkt: "west", hoek: 274.5 },
    { naam: "hoge boekenkast einde", soort: "rek", textuur: "boeken", x: 0.0, z: -19.8, lengte: 1.6, hoogte: 1.9, kijkt: "west", hoek: 274.5 },
    { naam: "boekenbak 1", soort: "boekenbak", x: -1.75, z: -19.2, kijkt: "oost" },
    { naam: "boekenbak 2", soort: "boekenbak", x: -1.75, z: -19.8, kijkt: "oost" },
    { naam: "boekenbak 3", soort: "boekenbak", x: -1.75, z: -20.4, kijkt: "oost" },
    { naam: "boekenbak 4", soort: "boekenbak", x: -1.75, z: -21.0, kijkt: "oost" },
    { naam: "boekenbak 5", soort: "boekenbak", x: -1.75, z: -23.0, kijkt: "oost" },
    { naam: "hoge boekenkast einde kopie 1", soort: "rek", textuur: "boeken", x: -0.75, z: -18.3, lengte: 1.2, hoogte: 1.9, kijkt: "noord", hoek: 187 },
    { naam: "hoge boekenkast einde kopie 2", soort: "rek", textuur: "boeken", x: -3.1, z: -25.85, lengte: 1.2, hoogte: 1.9, kijkt: "oost" },
    { naam: "boekenbak 6", soort: "boekenbak", x: -1.75, z: -24.8, kijkt: "oost" },
    { naam: "boekenbak 7", soort: "boekenbak", x: -1.75, z: -25.4, kijkt: "oost" },
    { naam: "boekenbak 5 kopie 1", soort: "boekenbak", x: -1.75, z: -23.6, kijkt: "oost" },
    { naam: "boekenbak 5 kopie 2", soort: "boekenbak", x: -1.75, z: -24.2, kijkt: "oost" },
  ],



  /* Losse onderdelen van het SketchUp-model verwijderen of verschuiven (bv. een kastje dat er niet hoort).
     Voorbeelden:  { onderdeel: "Dvd_Kast_(Jaan)@-8.1,-26.6", weg: true }   of   { onderdeel: "naam@x,z", dx: 0.3, dz: -0.1 }
     De naam met plek krijg je van "Kopieer lijst voor Claude" in de verplaatsmodus (&bewerk). */
  modelAanpassingen: [
    { onderdeel: "Dvd_Kast_(Jaan)@-8.1,-26.6", weg: true },
    { onderdeel: "onderdeel@-5.2,-27.9", weg: true },   // bureaugroep digipunt (wordt nagebouwd)
    { onderdeel: "onderdeel@-6.9,-27.9", weg: true }   // bureaugroep digipunt (wordt nagebouwd)
    // eerste: dun wit kastpaneel in het model dat dwars door een rek liep
  ],

  /* Ramen in de gevel (het model heeft geen ramen). onder = hoogte van de vensterbank. */
  ramen: [
    { x: -10.07, z: -22.5, breed: 1.3, hoog: 1.5, onder: 0.9, kijkt: "oost" },   // gang naar de glazen zaal, links
    { x: -8.28,  z: -22.5, breed: 1.3, hoog: 1.5, onder: 0.9, kijkt: "west" },   // en rechts
    { x: -6.7, z: -37.38, breed: 1.8, hoog: 2.2, onder: 0.9, kijkt: "zuid" },
    { x: -4.3, z: -37.38, breed: 1.8, hoog: 2.2, onder: 0.9, kijkt: "zuid" }
  ],

  /* Gegokte rekken uit een eerdere versie. Worden NIET getoond; bewaard als geheugensteun
     tot de echte posities bekend zijn. Verplaats een rek naar "rekken" om het te tonen. */
  rekkenGok: [
    { naam: "dvd-wand gang",        soort: "dvd",    x: -9.9, z: -24.5, lengte: 4.0, kijkt: "oost" },
    { naam: "spelletjes gang",      soort: "spel",   x: -8.5, z: -22.0, lengte: 2.4, kijkt: "west" },
    { naam: "boeken glazen zaal",   soort: "boeken", x: -9.0, z: -20.6, lengte: 3.6, kijkt: "zuid" },
    { naam: "boeken glazen zaal 2", soort: "boeken", x: -9.0, z: -18.0, lengte: 3.6, kijkt: "zuid" }
  ]
};
