/* LAAG: TENTOONSTELLING (de negen panelen van 50 jaar bib)
   ------------------------------------------------------------------
   De panelen staan in de zaal. Je bekijkt ze door:
     - er in het spel op te klikken of te tikken,
     - dichtbij te lopen en op "Bekijk paneel" te drukken,
     - op de knop "Tentoonstelling" te drukken (overzicht, met "Ga erheen").
   In de kijker: slepen, scrollen of knijpen om te zoomen; tik op een foto of tekstblok om erop in te zoomen.

   Waar staan de panelen? Een punt in het model met de naam  plek-paneel-1 ... plek-paneel-9  wint.
   Staat zo'n punt er niet, dan staan ze voorlopig in een boog rond het beginpunt (zie `voorlopig`).
   Titels en deelgebieden: panelen.js. Beelden: img/ (gemaakt uit de pdf). */
(() => {
  'use strict';
  const G = window.Gebouw, THREE = G.THREE;
  const P = window.TENTOONSTELLING || [];
  document.title = 'Bibliotheek Eeklo · tentoonstelling';

  /* Pad naar eigen bestanden, vanaf het script zelf (de pagina staat niet in deze map). */
  const eigen = document.currentScript && document.currentScript.src;
  const bron = f => eigen ? new URL(f, eigen).href : f;

  const BREEDTE = 0.94, HOOGTE = 2.0;        // echte maat van een paneel in meters
  const NABIJ = 3.2;                          // binnen zoveel meter komt de knop "Bekijk paneel"
  const ASPECT = BREEDTE / HOOGTE;

  /* ---------- scherm ---------- */
  const laag = document.getElementById('laag');
  laag.innerHTML = `
    <button class="tt-actie" id="ttActie" hidden></button>
    <div class="tt-lijst" id="ttLijst" hidden><div class="tt-doos">
      <h2>De tentoonstelling</h2>
      <p>50 jaar Bibliotheek Eeklo, op negen panelen. Bekijk een paneel, of loop er naartoe.</p>
      <div class="tt-raster" id="ttRaster"></div>
      <p style="margin-top:14px"><button id="ttLijstSluit">Sluiten</button></p>
    </div></div>
    <div class="tt-viewer" id="ttViewer" hidden>
      <div class="tt-vlak" id="ttVlak"><img id="ttImg" alt=""></div>
      <div class="tt-bar"><button id="ttSluit">✕ Sluiten</button><b id="ttTitel"></b><button id="ttDelen">Aanklikbare delen</button></div>
      <div class="tt-onder">
        <button id="ttVorig" title="Vorig paneel">◀</button>
        <button id="ttMin" title="Uitzoomen">−</button>
        <button id="ttHeel">Heel paneel</button>
        <button id="ttPlus" title="Inzoomen">+</button>
        <button id="ttVolg" title="Volgend paneel">▶</button>
      </div>
    </div>`;
  const $ = id => document.getElementById(id);

  /* ---------- de panelen in de zaal ---------- */
  const start = () => { const p = G.punten.start; return p ? [p.x, p.z] : [(G.config && G.config.start || [0, 0])[0], (G.config && G.config.start || [0, 0])[1]]; };

  /* voorlopige plek: een boog rond het beginpunt, elk paneel kijkt naar het midden */
  function voorlopig(i) {
    const [sx, sz] = start(), n = P.length, hoek = (-0.5 + (i + 0.5) / n) * Math.PI * 1.1 + Math.PI;   // boog achter het beginpunt
    return { x: sx + Math.sin(hoek) * 3.6, z: sz + Math.cos(hoek) * 3.6, y: 0 };
  }
  const objecten = [];   // { data, mesh, pos, r }

  function plaats() {
    const [sx, sz] = start(), lader = new THREE.TextureLoader();
    P.forEach((d, i) => {
      const pos = G.punten['plek-paneel-' + d.nr] || voorlopig(i);
      const r = Math.atan2(sx - pos.x, sz - pos.z);          // kijkt naar het beginpunt; r = draaiing om de y-as
      const tex = lader.load(bron(d.klein)); tex.anisotropy = 4;
      if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
      const voor = new THREE.MeshBasicMaterial({ map: tex });
      const rand = new THREE.MeshLambertMaterial({ color: 0x1f3a44 });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(BREEDTE, HOOGTE, 0.05), [rand, rand, rand, rand, voor, rand]);
      mesh.position.set(pos.x, (pos.y || 0) + HOOGTE / 2 + 0.05, pos.z);
      mesh.rotation.y = r;
      mesh.userData.paneel = i;
      G.scene.add(mesh);
      objecten.push({ data: d, mesh, pos, r });
    });
  }

  /* ---------- klikken in het spel ---------- */
  function kiesOpScherm(e) {
    const c = G.canvas.getBoundingClientRect(), rc = new THREE.Raycaster();
    rc.setFromCamera(new THREE.Vector2(((e.clientX - c.left) / c.width) * 2 - 1, -((e.clientY - c.top) / c.height) * 2 + 1), G.camera);
    const hit = rc.intersectObjects(objecten.map(o => o.mesh), false)[0];
    return hit ? hit.object.userData.paneel : -1;
  }
  let down = null;
  G.canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  G.canvas.addEventListener('pointerup', e => {
    if (!down || G.pauze) return;
    const korte = Math.hypot(e.clientX - down.x, e.clientY - down.y) < 8 && performance.now() - down.t < 500; down = null;
    if (!korte) return;
    const i = kiesOpScherm(e); if (i >= 0) openPaneel(i);
  });
  G.canvas.addEventListener('pointermove', e => {
    if (G.pauze || e.pointerType === 'touch') return;
    G.canvas.style.cursor = kiesOpScherm(e) >= 0 ? 'zoom-in' : '';
  });

  /* ---------- dichtbij: knop "Bekijk paneel" ---------- */
  let dichtbij = -1;
  G.opFrame(() => {
    let best = -1, bd = NABIJ;
    if (!G.pauze) objecten.forEach((o, i) => { const d = Math.hypot(G.speler.x - o.pos.x, G.speler.z - o.pos.z); if (d < bd) { bd = d; best = i; } });
    if (best !== dichtbij) {
      dichtbij = best;
      const b = $('ttActie');
      if (best < 0) b.hidden = true; else { b.textContent = '🔍 Bekijk paneel ' + P[best].nr + ': ' + P[best].titel; b.hidden = false; }
    }
  });
  $('ttActie').onclick = () => { if (dichtbij >= 0) openPaneel(dichtbij); };

  /* ---------- overzicht ---------- */
  function gaErheen(i) {
    const o = objecten[i], a = 2.4;
    G.zet(o.pos.x + Math.sin(o.r) * a, o.pos.z + Math.cos(o.r) * a, o.r);
    $('ttLijst').hidden = true; G.pauze = false;
  }
  function bouwLijst() {
    $('ttRaster').innerHTML = '';
    P.forEach((d, i) => {
      const k = document.createElement('div'); k.className = 'tt-kaart';
      k.innerHTML = `<img src="${bron(d.klein)}" alt=""><b>${d.nr}. ${d.titel}</b>`;
      const a = document.createElement('button'); a.textContent = 'Bekijk'; a.onclick = () => { $('ttLijst').hidden = true; openPaneel(i); };
      const b = document.createElement('button'); b.textContent = 'Ga erheen'; b.onclick = () => gaErheen(i);
      k.append(a, b); $('ttRaster').appendChild(k);
    });
  }
  function openLijst() { G.pauze = true; $('ttLijst').hidden = false; }
  $('ttLijstSluit').onclick = () => { $('ttLijst').hidden = true; G.pauze = false; };

  /* ---------- de kijker: slepen, zoomen, op delen klikken ---------- */
  const PB = 1000, PH = PB / ASPECT;           // logische maat van het paneel in de kijker
  const V = { i: -1, s: 1, tx: 0, ty: 0, s0: 1 }, vlak = $('ttVlak'), vw = $('ttViewer');
  vlak.style.width = PB + 'px'; vlak.style.height = PH + 'px';

  const maat = () => ({ w: vw.clientWidth, h: vw.clientHeight });
  function toepassen(anim) {
    vlak.style.transition = anim ? 'transform .35s ease' : 'none';
    vlak.style.transform = `translate(${V.tx}px,${V.ty}px) scale(${V.s})`;
  }
  function begrens() {                          // het paneel blijft in beeld
    const { w, h } = maat(), pw = PB * V.s, ph = PH * V.s;
    V.tx = pw <= w ? (w - pw) / 2 : Math.min(40, Math.max(w - pw - 40, V.tx));
    V.ty = ph <= h ? (h - ph) / 2 : Math.min(60, Math.max(h - ph - 60, V.ty));
  }
  function heel(anim) { const { w, h } = maat(); V.s0 = V.s = Math.min(w / PB, (h - 70) / PH); V.tx = (w - PB * V.s) / 2; V.ty = (h - PH * V.s) / 2 + 20; toepassen(anim); }
  function zoomOp(fx, fy, factor, anim, midden) {       // zoom rond een punt op het scherm
    const nieuw = Math.min(V.s0 * 14, Math.max(V.s0 * 0.9, V.s * factor)), k = nieuw / V.s;
    const { w, h } = maat(), px = midden ? w / 2 : fx, py = midden ? h / 2 : fy;
    V.tx = px - (px - V.tx) * k; V.ty = py - (py - V.ty) * k; V.s = nieuw; begrens(); toepassen(anim);
  }
  function naarDeel(d) {                        // inzoomen op een deel (x, y, b, h in 0..1)
    const { w, h } = maat(), s = Math.min(w / (d.b * PB), (h - 90) / (d.h * PH)) * 0.92;
    V.s = Math.min(V.s0 * 14, s);
    V.tx = w / 2 - (d.x + d.b / 2) * PB * V.s; V.ty = h / 2 - (d.y + d.h / 2) * PH * V.s; begrens(); toepassen(true);
  }

  function openPaneel(i) {
    i = (i + P.length) % P.length; const d = P[i]; V.i = i;
    G.pauze = true; $('ttActie').hidden = true; dichtbij = -2;
    vw.hidden = false;
    $('ttTitel').textContent = d.nr + '. ' + d.titel + ' · ' + d.ondertitel;
    const img = $('ttImg'); img.src = bron(d.klein);
    const groot = new Image(); groot.onload = () => { if (V.i === i) img.src = groot.src; }; groot.src = bron(d.groot);
    vlak.querySelectorAll('.tt-deel').forEach(n => n.remove());
    (d.delen || []).forEach(p => {
      const n = document.createElement('div'); n.className = 'tt-deel'; n.style.pointerEvents = 'none';
      n.style.cssText += `left:${p.x * 100}%;top:${p.y * 100}%;width:${p.b * 100}%;height:${p.h * 100}%`; vlak.appendChild(n);
    });
    heel(false);
  }
  function sluit() { vw.hidden = true; V.i = -1; G.pauze = false; dichtbij = -1; }

  /* aanraken en slepen */
  const ptrs = new Map(); let pinch = null, tik = null;
  vw.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    vw.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    tik = ptrs.size === 1 ? { x: e.clientX, y: e.clientY, t: performance.now() } : null;
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) }; }
  });
  vw.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId)) return;
    const vorig = ptrs.get(e.pointerId), nx = e.clientX, ny = e.clientY;
    ptrs.set(e.pointerId, { x: nx, y: ny });
    if (ptrs.size === 2 && pinch) {
      const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
      zoomOp((a.x + b.x) / 2, (a.y + b.y) / 2, d / pinch.d, false); pinch.d = d;
    } else if (ptrs.size === 1) { V.tx += nx - vorig.x; V.ty += ny - vorig.y; begrens(); toepassen(false); }
  });
  const eind = e => {
    if (tik && ptrs.size === 1 && Math.hypot(e.clientX - tik.x, e.clientY - tik.y) < 8 && performance.now() - tik.t < 500) tikOp(e.clientX, e.clientY);
    ptrs.delete(e.pointerId); pinch = null; tik = null;
  };
  vw.addEventListener('pointerup', eind); vw.addEventListener('pointercancel', e => { ptrs.delete(e.pointerId); pinch = null; tik = null; });
  vw.addEventListener('wheel', e => { e.preventDefault(); zoomOp(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0015), false); }, { passive: false });

  function tikOp(cx, cy) {                      // klik op een deel van het paneel: inzoomen
    const px = (cx - V.tx) / (V.s * PB), py = (cy - V.ty) / (V.s * PH);
    const delen = (P[V.i].delen || []).filter(d => px >= d.x && px <= d.x + d.b && py >= d.y && py <= d.y + d.h);
    if (!delen.length) return;
    delen.sort((a, b) => a.b * a.h - b.b * b.h);
    naarDeel(delen[0]);
  }

  $('ttSluit').onclick = sluit;
  $('ttHeel').onclick = () => heel(true);
  $('ttPlus').onclick = () => zoomOp(0, 0, 1.6, true, true);
  $('ttMin').onclick = () => zoomOp(0, 0, 1 / 1.6, true, true);
  $('ttVorig').onclick = () => openPaneel(V.i - 1);
  $('ttVolg').onclick = () => openPaneel(V.i + 1);
  $('ttDelen').onclick = () => vw.classList.toggle('toon');
  window.addEventListener('resize', () => { if (!vw.hidden) heel(false); });
  window.addEventListener('keydown', e => {
    if (vw.hidden) { if (e.key === 'Escape' && !$('ttLijst').hidden) { $('ttLijst').hidden = true; G.pauze = false; } return; }
    if (e.key === 'Escape') sluit();
    else if (e.key === 'ArrowLeft') openPaneel(V.i - 1);
    else if (e.key === 'ArrowRight') openPaneel(V.i + 1);
    else if (e.key === '+' || e.key === '=') zoomOp(0, 0, 1.4, true, true);
    else if (e.key === '-') zoomOp(0, 0, 1 / 1.4, true, true);
    e.stopPropagation();
  }, true);

  /* ---------- start ---------- */
  G.knop('Tentoonstelling', openLijst, 'ttKnop');
  bouwLijst();
  G.pauze = false;
  G.start().then(() => {
    plaats();
    if (/[?&]test/.test(location.search) && window.bibTest) window.bibTest.paneel = i => openPaneel(i - 1);
  });
})();
