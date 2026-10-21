// Grupează lansările care descriu același ceas (în aceeași sursă sau între surse).
// Reguli, aplicate pe fiecare brand:
//  1. Aceeași referință de bază (5840P, 126680, PAM01731, SBGX359) => același ceas.
//  2. Altfel, numele se compară ca seturi de cuvinte: dacă unul îl conține pe celălalt și
//     cuvintele în plus sunt doar descriptive (culoare, material, ediție), e același ceas.
//     Cuvintele care schimbă modelul (gmt, chronograph, tourbillon, skeleton...) sau
//     numere diferite (34 vs 36 mm) împiedică gruparea.
//  3. Două grupuri nu se unesc dacă ar ajunge să conțină ceasuri care se contrazic
//     (referințe diferite sau numere diferite), ca un nume generic să nu lege totul.

const STOP = new Set(("the a an new all of with and in for by from to on its at ref reference edition editions limited le " +
  "collection series model models version versions watch watches 2026 incl video live pics photos update updated mm " +
  "first look introducing hands").split(" "));
// Cuvinte care schimbă ceasul; dacă apar doar într-unul din nume, nu sunt duplicate.
const DEFINING = new Set(("gmt chrono chronograph chronographe tourbillon skeleton openworked squelette repeater " +
  "worldtimer worldtime world time moonphase moon lune calendar annual perpetual alarm alarme jumping flyback split " +
  "rattrapante regulator automaton pocket clock desk joaillerie diver dual date day small seconds power reserve " +
  "pilot ladies lady minute hour quartz solar").split(" "));

const REF_RE = /\b(PAM\d{5}|[A-Z]{3,4}\d{3}|\d{4}(?:\/\d{2,3})?[A-Z]{1,2}|[12]\d{5})(?:-\d{3})?\b/g;

const fold = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function analyse(model) {
  const refs = [...new Set([...model.matchAll(REF_RE)].map(m => m[1]))];
  let text = model;
  for (const m of model.matchAll(REF_RE)) text = text.replace(m[0], " ");
  const tokens = fold(text)
    .replace(/(\d+)\s*mm\b/g, "$1")
    .replace(/[“”"'’‘()\[\],.:;!?&+/–—-]/g, " ")
    .split(/\s+/)
    .filter(t => t && !STOP.has(t));
  const words = new Set(tokens);
  const numbers = new Set(tokens.filter(t => /^\d+$/.test(t)));
  // Un nume care enumeră mai multe modele („X and Y”) nu poate lega grupuri între ele.
  const multi = refs.length > 1 || /\b(and|&|trilogy|trio|set)\b/i.test(model);
  return { refs, words, numbers, multi };
}

const subset = (a, b) => { for (const x of a) if (!b.has(x)) return false; return true; };
const diff = (a, b) => [...a].filter(x => !b.has(x));

// Sunt cele două intrări același ceas? Întoarce un motiv sau null.
function same(a, b) {
  if (a.refs.length && b.refs.length) {
    const shared = a.refs.filter(r => b.refs.includes(r));
    return shared.length ? `aceeași referință ${shared[0]}` : null;
  }
  if (!a.words.size || !b.words.size) return null;
  const [small, big] = a.words.size <= b.words.size ? [a, b] : [b, a];
  if (!subset(small.words, big.words)) return null;
  const extra = diff(big.words, small.words);
  if (extra.some(w => DEFINING.has(w))) return null;
  // Un nume generic („Big Bang”) nu acoperă variante mult mai detaliate.
  if (small.words.size / big.words.size < 0.5) return null;
  if (small.numbers.size === 0 && big.numbers.size > 0) return null;
  // Un singur cuvânt comun (ex. „Monarch”) e acceptat doar dacă e un nume de model, nu un număr.
  if (small.words.size === 1 && /^\d+$/.test([...small.words][0])) return null;
  // „Calatrava 7200/50G” e o colecție + referință; fără referința celuilalt nu știm dacă e același ceas.
  if (small.words.size === 1 && (small.refs.length || big.refs.length)) return null;
  return extra.length ? `același nume, diferă doar prin: ${extra.join(", ")}` : "același nume";
}

function conflict(a, b) {
  if (a.refs.length && b.refs.length && !a.refs.some(r => b.refs.includes(r))) return true;
  if (a.numbers.size && b.numbers.size && ![...a.numbers].some(n => b.numbers.has(n))) return true;
  const da = diff(a.words, b.words).filter(w => DEFINING.has(w));
  const db = diff(b.words, a.words).filter(w => DEFINING.has(w));
  return da.length > 0 && db.length > 0;
}

// items: [{ brand, model, ... }] — întoarce pentru fiecare item un id de grup și lista grupurilor.
function group(items) {
  const info = items.map(x => analyse(x.model));
  const parent = items.map((_, i) => i);
  const members = items.map((_, i) => [i]);
  const reason = {};
  const find = i => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const byBrand = {};
  items.forEach((x, i) => (byBrand[x.brand] = byBrand[x.brand] || []).push(i));

  for (const idx of Object.values(byBrand)) {
    const pairs = [];
    for (let p = 0; p < idx.length; p++) {
      for (let q = p + 1; q < idx.length; q++) {
        const i = idx[p], j = idx[q];
        const r = same(info[i], info[j]);
        if (!r) continue;
        // Potrivirile pe referință au prioritate, apoi cele cu cele mai puține diferențe.
        const score = r.startsWith("aceeași referință") ? 0 : 1 + Math.abs(info[i].words.size - info[j].words.size);
        pairs.push({ i, j, r, score });
      }
    }
    pairs.sort((a, b) => a.score - b.score);
    for (const { i, j, r } of pairs) {
      let ri = find(i), rj = find(j);
      if (ri === rj) continue;
      // O intrare cu mai multe modele se poate atașa unui singur grup, nu le poate uni.
      if ((info[i].multi && members[ri].length > 1 && members[rj].length > 1) ||
          (info[j].multi && members[ri].length > 1 && members[rj].length > 1)) continue;
      if (members[ri].some(a => members[rj].some(b => conflict(info[a], info[b])))) continue;
      // Grupurile se unesc doar dacă majoritatea perechilor dintre ele sunt duplicate.
      let ok = 0, total = 0;
      for (const a of members[ri]) for (const b of members[rj]) { total++; if (same(info[a], info[b])) ok++; }
      if (ok * 2 < total) continue;
      if (members[ri].length < members[rj].length) [ri, rj] = [rj, ri];
      parent[rj] = ri;
      members[ri].push(...members[rj]);
      members[rj] = [];
      reason[i + "-" + j] = r;
    }
  }
  const groupOf = items.map((_, i) => find(i));
  const groups = members.map((m, root) => ({ root, members: m })).filter(g => g.members.length);

  // Posibile duplicate: grupuri diferite ale aceluiași brand cu nume foarte apropiate,
  // pe care regulile stricte nu le-au unit. Se afișează pentru verificare, nu se comasează.
  const possible = new Map();
  for (const idx of Object.values(byBrand)) {
    for (let p = 0; p < idx.length; p++) {
      for (let q = p + 1; q < idx.length; q++) {
        const i = idx[p], j = idx[q];
        const gi = groupOf[i], gj = groupOf[j];
        if (gi === gj) continue;
        const r = near(info[i], info[j]);
        if (!r) continue;
        const key = gi < gj ? gi + "-" + gj : gj + "-" + gi;
        if (!possible.has(key)) possible.set(key, { a: Math.min(gi, gj), b: Math.max(gi, gj), reason: r });
      }
    }
  }
  return { groupOf, groups, reason, possible: [...possible.values()] };
}

// Nume aproape identice: unul îl conține pe celălalt și diferă printr-un singur cuvânt „de model”,
// sau au cel puțin 3 cuvinte și 75% din cuvinte în comun.
function near(a, b) {
  if (a.refs.length && b.refs.length && !a.refs.some(r => b.refs.includes(r))) return null;
  if (a.numbers.size && b.numbers.size && ![...a.numbers].some(n => b.numbers.has(n))) return null;
  const [small, big] = a.words.size <= b.words.size ? [a, b] : [b, a];
  if (small.words.size < 2) return null;
  if (subset(small.words, big.words)) {
    const extra = diff(big.words, small.words);
    const defining = extra.filter(w => DEFINING.has(w));
    if (defining.length === 1 && extra.length <= 2) return `diferă doar prin: ${extra.join(", ")}`;
    return null;
  }
  const inter = [...small.words].filter(w => big.words.has(w)).length;
  const union = new Set([...a.words, ...b.words]).size;
  if (small.words.size >= 3 && inter / union >= 0.75) return "nume foarte apropiate";
  return null;
}

module.exports = { group, analyse, same };
