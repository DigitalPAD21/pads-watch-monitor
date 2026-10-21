// Extrage referințele din blocul de specificații al articolelor Monochrome („Reference:”)
// și Hodinkee („Reference Number:”). Scrie article-refs.json: { url: { refs: [...], raw } }.
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "raw", "articles");
const lines = fs.readFileSync(path.join(__dirname, "article-urls.txt"), "utf8").trim().split("\n").map(l => l.split(" "));
const dec = s => s.replace(/&amp;/g, "&").replace(/&#8211;|&ndash;/g, "–").replace(/&#8217;/g, "’").replace(/&nbsp;|&#160;/g, " ")
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));

// Valoarea de după o etichetă, până la următoarea etichetă („Ceva:”) din specificații.
function valueAfter(textLines, labelRe) {
  for (let i = 0; i < textLines.length; i++) {
    const m = textLines[i].match(labelRe);
    if (!m) continue;
    let v = textLines[i].slice(m[0].length).trim();
    for (let j = i + 1; j < textLines.length && j < i + 6; j++) {
      const l = textLines[j].trim();
      if (!l) continue;
      if (/^[A-Z][\w &/()'-]{1,30}:\s*$/.test(l) || /^[A-Z][\w &/()'-]{1,30}:\s/.test(l) && j > i + 1) break;
      v += (v ? " " : "") + l;
      if (/[:]$/.test(textLines[j + 1] || "")) break;
    }
    return v.trim();
  }
  return "";
}

// Câmpul amestecă coduri și descrieri („5517BB/YA/5ZU white gold, 5517BB/YA/BZO …”).
// Cuvintele obișnuite (cu litere mici) și semnele de separare despart codurile; rămân bucățile cu cifre.
function splitRefs(v) {
  if (!v) return [];
  const parts = v
    .replace(/\([^)]*\)/g, "  ")
    .replace(/\b(ref(erence)?s?\.?|nos?\.)\s*/gi, "  ")
    .split(/\s*(?:,|;|&|\||\s[–—-]\s|\s{2,}|\b(?:[A-Za-z][a-z]{2,}|[a-z]{1,2})\b)\s*/)
    .map(s => (s || "").trim().replace(/^[-–/.\s]+|[-–/.\s]+$/g, ""))
    .filter(s => s.length >= 4 && s.length <= 40 && ((s.match(/\d/g) || []).length >= 4 || /[A-Z]{2,}\d{2,}|\d{2,}[A-Z]/.test(s)));
  return [...new Set(parts)];
}

const out = {};
let withRef = 0, missing = 0;
for (const [id, url] of lines) {
  const f = path.join(dir, id + ".html");
  if (!fs.existsSync(f) || fs.statSync(f).size < 5000) { missing++; continue; }
  const h = fs.readFileSync(f, "utf8");
  const text = dec(h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "\n"));
  const tl = text.split("\n").map(s => s.replace(/\s+/g, " ").trim()).filter(Boolean);
  const raw = valueAfter(tl, /^(Reference Numbers?|References?|Ref\.?)\s*:/i);
  const refs = splitRefs(raw);
  out[url] = { refs, raw };
  if (refs.length) withRef++;
}
fs.writeFileSync(path.join(__dirname, "article-refs.json"), JSON.stringify(out, null, 1));
console.log({ articles: lines.length, parsed: Object.keys(out).length, withRef, missing });
