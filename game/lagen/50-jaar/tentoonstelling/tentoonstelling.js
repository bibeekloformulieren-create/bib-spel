/* TENTOONSTELLING BINNEN LAAG 50-JAAR
   ------------------------------------------------------------------
   De knop "Tentoonstelling bekijken" (rechtsboven, waar vroeger "Oude foto's" stond) verandert het spel in een tentoonstelling:
   de fiches springen weg en de negen panelen verschijnen in de zaal. Klik of tik op een paneel om het te bekijken
   (slepen, zoomen, op foto's of tekstblokken tikken). "Terug naar het spel" brengt de fiches terug.

   Verplaatsen: open het spel met &bewerk (dubbelklik op meubels-verplaatsen.bat), klik op de knop
   "Fiches en panelen verplaatsen", klik een fiche of paneel aan en sleep het. "Kopieer plekken" geeft de lijst voor Claude.
   Plekken van de panelen: eerst wat je zelf verplaatst hebt (&bewerk), dan `plek` in panelen.js, dan een punt
   plek-paneel-N in het model, en anders een voorlopige boog rond het beginpunt.
   Titels en deelgebieden: panelen.js. Beelden: tentoonstelling/img (gemaakt uit de pdf). */
(() => {
  'use strict';
  const G = window.Gebouw, THREE = G.THREE, L = window.Laag50;
  const P = window.TENTOONSTELLING || [];
  if (!L) return;

  const eigen = document.currentScript && document.currentScript.src;
  const bron = f => eigen ? new URL(f, eigen).href : f;
  const BEWERK = /[?&]bewerk/.test(location.search);
  const OPSLAG = 'bib50-plekken';
  const BREEDTE = 0.94, HOOGTE = 2.0, ASPECT = BREEDTE / HOOGTE, NABIJ = 3.2;
  const $ = id => document.getElementById(id);

  /* ---------- schermen ---------- */
  const div = document.createElement('div');
  div.innerHTML = `
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
        <button id="ttVorig" title="Vorig paneel">◀</button><button id="ttMin" title="Uitzoomen">−</button>
        <button id="ttHeel">Heel paneel</button>
        <button id="ttPlus" title="Inzoomen">+</button><button id="ttVolg" title="Volgend paneel">▶</button>
      </div>
    </div>`;
  document.getElementById('laag').append(...div.children);

  /* ---------- plekken ---------- */
  let lokaal = {};
  try { lokaal = JSON.parse(localStorage.getItem(OPSLAG) || '{}'); } catch (e) { lokaal = {}; }
  const bewaar = () => { try { localStorage.setItem(OPSLAG, JSON.stringify(lokaal)); } catch (e) {} };
  const start = () => { const p = G.punten.start; const s = p ? [p.x, p.z] : ((G.config && G.config.start) || [0, 0]); return s; };

  function plekPaneel(i, d) {
    if (lokaal['paneel-' + d.nr]) { const l = lokaal['paneel-' + d.nr]; return { x: l.x, z: l.z, y: 0, r: l.r }; }
    const [sx, sz] = start();
    if (d.plek) return { x: d.plek[0], z: d.plek[1], y: 0, r: (d.plek[2] || 0) * Math.PI / 180 };
    const pt = G.punten['plek-paneel-' + d.nr];
    if (pt) return { x: pt.x, z: pt.z, y: pt.y || 0, r: Math.atan2(sx - pt.x, sz - pt.z) };
    const a = automatisch()[i]; return { x: a.x, z: a.z, y: 0, r: Math.atan2(sx - a.x, sz - a.z) };
  }
  /* Voorlopige plekken: open plekken (min. 1,5 m vrij) rond het beginpunt, minstens 1,8 m uit elkaar, de dichtstbijzijnde eerst. */
  let auto = null;
  function automatisch() {
    if (auto) return auto;
    const [sx, sz] = start(), kand = [];
    for (let dx = -14; dx <= 14; dx += 0.6) for (let dz = -14; dz <= 14; dz += 0.6) {
      const x = sx + dx, z = sz + dz; if (Math.hypot(dx, dz) < 2.5) continue;
      if (G.vrijeRuimte(x, z) >= 1.5) kand.push({ x, z, d: Math.hypot(dx, dz) });
    }
    kand.sort((a, b) => a.d - b.d); auto = [];
    kand.forEach(k => { if (auto.length < P.length && auto.every(a => Math.hypot(a.x - k.x, a.z - k.z) >= 1.8)) auto.push(k); });
    for (let j = auto.length; j < P.length; j++) auto.push({ x: sx + 3 + j, z: sz + 3 });   // niet genoeg open plek: een rij
    return auto;
  }

  const objecten = [];   // panelen: { data, mesh, pos, r }
  function plaats() {
    const lader = new THREE.TextureLoader();
    P.forEach((d, i) => {
      const pl = plekPaneel(i, d);
      const tex = lader.load(bron(d.klein)); tex.anisotropy = 4;
      if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
      const voor = new THREE.MeshBasicMaterial({ map: tex });
      const rand = new THREE.MeshLambertMaterial({ color: 0x1f3a44 });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(BREEDTE, HOOGTE, 0.05), [rand, rand, rand, rand, voor, rand]);
      mesh.position.set(pl.x, pl.y + HOOGTE / 2 + 0.05, pl.z); mesh.rotation.y = pl.r; mesh.visible = false;
      G.scene.add(mesh);
      objecten.push({ data: d, mesh, pos: { x: pl.x, y: pl.y, z: pl.z }, r: pl.r, soort: 'paneel', sleutel: 'paneel-' + d.nr });
      mesh.userData.item = objecten[objecten.length - 1];
    });
    L.fiches.forEach(f => {                                   // opgeslagen plekken (via &bewerk) ook bij normaal spelen
      const l = lokaal['fiche-' + f.data.id]; if (l) zetFiche(f, l.x, l.z);
    });
  }
  function zetFiche(f, x, z) { f.pos.x = x; f.pos.z = z; f.groep.position.x = x; f.groep.position.z = z; }

  /* ---------- tussen spel en tentoonstelling wisselen ---------- */
  let modus = 'spel';
  function zetModus(m) {
    modus = L.modus = m;
    document.body.classList.toggle('tt-modus', m === 'tentoonstelling');
    L.ververs();
    objecten.forEach(o => { o.mesh.visible = m === 'tentoonstelling'; });
    $('ttKnop').textContent = m === 'tentoonstelling' ? 'Terug naar het spel' : 'Tentoonstelling bekijken';
    $('ttPanelen').style.display = m === 'tentoonstelling' ? '' : 'none';
    $('actie').hidden = true; $('ttActie').hidden = true; dichtbij = -1;
    select(null);
  }
  G.knop('Alle panelen', () => { if (!G.pauze) openLijst(); }, 'ttPanelen');
  G.knop('Tentoonstelling bekijken', () => { if (!G.pauze) zetModus(modus === 'spel' ? 'tentoonstelling' : 'spel'); }, 'ttKnop');
  $('ttPanelen').style.display = 'none';

  /* ---------- klikken in het spel ---------- */
  const ray = new THREE.Raycaster();
  function straal(e) {
    const c = G.canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((e.clientX - c.left) / c.width) * 2 - 1, -((e.clientY - c.top) / c.height) * 2 + 1), G.camera);
    return ray;
  }
  function itemVan(o) { for (let p = o; p; p = p.parent) if (p.userData && p.userData.item) return p.userData.item; return null; }
  function raak(e) {                        // welk zichtbaar fiche, paneel of brochure zit onder de muis?
    const wortels = [];
    if (modus === 'tentoonstelling') objecten.forEach(o => wortels.push(o.mesh));
    else {
      L.fiches.forEach(f => { if (f.groep.visible || BEWERK) wortels.push(f.groep); });
      if (L.brochureMesh) wortels.push(L.brochureMesh);
    }
    const hit = straal(e).intersectObjects(wortels, true).find(h => { for (let p = h.object; p; p = p.parent) if (p.visible === false && !wortels.includes(p)) return false; return true; });
    return hit ? itemVan(hit.object) : null;
  }
  const paneelIndex = o => objecten.indexOf(o);

  let down = null;
  G.canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  G.canvas.addEventListener('pointerup', e => {
    if (!down || G.pauze || editAan) return;
    const kort = Math.hypot(e.clientX - down.x, e.clientY - down.y) < 8 && performance.now() - down.t < 500; down = null;
    if (!kort) return;
    const it = raak(e);
    if (modus === 'tentoonstelling') { if (it && it.soort === 'paneel') openPaneel(paneelIndex(it)); }
    else { if (it && it.soort === 'brochure' && L.toonBrochure) L.toonBrochure(); }
  });
  G.canvas.addEventListener('pointermove', e => {
    if (G.pauze || e.pointerType === 'touch' || editAan) return;
    const it = raak(e);
    G.canvas.style.cursor = it ? (modus === 'tentoonstelling' ? 'zoom-in' : 'pointer') : '';
  });

  /* ---------- dichtbij: knop "Bekijk paneel" ---------- */
  let dichtbij = -1;
  G.opFrame(() => {
    let best = -1, bd = NABIJ;
    if (!G.pauze && modus === 'tentoonstelling' && !editAan) objecten.forEach((o, i) => { const d = Math.hypot(G.speler.x - o.pos.x, G.speler.z - o.pos.z); if (d < bd) { bd = d; best = i; } });
    if (best !== dichtbij) {
      dichtbij = best; const b = $('ttActie');
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

  /* ---------- de kijker ---------- */
  const PB = 1000, PH = PB / ASPECT;
  const V = { i: -1, s: 1, tx: 0, ty: 0, s0: 1 }, vlak = $('ttVlak'), vw = $('ttViewer');
  vlak.style.width = PB + 'px'; vlak.style.height = PH + 'px';
  const maat = () => ({ w: vw.clientWidth, h: vw.clientHeight });
  function toepassen(anim) { vlak.style.transition = anim ? 'transform .35s ease' : 'none'; vlak.style.transform = `translate(${V.tx}px,${V.ty}px) scale(${V.s})`; }
  function begrens() {
    const { w, h } = maat(), pw = PB * V.s, ph = PH * V.s;
    V.tx = pw <= w ? (w - pw) / 2 : Math.min(40, Math.max(w - pw - 40, V.tx));
    V.ty = ph <= h ? (h - ph) / 2 : Math.min(60, Math.max(h - ph - 60, V.ty));
  }
  function heel(anim) { const { w, h } = maat(); V.s0 = V.s = Math.min(w / PB, (h - 70) / PH); V.tx = (w - PB * V.s) / 2; V.ty = (h - PH * V.s) / 2 + 20; toepassen(anim); }
  function zoomOp(fx, fy, factor, anim, midden) {
    const nieuw = Math.min(V.s0 * 14, Math.max(V.s0 * 0.9, V.s * factor)), k = nieuw / V.s;
    const { w, h } = maat(), px = midden ? w / 2 : fx, py = midden ? h / 2 : fy;
    V.tx = px - (px - V.tx) * k; V.ty = py - (py - V.ty) * k; V.s = nieuw; begrens(); toepassen(anim);
  }
  function naarDeel(d) {
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
      const n = document.createElement('div'); n.className = 'tt-deel';
      n.style.cssText = `pointer-events:none;left:${p.x * 100}%;top:${p.y * 100}%;width:${p.b * 100}%;height:${p.h * 100}%`; vlak.appendChild(n);
    });
    heel(false);
  }
  function sluit() { vw.hidden = true; V.i = -1; G.pauze = false; dichtbij = -1; }

  const ptrs = new Map(); let pinch = null, tik = null;
  vw.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    vw.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    tik = ptrs.size === 1 ? { x: e.clientX, y: e.clientY, t: performance.now() } : null;
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) }; }
  });
  vw.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId)) return;
    const vorig = ptrs.get(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 2 && pinch) { const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y); zoomOp((a.x + b.x) / 2, (a.y + b.y) / 2, d / pinch.d, false); pinch.d = d; }
    else if (ptrs.size === 1) { V.tx += e.clientX - vorig.x; V.ty += e.clientY - vorig.y; begrens(); toepassen(false); }
  });
  vw.addEventListener('pointerup', e => {
    if (tik && ptrs.size === 1 && Math.hypot(e.clientX - tik.x, e.clientY - tik.y) < 8 && performance.now() - tik.t < 500) tikOp(e.clientX, e.clientY);
    ptrs.delete(e.pointerId); pinch = null; tik = null;
  });
  vw.addEventListener('pointercancel', e => { ptrs.delete(e.pointerId); pinch = null; tik = null; });
  vw.addEventListener('wheel', e => { e.preventDefault(); zoomOp(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0015), false); }, { passive: false });
  function tikOp(cx, cy) {
    const px = (cx - V.tx) / (V.s * PB), py = (cy - V.ty) / (V.s * PH);
    const delen = (P[V.i].delen || []).filter(d => px >= d.x && px <= d.x + d.b && py >= d.y && py <= d.y + d.h);
    if (delen.length) { delen.sort((a, b) => a.b * a.h - b.b * b.h); naarDeel(delen[0]); }
  }
  $('ttSluit').onclick = sluit; $('ttHeel').onclick = () => heel(true);
  $('ttPlus').onclick = () => zoomOp(0, 0, 1.6, true, true); $('ttMin').onclick = () => zoomOp(0, 0, 1 / 1.6, true, true);
  $('ttVorig').onclick = () => openPaneel(V.i - 1); $('ttVolg').onclick = () => openPaneel(V.i + 1);
  $('ttDelen').onclick = () => vw.classList.toggle('toon');
  window.addEventListener('resize', () => { if (!vw.hidden) heel(false); });
  window.addEventListener('keydown', e => {
    if (vw.hidden) { if (e.key === 'Escape' && !$('ttLijst').hidden) { $('ttLijst').hidden = true; G.pauze = false; } return; }
    if (e.key === 'Escape') sluit();
    else if (e.key === 'ArrowLeft') openPaneel(V.i - 1); else if (e.key === 'ArrowRight') openPaneel(V.i + 1);
    else if (e.key === '+' || e.key === '=') zoomOp(0, 0, 1.4, true, true); else if (e.key === '-') zoomOp(0, 0, 1 / 1.4, true, true);
    e.stopPropagation();
  }, true);

  /* ---------- fiches en panelen verplaatsen (alleen met &bewerk) ---------- */
  let editAan = false, gekozen = null, sleep = null, kader = null;
  const wortelVan = it => (it.soort === 'paneel' || it.soort === 'brochure') ? it.mesh : it.groep;
  function select(it) {
    gekozen = it;
    if (kader) { G.scene.remove(kader); kader = null; }
    if (it) { kader = new THREE.BoxHelper(wortelVan(it), 0xffb300); G.scene.add(kader); }
    if (paneelUI) {
      const naam = it ? (it.soort === 'paneel' ? 'Paneel ' + it.data.nr : it.soort === 'brochure' ? 'Brochure' : 'Fiche ' + it.data.id) : null;
      $('ttInfo').textContent = it ? naam + ': sleep het naar een nieuwe plek.' : 'Klik een fiche, paneel of brochure aan en sleep het.';
      $('ttDraaiL').disabled = $('ttDraaiR').disabled = !it || it.soort !== 'paneel';
    }
  }
  const zetItem = (it, x, z) => {
    if (it.soort === 'paneel') { it.pos.x = x; it.pos.z = z; it.mesh.position.x = x; it.mesh.position.z = z; }
    else if (it.soort === 'brochure') { it.pos.x = x; it.pos.z = z; it.mesh.position.x = x; it.mesh.position.z = z; if (window.SPELDATA) window.SPELDATA.baliePlek = [x, z]; }
    else zetFiche(it, x, z);
    if (kader) kader.update();
  };
  const sla = it => {
    lokaal[it.sleutel] = it.soort === 'paneel' ? { x: +it.pos.x.toFixed(2), z: +it.pos.z.toFixed(2), r: it.r } : { x: +it.pos.x.toFixed(2), z: +it.pos.z.toFixed(2) };
    bewaar();
  };
  let paneelUI = null;
  if (BEWERK) {
    paneelUI = document.createElement('div');
    paneelUI.className = 'tt-edit'; paneelUI.hidden = true;
    paneelUI.innerHTML = `<div id="ttInfo">Klik een fiche of paneel aan en sleep het.</div>
      <div><button id="ttDraaiL">⟲ Draai</button><button id="ttDraaiR">⟳ Draai</button><button id="ttKopie">Kopieer plekken</button><button id="ttWisFiche">Zet geselecteerde terug</button><button id="ttWisFiches">Zet alle fiches terug</button><button id="ttReset">Wis alle opgeslagen plekken</button></div>`;
    document.body.appendChild(paneelUI);
    G.knop('Fiches en panelen verplaatsen', () => { editAan = !editAan; paneelUI.hidden = !editAan; if (!editAan) select(null); else select(null); }, 'ttEdit');
    const draai = d => { if (gekozen && gekozen.soort === 'paneel') { gekozen.r += d * Math.PI / 12; gekozen.mesh.rotation.y = gekozen.r; kader.update(); sla(gekozen); } };
    $('ttDraaiL').onclick = () => draai(1); $('ttDraaiR').onclick = () => draai(-1);
    $('ttKopie').onclick = () => {
      const regels = [];
      L.fiches.forEach(f => { const l = lokaal['fiche-' + f.data.id]; if (l) regels.push('fiche ' + f.data.id + ': x ' + l.x.toFixed(2) + ', z ' + l.z.toFixed(2)); });
      objecten.forEach(o => { const l = lokaal[o.sleutel]; if (l) regels.push('paneel ' + o.data.nr + ': x ' + l.x.toFixed(2) + ', z ' + l.z.toFixed(2) + ', draaiing ' + Math.round(((l.r * 180 / Math.PI) % 360 + 360) % 360) + ' graden'); });
      if (lokaal.brochure) regels.push('brochure: x ' + lokaal.brochure.x.toFixed(2) + ', z ' + lokaal.brochure.z.toFixed(2));
      const uit = regels.join('\n') || 'Nog niets verplaatst.';
      const klaar = () => { $('ttInfo').textContent = 'Gekopieerd! Plak het nu in het gesprek met Claude.'; };
      const val = () => { const t = document.createElement('textarea'); t.value = uit; t.style.cssText = 'width:100%;height:120px'; paneelUI.appendChild(t); t.select(); $('ttInfo').textContent = 'Kopieer deze tekst (Ctrl+C) en plak hem bij Claude.'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(uit).then(klaar, val); else val();
    };
    $('ttWisFiches').onclick = () => {
      Object.keys(lokaal).filter(k => k.startsWith('fiche-')).forEach(k => delete lokaal[k]);
      try { localStorage.setItem(OPSLAG, JSON.stringify(lokaal)); } catch (e) {}
      location.reload();
    };
    $('ttWisFiche').onclick = () => {
      if (!gekozen) { $('ttInfo').textContent = 'Selecteer eerst een fiche of paneel.'; return; }
      delete lokaal[gekozen.sleutel];
      try { localStorage.setItem(OPSLAG, JSON.stringify(lokaal)); } catch (e) {}
      $('ttInfo').textContent = (gekozen.sleutel || 'Item') + ' teruggeplaatst op de standaardplek. Herlaad de pagina om het te zien.';
    };
    $('ttReset').onclick = () => { if (!confirm('Dit wist alle opgeslagen plekken (fiches, panelen én brochure). Doorgaan?')) return; try { localStorage.removeItem(OPSLAG); } catch (e) {} location.reload(); };

    const plat = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), pt = new THREE.Vector3();
    const opVloer = (e, y) => { plat.constant = -y; return straal(e).ray.intersectPlane(plat, pt) ? pt : null; };
    const alleenCanvas = e => e.target === G.canvas;
    window.addEventListener('pointerdown', e => {
      if (!editAan || G.pauze || !alleenCanvas(e)) return;
      const it = raak(e); if (!it) return;
      e.stopImmediatePropagation(); e.preventDefault();
      select(it); G.canvas.setPointerCapture(e.pointerId);
      const p = opVloer(e, it.pos.y || 0);
      sleep = { id: e.pointerId, dx: p ? it.pos.x - p.x : 0, dz: p ? it.pos.z - p.z : 0 };
    }, true);
    window.addEventListener('pointermove', e => {
      if (!sleep || e.pointerId !== sleep.id || !gekozen) return;
      e.stopImmediatePropagation(); e.preventDefault();
      const p = opVloer(e, gekozen.pos.y || 0); if (!p) return;
      zetItem(gekozen, Math.round((p.x + sleep.dx) * 20) / 20, Math.round((p.z + sleep.dz) * 20) / 20);
    }, true);
    const los = e => { if (sleep && e.pointerId === sleep.id) { e.stopImmediatePropagation(); sleep = null; if (gekozen) sla(gekozen); } };
    window.addEventListener('pointerup', los, true); window.addEventListener('pointercancel', los, true);
  }

  /* ---------- start ---------- */
  bouwLijst();
  L.klaar.then(() => {
    L.fiches.forEach(f => { f.groep.userData.item = f; f.soort = 'fiche'; f.sleutel = 'fiche-' + f.data.id; });
    if (L.brochureMesh) {
      const bi = { data: { id: 'brochure' }, mesh: L.brochureMesh, pos: L.brochureMesh.position, soort: 'brochure', sleutel: 'brochure' };
      L.brochureMesh.userData.item = bi;
      /* positie al gezet door laag.js; pos object wijst naar de live mesh.position */
    }
    plaats();
    if (window.bibTest) window.bibTest.paneel = i => { zetModus('tentoonstelling'); openPaneel(i - 1); };
  });
})();
