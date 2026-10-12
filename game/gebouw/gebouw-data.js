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
    vloerTegelLicht: "#d9cabd", // lichte beige tegels (o.a. bij het digipunt)
    vloerVoegLicht:  "#b9aea3",
    plafondLat:    "#d7c6a0",   // houten latten
    plafondSpleet: "#4a4338",
    /* Vloerzones. Overal is de vloer glad grijs, behalve in deze vakken.
       type: "tegel-donker", "tegel-licht", "tapijt" of "glad".  x: [van, tot]  z: [van, tot] */
    zones: [
      { naam: "dvd-gang", type: "tegel-donker", x: [-11.0, -6.5], z: [-27.0, -17.0] },
      { naam: "digipunt", type: "tegel-licht",  x: [-8.5, -3.5],  z: [-31.5, -27.0] },
      { naam: "koffiehoek", type: "tapijt",     x: [-7.6, -1.9],  z: [-37.4, -31.8] }
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

  /* Ramen in de gevel (het model heeft geen ramen). onder = hoogte van de vensterbank. */
  ramen: [
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
