/* GEBOUW · de basis van elk spel
   ------------------------------------------------------------------
   Dit bestand laat iemand door het 3D-gebouw wandelen. Meer niet.
   Er staat niets in over opdrachten, fiches, punten of een figuur: dat is het werk van een laag.

   Een laag praat met het gebouw via `window.Gebouw` (zie de lijst onderaan dit bestand).
   Wie aan het gebouw werkt, houdt die lijst stabiel. Wie een laag maakt, blijft van dit bestand af.

   Het 3D-model:
     - staat in  gebouw/model/bib.glb   (gegevens: gebouw-data.js)
     - staat het er niet (of laadt het niet), dan verschijnt een tijdelijke zaal
     - punten in het model met de naam  start,  fiche-1 ... fiche-8  of  plek-<naam>
       (in SketchUp: een groep of component met precies die naam) worden aan de lagen doorgegeven
       in  Gebouw.punten  */
(() => {
  'use strict';

  const BASIS = (document.currentScript && document.currentScript.src || '').replace(/[^/]*$/, '');
  const C = window.GEBOUWDATA;
  const MODEL = { url: BASIS + C.model.url, schaal: C.model.schaal || 1, grens: C.grens, deur: C.deur,
                  start: C.start, startRichting: C.startRichting || 0 };
  const $ = id => document.getElementById(id);

  /* ---------- het scherm van het gebouw ---------- */
  document.body.insertAdjacentHTML('afterbegin', `
    <canvas id="scene"></canvas>
    <div class="hud" id="modelnoot" hidden>Tijdelijke zaal. Het echte model van de bib komt hier later voor in de plaats.</div>
    <div class="hud" id="knoppen"><button id="weergave"></button><span class="zoomrij"><button id="zoomMin" aria-label="Verder weg">−</button><button id="zoomPlus" aria-label="Dichterbij">+</button></span></div>
    <div id="stick"><i></i></div>`);

  /* ---------- 3D-wereld ---------- */
  const canvas = $('scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe9e2d4);
  scene.fog = new THREE.Fog(0xe9e2d4, 16, 46);
  const camera = new THREE.PerspectiveCamera(72, 1, 0.05, 140);
  camera.rotation.order = 'YXZ';
  /* Licht: zacht licht van boven en van opzij, met echte schaduwen rond het poppetje. Dat geeft diepte aan het gebouw en de meubels. */
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb9b2a6, 0.62));
  scene.add(new THREE.AmbientLight(0xffffff, 0.12));
  const zon = new THREE.DirectionalLight(0xfff6e8, 0.72); zon.position.set(5, 11, 3.5);
  zon.castShadow = true; zon.shadow.mapSize.set(2048, 2048); zon.shadow.bias = -0.0004; zon.shadow.normalBias = 0.03;
  Object.assign(zon.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 40 });
  scene.add(zon, zon.target);

  const colliders = [];
  const speler = { x: 0, y: 1.6, z: 7.8, yaw: 0, pitch: 0, hoogte: 0.6, afstand: 5.2 * (C.spelerSchaal || 1) };   // y = oogpunt; hoogte = camerahoek achter de speler

  /* De speler als poppetje in de zaal. Het uiterlijk (3 loopbeeldjes) komt van de laag: Gebouw.zetAvatar. */
  let weergave = 'derde';                  // 'derde' = je ziet het poppetje, 'eerste' = door zijn ogen
  const avatar = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false }));
  const PS = C.spelerSchaal || 1;   // hoe groot de speler is ten opzichte van het gebouw (kleiner = het gebouw voelt groter)
  avatar.scale.set(1.25 * PS, 1.5 * PS, 1); avatar.center.set(0.5, 0.02);
  const avatarSchaduw = new THREE.Mesh(new THREE.CircleGeometry(0.42 * PS, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false }));
  avatarSchaduw.rotation.x = -Math.PI / 2;
  const doel = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.24, 28), new THREE.MeshBasicMaterial({ color: 0xd9601f, side: THREE.DoubleSide }));
  doel.rotation.x = -Math.PI / 2; doel.visible = false;
  let kaders = [];
  scene.add(avatar, avatarSchaduw, doel);

  /* Zonder laag-figuur: een eenvoudig pion-poppetje, zodat het gebouw ook alleen werkt. */
  function standaardKaders() {
    const cv = document.createElement('canvas'); cv.width = 300; cv.height = 360;
    const c = cv.getContext('2d');
    c.fillStyle = '#d9601f'; c.beginPath(); c.ellipse(150, 250, 70, 100, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fbf7ef'; c.beginPath(); c.arc(150, 110, 62, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#2e3033'; c.beginPath(); c.arc(128, 105, 8, 0, Math.PI * 2); c.arc(172, 105, 8, 0, Math.PI * 2); c.fill();
    return [new THREE.CanvasTexture(cv)];
  }

  function formaat() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', formaat); formaat();

  /* tijdelijke zaal, tot het echte model er is */
  function bouwTijdelijkeZaal() {
    const g = new THREE.Group();
    const lamb = c => new THREE.MeshLambertMaterial({ color: c });
    const doos = (w, h, d, x, z, kleur, y0 = 0, extra = {}) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial(Object.assign({ color: kleur }, extra)));
      m.position.set(x, y0 + h / 2, z); g.add(m); colliders.push(m); return m;
    };
    // vloer met tegels op 45 graden
    const cv = document.createElement('canvas'); cv.width = cv.height = 128;
    const c = cv.getContext('2d'); c.fillStyle = '#d8ceb8'; c.fillRect(0, 0, 128, 128);
    c.strokeStyle = '#b9ad94'; c.lineWidth = 4; c.strokeRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(16, 12);
    tex.center.set(0.5, 0.5); tex.rotation = Math.PI / 4;
    const vloer = new THREE.Mesh(new THREE.PlaneGeometry(24, 18), new THREE.MeshLambertMaterial({ map: tex }));
    vloer.rotation.x = -Math.PI / 2; g.add(vloer);
    const plafond = new THREE.Mesh(new THREE.PlaneGeometry(24, 18), lamb(0xfaf8f3));
    plafond.rotation.x = Math.PI / 2; plafond.position.y = 3.2; g.add(plafond);
    // buitenmuren
    const muur = 0xf4efe4;
    doos(24, 3.2, 0.3, 0, -9, muur); doos(24, 3.2, 0.3, 0, 9, muur);
    doos(0.3, 3.2, 18, -12, 0, muur); doos(0.3, 3.2, 18, 12, 0, muur);
    // rekken
    [[-7, -2], [-7, 2.5], [7, -2], [7, 2.5]].forEach(([x, z]) => {
      doos(6, 2.1, 0.5, x, z, 0x0b5d68);
      doos(5.8, 0.1, 0.52, x, z, 0xe9e2d4, 2.1);
    });
    // balie, zuilen, glazen wand, trap
    doos(3.2, 1.1, 0.8, 0, -4.4, 0xd9601f);
    [[-4, 4], [4, 4], [-4, -6.6], [4, -6.6], [0, 1.2]].forEach(([x, z]) => {
      const k = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 3.2, 14), lamb(0xdcd5c6));
      k.position.set(x, 1.6, z); g.add(k); colliders.push(k);
    });
    doos(10, 2.6, 0.1, 0, -7.6, 0x9fd3dc, 0, { transparent: true, opacity: 0.45 });
    for (let i = 0; i < 6; i++) doos(2.4, 0.18 * (i + 1), 0.45, -9.5, 6.6 - i * 0.45 - 0.4, 0x8a5a3a);
    scene.add(g);
    $('modelnoot').hidden = false;
  }

  /* Vloer en plafond: het model heeft ze niet. Kleuren staan in gebouw-data.js bij "look". */
  const LOOK = Object.assign({
    vloerTegel: '#5f5753', vloerVoeg: '#c4beb5', vloerGlad: '#8d8f93', vloerTegelLicht: '#a8857a', vloerVoegLicht: '#7f8a8c', tapijt: '#9a9ca1', vloerTegelGroot: '#4f4d4e', vloerVoegGroot: '#2b2a2a', vloerTegelKlein: '#9a8a84', vloerVoegKlein: '#463f3c', vloerLoper: '#5d6166',
    plafondLat: '#d7c6a0', plafondSpleet: '#4a4338'
  }, C.look || {});
  let plafondMesh = null;

  function canvasTexture(teken, repeatX, repeatY, rotatie) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 128;
    teken(cv.getContext('2d'));
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeatX, repeatY);
    if (rotatie) { t.center.set(0.5, 0.5); t.rotation = rotatie; }
    t.anisotropy = 4;
    return t;
  }

  function bouwVloerEnPlafond(G) {
    const bw = G.xmax - G.xmin, bd = G.zmax - G.zmin;
    const midX = (G.xmin + G.xmax) / 2, midZ = (G.zmin + G.zmax) / 2;
    const vlak = (x0, x1, z0, z1, tex, y) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshLambertMaterial({ map: tex, polygonOffset: true, polygonOffsetFactor: -y * 1000, polygonOffsetUnits: -1 }));
      m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); m.receiveShadow = true; scene.add(m);
    };
    const tegelTex = (kleur, voeg, rx, rz) => canvasTexture(c => {
      c.fillStyle = voeg; c.fillRect(0, 0, 128, 128);
      c.fillStyle = kleur;
      [[1, 1], [65, 1], [1, 65], [65, 65]].forEach(([x, y]) => c.fillRect(x, y, 62, 62));
    }, rx / 0.4, rz / 0.4, Math.PI / 4);
    const soorten = {
      'tegel-klein':  (rx, rz) => canvasTexture(c => { c.fillStyle = LOOK.vloerVoegKlein; c.fillRect(0, 0, 128, 128); c.fillStyle = LOOK.vloerTegelKlein; c.fillRect(3, 3, 122, 122); for (let i = 0; i < 300; i++) { c.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'; c.fillRect(3 + Math.random() * 120, 3 + Math.random() * 120, 2, 2); } }, rx / 0.2, rz / 0.2),
      'loper':        (rx, rz) => canvasTexture(c => { c.fillStyle = LOOK.vloerLoper; c.fillRect(0, 0, 128, 128); for (let i = 0; i < 300; i++) { c.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'; c.fillRect(Math.random() * 126, Math.random() * 126, 2, 2); } }, 1, 1),
      'tegel-groot':  (rx, rz) => canvasTexture(c => { c.fillStyle = LOOK.vloerVoegGroot; c.fillRect(0, 0, 128, 128); c.fillStyle = LOOK.vloerTegelGroot; c.fillRect(2, 2, 124, 124); for (let i = 0; i < 500; i++) { c.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'; c.fillRect(2 + Math.random() * 122, 2 + Math.random() * 122, 2, 2); } }, rx / 0.6, rz / 0.6),
      'glad':         (rx, rz) => canvasTexture(c => { c.fillStyle = LOOK.vloerGlad; c.fillRect(0, 0, 128, 128); }, 1, 1),
      'parket':       (rx, rz) => canvasTexture(c => { const k = [0xb08f62, 0xa5845a, 0xb99a6e, 0xaa8a5d]; for (let i = 0; i < 4; i++) { c.fillStyle = '#' + k[(i * 3 + 1) % 4].toString(16); c.fillRect(i * 32, 0, 32, 128); c.fillStyle = 'rgba(70,45,20,0.35)'; c.fillRect(i * 32, 0, 1.5, 128); for (let j = 0; j < 40; j++) { c.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.07)' : 'rgba(60,35,10,0.07)'; c.fillRect(i * 32 + Math.random() * 30, Math.random() * 128, 1.5, 6 + Math.random() * 14); } c.fillStyle = 'rgba(70,45,20,0.3)'; c.fillRect(i * 32, (i * 53) % 128, 32, 1.5); } }, rx / 0.48, rz / 1.0),
      'tegel-donker': (rx, rz) => tegelTex(LOOK.vloerTegel, LOOK.vloerVoeg, rx, rz),
      'tegel-licht':  (rx, rz) => tegelTex(LOOK.vloerTegelLicht, LOOK.vloerVoegLicht, rx, rz),
      'tapijt':       (rx, rz) => canvasTexture(c => { c.fillStyle = LOOK.tapijt; c.fillRect(0, 0, 128, 128); for (let i = 0; i < 700; i++) { c.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'; c.fillRect(Math.random() * 128, Math.random() * 128, 2, 2); } }, rx / 1.5, rz / 1.5)
    };
    // basis: overal gladde vloer; daarbovenop de zones met tegels
    vlak(G.xmin, G.xmax, G.zmin, G.zmax, soorten.glad(bw, bd), 0);
    (LOOK.zones || []).forEach((z, i) => {
      const maak = soorten[z.type]; if (!maak) return;
      const [x0, x1] = z.x, [z0, z1] = z.z;
      vlak(x0, x1, z0, z1, maak(x1 - x0, z1 - z0), 0.004 + i * 0.001);
    });

    // plafond met houten latten; alleen zichtbaar als je door de ogen van het poppetje kijkt
    const latten = canvasTexture(c => {
      c.fillStyle = LOOK.plafondSpleet; c.fillRect(0, 0, 128, 128);
      c.fillStyle = LOOK.plafondLat;
      for (let i = 0; i < 4; i++) c.fillRect(0, i * 32 + 2, 128, 28);
    }, bw / 0.5, bd / 0.5);
    plafondMesh = new THREE.Mesh(new THREE.PlaneGeometry(bw, bd), new THREE.MeshLambertMaterial({ map: latten }));
    plafondMesh.rotation.x = Math.PI / 2; plafondMesh.position.set(midX, 2.75, midZ);
    plafondMesh.visible = weergave === 'eerste';
    scene.add(plafondMesh);
  }

  /* ---------- rekken: het model bevat er geen, ze staan in gebouw-data.js bij "rekken" ---------- */
  function rugTextuur(soort, lengte) {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256;
    const c = cv.getContext('2d');
    let s = 7; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const paletten = {
      boeken: ['#c0392b', '#e8b339', '#3b7a8c', '#7d5ba6', '#f2efe6', '#3e6fb0', '#e07b2b', '#4d8f5a', '#d98aa8', '#a9b7b0'],
      dvd:    ['#1f2328', '#2b3a4a', '#4a2c2c', '#d9d9d9', '#355c7d', '#6c5b7b', '#222', '#8a8f98'],
      spel:   ['#d9601f', '#0b5d68', '#e8b339', '#c0392b', '#f2efe6', '#3e6fb0']
    };
    const pal = paletten[soort] || paletten.boeken;
    c.fillStyle = '#efe9dd'; c.fillRect(0, 0, 256, 256);
    const rijen = 5, rh = 256 / rijen;
    for (let r = 0; r < rijen; r++) {
      let x = 3;
      while (x < 253) {
        const w = soort === 'spel' ? 26 + rnd() * 18 : soort === 'dvd' ? 5 + rnd() * 3 : 6 + rnd() * 12;
        const h = rh - 14 - (soort === 'boeken' ? rnd() * 14 : 0);
        c.fillStyle = pal[Math.floor(rnd() * pal.length)];
        c.fillRect(x, r * rh + rh - 6 - h, Math.min(w, 253 - x), h);
        x += w + 1;
      }
      c.fillStyle = '#c99c62'; c.fillRect(0, r * rh + rh - 6, 256, 6);   // legplank (beuken)
    }
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = THREE.RepeatWrapping; t.repeat.set(Math.max(1, lengte / 1.0), 1); t.anisotropy = 4;
    return t;
  }

  /* ---------- kubuskasten en ramen (uit gebouw-data.js: "rekken" en "ramen") ---------- */
  function kubusTextuur(kol, rij) {
    const cv = document.createElement('canvas'); cv.width = 64 * kol; cv.height = 64 * rij;
    const c = cv.getContext('2d');
    c.fillStyle = '#d9b57c'; c.fillRect(0, 0, cv.width, cv.height);          // beuken kader
    for (let i = 0; i < kol; i++) for (let j = 0; j < rij; j++) {
      c.fillStyle = '#f6f4ef'; c.fillRect(i * 64 + 4, j * 64 + 4, 56, 56);   // witte kubus
      c.fillStyle = '#e3dfd6'; c.fillRect(i * 64 + 4, j * 64 + 4, 56, 6);    // schaduw bovenrand
      c.fillStyle = '#ffffff'; c.fillRect(i * 64 + 12, j * 64 + 20, 40, 34); // opening
    }
    const t = new THREE.CanvasTexture(cv); t.anisotropy = 4;
    return t;
  }

  function venster(breed, hoog) {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = Math.round(256 * hoog / breed);
    const c = cv.getContext('2d'), W = cv.width, H = cv.height;
    c.fillStyle = '#e4e1da'; c.fillRect(0, 0, W, H);                          // kozijn
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#dfe8ee'); g.addColorStop(1, '#a7b6bf');
    c.fillStyle = g; c.fillRect(10, 10, W - 20, H - 20);                       // glas
    c.fillStyle = '#c9bca9'; c.fillRect(10, 10, W - 20, (H - 20) * 0.68);     // rolgordijn
    c.fillStyle = '#b3a591'; c.fillRect(10, 10 + (H - 20) * 0.68 - 6, W - 20, 6);
    c.fillStyle = '#e4e1da'; c.fillRect(W / 2 - 3, 10, 6, H - 20);           // middenstijl
    return new THREE.CanvasTexture(cv);
  }

  function plaatsDecor() {
    (C.ramen || []).forEach(r => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(r.breed, r.hoog), new THREE.MeshLambertMaterial({ map: venster(r.breed, r.hoog) }));
      m.position.set(r.x, (r.onder || 0.9) + r.hoog / 2, r.z);
      m.rotation.y = r.kijkt === 'noord' ? Math.PI : r.kijkt === 'oost' ? Math.PI / 2 : r.kijkt === 'west' ? -Math.PI / 2 : 0;
      scene.add(m);
    });
  }

  function plaatsRekken() {
    const hout = new THREE.MeshLambertMaterial({ color: 0xd9b57c });
    const wit = new THREE.MeshLambertMaterial({ color: 0xf4f1ea });
    (C.rekken || []).forEach(r => {
      const len = r.lengte || 2, diep = 0.4, hoog = r.hoogte || 2.0;
      const voor = new THREE.MeshLambertMaterial({ map: r.soort === 'kubus' ? kubusTextuur(Math.max(1, Math.round(len / 0.42)), Math.max(1, Math.round(hoog / 0.42))) : rugTextuur(r.soort, len) });
      const langsZ = r.kijkt === 'oost' || r.kijkt === 'west';
      const geo = langsZ ? new THREE.BoxGeometry(diep, hoog, len) : new THREE.BoxGeometry(len, hoog, diep);
      // volgorde van de zijden: +x, -x, +y, -y, +z, -z
      const m = [wit, wit, hout, hout, wit, wit];
      const idx = { oost: 0, west: 1, zuid: 4, noord: 5 }[r.kijkt || 'zuid'];
      m[idx] = voor;
      const mesh = new THREE.Mesh(geo, m);
      mesh.position.set(r.x, hoog / 2, r.z);
      mesh.userData.rek = r.naam || r.soort;
      scene.add(mesh); colliders.push(mesh);
    });
  }

  /* ---------- meubels: uit gebouw-data.js bij "meubels" (fauteuil, poef, tafel-rond, tafel-hoog, tafel, stoel, kruk, plant) ---------- */
  function plaatsMeubels() {
    const mat = k => new THREE.MeshStandardMaterial({ color: k, roughness: 0.72, metalness: 0.0 });
    const zwart = new THREE.MeshStandardMaterial({ color: 0x1d1e21, roughness: 0.42, metalness: 0.35 });
    const doos = (g, b, h, d, x, y, z, m) => { const o = new THREE.Mesh(new THREE.BoxGeometry(b, h, d), m); o.position.set(x, y, z); g.add(o); return o; };
    const cyl = (g, r, h, x, y, z, m, r2) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r2 === undefined ? r : r2, r, h, 20), m); o.position.set(x, y, z); g.add(o); return o; };
    /* hulpjes: een gebogen schaal (rugleuning), een stijl-pootje */
    const boog = (g, r, h, x, y, z, midden, lengte, m) => {   // deel van een cilinder; midden = hoek (rad.) waar de boog het midden heeft (0 = +z, PI = -z)
      const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 20, 1, true, midden - lengte / 2, lengte), m);
      m.side = THREE.DoubleSide; o.position.set(x, y, z); g.add(o); return o;
    };
    const lat = (g, x0, y0, z0, x1, y1, z1, dik, m) => {       // een dunne staaf van punt 0 naar punt 1
      const a = new THREE.Vector3(x0, y0, z0), b = new THREE.Vector3(x1, y1, z1), d = b.clone().sub(a);
      const o = new THREE.Mesh(new THREE.CylinderGeometry(dik, dik, d.length(), 6), m);
      o.position.copy(a).addScaledVector(d, 0.5);
      o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(o); return o;
    };
    const bouw = {
      /* Fauteuil met ronde schaal en een draadframe (zoals de fauteuils in de zaal). Kijkt naar +z. */
      fauteuil(m, mt) {
        const g = new THREE.Group(), stof = mat(mt.kleur || 0xc98a1a);
        cyl(g, 0.36, 0.16, 0, 0.4, 0.02, stof, 0.33);                                         // zitkussen
        boog(g, 0.39, 0.42, 0, 0.62, 0.0, Math.PI, Math.PI * 1.25, stof);                     // schaal: rug en leuningen
        boog(g, 0.375, 0.42, 0, 0.62, 0.0, Math.PI, Math.PI * 1.25, stof);
        [-0.25, 0.25].forEach(x => {                                                            // draadframe (slee)
          lat(g, x, 0.03, -0.32, x, 0.03, 0.34, 0.012, zwart);
          lat(g, x, 0.03, 0.34, x, 0.3, 0.3, 0.012, zwart);
          lat(g, x, 0.03, -0.32, x, 0.3, -0.2, 0.012, zwart);
        });
        lat(g, -0.25, 0.03, 0.0, 0.25, 0.03, 0.0, 0.01, zwart);
        return { g, box: [0.78, 0.9, 0.78] };
      },
      /* Poef: een ronde ton met een leren lusje */
      poef(m, mt) {
        const g = new THREE.Group(), leer = mat(mt.kleur || 0x6b3a44);
        const pts = [[0, 0], [0.19, 0], [0.215, 0.08], [0.23, 0.22], [0.215, 0.38], [0.19, 0.45], [0, 0.45]].map(([r, y]) => new THREE.Vector2(r, y));
        g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 20), leer));
        doos(g, 0.05, 0.015, 0.12, 0.17, 0.43, 0, mat(0x2b1d1f));                              // lusje
        return { g, box: [0.46, 0.45, 0.46] };
      },
      /* Ronde salontafel: donkere plaat op een ring van zwart draad */
      'tafel-rond'(m, mt) {
        const g = new THREE.Group(), r = (mt.breed || 0.6) / 2;
        cyl(g, r, 0.025, 0, 0.44, 0, mat(mt.kleur || 0x30343a));
        [0.02, 0.4].forEach(y => { const t = new THREE.Mesh(new THREE.TorusGeometry(r - 0.04, 0.007, 6, 28), zwart); t.rotation.x = Math.PI / 2; t.position.y = y; g.add(t); });
        for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4, x = Math.cos(a) * (r - 0.04), z = Math.sin(a) * (r - 0.04); lat(g, x, 0.02, z, x, 0.42, z, 0.007, zwart); }
        return { g, box: [r * 2, 0.46, r * 2] };
      },
      /* Hoge tafel langs het glas: lichte plaat, donkere pootjes met voetplaat (om de 2 m één) */
      'tafel-hoog'(m, mt) {
        const g = new THREE.Group(), L = mt.lengte || 2.4, plaat = mat(mt.kleur || 0xdcc59c), donker = mat(0x2a2c30);
        doos(g, L, 0.035, 0.62, 0, 1.04, 0, plaat);
        doos(g, L, 0.03, 0.03, 0, 1.0, 0.3, donker);
        const n = Math.max(2, Math.round(L / 2) + 1);
        for (let i = 0; i < n; i++) { const x = -L / 2 + 0.25 + i * (L - 0.5) / (n - 1); doos(g, 0.06, 1.02, 0.06, x, 0.51, 0, donker); doos(g, 0.4, 0.02, 0.3, x, 0.01, 0, donker); }
        return { g, box: [L, 1.07, 0.62] };
      },
      /* Werktafel: lichte houten plaat, donkergrijze T-poten met wieltjes (klaptafel) */
      tafel(m, mt) {
        const g = new THREE.Group(), L = mt.lengte || 1.6, B = mt.breed || 0.8, H = mt.hoogte || 0.74, donker = mat(0x3e4146);
        doos(g, L, 0.03, B, 0, H - 0.015, 0, mat(mt.kleur || 0xdcc8a4));
        doos(g, L - 0.1, 0.07, 0.04, 0, H - 0.065, 0, donker);                               // ligger onder de plaat
        [-L / 2 + 0.3, L / 2 - 0.3].forEach(x => {
          doos(g, 0.07, H - 0.1, 0.07, x, (H - 0.1) / 2 + 0.05, 0, donker);
          doos(g, 0.06, 0.04, B - 0.1, x, 0.06, 0, donker);
          [-1, 1].forEach(k => cyl(g, 0.03, 0.04, x, 0.02, k * (B / 2 - 0.08), zwart));
        });
        return { g, box: [L, H, B] };
      },
      /* Witte schaalstoel met houten, schuin uitstaande poten. Kijkt naar +z. */
      stoel(m, mt) {
        const g = new THREE.Group(), schaal = mat(mt.kleur || 0xe9e6df), hout = mat(0xcaa56b);
        doos(g, 0.44, 0.035, 0.42, 0, 0.46, 0, schaal);
        boog(g, 0.25, 0.3, 0, 0.67, -0.05, Math.PI, Math.PI * 0.8, schaal);                     // gebogen rug
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => lat(g, a * 0.13, 0.45, b * 0.12, a * 0.2, 0.0, b * 0.2, 0.018, hout));
        return { g, box: [0.5, 0.9, 0.5] };
      },
      /* Gekleurd wandpaneel (bv. oranje muur). lengte = breedte langs de muur. Kijkt naar +z. */
      paneel(m, mt) {
        const g = new THREE.Group(), L = mt.lengte || 2, H = mt.hoogte || 2.7;
        const v = new THREE.Mesh(new THREE.PlaneGeometry(L, H), new THREE.MeshStandardMaterial({ color: mt.kleur || 0xe8960c, roughness: 0.9 })); v.position.y = H / 2; g.add(v);   // maar 1 kant: van buiten zie je niets
        return { g, box: [0.02, 0.02, 0.02] };      // geen botsing: het paneel ligt tegen de muur
      },
      /* Groen blad aan het plafond (hangt aan de muur, wijst naar +z). hoogte = ophanghoogte. */
      blad(m, mt) {
        const g = new THREE.Group(), L = mt.lengte || 1.2, Y = mt.hoogte || 2.4, groen = mat(mt.kleur || 0x1f9a55);
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 10), groen); b.scale.set(0.36 * L, 0.03, L * 0.5);
        b.position.set(0, Y, L * 0.5); b.rotation.x = 0.12; g.add(b);
        return { g, box: [0.02, 0.02, 0.02] };
      },
      /* Laag open rek op wieltjes: beuken zijkanten, witte planken. Kijkt naar +z. */
      laagrek(m, mt) {
        const g = new THREE.Group(), L = mt.lengte || 1.0, H = mt.hoogte || 1.25, D = 0.38, t = 0.03, hout = mat(0xc8924a), wit = mat(0xf0eee8);
        doos(g, t, H, D, -L / 2 + t / 2, 0.1 + H / 2, 0, hout); doos(g, t, H, D, L / 2 - t / 2, 0.1 + H / 2, 0, hout);
        for (let r = 0; r < 4; r++) { const sch = new THREE.Group(); sch.position.set(0, 0.2 + r * (H - 0.2) / 3.4, 0); sch.rotation.x = -0.12; doos(sch, L - 2 * t, 0.02, D - 0.02, 0, 0, 0, wit); g.add(sch);
          if (r < 3 || mt.vol !== false) {                                                       // prentenboeken: staan rechtop, naar voren geleund
            const pal = [0xd9534f, 0x3b7ea1, 0xe8b339, 0x4d9a62, 0xf2efe6, 0xc66a9b, 0x7d5ba6, 0xe07b2b].map(h => new THREE.Color(h));
            let sd = 11 + r * 17 + Math.round(Math.abs((mt.z || 0) * 100)); const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
            const lst = []; let x = -L / 2 + t + 0.015;
            while (x < L / 2 - t - 0.04) { const b = 0.015 + rnd() * 0.025, h = 0.19 + rnd() * 0.07; if (rnd() > 0.06) lst.push([x + b / 2, 0.01 + h / 2, 0.0, b * 0.95, h, 0.2 + rnd() * 0.06, pal[Math.floor(rnd() * pal.length)]]); x += b + 0.003; }
            const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.6 }), lst.length), mx = new THREE.Matrix4();
            lst.forEach(([x, y, z, bw, bh, bd, k], i) => { mx.makeScale(bw, bh, bd).setPosition(x, y, z); im.setMatrixAt(i, mx); im.setColorAt(i, k); });
            im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; sch.add(im);
          }
        }
        doos(g, L - 2 * t, 0.9 * H, 0.01, 0, 0.1 + H / 2, -D / 2, mat(0x6d7077));
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => cyl(g, 0.04, 0.05, a * (L / 2 - 0.06), 0.04, b * (D / 2 - 0.05), zwart));
        return { g, box: [L, H + 0.1, D] };
      },
      /* Witte boekenbak op wieltjes, vol prentenboeken. Kijkt naar +z. */
      boekenbak(m, mt) {
        const g = new THREE.Group(), wit = mat(0xf4f2ee), B = 0.55, Hh = 0.68, D = 0.42;
        doos(g, B, Hh, D, 0, 0.1 + Hh / 2, 0, wit);
        doos(g, B - 0.04, 0.02, D - 0.04, 0, 0.1 + Hh - 0.01, 0, mat(0x2d2d2f));
        const k = [0xd9534f, 0x3b7ea1, 0xe8b339, 0x4d9a62, 0xf2efe6, 0xc66a9b];
        for (let i = 0; i < 9; i++) { const h = 0.2 + (i * 7 % 3) * 0.03; const bk = doos(g, 0.025, h, 0.28, -B / 2 + 0.06 + i * 0.052, 0.1 + Hh + h / 2 - 0.02, 0, mat(k[i % 6])); bk.rotation.z = (i % 3 - 1) * 0.12; }
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => cyl(g, 0.04, 0.05, a * (B / 2 - 0.05), 0.04, b * (D / 2 - 0.05), zwart));
        return { g, box: [B, Hh + 0.3, D] };
      },
      /* Hoge witte kast met open tijdschriftvakken. Kijkt naar +z. */
      kast(m, mt) {
        const g = new THREE.Group(), L = mt.lengte || 1.2, H = mt.hoogte || 1.9, D = 0.45, wit = mat(0xf2f0ea);
        doos(g, L, H, D, 0, H / 2, 0, wit);
        for (let r = 0; r < 6; r++) doos(g, L - 0.06, 0.012, 0.03, 0, 0.35 + r * 0.24, D / 2 + 0.01, mat([0x2b2b2b, 0xd9d4c8, 0x8a8f98][r % 3]));
        return { g, box: [L, H, D] };
      },
      /* Witte stroomzuil tussen de bureaus (digipunt). */
      zuil(m, mt) {
        const g = new THREE.Group(), H = mt.hoogte || 1.9, wit = mat(0xf3f1ec);
        doos(g, 0.1, H, 0.1, 0, H / 2, 0, wit);
        doos(g, 0.02, 0.1, 0.11, 0, 0.9, 0, mat(0x2a2a2a));                                     // stopcontact
        return { g, box: [0.12, H, 0.12] };
      },
      /* Open laptop op een bureau. Scherm kijkt naar +z. */
      laptop(m, mt) {
        const g0 = new THREE.Group(), g = new THREE.Group(), grijs = mat(0x8e949b), donker = mat(0x23262b); g.position.y = 0.75; g0.add(g);
        doos(g, 0.33, 0.02, 0.23, 0, 0.01, 0, grijs);
        const sc = new THREE.Group(); sc.position.set(0, 0.02, -0.11); sc.rotation.x = -0.35; g.add(sc);
        doos(sc, 0.33, 0.22, 0.012, 0, 0.11, 0, grijs); doos(sc, 0.3, 0.19, 0.005, 0, 0.11, 0.007, donker);
        return { g: g0, box: [0.33, 0.25, 0.25] };
      },
      /* Hoge zwarte kruk: plastic schaal, draadframe met voetensteun. Kijkt naar +z. */
      kruk(m, mt) {
        const g = new THREE.Group();
        cyl(g, 0.17, 0.035, 0, 0.75, 0, zwart, 0.16);
        boog(g, 0.18, 0.22, 0, 0.9, -0.03, Math.PI, Math.PI * 0.9, zwart);                      // rug
        [-0.15, 0.15].forEach(x => {
          lat(g, x, 0.01, -0.28, x, 0.01, 0.2, 0.01, zwart);                                    // slee op de vloer
          lat(g, x, 0.01, 0.2, x, 0.74, 0.14, 0.01, zwart);
          lat(g, x, 0.01, -0.28, x, 0.74, -0.13, 0.01, zwart);
        });
        lat(g, -0.15, 0.3, 0.17, 0.15, 0.3, 0.17, 0.01, zwart);                                  // voetensteun
        return { g, box: [0.36, 0.95, 0.5] };
      },
      /* Rek met beuken zijkanten, planken en losse dvd's, boeken of spellen (textuur: "dvd", "boeken" of "spel"). Kijkt naar +z. */
      rek(m, mt) {
        const g = new THREE.Group(), L = mt.lengte || 2, H = mt.hoogte || 1.85, D = mt.diep || 0.4, t = 0.025, soort = mt.textuur || 'dvd';
        const hout = mat(0xd6b27a), wit = mat(0xf1eee8);
        doos(g, t, H, D, -L / 2 + t / 2, H / 2, 0, hout); doos(g, t, H, D, L / 2 - t / 2, H / 2, 0, hout);       // zijkanten
        doos(g, L - 2 * t, H - 0.1, 0.012, 0, 0.1 + (H - 0.1) / 2, -D / 2 + 0.006, wit);                           // achterwand
        doos(g, L, t, D, 0, H - t / 2, 0, hout); doos(g, L - 2 * t, 0.1, D - 0.02, 0, 0.05, -0.01, hout);          // bovenplank en plint
        const rijen = Math.max(2, Math.round((H - 0.1) / (soort === 'spel' ? 0.38 : 0.31))), hr = (H - 0.1 - t) / rijen;
        for (let r = 1; r < rijen; r++) doos(g, L - 2 * t, 0.02, D - 0.02, 0, 0.1 + r * hr, -0.01, hout);       // legplanken
        let sd = 7; for (let c = 0; c < (mt.naam || '').length; c++) sd = (sd * 31 + mt.naam.charCodeAt(c)) % 2147483647;
        const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
        const paletten = {
          dvd:    [0x1f2328, 0x2b3a4a, 0x4a2c2c, 0xd9d9d9, 0x355c7d, 0x6c5b7b, 0x222222, 0x8a8f98, 0x7a1f1f, 0x1c4a3a],
          boeken: [0xc0392b, 0xe8b339, 0x3b7a8c, 0x7d5ba6, 0xf2efe6, 0x3e6fb0, 0xe07b2b, 0x4d8f5a, 0xd98aa8, 0xa9b7b0],
          spel:   [0xd9601f, 0x0b5d68, 0xe8b339, 0xc0392b, 0xf2efe6, 0x3e6fb0]
        };
        const pal = (paletten[soort] || paletten.boeken).map(h => new THREE.Color(h));
        const lijst = [];
        for (let r = 0; r < rijen; r++) {
          const y0 = 0.1 + r * hr + 0.01, vrij = hr - 0.03;
          let x = -L / 2 + t + 0.012;
          while (x < L / 2 - t - 0.03) {
            let b, h, d;
            if (soort === 'dvd') { b = 0.0145; h = Math.min(vrij, 0.185 + rnd() * 0.01); d = 0.135; }
            else if (soort === 'spel') { b = 0.05 + rnd() * 0.05; h = Math.min(vrij, 0.26 + rnd() * 0.02); d = 0.28; }
            else { b = 0.018 + rnd() * 0.03; h = Math.min(vrij, 0.17 + rnd() * 0.1); d = 0.17 + rnd() * 0.05; }
            if (x + b > L / 2 - t - 0.01) break;
            if (rnd() > 0.04) lijst.push([x + b / 2, y0 + h / 2, D / 2 - 0.035 - d / 2, b * 0.94, h, d, pal[Math.floor(rnd() * pal.length)]]);
            x += b + (soort === 'dvd' ? 0.0015 : 0.002);
          }
        }
        const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0 }), lijst.length);
        const mx = new THREE.Matrix4();
        lijst.forEach(([x, y, z, b, h, d, k], i) => { mx.makeScale(b, h, d).setPosition(x, y, z); im.setMatrixAt(i, mx); im.setColorAt(i, k); });
        im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
        g.add(im);
        return { g, box: [L, H, D] };
      },
      /* Toren van witte kubussen met rode binnenkant, om en om links en rechts open (met draadhoudertjes voor dvd's). Kijkt naar +z. */
      rodetoren(m, mt) {
        const g = new THREE.Group(), n = mt.vakken || 5, h = 0.4, w = 0.55, d = 0.4, crème = mat(0xf2ede2), rood = mat(0xb3281f);
        for (let i = 0; i < n; i++) {
          const y = h * i + h / 2;
          doos(g, w, h - 0.01, d, 0, y, 0, crème);
          const x = (i % 2 ? 1 : -1) * w * 0.25;
          const v = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.46, h - 0.07), rood); v.position.set(x, y, d / 2 + 0.002); g.add(v);
          lat(g, x - 0.06, y - 0.12, d / 2 - 0.03, x - 0.02, y + 0.08, d / 2 - 0.12, 0.004, mat(0xeeeeee)); lat(g, x + 0.04, y - 0.12, d / 2 - 0.03, x + 0.08, y + 0.08, d / 2 - 0.12, 0.004, mat(0xeeeeee));
        }
        return { g, box: [w, n * h, d] };
      },
      /* Witte schuine standaard voor tijdschriften en brochures. De schuine kant kijkt naar +z. */
      tijdschriftrek(m, mt) {
        const g = new THREE.Group(), L = mt.lengte || 1.3, D = 0.5, H = mt.hoogte || 1.15, v0 = 0.25, wit = mat(0xf6f4ee);
        const zijkant = new THREE.Shape(); zijkant.moveTo(-D / 2, 0); zijkant.lineTo(D / 2, 0); zijkant.lineTo(D / 2, H); zijkant.lineTo(-D / 2, v0); zijkant.closePath();
        const zm = new THREE.MeshLambertMaterial({ color: 0xf6f4ee, side: THREE.DoubleSide });
        [-1, 1].forEach(k => { const o = new THREE.Mesh(new THREE.ShapeGeometry(zijkant), zm); o.rotation.y = Math.PI / 2; o.position.x = k * L / 2; g.add(o); });
        const hoek = Math.atan2(H - v0, D), lang = Math.hypot(D, H - v0);
        const plaat = doos(g, L, 0.03, lang, 0, (H + v0) / 2, 0, wit); plaat.rotation.x = hoek;
        const kleuren = [0x2e3a4a, 0x44546a, 0x1f2a36, 0x6b7a8f, 0x9aa7b4];
        for (let i = 0; i < Math.round(L / 0.2); i++) { const b = doos(g, 0.17, 0.012, 0.3, -L / 2 + 0.12 + i * 0.2, (H + v0) / 2 + 0.02, 0.04, mat(kleuren[i % 5])); b.rotation.x = hoek; }
        return { g, box: [L, H, D] };
      },
      /* Witte paneelradiator. Kijkt naar +z. */
      radiator(m, mt) {
        const g = new THREE.Group(), L = mt.lengte || 1.0, wit = mat(0xf4f4f1);
        doos(g, L, 0.55, 0.07, 0, 0.4, 0, wit);
        for (let i = 0; i < Math.round(L / 0.06); i++) doos(g, 0.012, 0.5, 0.012, -L / 2 + 0.05 + i * 0.06, 0.4, 0.04, mat(0xdcdcd8));
        return { g, box: [L, 0.7, 0.1] };
      },
      /* Witte vuilnisbak met groen deksel */
      vuilbak(m, mt) {
        const g = new THREE.Group();
        doos(g, 0.34, 0.62, 0.34, 0, 0.31, 0, mat(0xf3f2ee)); doos(g, 0.36, 0.05, 0.36, 0, 0.645, 0, mat(mt.kleur || 0x4fae5a));
        return { g, box: [0.36, 0.67, 0.36] };
      },
      /* Ficus: zwarte pot, dunne kromme stam, veel kleine donkergroene bladpakketjes */
      plant(m, mt) {
        const g = new THREE.Group(), h = mt.hoogte || 2.3;
        cyl(g, 0.2, 0.36, 0, 0.18, 0, mat(0x24262a), 0.17);
        const stam = mat(0x5b4a39);
        lat(g, 0, 0.3, 0, 0.05, h * 0.5, 0.02, 0.025, stam); lat(g, 0.05, h * 0.5, 0.02, -0.02, h * 0.8, 0, 0.018, stam);
        let sd = 11; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
        const kleuren = [0x2d4630, 0x35523a, 0x273d2a, 0x3e5e40].map(mat);
        for (let i = 0; i < 60; i++) {
          const t = 0.35 + rnd() * 0.65, hoek = rnd() * Math.PI * 2, br = 0.2 + 0.4 * (1 - Math.abs(t - 0.6) * 1.6);
          const o = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13 + rnd() * 0.12, 1), kleuren[i % 4]);
          o.scale.set(1, 0.7, 1);
          o.position.set(Math.cos(hoek) * br * (0.5 + rnd() * 0.7), h * t, Math.sin(hoek) * br * (0.5 + rnd() * 0.7)); g.add(o);
        }
        return { g, box: [0.55, h, 0.55] };
      }
    };
    const draai = { zuid: 0, noord: Math.PI, oost: Math.PI / 2, west: -Math.PI / 2 };
    const bewerk = /[?&]bewerk/.test(location.search);
    let bewaard = {};
    if (bewerk) { try { bewaard = JSON.parse(localStorage.getItem('bibMeubelPlekken') || '{}'); } catch (e) { bewaard = {}; } }
    const items = [];
    /* zet groep en botsingsblok op de plek en richting van het meubel */
    function zetItem(it) {
      const mt = it.mt, rot = mt.hoek != null ? mt.hoek * Math.PI / 180 : (draai[mt.kijkt || 'zuid'] || 0);
      it.rot = rot; it.g.rotation.y = rot; it.g.position.set(mt.x, 0, mt.z);
      let [bx, by, bz] = it.box; const c = Math.abs(Math.cos(rot)), sn = Math.abs(Math.sin(rot)); [bx, bz] = [bx * c + bz * sn, bx * sn + bz * c];   // gedraaid: het botsingsblok wordt breder of dieper
      it.bot.geometry.dispose(); it.bot.geometry = new THREE.BoxGeometry(bx, by, bz);
      it.bot.position.set(mt.x, by / 2, mt.z);
      it.bot.userData.bb = null; meubelCache = null; nabij = []; nabijX = 1e9;     // botsingsgegevens opnieuw berekenen
    }
    const verwijderd = new Set(Object.keys(bewaard).filter(n => bewaard[n] && bewaard[n].weg));
    const voegToe = orig => {
      const maak = bouw[orig.soort]; if (!maak || verwijderd.has(orig.naam)) return null;
      const mt = Object.assign({}, orig, bewaard[orig.naam] || {});
      const { g, box } = maak(mt, mt);
      g.userData.meubel = mt.naam || mt.soort; g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      scene.add(g);
      const bot = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ visible: false }));
      scene.add(bot); colliders.push(bot);
      const it = { mt, g, box, bot }; items.push(it); zetItem(it);
      return it;
    };
    const herbouw = it => {
      scene.remove(it.g);
      const r = bouw[it.mt.soort](it.mt, it.mt);
      it.g = r.g; it.box = r.box; it.g.userData.meubel = it.mt.naam || it.mt.soort; it.g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); scene.add(it.g); zetItem(it);
    };
    (C.meubels || []).forEach(voegToe);
    /* kopieen die in &bewerk gemaakt zijn (alleen in deze browser, tot Claude ze in gebouw-data.js zet) */
    Object.keys(bewaard).forEach(n => { const b = bewaard[n]; if (b && b.kopieVan && !(C.meubels || []).some(m => m.naam === n)) voegToe(Object.assign({}, b, { naam: n })); });
    if (bewerk) meubelsVerplaatsen(items, zetItem, verwijderd, voegToe, herbouw);
  }

  /* ---------- meubels en onderdelen van het model zelf verplaatsen of verwijderen: voeg &bewerk toe aan het adres ----------
     Klik iets aan en sleep het; R draait een meubel; "Verwijder" (of de Delete-toets) haalt het weg; "Kopieer plekken" geeft de lijst voor Claude.
     De wijzigingen blijven bewaard in deze browser (alleen met &bewerk) tot Claude ze in gebouw-data.js heeft gezet. */
  function meubelsVerplaatsen(items, zetItem, verwijderd, voegToe, herbouw) {
    const draaiVolgorde = ['zuid', 'west', 'noord', 'oost'];
    let gekozen = null, sleep = null, boven = false;   // gekozen: { it } (meubel) of { o } (onderdeel van het model)
    const kader = new THREE.BoxHelper(new THREE.Object3D(), 0xff9a1f); kader.visible = false; scene.add(kader);
    const paneel = document.createElement('div');
    paneel.style.cssText = 'position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:60;background:rgba(30,30,34,.88);color:#fff;font:14px system-ui,sans-serif;padding:8px 10px;border-radius:10px;display:flex;gap:6px;align-items:center;flex-wrap:wrap;max-width:96vw;justify-content:center';
    const knop = (tekst, fn) => { const b = document.createElement('button'); b.textContent = tekst; b.style.cssText = 'font:inherit;padding:6px 10px;border-radius:8px;border:0;background:#f4f1ea;color:#222;cursor:pointer'; b.addEventListener('click', fn); b.addEventListener('pointerdown', e => e.stopPropagation()); paneel.appendChild(b); return b; };
    const tekst = document.createElement('span'); tekst.style.cssText = 'margin-right:6px'; paneel.appendChild(tekst);
    const meld = t => { tekst.textContent = t; };
    meld('Klik een meubel of onderdeel van het gebouw en sleep het.');
    const ververs = () => { meubelCache = null; nabij = []; nabijX = 1e9; };
    const bewaar = () => { try {
      const o = {}; items.forEach(it => { o[it.mt.naam] = it.mt.kopieVan ? Object.assign({}, it.mt) : Object.assign({ x: +it.mt.x.toFixed(2), z: +it.mt.z.toFixed(2), kijkt: it.mt.kijkt || 'zuid' }, it.mt.hoek != null ? { hoek: it.mt.hoek } : {}, it.mt.lengte ? { lengte: +it.mt.lengte.toFixed(2) } : {}); });
      verwijderd.forEach(n => { o[n] = { weg: true }; });
      localStorage.setItem('bibMeubelPlekken', JSON.stringify(o));
      localStorage.setItem('bibModelAanpassingen', JSON.stringify(modelStaat));
    } catch (e) {} };
    /* draaiknop: oranje bol op een stokje voor het gekozen meubel; sleep hem rond het meubel om vrij te draaien (stapjes van 5 graden) */
    const knopG = new THREE.Group(), knopBol = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 14), new THREE.MeshBasicMaterial({ color: 0xff7a00, depthTest: false }));
    knopBol.renderOrder = 999; knopBol.userData.draaiknop = true; knopG.add(knopBol);
    const knopRing = new THREE.Mesh(new THREE.RingGeometry(0.17, 0.2, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false, side: THREE.DoubleSide })); knopRing.rotation.x = -Math.PI / 2; knopRing.renderOrder = 998; knopG.add(knopRing);
    knopG.visible = false; scene.add(knopG);
    const hoekVan = it => it.rot || 0;
    const zetKnop = () => {
      if (!gekozen || !gekozen.it) { knopG.visible = false; return; }
      const it = gekozen.it, r = hoekVan(it), afst = Math.max(it.box[0], it.box[2]) / 2 + 0.45;
      knopG.position.set(it.mt.x + Math.sin(r) * afst, 0.35, it.mt.z + Math.cos(r) * afst); knopG.visible = true;
    };
    const knoopVan = k => k ? (k.it ? k.it.g : k.o.c) : null;
    const kies = k => { gekozen = k; zetKnop(); if (k) { kader.setFromObject(knoopVan(k)); kader.visible = true; meld((k.it ? k.it.mt.naam : k.o.sleutel.split('@')[0] || 'onderdeel') + (k.it ? ' (sleep het meubel; draai met de oranje bol)' : ' (onderdeel van het gebouw; sleep of verwijder)')); } else kader.visible = false; };
    const draai = () => { if (!gekozen || !gekozen.it) return; const m = gekozen.it.mt, k = m.kijkt || 'zuid'; m.kijkt = draaiVolgorde[(draaiVolgorde.indexOf(k) + 1) % 4]; delete m.hoek; zetItem(gekozen.it); kader.setFromObject(gekozen.it.g); zetKnop(); bewaar(); };
    const zetModel = o => { const st = modelStaat[o.sleutel] || (modelStaat[o.sleutel] = { dx: 0, dz: 0 }); o.c.position.x = o.basis.x + st.dx; o.c.position.z = o.basis.z + st.dz; o.c.updateMatrixWorld(true); o.c.traverse(m => { m.userData.bb = null; }); ververs(); };
    const verwijder = () => {
      if (!gekozen) return;
      if (gekozen.it) { const it = gekozen.it; scene.remove(it.g, it.bot); const i = colliders.indexOf(it.bot); if (i >= 0) colliders.splice(i, 1); items.splice(items.indexOf(it), 1); verwijderd.add(it.mt.naam); }
      else { const o = gekozen.o; o.c.traverse(m => { const i = colliders.indexOf(m); if (i >= 0) colliders.splice(i, 1); }); o.c.parent.remove(o.c); o.weg = true; (modelStaat[o.sleutel] || (modelStaat[o.sleutel] = { dx: 0, dz: 0 })).weg = true; }
      ververs(); kies(null); meld('Verwijderd. ("Alles terugzetten" haalt het terug.)'); bewaar();
    };
    knop('Draai (R)', draai);
    const fijn = d => { if (!gekozen || !gekozen.it) { meld('Klik eerst een meubel aan.'); return; } const it = gekozen.it; let gr = (it.mt.hoek != null ? it.mt.hoek : Math.round(it.rot * 180 / Math.PI)) + d; gr = Math.round(((gr % 360) + 360) % 360 * 2) / 2; it.mt.hoek = gr; it.mt.kijkt = ['zuid', 'oost', 'noord', 'west'][Math.round(gr / 90) % 4]; zetItem(it); kader.setFromObject(it.g); zetKnop(); bewaar(); meld(it.mt.naam + ': ' + gr + ' graden'); };
    knop('Fijn links (,)', () => fijn(-0.5)); knop('Fijn rechts (.)', () => fijn(0.5));
    knop('Verwijder', verwijder);
    const kopieer = () => {
      if (!gekozen) { meld('Klik eerst een meubel aan om te kopiëren.'); return; }
      if (!gekozen.it) { meld('Onderdelen van het gebouw kun je verplaatsen en verwijderen, maar niet kopiëren.'); return; }
      const bron = gekozen.it.mt, basis = (bron.kopieVan || bron.naam).replace(/ kopie \d+$/, '');
      const namen = new Set(items.map(it => it.mt.naam).concat([...verwijderd], (C.meubels || []).map(m => m.naam)));
      let k = 1; while (namen.has(basis + ' kopie ' + k)) k++;
      const nieuw = voegToe(Object.assign({}, bron, { naam: basis + ' kopie ' + k, kopieVan: bron.kopieVan || bron.naam, x: bron.x + 0.5, z: bron.z + 0.5 }));
      if (nieuw) { kies({ it: nieuw }); bewaar(); meld(nieuw.mt.naam + ' gemaakt: sleep hem naar de juiste plek.'); }
    };
    knop('Kopieer (K)', kopieer);
    const LENGTES = { rek: 2, 'tafel-hoog': 2.4, tafel: 1.6, tijdschriftrek: 1.3, radiator: 1.0 };   // meubels die je korter of langer kunt maken
    const lengte = delta => {
      if (!gekozen || !gekozen.it) { meld('Klik eerst een rek of tafel aan.'); return; }
      const mt = gekozen.it.mt; if (!LENGTES[mt.soort]) { meld('Dit meubel kun je niet korter of langer maken.'); return; }
      mt.lengte = Math.max(0.3, Math.min(8, Math.round(((mt.lengte || LENGTES[mt.soort]) + delta) * 20) / 20));
      herbouw(gekozen.it); kader.setFromObject(gekozen.it.g); zetKnop(); bewaar(); meld(mt.naam + ': ' + mt.lengte.toFixed(2) + ' m lang');
    };
    knop('Korter ([)', () => lengte(-0.1)); knop('Langer (])', () => lengte(0.1));
    const zetBoven = () => { testCam = boven ? { fov: 55, p: [speler.x, 11.5, speler.z + 0.7], t: [speler.x, 0, speler.z] } : null; };
    setInterval(() => { if (boven) zetBoven(); }, 100);   // het overzicht volgt het poppetje: loop naar een andere ruimte en je ziet die van boven
    const bovenKnop = knop('Van boven kijken', () => {
      boven = !boven; bovenKnop.textContent = boven ? 'Terug naar lopen' : 'Van boven kijken';
      zetBoven();
    });
    knop('Kopieer lijst voor Claude', () => {
      const regels = items.map(it => it.mt.naam + ': x ' + it.mt.x.toFixed(2) + ', z ' + it.mt.z.toFixed(2) + ', kijkt ' + (it.mt.kijkt || 'zuid') + (it.mt.hoek != null ? ', hoek ' + it.mt.hoek : '') + (it.mt.lengte && LENGTES[it.mt.soort] ? ', lengte ' + it.mt.lengte.toFixed(2) : '') + (it.mt.kopieVan ? ' (kopie van ' + it.mt.kopieVan + ')' : ''));
      verwijderd.forEach(n => regels.push(n + ': WEG'));
      Object.keys(modelStaat).forEach(k => { const st = modelStaat[k]; if (st.weg) regels.push('gebouw ' + k + ': WEG'); else if (st.dx || st.dz) regels.push('gebouw ' + k + ': dx ' + (st.dx || 0).toFixed(2) + ', dz ' + (st.dz || 0).toFixed(2)); });
      const uit = regels.join('\n');
      const klaar = () => meld('Gekopieerd! Plak het nu in het gesprek met Claude.');
      const val = () => { const t = document.createElement('textarea'); t.value = uit; t.style.cssText = 'width:90vw;height:40vh'; paneel.appendChild(t); t.select(); meld('Kopieer deze tekst (Ctrl+C) en plak hem bij Claude.'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(uit).then(klaar, val); else val();
    });
    knop('Alles terugzetten', () => { try { localStorage.removeItem('bibMeubelPlekken'); localStorage.removeItem('bibModelAanpassingen'); } catch (e) {} location.reload(); });
    document.body.appendChild(paneel);
    window.addEventListener('keydown', e => { if (e.code === 'KeyR') draai(); if (e.code === 'Comma') fijn(-0.5); if (e.code === 'Period') fijn(0.5); if (e.code === 'Delete') verwijder(); if (e.code === 'KeyK') kopieer(); if (e.code === 'BracketLeft') lengte(-0.1); if (e.code === 'BracketRight') lengte(0.1); });

    const vlak = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), pt = new THREE.Vector3(), ray = new THREE.Raycaster();
    const wijs = e => { const r = canvas.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera); return ray; };
    const zichtbaar = o => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
    canvas.addEventListener('pointerdown', e => {
      if (gekozen && gekozen.it && knopG.visible && wijs(e).intersectObject(knopBol, false).length) {   // aan de draaiknop gepakt
        e.stopImmediatePropagation(); e.preventDefault(); canvas.setPointerCapture(e.pointerId); sleep = { id: e.pointerId, draaien: true }; return;
      }
      const doel = items.map(it => it.g); if (modelWortel) doel.push(modelWortel);
      const treffer = wijs(e).intersectObjects(doel, true).filter(h => zichtbaar(h.object))[0];
      let k = null;
      if (treffer) {
        for (let o = treffer.object; o && !k; o = o.parent) {
          const it = items.find(x => x.g === o); if (it) { k = { it }; break; }
          const mo = modelOnderdelen.find(x => x.c === o && !x.weg); if (mo) k = { o: mo };
        }
      }
      if (!k && wijs(e).ray.intersectPlane(vlak, pt)) {   // dunne wandjes en kastjes van het model zijn van boven nauwelijks te raken: kijk ook naar de plek op de vloer
        let beste = null, kleinste = 1e9;
        modelOnderdelen.forEach(o => {
          if (o.weg) return; const b = new THREE.Box3().setFromObject(o.c), a = (b.max.x - b.min.x + 0.3) * (b.max.z - b.min.z + 0.3);
          if (a < 2.5 && b.max.y > 0.3 && pt.x > b.min.x - 0.15 && pt.x < b.max.x + 0.15 && pt.z > b.min.z - 0.15 && pt.z < b.max.z + 0.15 && a < kleinste) { beste = o; kleinste = a; }
        });
        if (beste) k = { o: beste };
      }
      if (!k) { kies(null); return; }               // niets (aan te passen) geraakt: gewoon rondkijken of lopen
      e.stopImmediatePropagation(); e.preventDefault();
      kies(k); canvas.setPointerCapture(e.pointerId);
      const raak = wijs(e).ray.intersectPlane(vlak, pt) ? pt.clone() : null;
      if (k.it) sleep = { id: e.pointerId, dx: raak ? k.it.mt.x - raak.x : 0, dz: raak ? k.it.mt.z - raak.z : 0 };
      else { const st = modelStaat[k.o.sleutel] || { dx: 0, dz: 0 }; sleep = { id: e.pointerId, dx: raak ? (st.dx || 0) - raak.x : 0, dz: raak ? (st.dz || 0) - raak.z : 0 }; }
    }, true);
    canvas.addEventListener('pointermove', e => {
      if (!sleep || e.pointerId !== sleep.id || !gekozen) return;
      e.stopImmediatePropagation();
      if (!wijs(e).ray.intersectPlane(vlak, pt)) return;
      if (sleep.draaien) {
        const it = gekozen.it; let gr = Math.round(Math.atan2(pt.x - it.mt.x, pt.z - it.mt.z) * 180 / Math.PI * 2) / 2; gr = ((gr % 360) + 360) % 360; const kw = Math.round(gr / 90) * 90; if (Math.abs(gr - kw) <= 1) gr = kw % 360;   // vlak bij een kwartslag klikt hij vast
        it.mt.hoek = gr; it.mt.kijkt = ['zuid', 'oost', 'noord', 'west'][Math.round(gr / 90) % 4];
        zetItem(it); kader.setFromObject(it.g); zetKnop(); meld(it.mt.naam + ': gedraaid op ' + gr + ' graden'); return;
      }
      const nx = Math.round((pt.x + sleep.dx) * 20) / 20, nz = Math.round((pt.z + sleep.dz) * 20) / 20;   // stapjes van 5 cm
      if (gekozen.it) { gekozen.it.mt.x = nx; gekozen.it.mt.z = nz; zetItem(gekozen.it); }
      else { const st = modelStaat[gekozen.o.sleutel] || (modelStaat[gekozen.o.sleutel] = { dx: 0, dz: 0 }); st.dx = nx; st.dz = nz; zetModel(gekozen.o); }
      kader.setFromObject(knoopVan(gekozen)); zetKnop();
    }, true);
    const los = e => { if (sleep && e.pointerId === sleep.id) { e.stopImmediatePropagation(); sleep = null; bewaar(); } };
    canvas.addEventListener('pointerup', los, true); canvas.addEventListener('pointercancel', los, true);
  }

  /* ---------- onderdelen van het model (kastjes, tafels, ...) verwijderen of verplaatsen ----------
     In gebouw-data.js bij "modelAanpassingen": { onderdeel: "naam@x,z", weg: true }  of  { onderdeel: "naam@x,z", dx: 0.3, dz: -0.1 }.
     Met &bewerk kun je ze zelf aanklikken, slepen en verwijderen. */
  const modelOnderdelen = [];            // { sleutel, c, basis }
  const modelStaat = {};                 // sleutel -> { dx, dz, weg }: het verschil met het oorspronkelijke model
  let modelWortel = null;
  function modelAanpassen(wortel) {
    modelWortel = wortel;
    let houder = null;
    for (let rij = [wortel]; rij.length && !houder;) { const o = rij.shift(); if (!o.isMesh && o.children.length >= 10) houder = o; else rij.push(...o.children); }   // het hoogste knooppunt met veel onderdelen
    if (!houder) return;
    const G = MODEL.grens;
    let lokaal = {};
    if (/[?&]bewerk/.test(location.search)) { try { lokaal = JSON.parse(localStorage.getItem('bibModelAanpassingen') || '{}'); } catch (e) { lokaal = {}; } }
    (C.modelAanpassingen || []).forEach(a => { modelStaat[a.onderdeel] = { dx: a.dx || 0, dz: a.dz || 0, weg: !!a.weg }; });
    Object.keys(lokaal).forEach(k => { modelStaat[k] = lokaal[k]; });
    houder.children.slice().forEach(c => {
      const b = new THREE.Box3().setFromObject(c); if (b.isEmpty()) return;
      const m = b.getCenter(new THREE.Vector3()), z = b.getSize(new THREE.Vector3());
      const sleutel = (c.name || 'onderdeel') + '@' + m.x.toFixed(1) + ',' + m.z.toFixed(1);
      const klein = z.x < 4 && z.z < 4 && z.y > 0.1 && m.x > G.xmin && m.x < G.xmax && m.z > G.zmin && m.z < G.zmax;
      if (!klein) return;
      const o = { sleutel, c, basis: { x: c.position.x, z: c.position.z } };
      const st = modelStaat[sleutel];
      if (st && st.weg) { c.parent.remove(c); o.weg = true; }
      else if (st) { c.position.x = o.basis.x + (st.dx || 0); c.position.z = o.basis.z + (st.dz || 0); }
      modelOnderdelen.push(o);
    });
  }

  /* Het model laden. Geeft een belofte terug die klaar is als het gebouw er staat (echt model of tijdelijke zaal). */
  let modelGeladen = false;
  function laadModel() {
    return new Promise(klaar => {
      const terugval = () => { bouwTijdelijkeZaal(); API.echt = false; klaar(); };
      if (!THREE.GLTFLoader || location.protocol === 'file:') return terugval();
      new THREE.GLTFLoader().load(MODEL.url, gltf => {
        const wortel = gltf.scene; wortel.scale.setScalar(MODEL.schaal); scene.add(wortel);
        wortel.updateMatrixWorld(true);
        modelAanpassen(wortel); wortel.updateMatrixWorld(true);
        const G = MODEL.grens; let startPunt = null;
        const weg = [];
        wortel.traverse(o => {
          // benoemde punten in het model, voor de lagen: start, fiche-N, plek-<naam>
          const nm = (o.name || '').toLowerCase(); let m, sleutel = null;
          if ((m = /^fiche[-_ ]?(\d+)/.exec(nm))) sleutel = 'fiche-' + m[1];
          else if (/^start/.test(nm)) sleutel = 'start';
          else if ((m = /^plek[-_ ]([a-z0-9_-]+)/.exec(nm))) sleutel = 'plek-' + m[1];
          if (sleutel) {
            const v = new THREE.Vector3(); o.getWorldPosition(v);
            API.punten[sleutel] = { x: v.x, y: v.y, z: v.z };
            if (sleutel === 'start') startPunt = v;
          }
          if (!o.isMesh) return;
          // eenvoudige, snelle materialen; vlakken van beide kanten zichtbaar (SketchUp-vlakken hebben maar één goede kant)
          const mat = o.material; let glas = false;
          if (/block|dallen/i.test(mat.name || "")) {
            o.material = new THREE.MeshLambertMaterial({ color: 0xb4d3cd, side: THREE.DoubleSide, transparent: true, opacity: 0.8 }); glas = true;   // glasdallen: troebel glas
          } else if (/glass|glas/i.test(mat.name || "")) {
            o.material = new THREE.MeshLambertMaterial({ color: 0xbfe3ee, side: THREE.DoubleSide, transparent: true, opacity: 0.28, depthWrite: false }); glas = true;
          } else
          o.material = new THREE.MeshLambertMaterial({
            color: mat.color ? mat.color.clone() : 0xdddddd, map: mat.map || null, side: THREE.DoubleSide,
            transparent: !!mat.transparent, opacity: mat.opacity === undefined ? 1 : mat.opacity
          });
          if (!glas) { o.castShadow = true; o.receiveShadow = true; }
          const bb = new THREE.Box3().setFromObject(o), c = bb.getCenter(new THREE.Vector3());
          if (c.x < G.xmin || c.x > G.xmax || c.z < G.zmin || c.z > G.zmax) { weg.push(o); return; }   // losse voorwerpen buiten het gebouw
          // alleen de ingangsdeur is doorloopbaar; het andere glas blijft een wand
          const D = MODEL.deur;
          const inDeur = bb.max.x > D.xmin && bb.min.x < D.xmax && bb.max.z > D.zmin && bb.min.z < D.zmax;
          if (bb.min.y < 1.6 && bb.max.y > 0.25 && !(glas && inDeur)) colliders.push(o);
        });
        weg.forEach(o => { o.visible = false; });

        bouwVloerEnPlafond(G);   // het model heeft geen vloer of plafond
        plaatsRekken();          // en geen rekken
        plaatsMeubels();         // en geen stoelen, tafels, planten
        plaatsDecor();           // en geen ramen in de gevel
        scene.background = new THREE.Color(0xcfd8dc); scene.fog = new THREE.Fog(0xcfd8dc, 20, 70);

        speler.x = startPunt ? startPunt.x : MODEL.start[0]; speler.z = startPunt ? startPunt.z : MODEL.start[1];
        speler.y = 1.6;
        speler.yaw = MODEL.startRichting || 0;
        API.echt = true;
        modelGeladen = true;
        klaar();
      }, undefined, terugval);
    });
  }

  /* ---------- besturing ---------- */
  const toets = {};
  window.addEventListener('keydown', e => { toets[e.code] = true; });
  window.addEventListener('keyup', e => { toets[e.code] = false; });

  const stick = $('stick'), knop = stick.querySelector('i');
  let stickId = null, stickX = 0, stickZ = 0;
  const stickBeweeg = e => {
    const r = stick.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const max = r.width / 2 - 10, l = Math.hypot(dx, dy);
    if (l > max) { dx = dx / l * max; dy = dy / l * max; }
    knop.style.transform = `translate(${dx}px, ${dy}px)`;
    stickX = dx / max; stickZ = -dy / max;
  };
  stick.addEventListener('pointerdown', e => { stickId = e.pointerId; stick.setPointerCapture(e.pointerId); stickBeweeg(e); e.preventDefault(); });
  stick.addEventListener('pointermove', e => { if (e.pointerId === stickId) stickBeweeg(e); });
  const stickLos = e => { if (e.pointerId !== stickId) return; stickId = null; stickX = stickZ = 0; knop.style.transform = ''; };
  stick.addEventListener('pointerup', stickLos); stick.addEventListener('pointercancel', stickLos);

  /* slepen = rondkijken, kort tikken of klikken = het poppetje loopt daarheen (of: tik op het poppetje, dan krijgt de laag een seintje) */
  let kijkId = null, kijkX = 0, kijkY = 0, startX = 0, startY = 0, startT = 0, verplaatst = 0;
  canvas.addEventListener('pointerdown', e => {
    if (kijkId !== null) return;
    kijkId = e.pointerId; kijkX = startX = e.clientX; kijkY = startY = e.clientY; startT = performance.now(); verplaatst = 0;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if (e.pointerId !== kijkId) return;
    const dx = e.clientX - kijkX, dy = e.clientY - kijkY;
    verplaatst = Math.max(verplaatst, Math.hypot(e.clientX - startX, e.clientY - startY));
    speler.yaw -= dx * 0.0055;
    speler.pitch = Math.max(-0.7, Math.min(0.7, speler.pitch - dy * 0.0045));
    speler.hoogte = Math.max(0.08, Math.min(0.95, speler.hoogte + dy * 0.004));
    kijkX = e.clientX; kijkY = e.clientY;
  });
  const kijkLos = e => {
    if (e.pointerId !== kijkId) return;
    kijkId = null;
    if (e.type === 'pointerup' && verplaatst < 8 && performance.now() - startT < 450 && !API.pauze) tikOpScherm(e.clientX, e.clientY);
  };
  canvas.addEventListener('pointerup', kijkLos); canvas.addEventListener('pointercancel', kijkLos);

  const vloerVlak = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const tikStraal = new THREE.Raycaster();
  function tikOpScherm(cx, cy) {
    const r = canvas.getBoundingClientRect();
    if (weergave === 'derde') {
      const p = avatar.position.clone(); p.y += 0.75; p.project(camera);
      const sx = (p.x * 0.5 + 0.5) * r.width + r.left, sy = (-p.y * 0.5 + 0.5) * r.height + r.top;
      if (Math.hypot(cx - sx, cy - sy) < 60) { haken.tikSpeler.forEach(f => f()); return; }
    }
    tikStraal.setFromCamera(new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), camera);
    vloerVlak.constant = -(speler.y - 1.6);
    const punt = new THREE.Vector3();
    if (!tikStraal.ray.intersectPlane(vloerVlak, punt)) return;
    const muur = tikStraal.intersectObjects(colliders, false)[0];
    const afstandVloer = punt.distanceTo(tikStraal.ray.origin);
    if (muur && muur.distance < afstandVloer) {
      const d = tikStraal.ray.direction;
      punt.set(muur.point.x - d.x * 0.7, punt.y, muur.point.z - d.z * 0.7);
    }
    if (Math.hypot(punt.x - speler.x, punt.z - speler.z) > 40) return;
    ziel = { x: punt.x, z: punt.z };
    doel.position.set(punt.x, speler.y - 1.6 + 0.03, punt.z); doel.visible = true;
  }
  let ziel = null;

  const zoom = delta => { speler.afstand = Math.max(2.4 * PS, Math.min(10 * PS, speler.afstand + delta * PS)); };
  canvas.addEventListener('wheel', e => { e.preventDefault(); zoom(e.deltaY * 0.004); }, { passive: false });
  window.addEventListener('keydown', e => { if (e.code === 'Equal' || e.code === 'NumpadAdd') zoom(-0.6); if (e.code === 'Minus' || e.code === 'NumpadSubtract') zoom(0.6); });

  function zetWeergave(w) {
    weergave = w;
    camera.fov = w === 'derde' ? 60 : 72; camera.updateProjectionMatrix();
    if (plafondMesh) plafondMesh.visible = w === 'eerste';
    $('weergave').textContent = API.teksten[w];
    haken.weergave.forEach(f => f(w));
  }
  $('zoomMin').addEventListener('click', () => zoom(1.0));
  $('zoomPlus').addEventListener('click', () => zoom(-1.0));
  $('weergave').addEventListener('click', () => zetWeergave(weergave === 'derde' ? 'eerste' : 'derde'));
  window.addEventListener('keydown', e => { if (e.code === 'KeyV' && !API.pauze) zetWeergave(weergave === 'derde' ? 'eerste' : 'derde'); });

  /* ---------- botsing ---------- */
  const straal = new THREE.Raycaster();
  /* alleen de voorwerpen dichtbij de speler testen (het model is groot) */
  let nabij = [], nabijX = 1e9, nabijZ = 1e9;
  function nabijVan(x, z) { return colliders.filter(o => { if (!o.userData.bb) o.userData.bb = new THREE.Box3().setFromObject(o); const b = o.userData.bb; return b.max.x > x - 2 && b.min.x < x + 2 && b.max.z > z - 2 && b.min.z < z + 2; }); }
  function verversNabij() {
    if (nabij.length && Math.hypot(speler.x - nabijX, speler.z - nabijZ) < 0.7) return;
    nabijX = speler.x; nabijZ = speler.z;
    nabij = colliders.filter(o => {
      if (!o.userData.bb) o.userData.bb = new THREE.Box3().setFromObject(o);
      const b = o.userData.bb;
      return b.max.x > speler.x - 6 && b.min.x < speler.x + 6 && b.max.z > speler.z - 6 && b.min.z < speler.z + 6;
    });
  }
  /* Meubels (tafels, stoelen, kasten): kleine voorwerpen tellen als een blok van onder tot boven,
     zodat je er niet onderdoor of tussen de poten door kunt lopen. */
  let meubelCache = null, meubelAantal = -1;
  function meubelDozen() {
    if (meubelCache && meubelAantal === colliders.length) return meubelCache;
    meubelAantal = colliders.length;
    meubelCache = colliders.map(o => { if (!o.userData.bb) o.userData.bb = new THREE.Box3().setFromObject(o); return o.userData.bb; })
      .filter(b => (b.max.y - b.min.y) > 0.15 && (b.max.y - b.min.y) < 1.8 && b.min.y < 1.1 && (b.max.x - b.min.x) < 3.2 && (b.max.z - b.min.z) < 3.2
                   && ((b.max.x - b.min.x) > 0.6 || (b.max.z - b.min.z) > 0.6));   // tafels en kasten wel, losse stoelpoten en kleine dingen niet
    return meubelCache;
  }

  /* Zou een stap (dx, dz) vanaf punt (x, z) tegen iets aan botsen? Gebruikt door het gebouw en door de bereikbaarheidstest. */
  function blokkeertOp(x, z, dx, dz, lijst) {
    const l = Math.hypot(dx, dz); if (!l) return false;
    const R = 0.2, nx = x + dx, nz = z + dz;
    for (const b of meubelDozen()) {
      const binnen = (px, pz) => px > b.min.x - R && px < b.max.x + R && pz > b.min.z - R && pz < b.max.z + R;
      if (binnen(nx, nz) && !binnen(x, z)) return true;
    }
    const rx = dx / l, rz = dz / l, px = -rz, pz = rx;           // looprichting en dwars daarop
    for (const zij of [0, -0.24, 0.24]) {                          // drie stralen: een lichaam, geen punt
      straal.set(new THREE.Vector3(x + px * zij, speler.y - 0.7, z + pz * zij), new THREE.Vector3(rx, 0, rz));
      straal.far = l + 0.3;
      if (straal.intersectObjects(lijst, false).length > 0) return true;
    }
    return false;
  }
  function geblokkeerd(dx, dz) {
    verversNabij();
    return blokkeertOp(speler.x, speler.z, dx, dz, nabij);
  }

  /* Hoeveel vrije ruimte (tot 3 m) is er rond een punt? Handig om iets neer te zetten op een open plek. */
  function vrijeRuimte(x, z) {
    let min = 3; const o = new THREE.Vector3(x, 0.9, z);
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      straal.set(o, new THREE.Vector3(Math.cos(a), 0, Math.sin(a))); straal.far = 3;
      const h = straal.intersectObjects(colliders, false)[0];
      if (h && h.distance < min) min = h.distance;
    }
    return min;
  }

  /* ---------- wandelen en camera ---------- */
  let loopt = false, afstGlad = 5.2 * (C.spelerSchaal || 1), aGlad = 0.6;
  const vel = { x: 0, z: 0 };
  const klok = new THREE.Clock();
  function lus() {
    requestAnimationFrame(lus);
    bijwerken(Math.min(klok.getDelta(), 0.1), klok.elapsedTime);
    renderer.render(scene, camera);
  }
  let testTijd = 0, testCam = null;
  function bijwerken(dt, t) {
    if (!API.pauze) {
      let ix = stickX, iz = stickZ;
      if (toets.KeyW || toets.ArrowUp) iz += 1;
      if (toets.KeyS || toets.ArrowDown) iz -= 1;
      if (toets.KeyD || toets.ArrowRight) ix += 1;
      if (toets.KeyA || toets.ArrowLeft) ix -= 1;
      if (toets.KeyQ) speler.yaw += 1.6 * dt;
      if (toets.KeyE) speler.yaw -= 1.6 * dt;
      const l = Math.hypot(ix, iz);
      let vx = 0, vz = 0;
      if (l > 0.05) {
        ziel = null; doel.visible = false;
        if (l > 1) { ix /= l; iz /= l; }
        const s = 2.1 * PS;
        vx = (-Math.sin(speler.yaw) * iz + Math.cos(speler.yaw) * ix) * s;
        vz = (-Math.cos(speler.yaw) * iz - Math.sin(speler.yaw) * ix) * s;
      } else if (ziel) {
        const dx = ziel.x - speler.x, dz = ziel.z - speler.z, d = Math.hypot(dx, dz);
        if (d < 0.12) { ziel = null; doel.visible = false; }
        else { const s = Math.min(2.1 * PS, d * 4 * PS); vx = dx / d * s; vz = dz / d * s; }
      }
      // vloeiend optrekken en afremmen (voorkomt schokkerige beweging)
      vel.x += (vx - vel.x) * Math.min(1, dt * 9); vel.z += (vz - vel.z) * Math.min(1, dt * 9);
      if (Math.hypot(vel.x, vel.z) < 0.04 && !vx && !vz) { vel.x = vel.z = 0; }
      vx = vel.x * dt; vz = vel.z * dt;
      loopt = false;
      if (vx || vz) {
        if (!geblokkeerd(vx, vz)) { speler.x += vx; speler.z += vz; loopt = true; }
        else if (!geblokkeerd(vx, 0)) { speler.x += vx; loopt = true; }
        else if (!geblokkeerd(0, vz)) { speler.z += vz; loopt = true; }
        else if (ziel) { ziel = null; doel.visible = false; }
      }
    } else { loopt = false; vel.x = vel.z = 0; }

    if (modelGeladen) {   // niet buiten het gebouw wandelen
      const G = MODEL.grens;
      speler.x = Math.max(G.xmin + 0.4, Math.min(G.xmax - 0.4, speler.x));
      speler.z = Math.max(G.zmin + 0.4, Math.min(G.zmax - 0.4, speler.z));
    }
    /* camera en poppetje */
    const vloerY = speler.y - 1.6;
    const wandel = loopt ? Math.floor(t * 7) % 4 : 0;
    avatar.visible = avatarSchaduw.visible = weergave === 'derde';
    avatar.position.set(speler.x, vloerY + (loopt ? Math.abs(Math.sin(t * 7)) * 0.06 : 0), speler.z);
    avatarSchaduw.position.set(speler.x, vloerY + 0.02, speler.z);
    if (kaders.length) avatar.material.map = kaders[kaders.length > 2 ? (wandel === 1 ? 1 : wandel === 3 ? 2 : 0) : 0];
    if (testCam) { camera.fov = testCam.fov || 50; camera.updateProjectionMatrix(); camera.position.set(testCam.p[0], testCam.p[1], testCam.p[2]); camera.lookAt(testCam.t[0], testCam.t[1], testCam.t[2]); }
    else if (weergave === 'derde') {
      /* Camera achter het poppetje. Staat er iets tussen (zuil, muur)? Dan komt de camera hoger, zodat je erover heen kijkt,
         in plaats van er vlak voor te gaan hangen. Pas als dat niet kan, komt hij dichterbij. */
      const kop = new THREE.Vector3(speler.x, vloerY + 1.2 * PS, speler.z);
      verversNabij();
      const richtingVoor = a => { const ca = Math.cos(a); return new THREE.Vector3(Math.sin(speler.yaw) * ca, Math.sin(a), Math.cos(speler.yaw) * ca); };
      const vrij = (a, afst) => {
        straal.set(kop, richtingVoor(a)); straal.far = afst + 0.5;
        const h = straal.intersectObjects(nabij, false)[0];
        return h ? h.distance - 0.6 : afst;                     // hoeveel ruimte is er achter hem?
      };
      let aKies = speler.hoogte, afstKies = speler.afstand, gevonden = false;
      for (const extra of [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1.0]) {
        const a = Math.min(1.3, speler.hoogte + extra);
        if (vrij(a, speler.afstand) >= speler.afstand) { aKies = a; gevonden = true; break; }
      }
      if (!gevonden) {                                           // overal iets: hoog, en zo ver als het kan
        aKies = 1.3; afstKies = Math.max(1.8, vrij(aKies, speler.afstand));
      }
      // vloeiend: omhoog gaat snel (anders staat er even een zuil voor), terug naar beneden langzaam
      aGlad += (aKies - aGlad) * Math.min(1, dt * (aKies > aGlad ? 10 : 2));
      if (afstKies < afstGlad) afstGlad = afstKies; else afstGlad += (afstKies - afstGlad) * Math.min(1, dt * 3);
      camera.position.copy(kop).addScaledVector(richtingVoor(aGlad), afstGlad);
      camera.lookAt(kop.x, kop.y - 0.05, kop.z);
    } else {
      camera.position.set(speler.x, speler.y - 1.6 * (1 - PS), speler.z);
      camera.rotation.set(speler.pitch, speler.yaw, 0);
    }
    zon.target.position.set(speler.x, 0, speler.z); zon.position.set(speler.x + 5, 11, speler.z + 3.5);   // de schaduwen volgen het poppetje
    haken.frame.forEach(f => f(dt, t));
  }

  /* ================================================================
     DE LIJST VOOR LAGEN  (window.Gebouw)
     ================================================================ */
  const haken = { frame: [], tikSpeler: [], weergave: [] };
  const API = window.Gebouw = {
    THREE, scene, camera, renderer, canvas,

    /* De wereld */
    colliders,                 // alles waar je tegenaan botst (lijst van meshes)
    punten: {},                // benoemde punten uit het model: 'start', 'fiche-3', 'plek-leeshoek' → { x, y, z }
    echt: false,               // true = het echte model, false = de tijdelijke zaal
    config: C,                 // de gegevens uit gebouw-data.js

    /* De speler. x en z zijn meters; yaw is de kijkrichting; y is het oogpunt (vloer + 1,6 m) */
    speler,
    zet(x, z, yaw) { speler.x = x; speler.z = z; if (yaw !== undefined) speler.yaw = yaw; ziel = null; },

    /* true = het spel staat stil (een scherm is open). De laag zet dit aan en uit. */
    pauze: true,

    /* Weergave: 'derde' (je ziet het poppetje) of 'eerste' (door zijn ogen). */
    get weergave() { return weergave; },
    zetWeergave,
    teksten: { derde: 'Door mijn ogen kijken', eerste: 'Mijzelf zien' },   // tekst op de knop, per weergave

    /* Het uiterlijk van het poppetje: een lijst van 3 THREE-texturen (stil, linkervoet, rechtervoet). */
    zetAvatar(texturen) { kaders = texturen && texturen.length ? texturen : standaardKaders(); avatar.material.map = kaders[0]; avatar.material.needsUpdate = true; },

    /* Hulpjes */
    zoom,                      // zoom(1) = verder weg, zoom(-1) = dichterbij
    vrijeRuimte,               // vrijeRuimte(x, z) → meters vrij rond dat punt (tot 3)
    knop(label, fn, id) {      // een knop rechtsboven toevoegen (komt bovenaan)
      const b = document.createElement('button'); b.textContent = label; if (id) b.id = id; b.onclick = fn;
      $('knoppen').insertBefore(b, $('knoppen').firstChild); return b;
    },

    /* Haken: de laag laat weten dat zij mee wil kijken */
    opFrame(fn) { haken.frame.push(fn); },            // fn(dt, t) bij elk beeld, na het verplaatsen
    opTikSpeler(fn) { haken.tikSpeler.push(fn); },    // fn() als iemand op het poppetje tikt
    opWeergave(fn) { haken.weergave.push(fn); },      // fn('derde' of 'eerste') als de weergave wisselt

    /* Start het gebouw. Geeft een belofte terug: klaar als het model er staat (of de tijdelijke zaal). */
    start() { zetWeergave('derde'); const p = laadModel(); lus(); return p; }
  };
  API.zetAvatar();   // eerst het eenvoudige poppetje; een laag mag het vervangen

  /* ---------- test: voeg ?test toe aan het adres, dan kun je in de console bibTest typen ----------
     Gebouw: blok, bereik, meshes, camera, zet, vrijheid, toets, richt, plek, stap, toestand.
     Een laag mag er eigen dingen bij zetten (de laag 50-jaar voegt ga(nummer) toe). */
  if (/[?&]test/.test(location.search)) {
    /* Plaatsbalkje links onderaan: x, z en kijkrichting, zodat een screenshot meteen zegt waar het genomen is. */
    const plaatsLabel = document.createElement('div');
    plaatsLabel.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:50;padding:3px 8px;background:rgba(0,0,0,.6);color:#fff;font:12px monospace;border-radius:4px;pointer-events:none';
    document.body.appendChild(plaatsLabel);
    const kompas = ['noord', 'west', 'zuid', 'oost'];
    setInterval(() => { const g = Math.round((((-speler.yaw * 180 / Math.PI) % 360) + 360) % 360); plaatsLabel.textContent = 'x ' + speler.x.toFixed(1) + '  z ' + speler.z.toFixed(1) + '  kijkt ' + kompas[Math.round(((((speler.yaw % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI)) / (Math.PI/2))) % 4]; }, 200);
    window.bibTest = {
      blok(x, z, dx, dz, far) { const l = Math.hypot(dx, dz); straal.set(new THREE.Vector3(x, 0.9, z), new THREE.Vector3(dx / l, 0, dz / l)); straal.far = far || 8; const h = straal.intersectObjects(colliders, false)[0]; if (!h) return null; const o = h.object, b = new THREE.Box3().setFromObject(o); return { afstand: +h.distance.toFixed(2), naam: o.name || (o.parent && o.parent.name) || '-', kleur: o.material.color ? o.material.color.getHexString() : null, opac: o.material.opacity, min: b.min.toArray().map(v => +v.toFixed(1)), max: b.max.toArray().map(v => +v.toFixed(1)) }; },
      /* Welke plekken zijn te bereiken vanaf (x0, z0)? Geef optioneel `punten` mee: { naam: [x, z] }. */
      bereik(x0, z0, stap, punten) {
        stap = stap || 0.25;
        const sleutel = (i, j) => i + ',' + j;
        const bezocht = new Set([sleutel(0, 0)]); const rij = [[0, 0]];
        let minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9;
        while (rij.length && bezocht.size < 40000) {
          const [i, j] = rij.pop(); const x = x0 + i * stap, z = z0 + j * stap;
          minX = Math.min(minX, x); maxX = Math.max(maxX, x); minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
          for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const k = sleutel(i + di, j + dj); if (bezocht.has(k)) continue;
            const nx = x0 + (i + di) * stap, nz = z0 + (j + dj) * stap;
            if (nx < MODEL.grens.xmin || nx > MODEL.grens.xmax || nz < MODEL.grens.zmin || nz > MODEL.grens.zmax) continue;
            if (blokkeertOp(x, z, di * stap, dj * stap, nabijVan(x, z))) continue;
            bezocht.add(k); rij.push([i + di, j + dj]);
          }
        }
        window.__bereik = { set: bezocht, x0, z0, stap };
        const bereikt = {};
        for (const id in (punten || {})) { const p = punten[id]; bereikt[id] = bezocht.has(sleutel(Math.round((p[0] - x0) / stap), Math.round((p[1] - z0) / stap))); }
        const tp = C.testpunt || [x0, z0];
        return { cellen: bezocht.size, minX, maxX, minZ, maxZ, bevatZaal: bezocht.has(sleutel(Math.round((tp[0] - x0) / stap), Math.round((tp[1] - z0) / stap))), punten: bereikt };
      },
      meshes() { const uit = []; scene.traverse(o => { if (o.isMesh && o.visible && o.material) { const b = new THREE.Box3().setFromObject(o); uit.push({ n: o.name, c: o.material.color ? o.material.color.getHexString() : null, o: o.material.opacity, min: b.min.toArray().map(v => +v.toFixed(1)), max: b.max.toArray().map(v => +v.toFixed(1)) }); } }); return uit; },
      camera(a) { testCam = a || null; },
      zet(x, z, yaw) { API.zet(x, z, yaw); },
      vrijheid(x, z) { let min = 3; const o = new THREE.Vector3(x, 0.9, z); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; straal.set(o, new THREE.Vector3(Math.cos(a), 0, Math.sin(a))); straal.far = 3; const h = straal.intersectObjects(colliders, false)[0]; if (h && h.distance < min) min = h.distance; } return +min.toFixed(2); },
      toets(code, aan) { window.dispatchEvent(new KeyboardEvent(aan ? 'keydown' : 'keyup', { code })); },
      richt(yaw) { speler.yaw = yaw; ziel = null; },
      onderdelen() { return modelOnderdelen.map(o => o.sleutel + (o.weg ? ' (weg)' : '')); },
      plek() { return { x: speler.x, z: speler.z, colliders: colliders.length }; },
      stap(sec) { for (let i = 0; i < sec * 60; i++) { testTijd += 1 / 60; bijwerken(1 / 60, testTijd); } return this.toestand(); },
      toestand() { return { x: +speler.x.toFixed(2), z: +speler.z.toFixed(2), ziel, loopt, weergave, avatarZichtbaar: avatar.visible, kaders: kaders.length }; }
    };
  }
})();
