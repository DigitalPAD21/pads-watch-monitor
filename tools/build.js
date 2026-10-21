// Parsează paginile descărcate în raw/ și scrie releases.json (o intrare = o lansare).
const fs = require("fs");
const path = require("path");
const R = path.join(__dirname, "raw");
const read = f => fs.readFileSync(path.join(R, f), "utf8");
const dec = s => s
  .replace(/&#8217;|&rsquo;/g, "’").replace(/&#8216;|&lsquo;/g, "‘").replace(/&#8220;|&ldquo;/g, "“").replace(/&#8221;|&rdquo;/g, "”")
  .replace(/&#8211;|&ndash;/g, "–").replace(/&#8212;|&mdash;/g, "—").replace(/&#038;|&amp;/g, "&").replace(/&#039;|&#39;|&apos;/g, "'")
  .replace(/&hellip;/g, "…").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/\s+/g, " ").trim();

// ---------- branduri canonice + alias-uri ----------
const ALIASES = {
  "IWC Schaffhausen": "IWC", "Nomos Glashütte": "Nomos", "NOMOS Glashütte": "Nomos", "NOMOS": "Nomos", "BVLGARI": "Bulgari", "Bvlgari": "Bulgari",
  "Favre Leuba": "Favre-Leuba", "H. Moser & Cie": "H. Moser & Cie.", "H. Moser": "H. Moser & Cie.", "Moser & Cie": "H. Moser & Cie.", "Moser": "H. Moser & Cie.",
  "NORQAIN": "Norqain", "Tutima Glashütte": "Tutima", "TUDOR": "Tudor", "HAUTLENCE": "Hautlence", "STREHLER": "Strehler", "BENRUS": "Benrus",
  "BALL": "Ball", "Cyrus": "Cyrus Genève", "Jacob & Co": "Jacob & Co.", "GoS Watches": "GoS", "De Rijke & Co.": "De Rijke & Co", "De Rijke": "De Rijke & Co",
  "A. Lange & Sohne": "A. Lange & Söhne", "A. Lange und Söhne": "A. Lange & Söhne", "Lange & Söhne": "A. Lange & Söhne", "Lange": "A. Lange & Söhne",
  "Patek": "Patek Philippe", "Vacheron": "Vacheron Constantin", "JLC": "Jaeger-LeCoultre", "Czapek & Cie": "Czapek", "Sinn Spezialuhren": "Sinn",
  "U-BOAT": "U-Boat", "ArtyA Geneve": "ArtyA", "Kross Studio": "Marco Tedeschi", "B.R.M Chronographes": "B.R.M", "Union Glashutte": "Union Glashütte",
  "Glashutte Original": "Glashütte Original", "Glashütte": "Glashütte Original", "Hermes": "Hermès", "Gérald Genta": "Gerald Genta", "Gérald Charles": "Gerald Charles",
  "L.Leroy": "L. Leroy", "Kiwame": "Kiwame Tokyo", "Lebois & Co.": "Lebois & Co", "Lebois": "Lebois & Co", "Henri Grandjean & Cie": "Henri Grandjean",
  "Sero Watch Company": "Sero", "Urban Juergensen": "Urban Jürgensen", "Stepan Sarpaneva": "Sarpaneva", "C by Romain Gauthier": "Romain Gauthier",
  "Konstantin Chaykin": "Konstantin Chaykin", "Chaykin": "Konstantin Chaykin", "Studio Underdog": "Studio Underd0g", "Underd0g": "Studio Underd0g",
  "Audemars": "Audemars Piguet", "AP": "Audemars Piguet", "Cartier": "Cartier", "Rolex": "Rolex", "Swatch": "Swatch", "Breitling": "Breitling",
  "Lange 1": "A. Lange & Söhne", "Ochs & Junior": "Ochs und Junior", "Grönefeld": "Grönefeld", "Gronefeld": "Grönefeld", "Bell&Ross": "Bell & Ross",
  "MB&F": "MB&F", "Maison Alcée": "Maison Alcée", "Earthen Summit": "Earthen", "Depancel": "Depancel", "Habring2": "Habring2", "Habring²": "Habring2",
  "TAG": "TAG Heuer", "Heuer": "TAG Heuer", "Grand Seiko": "Grand Seiko", "King Seiko": "King Seiko", "Orient Star": "Orient Star",
  "Christopher Ward": "Christopher Ward", "Garmin": "Garmin", "Timex": "Timex", "Furlan Marri": "Furlan Marri", "Massena LAB": "Massena LAB",
  "Van Cleef": "Van Cleef & Arpels", "Frédérique Constant": "Frederique Constant", "Fredrique Constant": "Frederique Constant", "Parmigiani": "Parmigiani Fleurier",
  "Girard Perregaux": "Girard-Perregaux", "GP": "Girard-Perregaux", "Ulysse": "Ulysse Nardin", "Roger Dubuis": "Roger Dubuis", "Louis Vuitton": "Louis Vuitton",
  "Tiffany": "Tiffany & Co.", "Porsche Design": "Porsche Design", "Montblanc": "Montblanc", "Chanel": "Chanel", "Piaget": "Piaget", "Omega": "Omega",
  "Hamilton": "Hamilton", "Longines": "Longines", "Tissot": "Tissot", "Mido": "Mido", "Rado": "Rado", "Certina": "Certina", "Citizen": "Citizen", "Seiko": "Seiko",
  "Doxa": "Doxa", "Zenith": "Zenith", "Hublot": "Hublot", "Panerai": "Panerai", "Bremont": "Bremont", "Baltic": "Baltic", "Oris": "Oris", "Tudor": "Tudor",
  "Fears": "Fears", "Dryden": "Dryden", "Breguet": "Breguet", "Blancpain": "Blancpain", "Jaquet Droz": "Jaquet Droz", "Ming": "Ming", "Ressence": "Ressence",
  "Bulgari": "Bulgari", "Credor": "Credor", "Nivada": "Nivada Grenchen", "Le Petit Prince": null, "Girard-Perragaux": "Girard-Perregaux", "M.A.D.3": "MAD Editions", "M.A.D.2": "MB&F", "O&Hora": "O&Hora", "Speake Marin": "Speake-Marin", "J.N. Shapiro": "J.N. Shapiro", "A. Lange & Söhne": "A. Lange & Söhne", "L. Leroy": "L. Leroy", "H. Moser & Cie.": "H. Moser & Cie.", "Eberhard & Co.": "Eberhard & Co."
};
// Cuvinte comune care pot apărea în titluri fără să fie brandul.
const SKIP = new Set(["Watches", "Le Petit Prince"]);

function canonical(name) {
  name = dec(name);
  if (ALIASES[name] !== undefined && ALIASES[name] !== null) return ALIASES[name];
  return name;
}

// ---------- The Watch Pages ----------
const twp = [];
for (let i = 1; i <= 22; i++) {
  for (const a of read(`twp-${i}.html`).split('<article class="group relative').slice(1)) {
    const href = (a.match(/href="(\/watches\/[^"]+)"/) || [])[1];
    const ps = [...a.matchAll(/<p class="[^"]*">([\s\S]*?)<\/p>/g)].map(m => dec(m[1].replace(/<[^>]+>/g, "")));
    const src = ((a.match(/ src="([^"]+)"/) || [])[1] || "").split("?")[0];
    if (!href || ps.length < 2) continue;
    twp.push({ brand: canonical(ps[0]), model: ps.slice(1).join(" "), img: src ? src + "?width=480" : "", url: "https://www.thewatchpages.com" + href, slug: href.replace("/watches/", "") });
  }
}
// Pagina de detaliu a fiecărui ceas: referința (sku din JSON-LD), culoarea cadranului, materialul carcasei.
const specOf = (text, label) => {
  const m = text.match(new RegExp("\\n" + label + "\\n([^\\n]+)\\n"));
  return m ? dec(m[1]) : "";
};
for (const x of twp) {
  const f = path.join(R, "twp-detail", x.slug + ".html");
  if (!fs.existsSync(f)) continue;
  const h = fs.readFileSync(f, "utf8");
  const sku = (h.match(/"sku":"([^"]*)"/) || [])[1];
  if (sku) x.ref = dec(sku).trim();
  const text = h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, "\n").replace(/\n\s*\n+/g, "\n");
  x.dial = specOf(text, "Dial Color");
  x.material = specOf(text, "Case Material");
  x.size = specOf(text, "Case Diameter") || specOf(text, "Diameter");
}
// Comasează referințele cu aceeași denumire de model.
const dedupe = (list, key) => { const s = new Set(); return list.filter(x => { const k = key(x); if (s.has(k)) return false; s.add(k); return true; }); };
const twpU = dedupe(twp, x => x.brand + "|" + x.model.toLowerCase());

// ---------- Watches and Wonders ----------
const wwgHtml = read("wwg.html");
const wwg = [];
for (const li of wwgHtml.split('class="c_showcase-item ').slice(1)) {
  const img = (li.match(/<img src="([^"]+)"/) || [])[1];
  const title = (li.match(/c_showcase-item__title">([\s\S]*?)<\/span>/) || [])[1];
  const brand = (li.match(/class="b_tag ">([\s\S]*?)<\/a>/) || [])[1];
  const url = (li.match(/href="([^"]+)"/) || [])[1];
  if (!title || !brand) continue;
  wwg.push({ brand: canonical(brand), model: dec(title), img: img ? "https://www.watchesandwonders.com" + img : "", url });
}
const wwgU = dedupe(wwg, x => x.brand + "|" + x.model.toLowerCase());

// ---------- dicționar pentru detectarea brandului în titluri ----------
const known = new Set([...twpU, ...wwgU].map(x => x.brand));
const oldData = fs.readFileSync(path.join(__dirname, "brands-v1.js"), "utf8");
for (const m of oldData.matchAll(/"([^"\n]{2,40})"/g)) if (!/^https?:/.test(m[1]) && !/[.,;:]\s/.test(m[1])) known.add(m[1]);
const dict = [];
for (const b of known) if (!SKIP.has(b) && b.length > 1) dict.push([b, canonical(b)]);
for (const [a, b] of Object.entries(ALIASES)) if (b) dict.push([a, b]);
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const matchers = dict.map(([alias, brand]) => ({ alias, brand, re: new RegExp("(^|[^\\p{L}\\p{N}])" + esc(alias) + "(?![\\p{L}\\p{N}])", "u") }));

function detectBrand(title) {
  let best = null;
  for (const m of matchers) {
    const r = m.re.exec(title);
    if (!r) continue;
    const pos = r.index + r[1].length;
    if (!best || pos < best.pos || (pos === best.pos && m.alias.length > best.alias.length)) best = { pos, alias: m.alias, brand: m.brand };
  }
  return best;
}

// Numele modelului = textul de după brand; dacă brandul e la final, textul de dinainte.
function cleanModel(title, hit) {
  const tidy = s => s
    .replace(/…|\.\.\./g, "")
    .replace(/\((incl\.|with) video\)|\((with )?live (pics|photos)\)|[–—-]\s*live (pics|photos)|\blive (pics|photos)\b|,?\s*now on kickstarter/gi, "")
    .replace(/\s+/g, " ").replace(/^[\s,:;–—-]+|[\s,:;–—-]+$/g, "").trim();
  if (!hit) return tidy(title);
  let after = title.slice(hit.pos + hit.alias.length)
    .replace(/^\s*(’s|'s)\s+/, " ")
    .replace(/^\s*(releases|unveils|presents|launches|introduces|reveals|debuts|adds|expands|announces|celebrates|returns with|is back with|goes)\s+(its\s+|the\s+|a\s+|an\s+)?(all[- ]new\s+|new\s+)?/i, "")
    .replace(/^\s*(all[- ]new|new)\s+/i, "");
  after = tidy(after);
  if (after.length >= 3) return after;
  const before = tidy(title.slice(0, hit.pos)
    .replace(/^\s*(introducing|announcing|hands-on( with)?|first look( at)?)\s*[:–—-]?\s*/i, "")
    .replace(/^\s*(the\s+)?(all[- ]new\s+|new\s+)?/i, "")
    .replace(/[,\s]*(a|an|the)?\s*[\w\s-]*\s+(by|from|of)\s*$/i, ""));
  return before || tidy(title);
}

// ---------- Monochrome ----------
const MONO_OK = new Set(["Introducing", "First Look", "Hands-on", "Announcing"]);
const monoSeen = new Set();
const mono = [], monoMiss = [];
for (let i = 1; i <= 64; i++) {
  const h = read(`mono-${i}.html`);
  for (const a of h.split('<article class="post-card">').slice(1)) {
    const url = (a.match(/href="([^"]+)"/) || [])[1];
    if (!url || monoSeen.has(url)) continue;
    monoSeen.add(url);
    const sec = dec((a.match(/post-card__title__section">([^<]*)</) || [])[1] || "");
    if (!MONO_OK.has(sec)) continue;
    const titleHtml = (a.match(/<h3 class="post-card__title">([\s\S]*?)<\/h3>/) || [])[1] || "";
    const title = dec(titleHtml.replace(/<span class="post-card__title__section">[\s\S]*?<\/span>/, "").replace(/<[^>]+>/g, ""));
    const img = (a.match(/data-src="([^"]+)"/) || a.match(/<noscript><img[^>]+src="([^"]+)"/) || [])[1];
    const hit = detectBrand(title);
    const item = { brand: hit ? hit.brand : null, model: cleanModel(title, hit), title, pos: hit ? hit.pos : -1, alias: hit ? hit.alias : "", img: img ? (img.startsWith("http") ? img : "https://monochrome-watches.com" + img) : "", url };
    (hit ? mono : monoMiss).push(item);
  }
}
const monoU = dedupe(mono, x => x.brand + "|" + x.model.toLowerCase().replace(/[^a-z0-9]/g, ""));

// ---------- Hodinkee ----------
const HOD_OK = new Set(["Introducing", "Hands-On"]);
const hodCards = JSON.parse(read("hod-152.json")).package.cards;
const hod = [], hodMiss = [];
for (const c of hodCards) {
  if (!HOD_OK.has(c.metadata && c.metadata.column_name)) continue;
  const title = dec(c.message.title);
  const hit = detectBrand(title);
  const raw = c.media && c.media.image && c.media.image.url;
  const item = { brand: hit ? hit.brand : null, model: cleanModel(title, hit), title, img: raw ? raw.split("?")[0] + "?fm=jpg&q=60&auto=format&w=640&h=427&fit=crop" : "", url: c.action.share_url };
  (hit ? hod : hodMiss).push(item);
}

// ---------- Worn & Wound (articol cu 9 ceasuri, imagini preluate din articol) ----------
const WW = "https://wornandwound.com/library/uploads/";
const wwUrl = "https://wornandwound.com/our-favorite-watches-of-2026-so-far/";
const ww = [
  ["Baltic", "Seconde Majeure (x SpaceOne)", "2026/05/Space-One-Baltic-2.jpg"],
  ["Grand Seiko", "SBGX359", "2026/02/Grand-Seiko-new-quartz-7.jpg"],
  ["Grand Seiko", "SBGX361", "2026/02/Grand-Seiko-new-quartz-7.jpg"],
  ["Zenith", "G.F.J. Tantalum", "2026/04/WW26_Zenith_GFJ_02_WR.jpg"],
  ["Grand Seiko", "SLGB023 Spring Drive U.F.A. Ushio 300 Diver", "2026/04/SLGB023_1.jpg"],
  ["Tudor", "Monarch", "2026/04/Tudor-Monarch-ZK-wrist-shot.jpg"],
  ["Fears", "Brunswick 40.5 Jump Hour ‘Celestial’", "2026/06/Fears-Celestial-BWD-2026.jpg"],
  ["Doxa", "Sub 200 T.Graph II", "2026/06/Doxa-Sub-200-Tgraph-blue.jpg"],
  ["Dryden", "Chrono Diver Gen 2", "2026/06/Dryden-Chrono-Diver-2026.jpg"]
].map(([brand, model, img]) => ({ brand, model, img: WW + img, url: wwUrl }));

const out = { generated: new Date().toISOString(), twp, mono: monoU, hodinkee: hod, ww, wwg: wwgU };
fs.writeFileSync(path.join(__dirname, "releases.json"), JSON.stringify(out));
fs.writeFileSync(path.join(__dirname, "misses.json"), JSON.stringify({ monoMiss, hodMiss }, null, 1));
console.log({ twp: twp.length, twpU: twpU.length, wwg: wwgU.length, mono: mono.length, monoU: monoU.length, monoMiss: monoMiss.length, hod: hod.length, hodMiss: hodMiss.length, ww: ww.length });
console.log("noimg", Object.fromEntries(Object.entries(out).filter(([k]) => Array.isArray(out[k])).map(([k, v]) => [k, v.filter(x => !x.img).length])));
