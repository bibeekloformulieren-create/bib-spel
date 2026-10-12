/* SJABLOON VOOR EEN NIEUWE LAAG
   ------------------------------------------------------------------
   Een laag is een spel of activiteit bovenop het gebouw. Kopieer deze map, geef ze een nieuwe naam
   en zet ze in  ../lijst.js.  Open daarna  game/index.html?laag=<jouw-naam>.

   Wat het gebouw je geeft (window.Gebouw):
     G.start()               start het gebouw; geeft een belofte terug, klaar als het model er staat
     G.pauze = true/false    zet het wandelen stil (als een scherm open staat)
     G.speler                { x, z, yaw }: waar de speler staat (meters) en waar hij naar kijkt
     G.zet(x, z, yaw)        zet de speler ergens neer
     G.punten                benoemde punten uit het model: 'start', 'fiche-3', 'plek-leeshoek' → { x, y, z }
     G.echt                  true = echt model, false = tijdelijke zaal
     G.scene, G.THREE        de 3D-wereld, om eigen voorwerpen in te zetten
     G.vrijeRuimte(x, z)     hoeveel ruimte is er rond dit punt (meter, tot 3)
     G.knop(tekst, fn)       een knop rechtsboven
     G.opFrame(fn)           fn(dt, t) bij elk beeld
     G.opTikSpeler(fn)       fn() als iemand op het poppetje tikt
     G.opWeergave(fn)        fn('derde' | 'eerste') als de weergave wisselt
     G.zetAvatar([tex,tex,tex])  een eigen poppetje (3 THREE-texturen: stil, links, rechts)
     G.teksten               { derde, eerste }: tekst op de weergaveknop

   Je scherm bouw je in  <div id="laag">. Houd je aan de eigen map: raak `gebouw` niet aan.
   Heeft je laag iets van het gebouw nodig dat er niet in staat? Vraag de bouwer van het gebouw
   om het toe te voegen aan de lijst hierboven, in plaats van in het gebouw te knippen. */
(() => {
  'use strict';
  const G = window.Gebouw;
  document.title = 'Nieuwe laag';

  document.getElementById('laag').innerHTML =
    `<div class="hud" style="left:12px;top:12px;background:#fbf7ef;padding:8px 14px;border-radius:999px;font-weight:600;box-shadow:0 2px 8px #0003">
       Lege laag: hier komt jouw spel.</div>`;

  G.pauze = false;
  G.start().then(() => {
    // Hier komt jouw spel: voorwerpen plaatsen, opdrachten tonen, ...
  });
})();
