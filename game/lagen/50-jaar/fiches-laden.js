/* FICHES INLEZEN (laag "50 jaar bib")
   ------------------------------------------------------------------
   Elke fiche staat in een eigen tekstbestand in de map `fiches` (fiche-1.txt, fiche-2.txt, ...).
   Dit script leest ze in en zet ze klaar voor het spel. Je hoeft dit bestand nooit aan te passen:
   de uitleg om een fiche te wijzigen staat in `fiches/HANDLEIDING.md`.
   Klopt er iets niet in een fiche, dan zie je bovenaan het spel een rood vak met wat en waar. */
(function () {
  'use strict';

  const SOORTEN = ['keuze', 'meerdere', 'volgorde', 'invul'];
  const SECTIES = ['kijkpunten', 'beelden', 'vraag', 'antwoorden', 'velden', 'leer'];
  const KOP = {            // wat bovenaan een fiche staat -> naam in het spel
    'nummer': 'id', 'categorie': 'categorie', 'soort': 'soort', 'titel': 'titel', 'waar': 'waar',
    'plek': 'plek', 'bron': 'bron', 'zoek-opdracht': 'kijk', 'tip': 'tip',
    'boeke-goed': 'boekeGoed', 'boeke-fout': 'boekeFout', 'minimaal': 'minimaal', 'uniek': 'uniek'
  };

  /* Eén fiche-tekst omzetten. Geeft { fiche, fouten }. Bij fouten waar het spel niet zonder kan is fiche null. */
  function leesFiche(inhoud, bestand, categorieen) {
    const fouten = [];
    const fout = (nr, tekst) => fouten.push(bestand + (nr ? ', regel ' + nr : '') + ': ' + tekst);
    const kop = {}, sec = {};
    let huidig = null;

    inhoud.replace(/^﻿/, '').split(/\r?\n/).forEach((rauw, i) => {
      const nr = i + 1, r = rauw.trim();
      if (!r || r[0] === '#') return;
      const m = r.match(/^\[(.*)\]$/);
      if (m) {
        const naam = m[1].trim().toLowerCase();
        if (SECTIES.indexOf(naam) < 0) { fout(nr, 'het kopje [' + m[1] + '] bestaat niet. Kies uit: ' + SECTIES.map(s => '[' + s + ']').join(' ')); huidig = null; return; }
        huidig = naam; sec[naam] = sec[naam] || []; return;
      }
      if (huidig) { sec[huidig].push({ t: r, nr: nr }); return; }
      const k = r.indexOf(':');
      if (k < 1) { fout(nr, 'ik begrijp "' + r + '" niet. Bovenaan een fiche staan regels zoals  titel: Mijn titel'); return; }
      const sleutel = r.slice(0, k).trim().toLowerCase();
      if (!(sleutel in KOP)) { fout(nr, 'het veld "' + sleutel + '" bestaat niet. Kies uit: ' + Object.keys(KOP).join(', ')); return; }
      kop[sleutel] = r.slice(k + 1).trim();
    });

    const f = {};
    let fataal = false;
    const eis = (naam, label) => { if (!kop[naam]) { fout(0, 'er ontbreekt een regel "' + naam + ':" bovenaan.'); fataal = true; } };

    // nummer: uit de regel "nummer:", anders uit de bestandsnaam
    const uitNaam = (bestand.match(/(\d+)/) || [])[1];
    const nummer = Number(kop['nummer'] || uitNaam);
    if (!nummer) { fout(0, 'er ontbreekt een regel "nummer:" bovenaan (een getal, bv. nummer: 3).'); fataal = true; }
    f.id = nummer;

    eis('titel'); eis('soort'); eis('categorie');
    f.titel = kop['titel'] || '';
    f.categorie = kop['categorie'] || '';
    if (kop['categorie'] && categorieen && !categorieen[kop['categorie']]) {
      fout(0, 'categorie moet een van deze zijn: ' + Object.keys(categorieen).join(' of ') + '.'); fataal = true;
    }
    f.soort = (kop['soort'] || '').toLowerCase();
    if (kop['soort'] && SOORTEN.indexOf(f.soort) < 0) { fout(0, 'soort moet een van deze zijn: ' + SOORTEN.join(', ') + '.'); fataal = true; }

    if (kop['bron']) f.bron = kop['bron'];
    f.waar = kop['waar'] || '';
    if (kop['plek']) {
      const p = kop['plek'].split(/[,;\s]+/).filter(Boolean).map(Number);
      if (p.length === 2 && p.every(isFinite)) f.plek = p; else fout(0, 'plek moet twee getallen zijn, bv.  plek: 0, 4');
    }
    if (kop['zoek-opdracht']) f.kijk = kop['zoek-opdracht'];

    // lijsten met streepjes: "- tekst". Een regel zonder streepje hoort bij de vorige.
    const punten = naam => {
      const uit = [];
      (sec[naam] || []).forEach(x => {
        if (/^-/.test(x.t)) uit.push(x.t.replace(/^-\s*/, ''));
        else if (uit.length) uit[uit.length - 1] += ' ' + x.t;
        else uit.push(x.t);
      });
      return uit;
    };
    f.kijkPunten = punten('kijkpunten');
    if (!f.kijkPunten.length) fout(0, 'er staat niets onder [kijkpunten].');
    f.leer = punten('leer');
    if (!f.leer.length) fout(0, 'er staat niets onder [leer] ("Wist je dat?").');

    f.beelden = (sec['beelden'] || []).map(x => {
      const p = x.t.indexOf('|');
      if (p < 0) { fout(x.nr, 'een foto heeft de vorm  img/bestand.jpg | onderschrift'); return { src: x.t, onderschrift: '' }; }
      return { src: x.t.slice(0, p).trim(), onderschrift: x.t.slice(p + 1).trim() };
    });

    f.vraag = (sec['vraag'] || []).map(x => x.t).join(' ');
    if (!f.vraag) { fout(0, 'er staat niets onder [vraag].'); fataal = true; }

    f.tip = kop['tip'] || '';
    if (!f.tip) fout(0, 'er ontbreekt een regel "tip:" bovenaan.');
    f.boekeGoed = kop['boeke-goed'] || 'Dat klopt.';
    f.boekeFout = kop['boeke-fout'] || 'Niet juist. Probeer opnieuw.';
    if (!kop['boeke-goed']) fout(0, 'er ontbreekt een regel "boeke-goed:" bovenaan.');
    if (!kop['boeke-fout']) fout(0, 'er ontbreekt een regel "boeke-fout:" bovenaan.');

    // de antwoorden, volgens de soort vraag
    const antw = (sec['antwoorden'] || []);
    if (f.soort === 'keuze' || f.soort === 'meerdere') {
      f.opties = []; const goed = [];
      antw.forEach((x, i) => {
        let s = x.t.replace(/^-\s*/, '');
        if (s[0] === '*') { goed.push(i); s = s.slice(1).trim(); }
        f.opties.push(s);
      });
      if (f.opties.length < 2) { fout(0, 'zet minstens twee antwoorden onder [antwoorden].'); fataal = true; }
      if (f.soort === 'keuze') {
        if (goed.length !== 1) { fout(0, 'zet bij het juiste antwoord een * voor de tekst (precies één antwoord, nu ' + goed.length + ').'); fataal = true; }
        f.goed = goed[0];
      } else {
        if (!goed.length) { fout(0, 'zet bij de juiste antwoorden een * voor de tekst.'); fataal = true; }
        f.goedLijst = goed;
        f.minimaal = Number(kop['minimaal']) || goed.length;
      }
    } else if (f.soort === 'volgorde') {
      const rijen = antw.map(x => x.t.replace(/^-\s*/, ''));
      const metJaar = rijen.filter(s => s.indexOf('|') >= 0).length;
      if (rijen.length < 2) { fout(0, 'zet minstens twee regels onder [antwoorden], in de JUISTE volgorde.'); fataal = true; }
      if (metJaar && metJaar !== rijen.length) { fout(0, 'sommige regels hebben een  jaar | tekst  en andere niet. Doe het bij alle of bij geen enkele.'); fataal = true; }
      if (metJaar) {
        f.jaren = rijen.map(s => s.slice(0, s.indexOf('|')).trim());
        f.items = rijen.map(s => s.slice(s.indexOf('|') + 1).trim());
      } else f.items = rijen;
    } else if (f.soort === 'invul') {
      const v = sec['velden'] || [];
      if (!v.length) { fout(0, 'zet minstens één regel onder [velden]:  label | goed antwoord / ander goed antwoord'); fataal = true; }
      f.velden = v.map(x => {
        const p = x.t.replace(/^-\s*/, '').split('|');
        if (p.length < 2) fout(x.nr, 'een veld heeft de vorm  label | goed antwoord / ander goed antwoord');
        const veld = { label: p[0].trim(), ok: (p[1] || '').split('/').map(s => s.trim()).filter(Boolean) };
        if (/^(ja|waar|true)$/i.test(kop['uniek'] || '')) veld.uniek = true;
        return veld;
      });
    }

    return { fiche: fataal ? null : f, fouten: fouten };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { leesFiche: leesFiche };
  if (typeof window === 'undefined' || !window.SPELDATA) return;

  /* ---------- in het spel: de bestanden ophalen ---------- */
  const D = window.SPELDATA;
  const MAP = (document.currentScript && document.currentScript.src || '').replace(/[^/]*$/, '');
  const problemen = [];
  const fiches = [];

  function haal(pad) {                       // synchroon: het spel start pas als alle fiches er zijn
    const x = new XMLHttpRequest();
    x.open('GET', MAP + pad + '?t=' + Date.now(), false);
    if (x.overrideMimeType) x.overrideMimeType('text/plain; charset=utf-8');
    try { x.send(); } catch (e) { return { status: 0 }; }
    return { status: x.status, tekst: x.responseText };
  }

  for (let n = 1; n <= 40; n++) {
    const bestand = 'fiche-' + n + '.txt';
    const r = haal('fiches/' + bestand);
    if (r.status === 404) break;
    if (r.status !== 200) {
      problemen.push('Ik kan de fiches niet lezen. Open het spel via  start-spel.bat  (dubbelklik) en niet door op index.html te dubbelklikken.');
      break;
    }
    const uit = leesFiche(r.tekst, bestand, D.categorieen);
    uit.fouten.forEach(t => problemen.push(t));
    if (uit.fiche) fiches.push(uit.fiche);
  }
  if (!fiches.length && !problemen.length) problemen.push('Er zijn geen fiches gevonden in de map fiches (fiche-1.txt, fiche-2.txt, ...).');

  const gezien = {};
  fiches.forEach(f => { if (gezien[f.id]) problemen.push('Twee fiches hebben nummer ' + f.id + '. Elk nummer mag maar één keer.'); gezien[f.id] = 1; });
  fiches.sort((a, b) => a.id - b.id);
  D.fiches = fiches;

  if (problemen.length) {
    const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const v = document.createElement('div');
    v.style.cssText = 'position:fixed;z-index:99999;left:0;right:0;top:0;max-height:45vh;overflow:auto;background:#b3261e;color:#fff;font:14px/1.45 system-ui,sans-serif;padding:10px 14px;box-shadow:0 2px 10px rgba(0,0,0,.4)';
    v.innerHTML = '<button style="float:right;font:inherit;padding:2px 10px;cursor:pointer" onclick="this.parentNode.remove()">Sluiten</button>' +
      '<b>Let op: er klopt iets niet in de fiches.</b> Pas het tekstbestand aan en ververs de pagina (F5).<ul style="margin:6px 0 0 18px;padding:0">' +
      problemen.map(p => '<li>' + esc(p) + '</li>').join('') + '</ul>';
    document.body.appendChild(v);
    if (window.console) problemen.forEach(p => console.warn('[fiches] ' + p));
  }
})();
