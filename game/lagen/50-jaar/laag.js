/* LAAG "50 JAAR BIB" · Boek-E, acht fiches, opdrachten
   ------------------------------------------------------------------
   Dit is een spel BOVEN op het gebouw. Het gebouw (map `gebouw`) zorgt voor het wandelen;
   deze laag zorgt voor alles wat er in gebeurt. Ze praat met het gebouw via `window.Gebouw`
   en raakt de bestanden van het gebouw nooit aan.
   Teksten en vragen staan in  opdrachten.js  (naast dit bestand). */
(() => {
  'use strict';

  const G = window.Gebouw, THREE = G.THREE;
  const D = window.SPELDATA;
  const FICHES = D.fiches;
  const MAP = (document.currentScript && document.currentScript.src || '').replace(/[^/]*$/, '');
  const bron = s => MAP + s;               // een pad uit opdrachten.js (bv. img/balie.jpg) klaarmaken voor de pagina
  const $ = id => document.getElementById(id);
  const tekst = s => String(s).replace('{directeur}', D.directeur);
  document.title = 'Boek-E · 50 jaar bib Eeklo';

  /* ---------- het scherm van deze laag ---------- */
  $('laag').innerHTML = `
    <button class="hud" id="teller">Fiches <b id="aantal">0</b> / <span id="totaal">8</span><span class="o">· overzicht</span></button>
    <div class="hud" id="pijl" title="Richting van de volgende fiche">
      <svg viewBox="0 0 24 24"><path d="M12 2 L20 20 L12 15 L4 20 Z" fill="#d9601f"/></svg>
    </div>
    <button id="actie" hidden></button>
    <button id="brochure-knop" hidden>📖 Brochure</button>
    <div id="boeke">
      <div class="bel" id="bel" hidden></div>
      <div class="poppetje" id="poppetje"></div>
    </div>
    <div class="scherm" id="schermIntro" hidden><div class="kaart" id="kaartIntro"></div></div>
    <div class="scherm" id="schermFiche" hidden><div class="kaart fiche" id="kaartFiche"></div></div>
    <div class="scherm" id="schermOverzicht" hidden><div class="kaart" id="kaartOverzicht"></div></div>
    <div class="scherm" id="schermEinde" hidden><div class="kaart" id="kaartEinde"></div></div>
    <div id="schermBrochure" class="brochure-ov" hidden>
      <div class="brochure-venster">
        <div class="brochure-balk">
          <button id="brochurePrev" class="brochure-nav" disabled>‹</button>
          <span id="brochurePagina">Laden…</span>
          <button id="brochureNext" class="brochure-nav" disabled>›</button>
          <button id="sluitBrochure" class="brochure-sluit">✕</button>
        </div>
        <div class="brochure-canvas-wrap" id="brochureWrap">
          <canvas id="brochureCanvas"></canvas>
        </div>
      </div>
    </div>`;

  /* ---------- opslag: alleen op dit toestel ---------- */
  const SLEUTEL = 'bib50-gevonden';
  const opslag = {
    lees() { try { return JSON.parse(localStorage.getItem(SLEUTEL)) || []; } catch (e) { return []; } },
    schrijf(v) { try { localStorage.setItem(SLEUTEL, JSON.stringify(v)); } catch (e) { /* geen opslag, geen probleem */ } },
    wis() { try { localStorage.removeItem(SLEUTEL); } catch (e) {} }
  };
  let gevonden = new Set(opslag.lees());
  let eindeGetoond = false;
  let dichtbij = null;
  let balieDichtbij = false;

  /* ---------- Boek-E in de hoek ---------- */
  let belTimer = 0;
  const boeke = {
    toon(uitdr = 'neutraal', opt = {}) { $('poppetje').innerHTML = BoekE.svg(uitdr, opt); },
    zeg(zin, uitdr = 'neutraal', opt = {}, ms = 7000) {
      this.toon(uitdr, opt);
      const bel = $('bel');
      bel.textContent = tekst(zin); bel.hidden = false;
      clearTimeout(belTimer);
      if (ms) belTimer = setTimeout(() => { bel.hidden = true; this.toon('neutraal'); }, ms);
    },
    stil() { $('bel').hidden = true; clearTimeout(belTimer); this.toon('neutraal'); }
  };

  /* Boek-E als poppetje in de zaal: drie loopbeeldjes die het gebouw gebruikt */
  function maakKaders() {
    const basis = BoekE.svg('neutraal', { pose: 'lezen', badge: true }).replace('<svg ', '<svg width="400" height="480" ');
    return [[0, 0], [14, -14], [-14, 14]].map(([l, r]) => {
      const svg = basis.replace('class="be-been be-been-l"', `transform="rotate(${l} 172 412)"`).replace('class="be-been be-been-r"', `transform="rotate(${r} 228 412)"`);
      const cv = document.createElement('canvas'); cv.width = 300; cv.height = 360;
      const tex = new THREE.CanvasTexture(cv);
      const img = new Image();
      img.onload = () => { cv.getContext('2d').drawImage(img, 0, 0, 300, 360); tex.needsUpdate = true; };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      return tex;
    });
  }

  /* ---------- fiches in de zaal ---------- */
  const ficheObj = [];                     // { data, groep, pos, kaart }
  /* Aanhaakpunt voor de tentoonstelling (map tentoonstelling): modus 'spel' of 'tentoonstelling'. In de tentoonstelling zijn de fiches weg. */
  const Laag50 = window.Laag50 = { modus: 'spel', fiches: ficheObj, ververs() { ficheObj.forEach(zetUiterlijk); }, klaar: null };

  /* Waar ligt fiche f? Een punt "fiche-N" in het model wint; anders de plekken uit opdrachten.js. */
  function plek(f) {
    const p = G.punten['fiche-' + f.id];
    if (p) return p;
    const xz = (G.echt && D.fichePlekken && D.fichePlekken[f.id]) || f.plek;   // f.plek hoort bij de tijdelijke zaal
    return { x: xz[0], z: xz[1], y: 0 };
  }

  function plaatsFiches() {
    FICHES.forEach(f => {
      const p = plek(f);
      const groep = new THREE.Group();
      const kleur = '#0b5d68';

      /* Canvas: bibliotheekkaart-stijl */
      const cv = document.createElement('canvas'); cv.width = 192; cv.height = 300;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#f5efe0';
      ctx.fillRect(0, 0, 192, 300);
      ctx.strokeStyle = '#c8ba9a'; ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 190, 298);
      ctx.fillStyle = kleur;
      ctx.fillRect(0, 0, 192, 44);
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('BIB EEKLO', 10, 22);
      ctx.textAlign = 'right'; ctx.font = 'bold 16px system-ui';
      ctx.fillText(String(f.id), 182, 22);
      ctx.strokeStyle = '#d5c9b0'; ctx.lineWidth = 1;
      [72, 96, 120, 144, 168, 192, 216, 240].forEach(y => { ctx.beginPath(); ctx.moveTo(14, y); ctx.lineTo(178, y); ctx.stroke(); });
      ctx.fillStyle = kleur; ctx.font = 'bold 80px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(f.id), 96, 152);
      ctx.fillStyle = '#e8ddc8'; ctx.beginPath(); ctx.arc(96, 278, 7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#b8a888'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(96, 278, 7, 0, Math.PI * 2); ctx.stroke();

      const mat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), side: THREE.DoubleSide });
      const kaart = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.34), mat);
      kaart.position.y = 1.0;
      groep.add(kaart);
      groep.position.set(p.x, p.y, p.z);
      G.scene.add(groep);
      const o = { data: f, groep, kaart, pos: new THREE.Vector3(p.x, p.y, p.z) };
      ficheObj.push(o); zetUiterlijk(o);
    });
  }

  /* Optioneel (opdrachten.js: panelenInZaal): bij elke fiche een tentoonstellingspaneel met een foto. */
  function plaatsPanelen() {
    const lader = new THREE.TextureLoader();
    FICHES.forEach(f => {
      const b = f.beelden && f.beelden[0]; if (!b) return;
      const p = plek(f);
      let beste = null, ruimte = 0.65;
      [[1.5, 0], [-1.5, 0], [0, 1.5], [0, -1.5], [1.2, 1.2], [-1.2, 1.2], [1.2, -1.2], [-1.2, -1.2]].forEach(([dx, dz]) => {
        const r = G.vrijeRuimte(p.x + dx, p.z + dz);
        if (r > ruimte) { ruimte = r; beste = { x: p.x + dx, z: p.z + dz }; }
      });
      if (!beste) return;
      lader.load(bron(b.src), tex => {
        const asp = tex.image.width / tex.image.height;
        const h = 0.85, w = Math.min(1.25, h * asp), hh = w / asp;
        const g = new THREE.Group();
        const kader = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, hh + 0.1, 0.05), new THREE.MeshLambertMaterial({ color: 0x2e3033 }));
        const foto = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), new THREE.MeshBasicMaterial({ map: tex }));
        foto.position.z = 0.03;
        const poot = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.06), new THREE.MeshLambertMaterial({ color: 0x2e3033 }));
        poot.position.y = -hh / 2 - 0.35;
        g.add(kader, foto, poot);
        g.position.set(beste.x, p.y + 0.7 + hh / 2 + 0.35, beste.z);
        g.rotation.y = Math.atan2(p.x - beste.x, p.z - beste.z);
        G.scene.add(g);
      });
    });
  }

  function zetUiterlijk(o) {
    o.groep.visible = !gevonden.has(o.data.id) && Laag50.modus === 'spel';
  }

  const hint = () => {
    const volgende = FICHES.find(f => !gevonden.has(f.id));
    boeke.zeg(volgende ? 'Volg de pijl bovenaan. Dichtbij verschijnt een knop.' : 'Alles terug. Goed gedaan.', 'neutraal', { pose: 'wijzen' }, 6000);
  };

  /* ---------- de dichtstbijzijnde fiche: knop en pijl ---------- */
  function bijwerkenNabijheid() {
    if (Laag50.modus !== 'spel') { dichtbij = null; balieDichtbij = false; $('actie').hidden = true; return; }
    const speler = G.speler;
    let dichtste = null, afstand = 1e9;
    ficheObj.forEach(o => {
      if (gevonden.has(o.data.id)) return;
      const d = Math.hypot(o.pos.x - speler.x, o.pos.z - speler.z);
      if (d < afstand) { afstand = d; dichtste = o; }
    });
    const knopEl = $('actie');
    if (dichtste && afstand < 2.1 && !G.pauze) {
      if (dichtbij !== dichtste) {
        dichtbij = dichtste;
        knopEl.textContent = `Fiche ${dichtste.data.id}: ${dichtste.data.titel}`;
        knopEl.style.background = CAT[dichtste.data.categorie].kleur;
        knopEl.hidden = false;
        boeke.zeg('Kijk, daar ligt er één.', 'blij', { pose: 'wijzen' }, 3500);
      }
    } else if (dichtbij) { dichtbij = null; knopEl.hidden = true; }

    const pijl = $('pijl').firstElementChild;
    if (dichtste) {
      const dx = dichtste.pos.x - speler.x, dz = dichtste.pos.z - speler.z;
      let rel = Math.atan2(-dx, -dz) - speler.yaw;
      rel = Math.atan2(Math.sin(rel), Math.cos(rel));
      pijl.style.transform = `rotate(${-rel * 180 / Math.PI}deg)`;
      pijl.firstElementChild.setAttribute('fill', CAT[dichtste.data.categorie].kleur);
      $('pijl').style.visibility = 'visible';
    } else $('pijl').style.visibility = 'hidden';
  }

  function bijwerkenBalie() {
    if (Laag50.modus !== 'spel' || G.pauze) { if (balieDichtbij) { balieDichtbij = false; $('brochure-knop').hidden = true; } return; }
    const bp = D.baliePlek || [-8, -29];
    const bd = Math.hypot(bp[0] - G.speler.x, bp[1] - G.speler.z);
    if (bd < 2.5) {
      if (!balieDichtbij) {
        balieDichtbij = true;
        $('brochure-knop').hidden = false;
        boeke.zeg('Aan de balie ligt een brochure. Kijk maar eens!', 'blij', {}, 4000);
      }
    } else if (balieDichtbij) { balieDichtbij = false; $('brochure-knop').hidden = true; }
  }

  function telOp() { $('aantal').textContent = gevonden.size; $('totaal').textContent = FICHES.length; }

  /* ---------- fiche: kijk, raad, leer ---------- */
  const norm = s => String(s).toLowerCase().replace(/frank|euro|€|fr\.?|foto|nr\.?/g, '').replace(/[^a-z0-9]/g, '');
  const schud = a => { const b = a.map((v, i) => i); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const CAT = D.categorieen;
  let open = null;   // { f, stap, volgorde, gekozen, fouten }

  function openFiche(f, begin) {
    G.pauze = true; $('actie').hidden = true; dichtbij = null; boeke.stil();
    open = { f, stap: begin || 'kijk', volgorde: null, gekozen: [], fouten: 0 };
    $('schermOverzicht').hidden = true;
    $('schermFiche').hidden = false;
    teken();
  }
  function sluitFiche() {
    if (open && open.sleepGeest) { open.sleepGeest.remove(); open.sleepGeest = null; }
    $('schermFiche').hidden = true; open = null; G.pauze = false; boeke.toon('neutraal');
    if (gevonden.size === FICHES.length && !eindeGetoond) toonEinde();
  }

  function kop(f) {
    const c = CAT[f.categorie];
    return `<div class="kopregel"><span class="cat" style="background:${c.kleur}">${c.naam}</span> Fiche ${f.id} van ${FICHES.length}</div><h2>${esc(f.titel)}</h2>`;
  }
  function beeldenHtml(f) {
    if (!f.beelden || !f.beelden.length) return '';
    return `<div class="beelden">` + f.beelden.map(b =>
      `<figure><img src="${bron(b.src)}" alt="${esc(b.onderschrift)}" onerror="this.style.display='none'"><figcaption>${esc(b.onderschrift)}</figcaption></figure>`).join('') + `</div>`;
  }
  const boekRegel = (zin, uitdr, opt) =>
    `<div class="boekregel"><div class="bk">${BoekE.svg(uitdr, opt)}</div><div class="zeg" id="bZeg">${esc(tekst(zin))}</div></div>`;

  function teken() {
    const { f, stap } = open, klaar = gevonden.has(f.id);
    if (open.sleepGeest) { open.sleepGeest.remove(); open.sleepGeest = null; }
    const knoppen = [['kijk', '1 Kijk'], ['raad', '2 Raad'], ['leer', 'Wist-je-datjes']].map(([s, t]) =>
      `<button class="stap ${stap === s ? 'actief' : ''}" data-s="${s}">${t}</button>`).join('');
    $('kaartFiche').innerHTML =
      `<div class="balk"><div class="stappen">${knoppen}</div><button class="sluit" id="fSluit" aria-label="Sluiten">×</button></div>
       <div class="inhoud" id="fInhoud"></div><div class="voet" id="fVoet"></div>`;
    document.querySelectorAll('#kaartFiche .stap').forEach(b => { b.onclick = () => { if (!b.disabled) { open.stap = b.dataset.s; teken(); } }; });
    $('fSluit').onclick = sluitFiche;
    if (stap === 'kijk') tekenKijk(); else if (stap === 'raad') tekenRaad(); else tekenLeer();
    $('fInhoud').scrollTop = 0;
  }
  const naar = s => { open.stap = s; teken(); };
  const voet = html => { $('fVoet').innerHTML = html; };

  function tekenKijk() {
    const f = open.f, klaar = gevonden.has(f.id);
    $('fInhoud').innerHTML = kop(f) + beeldenHtml(f) +
      `<ul class="punten">${f.kijkPunten.map(p => `<li>${esc(tekst(p))}</li>`).join('')}</ul>` +
      (f.kijk ? `<div class="kijkbox">In de bib: ${esc(f.kijk)}</div>` : '');
    voet(`<button class="groot" id="v1">${klaar ? 'Naar wat je leerde' : 'Ik heb gekeken. Naar de vraag'}</button>`);
    $('v1').onclick = () => naar(klaar ? 'leer' : 'raad');
  }

  function tekenLeer() {
    const f = open.f, klaar = gevonden.has(f.id);
    const tijdlijn = (klaar && f.jaren) ? `<ol class="tijdlijn">${f.items.map((t, i) => `<li><b>${esc(f.jaren[i])}</b><span>${esc(t)}</span></li>`).join('')}</ol>` : '';
    $('fInhoud').innerHTML = kop(f) +
      (klaar ? `<div class="goedbanner">${esc(tekst(f.boekeGoed))}</div>` + boekRegel('Dit mag je onthouden.', 'blij', { pose: 'lezen', knik: true }) + tijdlijn : '') +
      `<ul class="punten leer">${f.leer.map(p => `<li>${esc(tekst(p))}</li>`).join('')}</ul>`;
    voet(klaar
      ? `<button class="licht" id="vTerug">Nog even kijken</button><button class="groot" id="vKlaar">Fiche terug in de kast</button>`
      : `<button class="licht" id="vTerug">Nog even kijken</button><button class="groot" id="vNaarRaad">Naar de vraag</button>`);
    $('vTerug').onclick = () => naar('kijk');
    if (klaar) {
      $('vKlaar').onclick = () => {
        const rest = FICHES.length - gevonden.size;
        sluitFiche();
        if (rest > 0) boeke.zeg(`Goed. Nog ${rest} te gaan.`, 'blij', { pose: 'zwaaien' }, 6000);
      };
    } else {
      $('vNaarRaad').onclick = () => naar('raad');
    }
  }

  function tekenRaad() {
    const f = open.f, klaar = gevonden.has(f.id);
    $('fInhoud').innerHTML = kop(f) +
      boekRegel(klaar ? 'Dit had je al opgelost.' : 'Denk na en kies. Fout is niet erg.', 'neutraal', { pose: 'lezen' }) +
      `<div class="vraag">${esc(f.vraag)}</div><div id="antwoord"></div><div id="melding"></div>`;
    voet(`<button class="licht" id="vKijk">Nog even kijken</button><button class="licht" id="vTip">Tip</button>`);
    $('vKijk').onclick = () => naar('kijk');
    $('vTip').onclick = () => melding('tip', 'Tip: ' + f.tip);
    if (klaar) { toonOpgelost(false); return; }
    bouwVraag();
  }

  function melding(klasse, z) { const m = $('melding'); m.innerHTML = `<div class="melding ${klasse}">${esc(z)}</div>`; if (m.scrollIntoView) m.scrollIntoView({ block: 'nearest' }); }
  function boekeZegt(zin, uitdr, opt) {
    const z = $('bZeg'); if (z) z.textContent = tekst(zin);
    const b = document.querySelector('#fInhoud .boekregel .bk'); if (b) b.innerHTML = BoekE.svg(uitdr, opt);
  }
  function fout(z) {
    const f = open.f; open.fouten++;
    boekeZegt(f.boekeFout, 'nadenken', { pose: 'lezen' });
    melding('fout', z || 'Dat klopt niet helemaal. Probeer opnieuw.');
  }
  function goed() {
    const f = open.f;
    gevonden.add(f.id); opslag.schrijf([...gevonden]); telOp();
    const o = ficheObj.find(x => x.data.id === f.id); if (o) zetUiterlijk(o);
    toonOpgelost(true);
  }
  function toonOpgelost(nuPas) {
    const f = open.f;
    if (nuPas) {
      boekeZegt(f.boekeGoed, 'blij', { pose: 'lezen', knik: true });
      $('melding').innerHTML = `<div class="goedbanner">Juist!</div>`;
      document.querySelectorAll('#antwoord button').forEach(b => { b.disabled = true; });
    } else {
      $('melding').innerHTML = `<div class="goedbanner">Opgelost.</div>`;
    }
    voet(`<button class="licht" id="vKijk">Nog even kijken</button><button class="groot" id="vLeer">Lees waarom</button>`);
    $('vKijk').onclick = () => naar('kijk');
    $('vLeer').onclick = () => naar('leer');
    const m = $('melding'); if (m.scrollIntoView) m.scrollIntoView({ block: 'nearest' });
  }

  function bouwVraag() {
    const f = open.f, antw = $('antwoord');

    if (f.soort === 'keuze') {
      f.opties.forEach((t, i) => {
        const b = document.createElement('button'); b.className = 'knop'; b.textContent = t;
        b.onclick = () => {
          if (i === f.goed) { b.classList.add('goed'); goed(); }
          else { b.classList.add('fout'); fout('Niet dit antwoord. Kies opnieuw.'); }
        };
        antw.appendChild(b);
      });
    }

    if (f.soort === 'meerdere') {
      const gekozen = new Set();
      f.opties.forEach((t, i) => {
        const b = document.createElement('button'); b.className = 'knop'; b.textContent = t;
        b.onclick = () => { gekozen.has(i) ? gekozen.delete(i) : gekozen.add(i); b.classList.toggle('gekozen'); };
        antw.appendChild(b);
      });
      const c = document.createElement('button'); c.className = 'groot'; c.style.width = '100%'; c.textContent = 'Controleer';
      c.onclick = () => {
        const ok = new Set(f.goedLijst);
        const alleGoed = [...gekozen].every(i => ok.has(i));
        if (gekozen.size >= f.minimaal && alleGoed) goed();
        else if (gekozen.size < f.minimaal) fout(`Kies er minstens ${f.minimaal}.`);
        else fout('Eén van je keuzes klopt niet.');
      };
      antw.appendChild(c);
    }

    if (f.soort === 'volgorde') {
      if (!open.volgorde) {
        open.volgorde = schud(f.items);
        if (open.volgorde.every((v, i) => v === i)) open.volgorde.reverse();
      }
      const tip = document.createElement('p'); tip.className = 'sleep-tip';
      tip.textContent = 'Versleep de kaartjes van oud naar nieuw.'; antw.appendChild(tip);
      const lijst = document.createElement('ul'); lijst.className = 'sleep-lijst'; antw.appendChild(lijst);
      let sleepIdx = null;
      const tekenLijst = () => {
        lijst.innerHTML = '';
        open.volgorde.forEach((idx, pos) => {
          const li = document.createElement('li'); li.className = 'sleep-item'; li.dataset.pos = String(pos);
          const jaar = f.jaren ? `<b>${esc(f.jaren[idx])}</b> ` : '';
          li.innerHTML = `<span class="grip">&#x2807;</span>${jaar}${esc(f.items[idx])}`;
          lijst.appendChild(li);
        });
      };
      tekenLijst();
      if (!gevonden.has(f.id)) {
        lijst.addEventListener('pointerdown', e => {
          const item = e.target.closest('.sleep-item'); if (!item) return;
          e.preventDefault(); lijst.setPointerCapture(e.pointerId);
          sleepIdx = parseInt(item.dataset.pos); item.classList.add('sleept');
          const geest = document.createElement('div'); geest.className = 'sleep-geest';
          geest.textContent = item.textContent.trim();
          geest.style.left = (e.clientX - 10) + 'px'; geest.style.top = (e.clientY - 22) + 'px';
          document.body.appendChild(geest); open.sleepGeest = geest;
        });
        lijst.addEventListener('pointermove', e => {
          if (sleepIdx === null) return; e.preventDefault();
          if (open.sleepGeest) { open.sleepGeest.style.left = (e.clientX - 10) + 'px'; open.sleepGeest.style.top = (e.clientY - 22) + 'px'; }
          lijst.querySelectorAll('.sleep-item').forEach(el => el.classList.remove('over'));
          const el = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.sleep-item');
          if (el && parseInt(el.dataset.pos) !== sleepIdx) el.classList.add('over');
        });
        const loslaten = e => {
          if (sleepIdx === null) return;
          if (open.sleepGeest) { open.sleepGeest.remove(); open.sleepGeest = null; }
          const el = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.sleep-item');
          if (el) {
            const doel = parseInt(el.dataset.pos);
            if (doel !== sleepIdx) { const arr = [...open.volgorde]; const [verplaatst] = arr.splice(sleepIdx, 1); arr.splice(doel, 0, verplaatst); open.volgorde = arr; }
          }
          sleepIdx = null; tekenLijst();
        };
        lijst.addEventListener('pointerup', loslaten);
        lijst.addEventListener('pointercancel', () => {
          if (open.sleepGeest) { open.sleepGeest.remove(); open.sleepGeest = null; }
          sleepIdx = null; tekenLijst();
        });
        const c = document.createElement('button'); c.className = 'groot'; c.style.cssText = 'width:100%;margin-top:12px';
        c.textContent = 'Controleer volgorde';
        c.onclick = () => { if (open.volgorde.every((v, i) => v === i)) goed(); else fout('Niet in de juiste volgorde. Versleep de kaartjes opnieuw.'); };
        antw.appendChild(c);
      }
    }

    if (f.soort === 'invul') {
      f.velden.forEach((v, i) => {
        const l = document.createElement('label'); l.className = 'veld'; l.textContent = v.label;
        const inp = document.createElement('input'); inp.type = 'text'; inp.autocomplete = 'off'; inp.id = 'veld' + i;
        l.appendChild(inp); antw.appendChild(l);
      });
      const c = document.createElement('button'); c.className = 'groot'; c.style.cssText = 'width:100%;margin-top:12px'; c.textContent = 'Controleer';
      c.onclick = () => {
        const waarden = f.velden.map((v, i) => norm($('veld' + i).value));
        const okAlle = f.velden.every((v, i) => v.ok.map(norm).includes(waarden[i]));
        const uniek = f.velden.some(v => v.uniek) ? new Set(waarden).size === waarden.length : true;
        if (okAlle && uniek) goed(); else fout();
      };
      antw.appendChild(c);
    }
  }

  /* ---------- overzicht van alle fiches ---------- */
  function toonOverzicht() {
    G.pauze = true; $('actie').hidden = true; dichtbij = null;
    const n = gevonden.size, tot = FICHES.length;
    const tegels = FICHES.map(f => {
      const klaar = gevonden.has(f.id), c = CAT[f.categorie];
      return `<button class="tegel ${klaar ? 'klaar' : ''}" data-id="${f.id}"><span class="n">${f.id}</span>
        <span class="cat" style="background:${c.kleur}">${c.naam}</span>
        <div class="t">${esc(f.titel)}</div><div class="s">${klaar ? 'Gevonden. Tik om het nog eens te lezen.' : 'Nog te vinden in de bib.'}</div></button>`;
    }).join('');
    $('kaartOverzicht').innerHTML =
      `<h2>Jouw fiches</h2>
       <div class="voortgang"><i style="width:${Math.round(n / tot * 100)}%"></i></div>
       <p class="klein">${n} van ${tot} terug in de kast. Vier gaan over het gebouw en vier over hoe de bib werkt.</p>
       <div class="raster">${tegels}</div>
       <button class="groot" id="ovSluit" style="width:100%">Verder wandelen</button>`;
    $('schermOverzicht').hidden = false;
    $('ovSluit').onclick = () => { $('schermOverzicht').hidden = true; G.pauze = false; };
    document.querySelectorAll('#kaartOverzicht .tegel').forEach(t => {
      t.onclick = () => {
        const f = FICHES.find(x => x.id === +t.dataset.id);
        if (gevonden.has(f.id)) openFiche(f, 'kijk');
        else { $('schermOverzicht').hidden = true; G.pauze = false; boeke.zeg(`Fiche ${f.id} ligt nog ergens in de bib. Volg de pijl bovenaan.`, 'neutraal', { pose: 'wijzen' }, 7000); }
      };
    });
  }

  /* ---------- begin en einde ---------- */
  function toonIntro() {
    const sch = $('schermIntro'), kaart = $('kaartIntro');
    kaart.className = 'kaart intro';
    kaart.innerHTML = `
      <div class="intro-hoofd">
        <div class="boeke-svg">${BoekE.svg('blij', { pose: 'zwaaien' })}</div>
        <h2>Hoi! Ik ben Boek-E.</h2>
      </div>
      <div class="intro-body">
        <p>${tekst(D.intro[0])}</p>
        <p>${tekst(D.intro[1])}</p>
        <p>${tekst(D.intro[2])}</p>
        <p class="klein">${tekst(D.intro[3])}</p>
        <button class="groot" id="volgende" style="width:100%;margin-top:12px">Start ›</button>
      </div>`;
    sch.hidden = false;
    $('volgende').onclick = () => { sch.hidden = true; startAutolopen(); };
  }

  function startAutolopen() {
    const beginX = G.speler.x, beginZ = G.speler.z;
    const doelX = -9, doelZ = -29.5;
    const duur = 4500;
    const yaw = Math.atan2(-(doelX - beginX), -(doelZ - beginZ));
    const startMs = performance.now();
    boeke.zeg('Volg me naar binnen!', 'blij', { pose: 'wijzen' }, duur);
    let walkKlaar = false;
    G.opFrame(() => {
      if (walkKlaar) return;
      const ms = performance.now() - startMs;
      const p = Math.min(1, ms / duur);
      const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      G.speler.x = beginX + (doelX - beginX) * ease;
      G.speler.z = beginZ + (doelZ - beginZ) * ease;
      G.speler.yaw = yaw;
      if (p >= 1) { walkKlaar = true; toonUitleg(); }
    });
  }

  function toonUitleg() {
    const sch = $('schermIntro'), kaart = $('kaartIntro');
    const stappen = [
      { zin: 'Loop met de pijltjes of de joystick op het scherm. Tik ergens op de vloer om daarheen te lopen.', uitdr: 'neutraal', pose: 'wijzen' },
      { zin: 'Kijk rond door op het scherm te slepen.', uitdr: 'neutraal', pose: 'lezen' },
    ];
    let i = 0;
    const dots = n => stappen.map((_, j) => `<span${j === n ? ' class="actief"' : ''}></span>`).join('');
    const toon = () => {
      const s = stappen[i];
      kaart.className = 'kaart intro';
      kaart.innerHTML = `
        <div class="intro-hoofd">
          <div class="boeke-svg">${BoekE.svg(s.uitdr, { pose: s.pose })}</div>
        </div>
        <div class="intro-body">
          <div class="intro-dots">${dots(i)}</div>
          <p>${esc(s.zin)}</p>
          <button class="groot" id="uitlegVolgende" style="width:100%;margin-top:6px">${i === stappen.length - 1 ? 'Spelen! ›' : 'Verder ›'}</button>
        </div>`;
      $('uitlegVolgende').onclick = () => {
        if (i < stappen.length - 1) { i++; toon(); }
        else { sch.hidden = true; boeke.stil(); G.pauze = false; }
      };
    };
    sch.hidden = false; toon();
  }

  function toonEinde() {
    G.pauze = true;
    eindeGetoond = true;
    const sch = $('schermEinde'), kaart = $('kaartEinde');
    let bewaard = ''; try { bewaard = localStorage.getItem('bib50-2076') || ''; } catch (e) {}
    kaart.innerHTML = `
      <div style="width:min(200px,55%);margin:0 auto">${BoekE.svg('blij', { pose: 'zwaaien' })}</div>
      <h2 style="text-align:center">Zes van zes</h2>
      <p style="text-align:center">${tekst(D.einde.zin)}</p>
      <p style="text-align:center;font-weight:700;font-size:1.15rem">${D.einde.vraag}</p>
      <textarea id="antwoord2076" rows="3" placeholder="Schrijf het samen met je kind…">${bewaard.replace(/</g, '&lt;')}</textarea>
      <p class="klein">${D.einde.voet}</p>
      <div class="rij"><button class="knop licht" id="opnieuw" style="text-align:center">Opnieuw spelen</button>
      <button class="knop groot" id="rond" style="margin:8px 0">Verder rondkijken</button></div>`;
    sch.hidden = false;
    $('antwoord2076').addEventListener('input', e => { try { localStorage.setItem('bib50-2076', e.target.value); } catch (er) {} });
    $('rond').onclick = () => { sch.hidden = true; G.pauze = false; };
    $('opnieuw').onclick = () => { opslag.wis(); try { localStorage.removeItem('bib50-2076'); } catch (e) {} location.reload(); };
  }

  /* ---------- brochure (PDF.js) ---------- */
  let pdfDoc = null, paginaNr = 1, pdfLaadt = false;

  function laadPdfScript(cb) {
    if (window.pdfjsLib) { cb(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
    s.onload = cb;
    document.head.appendChild(s);
  }

  async function toonPaginaOp(nr) {
    const wrap = $('brochureWrap'), canvas = $('brochureCanvas');
    const page = await pdfDoc.getPage(nr);
    const schaal = Math.min((wrap.clientWidth - 4) / page.getViewport({ scale: 1 }).width, (wrap.clientHeight - 4) / page.getViewport({ scale: 1 }).height);
    const vp = page.getViewport({ scale: schaal });
    canvas.width = vp.width; canvas.height = vp.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
    $('brochurePagina').textContent = `${nr} / ${pdfDoc.numPages}`;
    $('brochurePrev').disabled = nr <= 1;
    $('brochureNext').disabled = nr >= pdfDoc.numPages;
  }

  async function toonBrochure() {
    G.pauze = true;
    $('schermBrochure').hidden = false;
    if (pdfLaadt) return;
    pdfLaadt = true;
    laadPdfScript(async () => {
      try {
        const lib = window.pdfjsLib;
        lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        pdfDoc = await lib.getDocument(bron('brochure/brochure.pdf')).promise;
        await toonPaginaOp(paginaNr);
      } catch (e) { $('brochurePagina').textContent = 'Fout bij laden'; }
    });
  }

  $('sluitBrochure').onclick = () => { $('schermBrochure').hidden = true; G.pauze = false; };
  $('brochurePrev').onclick = async () => { if (paginaNr > 1) { paginaNr--; await toonPaginaOp(paginaNr); } };
  $('brochureNext').onclick = async () => { if (pdfDoc && paginaNr < pdfDoc.numPages) { paginaNr++; await toonPaginaOp(paginaNr); } };

  /* Swipe links/rechts op de canvas (touch) */
  (() => {
    let sx = 0;
    const wrap = $('brochureWrap');
    wrap.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    wrap.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) { if (dx < 0) $('brochureNext').click(); else $('brochurePrev').click(); }
    }, { passive: true });
  })();

  /* 3D brochure op de toonbank */
  let brochureMesh = null;
  function plaatsBrochure() {
    /* Visuele plek van het 3D-boekje (toonbankrand); de triggerplek (baliePlek) staat in opdrachten.js.
       Met &bewerk kan de speler het boekje verslepen; de opgeslagen plek wint dan. */
    let mx = -10, mz = -27;
    try { const op = JSON.parse(localStorage.getItem('bib50-plekken') || '{}'); if (op.brochure) { mx = op.brochure.x; mz = op.brochure.z; D.baliePlek = [mx, mz]; } } catch (e) {}
    const cv = document.createElement('canvas'); cv.width = 240; cv.height = 340;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#0b5d68'; ctx.fillRect(0, 0, 240, 340);
    ctx.fillStyle = '#d9601f';
    ctx.beginPath(); ctx.moveTo(170, 0); ctx.lineTo(240, 0); ctx.lineTo(240, 100); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 110px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('50', 120, 130);
    ctx.font = 'bold 28px system-ui'; ctx.fillText('JAAR', 120, 198);
    ctx.fillStyle = '#5a2d8e'; ctx.fillRect(20, 220, 200, 44);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 17px system-ui'; ctx.fillText('Bibliotheek Eeklo', 120, 247);
    ctx.font = '13px system-ui'; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillText('1976 – 2026', 120, 305);
    const mat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), side: THREE.DoubleSide });
    brochureMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.40), mat);
    brochureMesh.position.set(mx, 1.18, mz);
    brochureMesh.rotation.y = -Math.PI / 4; /* Schuin richting looppad */
    G.scene.add(brochureMesh);
    Laag50.brochureMesh = brochureMesh;
  }

  /* ---------- begin ---------- */
  $('actie').addEventListener('click', () => { if (dichtbij) openFiche(dichtbij.data); });
  $('brochure-knop').addEventListener('click', toonBrochure);
  $('teller').addEventListener('click', () => { if (G.pauze) return; toonOverzicht(); });
  $('bel').addEventListener('click', () => boeke.stil());
  $('poppetje').addEventListener('click', () => {
    const volgende = FICHES.find(f => !gevonden.has(f.id));
    boeke.zeg(volgende ? 'Volg de pijl bovenaan. Dichtbij verschijnt een knop.' : 'Alles terug. Goed gedaan.', 'neutraal', { pose: 'wijzen' }, 4500);
  });

  function beginSpel() {
    telOp(); boeke.toon('neutraal');
    if (gevonden.size >= FICHES.length) { G.pauze = false; toonEinde(); }
    else if (gevonden.size > 0) { $('schermIntro').hidden = true; G.pauze = false; boeke.zeg(`Welkom terug. Nog ${FICHES.length - gevonden.size} fiches.`, 'blij', { pose: 'zwaaien' }, 4500); }
    else toonIntro();
  }

  /* De laag meldt zich aan bij het gebouw */
  G.teksten = { derde: 'Door zijn ogen kijken', eerste: 'Boek-E zien' };
  G.opWeergave(w => $('boeke').classList.toggle('met', w === 'derde'));   // Boek-E loopt zelf in de zaal: dan alleen zijn tekstballon
  G.opTikSpeler(hint);
  G.opFrame((dt, t) => {
    ficheObj.forEach(o => { if (o.groep.visible) { o.kaart.rotation.y = t * 1.4; o.kaart.position.y = 1.15 + Math.sin(t * 2 + o.data.id) * 0.06; } });
    if (brochureMesh) { brochureMesh.position.y = 1.18 + Math.sin(t * 1.2) * 0.03; }
    bijwerkenNabijheid();
    bijwerkenBalie();
  });
  G.zetAvatar(maakKaders());

  /* Test (adres met ?test): bibTest.ga(3) springt naar fiche 3; bibTest.bereik meldt welke fiches te bereiken zijn. */
  if (window.bibTest) {
    const bereikBasis = window.bibTest.bereik;
    window.bibTest.bereik = (x0, z0, stap) => { const r = bereikBasis(x0, z0, stap, D.fichePlekken || {}); r.fiches = r.punten; return r; };
    window.bibTest.ga = id => { const o = ficheObj.find(x => x.data.id === id); if (o) { G.speler.x = o.pos.x; G.speler.z = o.pos.z + 1.2; G.speler.yaw = 0; } };
  }

  telOp(); boeke.toon('neutraal');
  Laag50.klaar = G.start().then(() => {
    plaatsFiches();
    if (G.echt && D.panelenInZaal) plaatsPanelen();
    plaatsBrochure();
    beginSpel();
  });
})();
