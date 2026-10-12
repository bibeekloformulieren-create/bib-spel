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
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe6e2da, 1.0));
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const zon = new THREE.DirectionalLight(0xffffff, 0.3); zon.position.set(4, 8, 3); scene.add(zon);

  const colliders = [];
  const speler = { x: 0, y: 1.6, z: 7.8, yaw: 0, pitch: 0, hoogte: 0.6, afstand: 5.2 };   // y = oogpunt; hoogte = camerahoek achter de speler

  /* De speler als poppetje in de zaal. Het uiterlijk (3 loopbeeldjes) komt van de laag: Gebouw.zetAvatar. */
  let weergave = 'derde';                  // 'derde' = je ziet het poppetje, 'eerste' = door zijn ogen
  const avatar = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false }));
  avatar.scale.set(1.25, 1.5, 1); avatar.center.set(0.5, 0.02);
  const avatarSchaduw = new THREE.Mesh(new THREE.CircleGeometry(0.42, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false }));
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
    vloerTegel: '#5f5753', vloerVoeg: '#c4beb5', vloerGlad: '#8d8f93', vloerTegelLicht: '#d9cabd', vloerVoegLicht: '#b9aea3', tapijt: '#9a9ca1',
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
      m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); scene.add(m);
    };
    const tegelTex = (kleur, voeg, rx, rz) => canvasTexture(c => {
      c.fillStyle = voeg; c.fillRect(0, 0, 128, 128);
      c.fillStyle = kleur;
      [[1, 1], [65, 1], [1, 65], [65, 65]].forEach(([x, y]) => c.fillRect(x, y, 62, 62));
    }, rx / 0.4, rz / 0.4, Math.PI / 4);
    const soorten = {
      'glad':         (rx, rz) => canvasTexture(c => { c.fillStyle = LOOK.vloerGlad; c.fillRect(0, 0, 128, 128); }, 1, 1),
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

  /* Het model laden. Geeft een belofte terug die klaar is als het gebouw er staat (echt model of tijdelijke zaal). */
  let modelGeladen = false;
  function laadModel() {
    return new Promise(klaar => {
      const terugval = () => { bouwTijdelijkeZaal(); API.echt = false; klaar(); };
      if (!THREE.GLTFLoader || location.protocol === 'file:') return terugval();
      new THREE.GLTFLoader().load(MODEL.url, gltf => {
        const wortel = gltf.scene; wortel.scale.setScalar(MODEL.schaal); scene.add(wortel);
        wortel.updateMatrixWorld(true);
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

  const zoom = delta => { speler.afstand = Math.max(2.4, Math.min(10, speler.afstand + delta)); };
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
  let loopt = false, afstGlad = 5.2, aGlad = 0.6;
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
        const s = 2.1;
        vx = (-Math.sin(speler.yaw) * iz + Math.cos(speler.yaw) * ix) * s;
        vz = (-Math.cos(speler.yaw) * iz - Math.sin(speler.yaw) * ix) * s;
      } else if (ziel) {
        const dx = ziel.x - speler.x, dz = ziel.z - speler.z, d = Math.hypot(dx, dz);
        if (d < 0.12) { ziel = null; doel.visible = false; }
        else { const s = Math.min(2.1, d * 4); vx = dx / d * s; vz = dz / d * s; }
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
      const kop = new THREE.Vector3(speler.x, vloerY + 1.2, speler.z);
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
      camera.position.set(speler.x, speler.y, speler.z);
      camera.rotation.set(speler.pitch, speler.yaw, 0);
    }
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
      plek() { return { x: speler.x, z: speler.z, colliders: colliders.length }; },
      stap(sec) { for (let i = 0; i < sec * 60; i++) { testTijd += 1 / 60; bijwerken(1 / 60, testTijd); } return this.toestand(); },
      toestand() { return { x: +speler.x.toFixed(2), z: +speler.z.toFixed(2), ziel, loopt, weergave, avatarZichtbaar: avatar.visible, kaders: kaders.length }; }
    };
  }
})();
