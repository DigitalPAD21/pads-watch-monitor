// Detectarea brandului într-un titlu de articol, cu dicționarul și alias-urile din build.js
// plus toate brandurile cunoscute din data.js (MODELS) și din prima versiune (brands-v1.js).
const fs = require("fs");
const path = require("path");

const buildSrc = fs.readFileSync(path.join(__dirname, "build.js"), "utf8");
const aliasLiteral = buildSrc.match(/const ALIASES = (\{[\s\S]*?\n\});/)[1];
const ALIASES = eval("(" + aliasLiteral + ")");
const EXTRA = {
  "Grand Seiko": "Grand Seiko", "Cartier": "Cartier", "Breitling": "Breitling", "Swatch": "Swatch", "Tissot": "Tissot",
  "Sinn": "Sinn", "Glashütte Original": "Glashütte Original", "Lange": "A. Lange & Söhne", "F.P. Journe": "F.P. Journe",
  "FP Journe": "F.P. Journe", "Journe": "F.P. Journe", "Richard Mille": "Richard Mille", "Jacob & Co.": "Jacob & Co.",
  "Jacob & Co": "Jacob & Co.", "De Bethune": "De Bethune", "Kari Voutilainen": "Voutilainen", "Voutilainen": "Voutilainen",
  "Christopher Ward": "Christopher Ward", "Zodiac": "Zodiac", "Seiko": "Seiko", "Casio": "Casio", "G-Shock": "Casio",
  "Bulova": "Bulova", "Norqain": "Norqain", "Ming": "Ming", "Furlan Marri": "Furlan Marri", "Lorier": "Lorier",
  "Serica": "Serica", "Unimatic": "Unimatic", "Anordain": "Anordain", "Kurono": "Kurono Tokyo", "Laurent Ferrier": "Laurent Ferrier",
  "MB&F": "MB&F", "Moser": "H. Moser & Cie.", "Montblanc": "Montblanc", "Ressence": "Ressence", "Ulysse Nardin": "Ulysse Nardin",
  "Vacheron Constantin": "Vacheron Constantin", "Hermès": "Hermès", "Hermes": "Hermès", "Chanel": "Chanel", "Dior": "Dior",
  "Louis Vuitton": "Louis Vuitton", "Bvlgari": "Bulgari", "BVLGARI": "Bulgari", "Bulgari": "Bulgari", "Tudor": "Tudor",
  "Rolex": "Rolex", "Omega": "Omega", "Longines": "Longines", "Oris": "Oris", "Nomos": "Nomos", "Junghans": "Junghans",
  "Mido": "Mido", "Certina": "Certina", "Rado": "Rado", "Hamilton": "Hamilton", "Citizen": "Citizen", "Orient": "Orient",
  "Timex": "Timex", "Doxa": "Doxa", "Squale": "Squale", "Baltic": "Baltic", "Farer": "Farer", "Formex": "Formex",
  "Studio Underd0g": "Studio Underd0g", "Breguet": "Breguet", "Blancpain": "Blancpain", "Jaquet Droz": "Jaquet Droz",
  "Parmigiani": "Parmigiani Fleurier", "Chopard": "Chopard", "Piaget": "Piaget", "Panerai": "Panerai", "IWC": "IWC",
  "Zenith": "Zenith", "Hublot": "Hublot", "TAG Heuer": "TAG Heuer", "Tag Heuer": "TAG Heuer", "Heuer": "TAG Heuer",
  "Audemars Piguet": "Audemars Piguet", "Patek Philippe": "Patek Philippe", "Patek": "Patek Philippe",
  "Jaeger-LeCoultre": "Jaeger-LeCoultre", "Jaeger LeCoultre": "Jaeger-LeCoultre", "JLC": "Jaeger-LeCoultre",
  "Girard-Perregaux": "Girard-Perregaux", "Girard Perregaux": "Girard-Perregaux", "Frederique Constant": "Frederique Constant",
  "Frédérique Constant": "Frederique Constant", "Raymond Weil": "Raymond Weil", "Maurice Lacroix": "Maurice Lacroix",
  "Bell & Ross": "Bell & Ross", "Bell&Ross": "Bell & Ross", "Bremont": "Bremont", "Czapek": "Czapek", "Grönefeld": "Grönefeld",
  "Gronefeld": "Grönefeld", "Urwerk": "Urwerk", "Greubel Forsey": "Greubel Forsey", "Armin Strom": "Armin Strom",
  "Arnold & Son": "Arnold & Son", "Angelus": "Angelus", "Louis Moinet": "Louis Moinet", "Louis Erard": "Louis Erard",
  "Ochs und Junior": "Ochs und Junior", "Konstantin Chaykin": "Konstantin Chaykin", "Krayon": "Krayon",
  "Rexhep Rexhepi": "Rexhep Rexhepi", "Akrivia": "Rexhep Rexhepi", "Simon Brette": "Simon Brette", "Petermann Bédat": "Petermann Bédat",
  "Petermann Bedat": "Petermann Bédat", "Andersen Genève": "Andersen Genève", "Kudoke": "Kudoke", "Moritz Grossmann": "Moritz Grossmann",
  "Lang & Heyne": "Lang & Heyne", "Tutima": "Tutima", "Stowa": "Stowa", "Laco": "Laco", "Hanhart": "Hanhart", "Fortis": "Fortis",
  "Vulcain": "Vulcain", "Yema": "Yema", "Lip": "Lip", "Pequignet": "Pequignet", "Trilobe": "Trilobe", "Anoma": "Anoma",
  "Raketa": "Raketa", "Vostok": "Vostok", "Glycine": "Glycine", "Eterna": "Eterna", "Alpina": "Alpina", "Edox": "Edox",
  "Ball": "Ball", "Victorinox": "Victorinox", "Swiss Military": "Swiss Military", "Mühle-Glashütte": "Mühle-Glashütte",
  "Muhle Glashutte": "Mühle-Glashütte", "Garmin": "Garmin", "Apple Watch": "Apple", "Gucci": "Gucci", "Van Cleef & Arpels": "Van Cleef & Arpels",
  "Tiffany": "Tiffany & Co.", "Tiffany & Co.": "Tiffany & Co.", "Ralph Lauren": "Ralph Lauren", "Porsche Design": "Porsche Design",
  "Gerald Genta": "Gerald Genta", "Gérald Genta": "Gerald Genta", "Daniel Roth": "Daniel Roth", "Ferdinand Berthoud": "Ferdinand Berthoud",
  "Chronoswiss": "Chronoswiss", "Corum": "Corum", "Cvstos": "Cvstos", "HYT": "HYT", "Hautlence": "Hautlence", "Speake-Marin": "Speake-Marin",
  "Speake Marin": "Speake-Marin", "Bovet": "Bovet", "Roger Dubuis": "Roger Dubuis", "Ludovic Ballouard": "Ludovic Ballouard",
  "Romain Gauthier": "Romain Gauthier", "Laurent Ferrier ": "Laurent Ferrier", "Sarpaneva": "Sarpaneva", "Habring": "Habring²",
  "Habring²": "Habring²", "Credor": "Credor", "King Seiko": "King Seiko", "Orient Star": "Orient Star", "Minase": "Minase",
  "Naoya Hida": "Naoya Hida", "Hajime Asaoka": "Hajime Asaoka", "Masahiro Kikuno": "Masahiro Kikuno", "Kikuno": "Masahiro Kikuno"
};

const known = new Map();
const add = (alias, brand) => { if (alias && brand && !known.has(alias)) known.set(alias, brand); };
for (const [a, b] of Object.entries(ALIASES)) add(a, b);
for (const [a, b] of Object.entries(EXTRA)) add(a.trim(), b);
// Branduri canonice din datele existente.
const dataSrc = fs.readFileSync(path.join(__dirname, "..", "data.js"), "utf8");
for (const m of dataSrc.matchAll(/^\s*\["([^"]+)",/gm)) add(m[1], m[1]);
const v1 = fs.readFileSync(path.join(__dirname, "brands-v1.js"), "utf8");
for (const m of v1.matchAll(/"([^"\n]{2,40})"/g)) {
  const s = m[1];
  if (!/^https?:/.test(s) && !/[.,;:]\s/.test(s) && /^[A-Z0-9]/.test(s) && s !== "Watches") add(s, ALIASES[s] || s);
}
known.delete("Watches"); known.delete("Le Petit Prince"); known.delete("Blue"); known.delete("Capri");

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const matchers = [...known].map(([alias, brand]) => ({
  alias, brand, re: new RegExp("(^|[^\\p{L}\\p{N}])" + esc(alias) + "(?![\\p{L}\\p{N}])", "u")
}));

// Brandul care apare cel mai devreme în titlu; la egalitate, aliasul cel mai lung.
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
const canonical = name => (known.get(name) || name);

module.exports = { detectBrand, canonical, known };
