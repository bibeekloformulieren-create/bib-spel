/* Boek-E: de gids van het spel, als vector getekend naar het ontwerp in Spel/Boek-E.jpg.
   Gebruik:  BoekE.svg('blij', { pose: 'zwaaien' })  geeft een SVG-tekst terug (transparante achtergrond).
   Uitdrukkingen: BoekE.uitdrukkingen  (neutraal, blij, knipoog, nadenken, verbaasd, moe)
   Houdingen:     BoekE.houdingen      (lezen, wijzen, zwaaien)
   Opties:        { lopen: true }  laat hem stappen (alleen bij 'lezen').
                  { pose: 'wijzen' | 'zwaaien' | 'lezen' }
                  { badge: false }  verbergt het naamkaartje.
                  { knik: true }    laat hem drie keer knikken (bij een goed antwoord).
   CSS staat in boek-e.css. */
const BoekE = (() => {
  let teller = 0;
  const GROEN = '#a6e24b', LICHT = '#e9ffc0', ORANJE = '#f48c1b', WIT = '#f6f1e4', TEAL = '#4f8e8a';
  const VEST = '#2c4a63', VEST_RAND = '#6f98b8';   // donker vest, zodat de romp niet één oranje vlek is

  const oog = (x, y, r = 17) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${GROEN}"/>` +
    `<circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.26}" fill="${LICHT}"/>`;

  const boog = (x, y) =>
    `<path d="M${x - 17} ${y + 9} Q${x} ${y - 20} ${x + 17} ${y + 9}" fill="none" stroke="${GROEN}" stroke-width="9" stroke-linecap="round"/>`;

  const halfDicht = (x, y) =>
    `<path d="M${x - 17} ${y} A17 17 0 0 0 ${x + 17} ${y} Z" fill="${GROEN}"/>` +
    `<path d="M${x - 19} ${y} H${x + 19}" stroke="${GROEN}" stroke-width="5" stroke-linecap="round"/>`;

  const L = [165, 168], R = [235, 168];

  const uitdrukkingen = {
    neutraal:  oog(...L) + oog(...R),
    blij:      boog(...L) + boog(...R),
    knipoog:   oog(...L) + boog(...R),
    nadenken:  `<g transform="translate(-7 -9)">${oog(...L, 15)}${oog(R[0], R[1], 11)}</g>`,
    verbaasd:  oog(...L, 23) + oog(...R, 23) +
               `<circle cx="${L[0]}" cy="${L[1]}" r="6" fill="#16240a"/><circle cx="${R[0]}" cy="${R[1]}" r="6" fill="#16240a"/>`,
    moe:       halfDicht(...L) + halfDicht(...R),
  };

  const arm = (x, y, w, h) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(w, h) / 2}" fill="${ORANJE}"/>`;
  const band = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${WIT}"/>`;
  const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="19" fill="${ORANJE}"/>`;

  /* Open boek, gecentreerd op x=200. 'dx' schuift het opzij. */
  const boek = (dx = 0) => `<g transform="translate(${dx} 0)">
    <path d="M140 372 L200 386 L200 432 L140 418 Z" fill="#f4f1e6" stroke="${TEAL}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M260 372 L200 386 L200 432 L260 418 Z" fill="#f4f1e6" stroke="${TEAL}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M152 388 l36 8 M152 399 l36 8 M248 388 l-36 8 M248 399 l-36 8" stroke="#aeb7b2" stroke-width="3" stroke-linecap="round"/>
  </g>`;

  /* Naamkaartje (alleen de naam), rechts op de borst (zoals de medewerkers). */
  const badge = `<g class="be-badge">
    <rect x="216" y="314" width="56" height="26" rx="5" fill="#fff" stroke="${TEAL}" stroke-width="2"/>
    <text x="244" y="332" text-anchor="middle" font-family="system-ui,Segoe UI,sans-serif" font-size="13" font-weight="800" fill="${VEST}">BOEK-E</text>
  </g>`;

  const houdingen = {
    lezen: {
      armen: `<g transform="rotate(14 122 330)">${arm(98, 292, 46, 112)}${band(96, 300, 50, 14)}</g>
              <g transform="rotate(-14 278 330)">${arm(256, 292, 46, 112)}${band(254, 300, 50, 14)}</g>`,
      boek: boek(0) + hand(144, 402) + hand(256, 402),
      hoofd: 0,
    },
    wijzen: {
      armen: `<g transform="rotate(8 122 330)">${arm(98, 292, 46, 112)}${band(96, 300, 50, 14)}</g>
              <g transform="rotate(-8 270 310)">
                ${arm(262, 290, 84, 40)}${band(264, 288, 14, 44)}
                <circle cx="338" cy="310" r="21" fill="${ORANJE}"/>
                <rect x="340" y="302" width="46" height="14" rx="7" fill="${ORANJE}"/>
              </g>`,
      boek: boek(-46) + hand(98, 404),
      hoofd: 4,
    },
    zwaaien: {
      armen: `<g transform="rotate(8 122 330)">${arm(98, 292, 46, 112)}${band(96, 300, 50, 14)}</g>
              <g class="be-zwaaiarm" transform="rotate(40 286 300)">
                ${arm(266, 205, 40, 112)}${band(264, 282, 44, 14)}
                <circle cx="286" cy="206" r="22" fill="${ORANJE}"/>
              </g>`,
      boek: boek(-46) + hand(98, 404),
      hoofd: -3,
    },
  };

  function svg(uitdrukking = 'neutraal', opties = {}) {
    const ogen = uitdrukkingen[uitdrukking] || uitdrukkingen.neutraal;
    const pose = houdingen[opties.pose] ? opties.pose : 'lezen';
    const h = houdingen[pose];
    const u = ++teller;   // elke tekening krijgt eigen id's, anders verdwijnt de vulling als de eerste verborgen staat
    const klasse = 'boek-e' + (opties.lopen && pose === 'lezen' ? ' boek-e--lopen' : '') + ` boek-e--${pose}` + (opties.knik ? ' boek-e--knikken' : '');
    return `
<svg class="${klasse}" viewBox="0 0 400 480" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Boek-E, de gids van de bibliotheek">
  <defs>
    <linearGradient id="be-oranje${u}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffa63d"/><stop offset="1" stop-color="#ef7d12"/>
    </linearGradient>
    <clipPath id="be-romp-clip${u}"><rect x="116" y="258" width="168" height="172" rx="64"/></clipPath>
    <filter id="be-gloed${u}" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="3.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <ellipse class="be-schaduw" cx="200" cy="466" rx="112" ry="12" fill="#000" opacity=".28"/>

  <g class="be-benen">
    <g class="be-been be-been-l"><rect x="158" y="412" width="28" height="36" rx="9" fill="#6d6967"/><ellipse cx="170" cy="453" rx="31" ry="15" fill="url(#be-oranje${u})"/></g>
    <g class="be-been be-been-r"><rect x="214" y="412" width="28" height="36" rx="9" fill="#6d6967"/><ellipse cx="230" cy="453" rx="31" ry="15" fill="url(#be-oranje${u})"/></g>
  </g>

  <g class="be-romp">
    <rect x="116" y="258" width="168" height="172" rx="64" fill="url(#be-oranje${u})"/>
    <path d="M140 285 Q200 262 260 285" fill="none" stroke="#ffc377" stroke-width="5" stroke-linecap="round" opacity=".7"/>
    <g clip-path="url(#be-romp-clip${u})">
      <path d="M110 302 L178 298 L200 346 L222 298 L290 302 L290 440 L110 440 Z" fill="${VEST}"/>
      <path d="M110 302 L178 298 L200 346 L222 298 L290 302" fill="none" stroke="${VEST_RAND}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M200 346 V440" stroke="${VEST_RAND}" stroke-width="3" opacity=".6"/>
    </g>
    <circle cx="200" cy="356" r="4.5" fill="#e8c26a"/>
    ${h.armen}
    <path d="M200 284 l-24 -12 v24 z M200 284 l24 -12 v24 z" fill="#d93a2b"/>
    <circle cx="200" cy="284" r="7" fill="#b92c20"/>
    <circle cx="170" cy="334" r="17" fill="${WIT}"/>
    <path d="M160 329 q10 -5 10 2 v10 q0 -6 -10 -2 z M180 329 q-10 -5 -10 2 v10 q0 -6 10 -2 z" fill="none" stroke="#ee7d12" stroke-width="2.4" stroke-linejoin="round"/>
    ${opties.badge === false ? '' : badge}
    ${h.boek}
  </g>

  <g transform="rotate(${h.hoofd} 200 250)"><g class="be-knik"><g class="be-hoofd">
    <rect x="186" y="246" width="28" height="22" rx="6" fill="#6d6967"/>
    <circle cx="122" cy="104" r="30" fill="${ORANJE}"/><circle cx="122" cy="104" r="17" fill="#ffb457"/>
    <circle cx="278" cy="104" r="30" fill="${ORANJE}"/><circle cx="278" cy="104" r="17" fill="#ffb457"/>
    <rect x="92" y="82" width="216" height="178" rx="84" fill="url(#be-oranje${u})"/>
    <path d="M130 100 Q168 80 214 84" fill="none" stroke="#ffd29b" stroke-width="7" stroke-linecap="round" opacity=".8"/>
    <ellipse cx="90" cy="176" rx="15" ry="35" fill="${WIT}"/><ellipse cx="310" cy="176" rx="15" ry="35" fill="${WIT}"/>
    <rect x="107" y="109" width="186" height="120" rx="58" fill="#c25f0b"/>
    <rect x="114" y="116" width="172" height="106" rx="52" fill="#101010"/>
    <g class="be-ogen" filter="url(#be-gloed${u})">${ogen}</g>
  </g></g></g>
</svg>`;
  }

  return { svg, uitdrukkingen: Object.keys(uitdrukkingen), houdingen: Object.keys(houdingen) };
})();
