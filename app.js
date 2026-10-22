// Statistica pe branduri și pagina fiecărui brand, organizate pe referințe.
// O lansare = o referință (fiecare variantă de cadran sau material are referința ei).
// Referințele sunt grupate pe model; fiecare model arată în ce surse a apărut.

// Datele generate (data.js), înainte de corecțiile manuale.
const baseModels = MODELS.map(([brand, name, articleOnly, refs, coverage]) => ({
  brand, name, articleOnly: !!articleOnly, aliases: [],
  refs: refs.map(([ref, dial, material, img, url, variant]) => ({ ref, dial, material, img, url, variant })),
  coverage: coverage.map(([src, model, url]) => ({ source: SOURCES[src], model, url }))
}));

// Corecțiile manuale (corrections.js) se aplică peste date; tot ce se afișează și se numără vine din `models`.
let corrections = typeof CORRECTIONS !== "undefined" ? CORRECTIONS : [];
let correctionStatus = [];
let models = [];
let brandBySlug = {};
// Starea „Verificat” a brandurilor: cea publicată în corrections.js (setată din modul editare)
// și, pe site-ul public, cea notată de vizitator în propriul browser, care o are prioritate.
let fileVerified = () => false;
const VER_KEY = "pads-watch-monitor:verified";
const localVerified = (() => {
  try { return JSON.parse(localStorage.getItem(VER_KEY) || "{}"); } catch { return {}; }
})();
const isVerified = brand => !editMode && Object.prototype.hasOwnProperty.call(localVerified, brand)
  ? localVerified[brand] : fileVerified(brand);
function rebuild() {
  const r = Corrections.apply(baseModels, corrections);
  models = r.models.map((m, i) => ({ ...m, id: i }));
  correctionStatus = r.status;
  fileVerified = r.isVerified;
  brandBySlug = Object.fromEntries([...new Set(models.map(m => m.brand))].map(b => [slug(b), b]));
}

let current = "all";
let query = "";
let currentBrand = null;
let onlyHighlights = false;
let modelQuery = "";
// Modul editare există doar pe varianta locală (node server.js); `editing` e formularul deschis acum.
let editMode = false;
let editing = null; // { act, model, ref? }

// Modelele marcate cu „Highlight” se păstrează în browserul vizitatorului (localStorage),
// după o cheie stabilă brand + nume model, ca selecția să rămână și după actualizarea datelor.
const HL_KEY = "pads-watch-monitor:highlights";
const modelKey = m => slug(m.brand) + "/" + slug(m.name);
const highlights = new Set((() => {
  try { return JSON.parse(localStorage.getItem(HL_KEY) || "[]"); } catch { return []; }
})());
// Un model redenumit sau comasat rămâne marcat: se verifică și numele lui vechi.
const keysOf = m => [modelKey(m), ...(m.aliases || []).map(a => slug(m.brand) + "/" + slug(a))];
const isHighlighted = m => keysOf(m).some(k => highlights.has(k));
function toggleHighlight(m) {
  if (isHighlighted(m)) keysOf(m).forEach(k => highlights.delete(k));
  else highlights.add(modelKey(m));
  try { localStorage.setItem(HL_KEY, JSON.stringify([...highlights])); } catch {}
}

const covers = (m, id) => id === "all" || m.coverage.some(c => c.source.id === id);
const visibleModels = () => models.filter(m => covers(m, current));

// Pentru sursa selectată: brand -> { refs, models, articles }.
// articles: câte articole (sau fișe) a publicat fiecare sursă despre modelele brandului.
function stats() {
  const out = {};
  for (const m of visibleModels()) {
    const b = (out[m.brand] = out[m.brand] || { refs: 0, models: 0, highlights: 0, articles: {} });
    b.refs += m.refs.length;
    b.models++;
    if (isHighlighted(m)) b.highlights++;
    for (const c of m.coverage) b.articles[c.source.id] = (b.articles[c.source.id] || 0) + 1;
  }
  return out;
}

// All Watch News adună știri din alte publicații: contează la statistică, dar nu apare sub branduri.
const HIDDEN_IN_LIST = new Set(["allwatchnews"]);

// În română, de la 20 în sus (și la multipli de 100) se pune „de”: „43 de lansări”.
const plural = (n, one, many) => {
  if (n === 1) return `1 ${one}`;
  const r = n % 100;
  return r >= 20 || (r === 0 && n > 0) ? `${n} de ${many}` : `${n} ${many}`;
};
const lansari = n => plural(n, "lansare", "lansări");
const fmt = n => n.toLocaleString("ro-RO");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const slug = b => b.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

rebuild();

const $ = id => document.getElementById(id);

// Tag-ul „Verificat” / „Neverificat” de lângă numele brandului: un click comută starea.
// În modul editare starea se publică (corrections.js); altfel se reține doar în acest browser.
function statusTag(brand) {
  const on = isVerified(brand);
  const where = editMode ? "Se salvează în corrections.js." : "Se reține în acest browser.";
  return `<button class="vtag${on ? " is-verified" : ""}" type="button" data-verify="${esc(brand)}" aria-pressed="${on}"
    title="Apasă ca să marchezi ${on ? "Neverificat" : "Verificat"}. ${where}">${on ? "✓ Verificat" : "Neverificat"}</button>`;
}

function renderChips() {
  // Sursele fără nicio lansare (ex. GMT Post) apar doar în „Despre Proiect”.
  const chips = [{ id: "all", name: "Toate sursele" }, ...SOURCES.filter(s => models.some(m => covers(m, s.id)))];
  $("source-chips").innerHTML = chips.map(c => `
    <button class="chip${c.id === current ? " is-active" : ""}" data-source="${c.id}">${esc(c.name)}</button>`).join("");
}

function renderList() {
  const st = stats();
  const rows = Object.entries(st).sort((a, b) => b[1].refs - a[1].refs || a[0].localeCompare(b[0]));
  const max = rows.length ? rows[0][1].refs : 1;
  const refs = rows.reduce((n, [, b]) => n + b.refs, 0);
  const mods = rows.reduce((n, [, b]) => n + b.models, 0);

  $("kpis").innerHTML = `
    <div class="kpi"><b>${fmt(refs)}</b><span>referințe lansate</span></div>
    <div class="kpi"><b>${fmt(mods)}</b><span>modele</span></div>
    <div class="kpi"><b>${rows.length}</b><span>branduri</span></div>`;

  $("source-note").textContent = current === "all"
    ? "O lansare = o referință: fiecare variantă de cadran sau material are referința ei. Același ceas apărut în mai multe surse e numărat o singură dată. Sub fiecare brand: câte articole a publicat fiecare sursă. Apasă pe un brand ca să vezi modelele și referințele."
    : `Referințele modelelor despre care a scris ${SOURCES.find(s => s.id === current).name}. ${SOURCES.find(s => s.id === current).note}`;

  const q = query.trim().toLowerCase();
  const visible = rows.map((r, i) => [i + 1, ...r]).filter(([, brand]) => brand.toLowerCase().includes(q));

  $("brand-list").innerHTML = visible.length ? visible.map(([rank, brand, b]) => {
    const parts = [];
    if (b.highlights) parts.push(`<span class="hl-count">★ ${b.highlights} highlight</span>`);
    if (current === "all") {
      // Sursele, de la cele cu cele mai multe articole la cele cu cele mai puține.
      parts.push(...SOURCES
        .filter(s => b.articles[s.id] && !HIDDEN_IN_LIST.has(s.id))
        .sort((x, y) => b.articles[y.id] - b.articles[x.id] || x.name.localeCompare(y.name))
        .map(s => `${esc(s.name)}: ${b.articles[s.id]}`));
    }
    return `<li>
      <span class="rank">${rank}.</span>
      <span class="line"><button class="brand-link" data-brand="${esc(brand)}">${esc(brand)}</button> ${statusTag(brand)} - <span class="n">${lansari(b.refs)}</span> - <span class="n">${plural(b.models, "model", "modele")}</span></span>
      <span class="bar"><i style="width:${(b.refs / max) * 100}%"></i></span>
      ${parts.length ? `<span class="split">${parts.join(" · ")}</span>` : ""}
    </li>`;
  }).join("") : `<li class="empty">Niciun brand găsit.</li>`;
}

// Traducerea culorilor și materialelor din The Watch Pages; ce nu e în listă rămâne în engleză.
const RO = {
  blue: "albastru", green: "verde", black: "negru", white: "alb", silver: "argintiu", gray: "gri", grey: "gri",
  brown: "maro", red: "roșu", beige: "bej", salmon: "somon", gold: "auriu", champagne: "șampanie", pink: "roz",
  purple: "mov", yellow: "galben", orange: "portocaliu", turquoise: "turcoaz", burgundy: "vișiniu", cream: "crem",
  "mother-of-pearl": "sidef", skeleton: "scheletat", "artistic dial": "decor artistic", transparent: "transparent", multicolor: "multicolor",
  "white gold": "aur alb", "rose gold": "aur roz", "yellow gold": "aur galben", "red gold": "aur roșu", platinum: "platină",
  "stainless steel": "oțel inoxidabil", steel: "oțel", titanium: "titan", ceramic: "ceramică", bronze: "bronz",
  carbon: "carbon", tantalum: "tantal", sapphire: "safir", aluminium: "aluminiu", aluminum: "aluminiu", "18k gold": "aur 18k"
};
const ro = s => s.split(/\s*,\s*/).map(p => RO[p.toLowerCase()] || p).join(", ");

const refLabel = r => r.ref || r.variant || "Referință nespecificată";

function refRow(r, m) {
  const code = refLabel(r);
  const details = [r.dial && `Cadran ${ro(r.dial)}`, r.material && ro(r.material)].filter(Boolean).join(" · ");
  const key = Corrections.refKey(r);
  const ed = editMode && editing && editing.model === m.id && editing.ref === key ? editing : null;
  return `
    <li class="ref">
      <a class="thumb" href="${esc(r.url)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">
        ${r.img ? `<img src="${esc(r.img)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : ""}
        <span class="thumb-fallback">Imagine indisponibilă</span>
      </a>
      <div class="ref-text">
        ${ed && ed.act === "editRef" ? `
          <form class="edit-form" data-model="${m.id}" data-ref="${esc(key)}" data-act="editRef">
            <label class="edit-label" for="edit-ref-input">Referința corectă</label>
            <input id="edit-ref-input" class="edit-input" value="${esc(r.ref || "")}" placeholder="ex. 5322G-001" required>
            <div class="edit-actions"><button class="btn-save" type="submit">Salvează</button><button class="btn-cancel" type="button" data-act="cancel">Renunță</button></div>
          </form>` : `<p class="ref-code${r.ref ? "" : " is-unknown"}">${esc(code)}</p>`}
        ${details ? `<p class="ref-details">${esc(details)}</p>` : ""}
        <a class="ref-link" href="${esc(r.url)}" target="_blank" rel="noopener">Vezi la sursă</a>
        ${ed && ed.act === "deleteRef" ? `
          <div class="edit-confirm" role="alert">
            <p>Ștergi referința <strong>${esc(code)}</strong>?${m.refs.length === 1 ? " E singura referință a modelului, așa că modelul dispare și el." : ""}</p>
            <div class="edit-actions"><button class="btn-danger" type="button" data-act="confirmDeleteRef" data-model="${m.id}" data-ref="${esc(key)}">Da, șterge</button><button class="btn-cancel" type="button" data-act="cancel">Renunță</button></div>
          </div>` : ""}
        ${editMode && !ed ? `
          <div class="edit-tools">
            <button class="edit-btn" type="button" data-act="editRef" data-model="${m.id}" data-ref="${esc(key)}" title="Editează referința">✎ Editează</button>
            <button class="edit-btn is-danger" type="button" data-act="deleteRef" data-model="${m.id}" data-ref="${esc(key)}" title="Șterge referința">🗑 Șterge</button>
          </div>` : ""}
      </div>
    </li>`;
}

// Bara de editare a unui model și formularul deschis pentru el (redenumire, ștergere, comasare).
function modelEditor(m) {
  if (!editMode) return "";
  const ed = editing && editing.model === m.id && !editing.ref ? editing : null;
  if (!ed) return `
    <div class="edit-tools">
      <button class="edit-btn" type="button" data-act="rename" data-model="${m.id}">✎ Redenumește</button>
      <button class="edit-btn" type="button" data-act="merge" data-model="${m.id}">⇄ Comasează</button>
      <button class="edit-btn is-danger" type="button" data-act="deleteModel" data-model="${m.id}">🗑 Șterge modelul</button>
    </div>`;
  if (ed.act === "rename") return `
    <form class="edit-form" data-model="${m.id}" data-act="rename">
      <label class="edit-label" for="edit-name-input">Numele corect al modelului</label>
      <input id="edit-name-input" class="edit-input" value="${esc(m.name)}" required>
      <div class="edit-actions"><button class="btn-save" type="submit">Salvează</button><button class="btn-cancel" type="button" data-act="cancel">Renunță</button></div>
    </form>`;
  if (ed.act === "deleteModel") return `
    <div class="edit-confirm" role="alert">
      <p>Ștergi modelul <strong>${esc(m.name)}</strong> cu ${plural(m.refs.length, "referință", "referințe")}? Lansările brandului scad cu ${m.refs.length}.</p>
      <div class="edit-actions"><button class="btn-danger" type="button" data-act="confirmDeleteModel" data-model="${m.id}">Da, șterge</button><button class="btn-cancel" type="button" data-act="cancel">Renunță</button></div>
    </div>`;
  if (ed.act === "merge") {
    const others = models.filter(x => x.brand === m.brand && x !== m).sort((a, b) => a.name.localeCompare(b.name));
    if (!others.length) return `
      <div class="edit-confirm"><p>${esc(m.brand)} nu are alt model cu care să comasezi.</p>
        <div class="edit-actions"><button class="btn-cancel" type="button" data-act="cancel">Închide</button></div></div>`;
    return `
    <form class="edit-form" data-model="${m.id}" data-act="merge">
      <label class="edit-label" for="edit-merge-select">Comasează „${esc(m.name)}” în modelul:</label>
      <select id="edit-merge-select" class="edit-input" required>
        ${others.map(x => `<option value="${x.id}">${esc(x.name)} (${plural(x.refs.length, "referință", "referințe")})</option>`).join("")}
      </select>
      <p class="edit-hint">Referințele și articolele lui se mută în modelul ales, iar „${esc(m.name)}” dispare din listă. Referințele identice sunt numărate o singură dată.</p>
      <div class="edit-actions"><button class="btn-save" type="submit">Comasează</button><button class="btn-cancel" type="button" data-act="cancel">Renunță</button></div>
    </form>`;
  }
  return "";
}

// Căutarea pe pagina brandului: după numele modelului, referințe și numele din articole.
// Toate cuvintele căutate trebuie să apară, în orice ordine, fără diacritice și majuscule.
const foldText = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const matchesModel = (m, q) => {
  const words = foldText(q).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = foldText([m.name, ...m.refs.map(r => r.ref || r.variant), ...m.coverage.map(c => c.model)].join(" "));
  const compact = hay.replace(/[^a-z0-9]/g, "");
  return words.every(w => hay.includes(w) || compact.includes(w.replace(/[^a-z0-9]/g, "")));
};

function renderBrand(brand) {
  const all = visibleModels().filter(m => m.brand === brand);
  const marked = all.filter(isHighlighted).length;
  if (!marked) onlyHighlights = false;
  const shown = onlyHighlights ? all.filter(isHighlighted) : all;
  const list = shown.filter(m => matchesModel(m, modelQuery));
  $("model-count").textContent = modelQuery.trim()
    ? (list.length ? `${plural(list.length, "model găsit", "modele găsite")} din ${shown.length}` : "")
    : "";
  const refs = all.reduce((n, m) => n + m.refs.length, 0);
  $("brand-title").innerHTML = `${esc(brand)} ${statusTag(brand)}`;
  $("brand-meta").textContent = `${lansari(refs)} (referințe) în ${plural(all.length, "model", "modele")} · ${current === "all" ? "toate sursele" : SOURCES.find(s => s.id === current).name}`;
  $("brand-filters").innerHTML = `
    <button class="chip${onlyHighlights ? "" : " is-active"}" data-filter="all">Toate modelele (${all.length})</button>
    <button class="chip${onlyHighlights ? " is-active" : ""}" data-filter="hl"${marked ? "" : " disabled"}>★ Doar highlight (${marked})</button>`;

  $("model-list").innerHTML = list.map(m => modelCard(m)).join("") ||
    `<li class="empty">${modelQuery.trim() && shown.length
      ? `Niciun model ${esc(brand)} nu se potrivește cu „${esc(modelQuery.trim())}”. Încearcă alt nume sau o referință.`
      : onlyHighlights ? "Niciun model marcat cu Highlight." : "Nicio lansare pentru această sursă."}</li>`;
  watchImages($("model-list"));
}

function modelCard(m) {
  const srcCount = {};
  for (const c of m.coverage) srcCount[c.source.name] = (srcCount[c.source.name] || 0) + 1;
  const tags = Object.entries(srcCount).map(([n, c]) => `<span class="src-tag">${esc(n)}${c > 1 ? ` ×${c}` : ""}</span>`).join("");
  const articles = m.coverage.filter(c => c.source.id !== "twp");
  return `
    <li class="model-card${isHighlighted(m) ? " is-highlighted" : ""}">
      <header class="model-head">
        <div class="model-title">
          <h3 class="model-name">${esc(m.name)}</h3>
          <button class="hl-btn" data-model="${m.id}" aria-pressed="${isHighlighted(m)}"
            title="${isHighlighted(m) ? "Scoate din highlight" : "Marchează modelul"}">
            <span aria-hidden="true">${isHighlighted(m) ? "★" : "☆"}</span> Highlight</button>
        </div>
        <p class="model-meta">${plural(m.refs.length, "referință", "referințe")} · ${tags}</p>
        ${m.aliases.length && editMode ? `<p class="edit-hint">Nume anterioare: ${m.aliases.map(esc).join(", ")}</p>` : ""}
        ${modelEditor(m)}
      </header>
      <ul class="ref-list">${m.refs.map(r => refRow(r, m)).join("")}</ul>
      ${articles.length ? `
      <details class="dups">
        <summary>${plural(articles.length, "articol", "articole")} despre acest model</summary>
        <ul>${articles.map(c => `<li><span class="muted">${esc(c.source.name)}:</span> <a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.model)}</a></li>`).join("")}</ul>
      </details>` : ""}
    </li>`;
}

// Dacă o imagine nu se încarcă, rămâne cadrul gri cu textul de rezervă.
function watchImages(root) {
  root.querySelectorAll("img").forEach(img => {
    const fail = () => img.closest(".thumb").classList.add("is-missing");
    img.addEventListener("error", fail, { once: true });
    if (img.complete && img.naturalWidth === 0) fail();
  });
}

// Lista de preferințe: toate modelele marcate, din toate sursele, grupate pe brand.
const highlightedModels = () => models.filter(isHighlighted)
  .sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name));
let confirmClear = false;

function renderHighlights() {
  const list = highlightedModels();
  const refs = list.reduce((n, m) => n + m.refs.length, 0);
  const brands = [...new Set(list.map(m => m.brand))];
  $("hl-meta").textContent = list.length
    ? `${plural(list.length, "model marcat", "modele marcate")} · ${plural(refs, "referință", "referințe")} · ${plural(brands.length, "brand", "branduri")}`
    : "Lista ta e goală.";
  $("hl-actions").hidden = !list.length;
  $("hl-clear").textContent = confirmClear ? "Confirmă golirea listei" : "Golește lista";
  $("hl-clear").classList.toggle("is-danger", confirmClear);

  $("hl-list").innerHTML = list.length ? brands.map(b => `
    <section class="hl-brand">
      <h3 class="hl-brand-name"><button class="brand-link" data-brand="${esc(b)}">${esc(b)}</button>
        <span class="muted">${plural(list.filter(m => m.brand === b).length, "model", "modele")}</span></h3>
      <ul class="model-list">${list.filter(m => m.brand === b).map(modelCard).join("")}</ul>
    </section>`).join("") : `
    <div class="hl-empty">
      <p class="hl-empty-star" aria-hidden="true">☆</p>
      <p><strong>Niciun model marcat încă.</strong></p>
      <p class="muted">Deschide un brand din secțiunea 2026 și apasă „☆ Highlight” în dreptul modelelor care te interesează. Ele apar aici, grupate pe brand.</p>
      <button class="back" data-go="stats">Mergi la lansările 2026</button>
    </div>`;
  watchImages($("hl-list"));
  $("hl-copied").textContent = "";
}

// Text simplu, ușor de lipit într-un email sau document.
function highlightsText() {
  const list = highlightedModels();
  let out = `PAD's Watch Monitor · Highlights (${new Date().toLocaleDateString("ro-RO")})\n`;
  for (const b of [...new Set(list.map(m => m.brand))]) {
    out += `\n${b}\n`;
    for (const m of list.filter(x => x.brand === b)) {
      const refs = m.refs.map(r => {
        const det = [r.dial && `cadran ${ro(r.dial)}`, r.material && ro(r.material)].filter(Boolean).join(", ");
        return (r.ref || r.variant || "referință nespecificată") + (det ? ` (${det})` : "");
      });
      out += `- ${m.name}: ${refs.join("; ")}\n`;
    }
  }
  return out;
}

function showView(view, brand) {
  document.querySelectorAll(".tab").forEach(t => {
    const on = t.dataset.view === (view === "brand" ? "stats" : view);
    t.classList.toggle("is-active", on);
    t.setAttribute("aria-selected", on);
  });
  $("view-stats").hidden = view !== "stats";
  $("view-brand").hidden = view !== "brand";
  $("view-highlights").hidden = view !== "highlights";
  $("view-corrections").hidden = view !== "corrections";
  $("view-about").hidden = view !== "about";
  if (view !== "brand") editing = null;
  if (view === "brand") {
    if (brand !== currentBrand) { onlyHighlights = false; modelQuery = ""; $("model-search").value = ""; editing = null; }
    currentBrand = brand;
    renderBrand(brand);
  }
  if (view === "stats") renderList();
  if (view === "highlights") { confirmClear = false; renderHighlights(); }
  if (view === "corrections") renderCorrections();
  const hash = view === "brand" ? slug(brand) : view === "about" ? "despre" : view === "highlights" ? "highlights" : view === "corrections" ? "corectii" : "";
  if (location.hash.slice(1) !== hash) history.replaceState(null, "", hash ? "#" + hash : location.pathname + location.search);
  window.scrollTo(0, 0);
}

// ---------- Mod editare ----------

const describe = c => ({
  deleteModel: () => `Șters modelul „${c.model}”`,
  renameModel: () => `Redenumit „${c.model}” în „${c.to}”`,
  deleteRef: () => `Ștearsă referința ${c.label || c.ref} din „${c.model}”`,
  editRef: () => `Referința ${c.label || c.ref} corectată în ${c.to} („${c.model}”)`,
  merge: () => `Comasat „${c.model}” în „${c.into}”`,
  brandStatus: () => `Brandul marcat ${c.verified ? "Verificat" : "Neverificat"}`
}[c.type] || (() => c.type))();

function renderCorrections() {
  const byId = Object.fromEntries(correctionStatus.map(s => [s.id, s]));
  const list = [...corrections].reverse();
  $("corr-meta").textContent = list.length
    ? `${plural(list.length, "corecție", "corecții")}, cea mai nouă prima. Anularea unei corecții refă cifrele imediat.`
    : "Nu ai făcut încă nicio corecție.";
  $("corr-list").innerHTML = list.length ? list.map(c => {
    const s = byId[c.id] || {};
    return `
      <li class="corr${s.applied === false ? " is-unapplied" : ""}">
        <div class="corr-text">
          <p class="corr-title"><button class="brand-link" data-brand="${esc(c.brand)}">${esc(c.brand)}</button> · ${esc(describe(c))}</p>
          <p class="muted corr-date">${esc(c.at || "")}${s.applied === false ? ` · <span class="corr-warn">Neaplicată: ${esc(s.reason)}</span>` : ""}</p>
        </div>
        <button class="chip" type="button" data-undo="${esc(c.id)}">Anulează</button>
      </li>`;
  }).join("") : `
    <li class="hl-empty">
      <p><strong>Nicio corecție încă.</strong></p>
      <p class="muted">Deschide un brand și folosește butoanele ✎, ⇄ și 🗑 de pe carduri. Corecțiile apar aici și pot fi anulate oricând.</p>
    </li>`;
}

function setEditStatus(text, isError) {
  const el = $("edit-status");
  el.textContent = text;
  el.classList.toggle("is-error", !!isError);
}

async function sendCorrection(body) {
  setEditStatus("Se salvează…");
  try {
    const r = await fetch("/api/corrections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || "Salvarea a eșuat.");
    corrections = j.corrections;
    rebuild();
    editing = null;
    rerender();
    setEditStatus(body.remove ? "Corecția a fost anulată. Cifrele sunt actualizate." : "Salvat în corrections.js. Cifrele sunt actualizate.");
  } catch (e) {
    setEditStatus(`Nu s-a salvat: ${e.message} Verifică dacă rulează node server.js.`, true);
  }
}

// Redesenează secțiunea deschisă după o modificare.
function rerender() {
  renderChips();
  renderHlTab();
  renderSources();
  if (!$("view-brand").hidden) {
    if (!models.some(m => m.brand === currentBrand)) { showView("stats"); return; }
    renderBrand(currentBrand);
  }
  if (!$("view-stats").hidden) renderList();
  if (!$("view-highlights").hidden) renderHighlights();
  if (!$("view-corrections").hidden) renderCorrections();
}

const snapshot = m => ({ brand: m.brand, model: m.name, refs: Corrections.refCodes(m) });

function onEditClick(e) {
  const btn = e.target.closest("[data-act]");
  if (!btn || !editMode || btn.tagName === "FORM") return;
  const act = btn.dataset.act;
  const m = btn.dataset.model !== undefined ? models[+btn.dataset.model] : null;
  if (act === "cancel") { editing = null; rerender(); return; }
  if (act === "confirmDeleteModel") return sendCorrection({ add: { type: "deleteModel", ...snapshot(m) } });
  if (act === "confirmDeleteRef") {
    const r = m.refs.find(x => Corrections.refKey(x) === btn.dataset.ref);
    return sendCorrection({ add: { type: "deleteRef", ...snapshot(m), ref: btn.dataset.ref, label: refLabel(r) } });
  }
  if (["rename", "merge", "deleteModel", "editRef", "deleteRef"].includes(act)) {
    editing = { act, model: m.id, ref: btn.dataset.ref || null };
    rerender();
    const input = document.querySelector(".edit-form .edit-input");
    if (input) { input.focus(); if (input.select) input.select(); }
  }
}

function onEditSubmit(e) {
  const form = e.target.closest(".edit-form");
  if (!form) return;
  e.preventDefault();
  const m = models[+form.dataset.model];
  const value = form.querySelector(".edit-input").value.trim();
  if (!value) return;
  if (form.dataset.act === "rename") {
    if (value === m.name) { editing = null; rerender(); return; }
    sendCorrection({ add: { type: "renameModel", ...snapshot(m), to: value } });
  } else if (form.dataset.act === "editRef") {
    const r = m.refs.find(x => Corrections.refKey(x) === form.dataset.ref);
    if (value === r.ref) { editing = null; rerender(); return; }
    sendCorrection({ add: { type: "editRef", ...snapshot(m), ref: form.dataset.ref, label: refLabel(r), to: value } });
  } else if (form.dataset.act === "merge") {
    const into = models[+value];
    sendCorrection({ add: { type: "merge", ...snapshot(m), into: into.name, intoRefs: Corrections.refCodes(into) } });
  }
}

// Activează modul editare doar dacă pagina e servită de node server.js pe acest calculator.
async function detectEditMode() {
  if (!/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
  try {
    const r = await fetch("/api/edit", { cache: "no-store" });
    if (!r.ok || !(await r.json()).enabled) return;
  } catch { return; }
  editMode = true;
  document.body.classList.add("is-editing");
  $("edit-banner").hidden = false;
  $("corr-tab").hidden = false;
  rerender();
  if (location.hash.slice(1) === "corectii") showView("corrections");
}

// Numărul de pe butonul din header.
function renderHlTab() {
  const n = models.filter(isHighlighted).length;
  $("hl-tab-count").textContent = n ? n : "";
  $("hl-tab-count").hidden = !n;
}

function renderSources() {
  $("source-table").innerHTML = SOURCES.map(s => {
    const n = models.filter(m => covers(m, s.id)).length;
    return `
    <li><strong>${esc(s.name)}</strong><span class="badge">${plural(n, "model", "modele")}</span><br>
      <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a><br>
      <span class="muted">${esc(s.note)}</span></li>`;
  }).join("");
}

document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => showView(t.dataset.view)));
$("back").addEventListener("click", () => showView("stats"));
$("source-chips").addEventListener("click", e => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  current = btn.dataset.source;
  renderChips();
  renderList();
});
$("brand-list").addEventListener("click", e => {
  const btn = e.target.closest(".brand-link");
  if (btn) showView("brand", btn.dataset.brand);
});
$("model-list").addEventListener("click", e => {
  const btn = e.target.closest(".hl-btn");
  if (!btn) return;
  const m = models[+btn.dataset.model];
  toggleHighlight(m);
  renderHlTab();
  const on = isHighlighted(m);
  // Actualizează doar cardul, ca lista să nu sară; în filtrul „Doar highlight” cardul deselectat dispare.
  if (onlyHighlights && !on) { renderBrand(currentBrand); return; }
  btn.setAttribute("aria-pressed", on);
  btn.title = on ? "Scoate din highlight" : "Marchează modelul";
  btn.querySelector("span").textContent = on ? "★" : "☆";
  btn.closest(".model-card").classList.toggle("is-highlighted", on);
  const marked = visibleModels().filter(x => x.brand === currentBrand && isHighlighted(x)).length;
  const hlChip = $("brand-filters").querySelector('[data-filter="hl"]');
  hlChip.textContent = `★ Doar highlight (${marked})`;
  hlChip.disabled = !marked;
});
// În secțiunea Highlights, deselectarea scoate modelul din listă.
$("hl-list").addEventListener("click", e => {
  const hl = e.target.closest(".hl-btn");
  if (hl) { toggleHighlight(models[+hl.dataset.model]); renderHlTab(); confirmClear = false; renderHighlights(); return; }
  const brand = e.target.closest(".brand-link");
  if (brand) { showView("brand", brand.dataset.brand); return; }
  if (e.target.closest("[data-go]")) showView("stats");
});
$("hl-copy").addEventListener("click", async () => {
  const text = highlightsText();
  try {
    await navigator.clipboard.writeText(text);
    $("hl-copied").textContent = "Lista a fost copiată.";
  } catch {
    // Fără acces la clipboard: afișează textul selectat, ca să poată fi copiat manual.
    $("hl-text").value = text;
    $("hl-text").hidden = false;
    $("hl-text").select();
    $("hl-copied").textContent = "Copiază textul selectat (Ctrl+C).";
  }
});
$("hl-clear").addEventListener("click", () => {
  if (!confirmClear) { confirmClear = true; renderHighlights(); return; }
  highlights.clear();
  try { localStorage.setItem(HL_KEY, "[]"); } catch {}
  confirmClear = false;
  renderHlTab();
  renderHighlights();
});
$("brand-filters").addEventListener("click", e => {
  const btn = e.target.closest(".chip");
  if (!btn || btn.disabled) return;
  onlyHighlights = btn.dataset.filter === "hl";
  renderBrand(currentBrand);
});
$("search").addEventListener("input", e => { query = e.target.value; renderList(); });
$("model-search").addEventListener("input", e => { modelQuery = e.target.value; renderBrand(currentBrand); });

for (const id of ["model-list", "hl-list"]) {
  $(id).addEventListener("click", onEditClick);
  $(id).addEventListener("submit", onEditSubmit);
}
$("corr-list").addEventListener("click", e => {
  const undo = e.target.closest("[data-undo]");
  if (undo) return sendCorrection({ remove: undo.dataset.undo });
  const brand = e.target.closest(".brand-link");
  if (brand) showView("brand", brand.dataset.brand);
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && editing) { editing = null; rerender(); } });
// Comutarea Verificat / Neverificat, din listă sau de pe pagina brandului.
document.addEventListener("click", e => {
  const tag = e.target.closest("button.vtag");
  if (!tag) return;
  e.stopPropagation();
  const brand = tag.dataset.verify;
  const next = !isVerified(brand);
  if (editMode) return sendCorrection({ add: { type: "brandStatus", brand, verified: next } });
  // Pe site-ul public: notița rămâne în browserul vizitatorului, ca lista de Highlights.
  if (next === fileVerified(brand)) delete localVerified[brand]; else localVerified[brand] = next;
  try { localStorage.setItem(VER_KEY, JSON.stringify(localVerified)); } catch {}
  rerender();
});

// Butonul „Înapoi sus” apare după ce pagina a coborât peste un ecran.
const toTop = $("to-top");
const updateToTop = () => { toTop.hidden = window.scrollY < window.innerHeight * 0.8; };
window.addEventListener("scroll", updateToTop, { passive: true });
toTop.addEventListener("click", () => {
  const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
});
updateToTop();

renderChips();
renderList();
renderSources();
renderHlTab();

// Adresa (#brand, #highlights, #despre) deschide secțiunea potrivită, la încărcare și când se schimbă.
function route() {
  const h = location.hash.slice(1);
  if (brandBySlug[h]) showView("brand", brandBySlug[h]);
  else if (h === "despre") showView("about");
  else if (h === "highlights") showView("highlights");
  else if (h === "corectii" && editMode) showView("corrections");
  else if (!h && $("view-stats").hidden) showView("stats");
}
window.addEventListener("hashchange", route);
route();
detectEditMode();
