// Generează data.js organizat pe referințe.
//  - The Watch Pages dă lista de referințe (sku), cu culoarea cadranului și materialul.
//  - Referințele se grupează pe model (aceeași referință de bază, ex. 5322G-001 / 5322G-010, sau același nume).
//  - Articolele din celelalte surse se leagă de model prin referința din specificații sau din titlu,
//    iar dacă nu au referință, prin nume. Referințele din articole care lipsesc din The Watch Pages se adaugă.
//  - Ce nu se leagă de nimic rămâne model separat, grupat cu regulile de duplicate.
const fs = require("fs");
const path = require("path");
const { group, analyse, same } = require("./dedupe.js");
const d = JSON.parse(fs.readFileSync(path.join(__dirname, "releases.json"), "utf8"));
const articleRefs = fs.existsSync(path.join(__dirname, "article-refs.json"))
  ? JSON.parse(fs.readFileSync(path.join(__dirname, "article-refs.json"), "utf8")) : {};

// Numele curățate pentru Monochrome / Hodinkee.
const fixes = {};
for (const k of [0, 1, 2, 3, "_manual"]) {
  const f = path.join(__dirname, "titles", `out${k}.json`);
  if (fs.existsSync(f)) Object.assign(fixes, JSON.parse(fs.readFileSync(f, "utf8")));
}
const BRAND_FIX = { "Habring2": "Habring²", "O&Hora": "O&Hora Pictor Atelier", "Jaeger-Lecoultre": "Jaeger-LeCoultre", "Christiaan Van Der Klaauw": "Christiaan van der Klaauw" };
const fixBrand = b => BRAND_FIX[b] || b;
const applyFix = (list, prefix) => list.map((x, i) => {
  const fx = fixes[prefix + i];
  const y = fx ? { ...x, model: fx.model || x.model, brand: fx.brand || x.brand } : { ...x };
  y.model = y.model.replace(/\s*(…|\.\.\.)\s*$/, "").trim();
  y.brand = fixBrand(y.brand);
  return y;
});

const SOURCES = [
  { id: "twp", name: "The Watch Pages", url: "https://www.thewatchpages.com/new-watches/2026",
    note: "Catalogul de referințe 2026: 843 de ceasuri listate, fiecare cu pagina lui (referință, cadran, material)." },
  { id: "mono", name: "Monochrome Watches", url: "https://monochrome-watches.com/tag/2026/",
    note: "Toate cele 64 de pagini ale tag-ului 2026: articolele Introducing, First Look, Hands-on și Announcing. Referințele sunt citite din specificațiile fiecărui articol." },
  { id: "hodinkee", name: "Hodinkee", url: "https://www.hodinkee.com/packages/watches-and-wonders-2026",
    note: "Pachetul Watches and Wonders 2026: articolele Introducing și Hands-On. Referințele sunt citite din secțiunea „The Basics”." },
  { id: "ww", name: "Worn & Wound", url: "https://wornandwound.com/our-favorite-watches-of-2026-so-far/",
    note: "Articolul „Our Favorite Watches of 2026 (So Far)” din 3 iulie 2026: 9 ceasuri." },
  { id: "wwg", name: "Watches and Wonders", url: "https://www.watchesandwonders.com/en/geneva-2026/novelties",
    note: "Pagina de noutăți Geneva 2026: câte o noutate reprezentativă pentru fiecare dintre cei 65 de expozanți." }
];
// Notele surselor noi se completează după colectare (vezi new-sources/<id>.meta.json).
const NEW_SOURCES = JSON.parse(fs.readFileSync(path.join(__dirname, "new-sources", "sources.json"), "utf8"));
SOURCES.push(...NEW_SOURCES);
const srcIndex = Object.fromEntries(SOURCES.map((s, i) => [s.id, i]));

const norm = r => (r || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const isClock = m => /\b(desk clock|table clock|wall clock|clock)\b/i.test(m) && !/watch/i.test(m);

// ---------- 1. Modele din referințele The Watch Pages ----------
const models = [];       // { brand, name, key, refs: Map(normRef -> row), coverage: [] }
const byKey = new Map();
const refIndex = new Map(); // brand|normRef -> model
const allTwp = d.twp.map(x => ({ ...x, brand: fixBrand(x.brand) }));
// Pendulele (ex. Nautilus Desk Clock 958G) nu sunt ceasuri de mână; referințele lor nu se adaugă nici din articole.
const clockRefs = new Set(allTwp.filter(x => isClock(x.model) && x.ref).map(x => x.brand + "|" + norm(x.ref)));
const twp = allTwp.filter(x => !isClock(x.model));
for (const x of twp) {
  const ref = (x.ref || "").trim();
  let name = x.model, key;
  const nr = norm(ref);
  // Numele care conțin referința („Calatrava 5322G-010”) se grupează pe referința de bază.
  const refInName = ref && norm(name).includes(nr);
  if (refInName) {
    const base = ref.replace(/[-.\s]\d{3,4}$/, "");
    name = name.replace(new RegExp(ref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), "").replace(/\s+/g, " ").trim();
    name = (name + " " + base).trim();
    key = x.brand + "|ref|" + norm(base);
  } else {
    key = x.brand + "|name|" + name.toLowerCase().replace(/[^a-z0-9]/g, "");
  }
  // Aceeași referință listată de două ori merge în modelul existent.
  const existing = nr && refIndex.get(x.brand + "|" + nr);
  let m = existing || byKey.get(key);
  if (!m) {
    m = { brand: x.brand, name, key, refs: new Map(), coverage: [] };
    byKey.set(key, m);
    models.push(m);
  }
  const rowKey = nr || "slug:" + x.slug;
  if (!m.refs.has(rowKey)) {
    m.refs.set(rowKey, { ref, dial: x.dial || "", material: x.material || "", img: x.img, url: x.url, variant: refInName ? "" : (nr ? "" : x.model) });
  }
  if (!m.coverage.some(c => c.src === "twp" && c.url === x.url)) m.coverage.push({ src: "twp", model: x.model, url: x.url });
  if (nr) refIndex.set(x.brand + "|" + nr, m);
}

// ---------- 2. Celelalte surse ----------
const others = [
  ...applyFix(d.mono, "m").map(x => ({ ...x, src: "mono" })),
  ...applyFix(d.hodinkee, "h").map(x => ({ ...x, src: "hodinkee" })),
  ...d.ww.map(x => ({ ...x, brand: fixBrand(x.brand), src: "ww" })),
  ...d.wwg.map(x => ({ ...x, brand: fixBrand(x.brand), src: "wwg" })),
  ...newSourceItems()
];

// Aceeași firmă scrisă diferit („AUDEMARS PIGUET”, „Out Of Order Watches”) primește o singură formă:
// cea din The Watch Pages dacă există, altfel cea mai folosită formă care nu e scrisă cu majuscule.
{
  const fold = b => b.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "")
    .replace(/(watches|watch|watchco|watchcompany|co)$/, "");
  const votes = new Map();
  const vote = (b, w) => {
    const k = fold(b);
    if (!votes.has(k)) votes.set(k, new Map());
    votes.get(k).set(b, (votes.get(k).get(b) || 0) + w);
  };
  for (const x of twp) vote(x.brand, 1000);
  for (const x of others) vote(x.brand, x.brand === x.brand.toUpperCase() && /[A-Z]{3}/.test(x.brand) ? 0.1 : 1);
  const best = new Map([...votes].map(([k, m]) => [k, [...m].sort((a, b) => b[1] - a[1] || a[0].length - b[0].length)[0][0]]));
  for (const x of others) x.brand = best.get(fold(x.brand)) || x.brand;
}

// Sursele adăugate ulterior: new-sources/<id>.json, colectate de câte un script per site.
// Brandul vine din câmpul explicit sau din titlu; numele curățat din titles/new-out*.json (cheie „<id>:<index>”).
function newSourceItems() {
  const { detectBrand, canonical } = require("./brands.js");
  const dir = path.join(__dirname, "new-sources");
  const newFixes = {};
  for (const f of fs.readdirSync(path.join(__dirname, "titles")).filter(f => /^new-out.*\.json$/.test(f))) {
    Object.assign(newFixes, JSON.parse(fs.readFileSync(path.join(__dirname, "titles", f), "utf8")));
  }
  const out = [];
  for (const s of NEW_SOURCES) {
    const f = path.join(dir, s.id + ".json");
    if (!fs.existsSync(f)) continue;
    const list = JSON.parse(fs.readFileSync(f, "utf8"));
    list.forEach((x, i) => {
      const fx = newFixes[`${s.id}:${i}`] || {};
      const hit = x.brand ? null : detectBrand(x.title || "");
      const brand = fixBrand(canonical(fx.brand || x.brand || (hit && hit.brand) || ""));
      if (!brand || fx.skip) return;
      // Doar lansările din 2026 (ex. GPHG nominalizează și ceasuri lansate în 2025).
      if (x.date && x.date < "2026-01-01") return;
      const model = (fx.model || x.model || x.title || "").replace(/\s*(…|\.\.\.)\s*$/, "").trim();
      out.push({ brand, model, img: x.img || "", url: x.url, src: s.id, extraRefs: x.refs || [] });
    });
  }
  return out;
}
const REF_IN_NAME = /\b(PAM\d{5}|[A-Z]{3,4}\d{3}[A-Z]?|\d{4}(?:\/\d{1,3})?[A-Z]{1,2}(?:-\d{3})?|[12]\d{5}[A-Z]*|M?\d{5}[A-Z]{1,3})\b/g;

// Caută referința în modelele brandului: potrivire exactă sau referința de bază (5322G ↔ 5322G-001).
function findByRef(brand, r, prefixOk = false) {
  const nr = norm(r);
  if (nr.length < 4) return [];
  const hits = new Set();
  for (const m of models) {
    if (m.brand !== brand) continue;
    for (const [k] of m.refs) {
      if (k.startsWith("slug:")) continue;
      if (k === nr || ((nr.length >= 5 || prefixOk) && (k.startsWith(nr) || nr.startsWith(k))) ||
          (nr.length >= 6 && k.includes(nr))) hits.add(m);
    }
  }
  return [...hits];
}

const nameInfo = new Map();
const infoOf = s => { if (!nameInfo.has(s)) nameInfo.set(s, analyse(s)); return nameInfo.get(s); };
function findByName(brand, model) {
  const a = infoOf(model);
  let best = null;
  for (const m of models) {
    if (m.brand !== brand || !m.refs.size) continue;
    // Numele din The Watch Pages și din articolele legate prin referință („Celestial 6105G” → 6105G-001).
    const names = [m.name, ...m.coverage.filter(c => c.src === "twp" || STRUCTURED.has(c.src)).map(c => c.model)];
    for (const n of names) {
      if (!same(a, infoOf(n))) continue;
      const score = Math.abs(infoOf(n).words.size - a.words.size);
      if (!best || score < best.score) best = { m, score };
    }
  }
  if (best) return best.m;
  // Potrivire mai permisivă (numerele în plus sunt acceptate), folosită doar dacă există un singur candidat.
  const cands = new Set();
  for (const m of models) {
    if (m.brand !== brand || !m.refs.size) continue;
    for (const n of [m.name, ...m.coverage.filter(c => c.src === "twp").map(c => c.model)]) {
      if (looseSame(a, infoOf(n))) { cands.add(m); break; }
    }
  }
  return cands.size === 1 ? [...cands][0] : null;
}
const DEFINING_WORDS = /^(gmt|chrono|chronograph|tourbillon|skeleton|openworked|repeater|worldtimer|worldtime|moonphase|calendar|annual|perpetual|alarm|jumping|flyback|split|rattrapante|regulator|date|day|diver|pilot|minute|hour)$/;
function looseSame(a, b) {
  const [small, big] = a.words.size <= b.words.size ? [a, b] : [b, a];
  if (small.words.size < 2) return false;
  for (const w of small.words) if (!big.words.has(w)) return false;
  const extra = [...big.words].filter(w => !small.words.has(w));
  if (extra.some(w => DEFINING_WORDS.test(w))) return false;
  return small.words.size / big.words.size >= 0.5;
}

// Referințele din câmpuri structurate (specificații, fișe) pot adăuga referințe noi.
// Cele extrase din textul articolelor pot pomeni și modele istorice, așa că servesc doar la legarea de un model existent.
const STRUCTURED = new Set(["mono", "hodinkee", "gphg", "ww", "wwg"]);
// Numere de 4 cifre („Gondolo 7043”) ajută la legare, dar nu sunt ani.
const SHORT_REF = /\b(?!19\d\d\b|20\d\d\b)(\d{4})\b/g;
const orphans = [];
let linkedByRef = 0, linkedByName = 0, addedRefs = 0;
for (const x of others) {
  const structured = STRUCTURED.has(x.src);
  const fromArticle = [...((articleRefs[x.url] && articleRefs[x.url].refs) || []), ...(x.extraRefs || [])];
  const fromName = [...x.model.matchAll(REF_IN_NAME)].map(m => m[1]);
  const refs = [...new Set([...fromArticle, ...fromName].map(r => r.trim()))].filter(r => !clockRefs.has(x.brand + "|" + norm(r)));
  const linkOnly = [...x.model.matchAll(SHORT_REF)].map(m => m[1]).filter(r => !refs.includes(r));
  const matched = new Set(), unknown = [];
  for (const r of linkOnly) findByRef(x.brand, r, true).forEach(h => matched.add(h));
  for (const r of refs) {
    const hits = findByRef(x.brand, r);
    if (hits.length) hits.forEach(h => matched.add(h)); else unknown.push(r);
  }
  let target = [...matched];
  if (target.length) linkedByRef++;
  else {
    const m = findByName(x.brand, x.model);
    if (m) { target = [m]; linkedByName++; }
  }
  if (!target.length) { orphans.push({ ...x, refs: structured ? refs : [] }); continue; }
  for (const m of target) m.coverage.push({ src: x.src, model: x.model, url: x.url });
  // Referințele din specificații care nu există încă se adaugă la primul model potrivit.
  for (const r of structured ? unknown : []) {
    const nr = norm(r);
    if (nr.length < 4 || target[0].refs.has(nr)) continue;
    target[0].refs.set(nr, { ref: r, dial: "", material: "", img: x.img, url: x.url, variant: "" });
    refIndex.set(x.brand + "|" + nr, target[0]);
    addedRefs++;
  }
}

// ---------- 3. Modele care apar doar în articole ----------
const g = group(orphans.map(o => ({ brand: o.brand, model: o.model + (o.refs.length ? " " + o.refs.join(" ") : "") })));
for (const gr of g.groups) {
  const items = gr.members.map(i => orphans[i]);
  const names = items.map(o => o.model).filter(n => !/ and | & /.test(n));
  const pool = names.length ? names : items.map(o => o.model);
  const name = pool.filter(n => n.length <= 60).sort((a, b) => b.length - a.length)[0] || pool[0];
  const m = { brand: items[0].brand, name, key: "orphan|" + gr.root, refs: new Map(), coverage: [], articleOnly: true };
  for (const o of items) {
    m.coverage.push({ src: o.src, model: o.model, url: o.url });
    for (const r of o.refs) {
      const nr = norm(r);
      if (nr.length >= 4 && !m.refs.has(nr)) m.refs.set(nr, { ref: r, dial: "", material: "", img: o.img, url: o.url, variant: "" });
    }
  }
  // Fără referință cunoscută, modelul contează ca o singură lansare.
  if (!m.refs.size) m.refs.set("none", { ref: "", dial: "", material: "", img: items[0].img, url: items[0].url, variant: "" });
  models.push(m);
}

// ---------- 4. Ieșire ----------
models.sort((a, b) => a.brand.localeCompare(b.brand) || b.refs.size - a.refs.size || a.name.localeCompare(b.name));
const rows = models.map(m => [
  m.brand, m.name, m.articleOnly ? 1 : 0,
  [...m.refs.values()].map(r => [r.ref, r.dial, r.material, r.img, r.url, r.variant]),
  m.coverage.map(c => [srcIndex[c.src], c.model, c.url])
]);
const totalRefs = models.reduce((n, m) => n + m.refs.size, 0);
const brands = new Set(models.map(m => m.brand)).size;
let js = "// Generat automat pe " + new Date().toISOString().slice(0, 10) + ".\n" +
  "// MODELS: [brand, nume model, doar din articole (1/0), referințe, acoperire în surse]\n" +
  "//   referință: [cod, culoare cadran, material, imagine, link, variantă]\n" +
  "//   acoperire: [index sursă, nume în sursă, link]\n\n" +
  "const SOURCES = " + JSON.stringify(SOURCES, null, 2) + ";\n\n" +
  "const MODELS = [\n" + rows.map(r => "  " + JSON.stringify(r)).join(",\n") + "\n];\n";
fs.writeFileSync(path.join(__dirname, "..", "data.js"), js);

// Raport pentru verificare, cu corecțiile manuale (corrections.js) aplicate, ca să arate ce arată și site-ul.
// data.js rămâne fără corecții: site-ul le aplică la încărcare, așa că o corecție se poate anula fără regenerare.
const Corrections = require(path.join(__dirname, "..", "corrections-lib.js"));
const corrSrc = fs.readFileSync(path.join(__dirname, "..", "corrections.js"), "utf8");
const corrList = JSON.parse((corrSrc.match(/const CORRECTIONS = ([\s\S]*);\s*$/) || [, "[]"])[1]);
const corrected = Corrections.apply(models.map(m => ({
  brand: m.brand, name: m.name, articleOnly: !!m.articleOnly, refs: [...m.refs.values()], coverage: m.coverage, aliases: []
})), corrList);
const shownModels = corrected.models;
const shownRefs = shownModels.reduce((n, m) => n + m.refs.length, 0);
const unapplied = corrected.status.filter(s => !s.applied);
let md = `# Referințe 2026\n\nGenerat pe ${new Date().toISOString().slice(0, 10)}. ${shownRefs} de referințe în ${shownModels.length} de modele, ` +
  `${new Set(shownModels.map(m => m.brand)).size} de branduri.\n\n` +
  `- Articole legate de un model prin referință: ${linkedByRef}\n- Articole legate prin nume: ${linkedByName}\n` +
  `- Referințe adăugate din articole (lipsă în The Watch Pages): ${addedRefs}\n- Articole fără corespondent, grupate separat: ${orphans.length} → ${g.groups.length} de modele\n` +
  `- Corecții manuale aplicate: ${corrList.length - unapplied.length} din ${corrList.length}` +
  (unapplied.length ? ` (neaplicate: ${unapplied.map(s => s.id).join(", ")})` : "") + "\n";
for (const b of [...new Set(shownModels.map(m => m.brand))]) {
  md += `\n## ${b}\n`;
  for (const m of shownModels.filter(x => x.brand === b)) {
    md += `\n- **${m.name}** — ${m.refs.length} ${m.refs.length === 1 ? "referință" : "referințe"}${m.articleOnly ? " (doar din articole)" : ""}` +
      (m.aliases.length ? ` (corectat; nume anterioare: ${m.aliases.join(", ")})` : "") + "\n";
    for (const r of m.refs) md += `  - ${r.ref || r.variant || "referință nespecificată"}${r.dial ? " · " + r.dial : ""}${r.material ? " · " + r.material : ""}\n`;
    md += `  - surse: ${m.coverage.map(c => `${SOURCES[srcIndex[c.src]].name} („${c.model}”)`).join("; ")}\n`;
  }
}
fs.writeFileSync(path.join(__dirname, "..", "references.md"), md);
console.log({ models: models.length, totalRefs, brands, linkedByRef, linkedByName, addedRefs, orphans: orphans.length, orphanModels: g.groups.length, bytes: js.length });

// Diagnostic: modele doar din articole, pentru branduri care au referințe în The Watch Pages.
if (process.env.DIAG) {
  const withTwp = new Set(models.filter(m => !m.articleOnly).map(m => m.brand));
  const o = models.filter(m => m.articleOnly && withTwp.has(m.brand));
  console.log("orphan models of twp brands", o.length);
  for (const m of o.slice(0, +process.env.DIAG)) {
    const cands = models.filter(x => !x.articleOnly && x.brand === m.brand).map(x => x.name).slice(0, 6).join(" ; ");
    console.log(m.brand, "::", m.name, "  [refs:", [...m.refs.values()].map(r => r.ref).join(",") + "]   twp:", cands);
  }
}
