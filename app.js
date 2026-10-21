// Statistica pe branduri și pagina fiecărui brand, organizate pe referințe.
// O lansare = o referință (fiecare variantă de cadran sau material are referința ei).
// Referințele sunt grupate pe model; fiecare model arată în ce surse a apărut.

const models = MODELS.map(([brand, name, articleOnly, refs, coverage], i) => ({
  id: i, brand, name, articleOnly: !!articleOnly,
  refs: refs.map(([ref, dial, material, img, url, variant]) => ({ ref, dial, material, img, url, variant })),
  coverage: coverage.map(([src, model, url]) => ({ source: SOURCES[src], model, url }))
}));

let current = "all";
let query = "";
let currentBrand = null;
let onlyHighlights = false;

// Modelele marcate cu „Highlight” se păstrează în browserul vizitatorului (localStorage),
// după o cheie stabilă brand + nume model, ca selecția să rămână și după actualizarea datelor.
const HL_KEY = "pads-watch-monitor:highlights";
const modelKey = m => slug(m.brand) + "/" + slug(m.name);
const highlights = new Set((() => {
  try { return JSON.parse(localStorage.getItem(HL_KEY) || "[]"); } catch { return []; }
})());
const isHighlighted = m => highlights.has(modelKey(m));
function toggleHighlight(m) {
  const k = modelKey(m);
  highlights.has(k) ? highlights.delete(k) : highlights.add(k);
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

const brandBySlug = Object.fromEntries([...new Set(models.map(m => m.brand))].map(b => [slug(b), b]));

const $ = id => document.getElementById(id);

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
      <span class="line"><button class="brand-link" data-brand="${esc(brand)}">${esc(brand)}</button> - <span class="n">${lansari(b.refs)}</span> - <span class="n">${plural(b.models, "model", "modele")}</span></span>
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

function refRow(r) {
  const code = r.ref || r.variant || "Referință nespecificată";
  const details = [r.dial && `Cadran ${ro(r.dial)}`, r.material && ro(r.material)].filter(Boolean).join(" · ");
  return `
    <li class="ref">
      <a class="thumb" href="${esc(r.url)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">
        ${r.img ? `<img src="${esc(r.img)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : ""}
        <span class="thumb-fallback">Imagine indisponibilă</span>
      </a>
      <div class="ref-text">
        <p class="ref-code${r.ref ? "" : " is-unknown"}">${esc(code)}</p>
        ${details ? `<p class="ref-details">${esc(details)}</p>` : ""}
        <a class="ref-link" href="${esc(r.url)}" target="_blank" rel="noopener">Vezi la sursă</a>
      </div>
    </li>`;
}

function renderBrand(brand) {
  const all = visibleModels().filter(m => m.brand === brand);
  const marked = all.filter(isHighlighted).length;
  if (!marked) onlyHighlights = false;
  const list = onlyHighlights ? all.filter(isHighlighted) : all;
  const refs = all.reduce((n, m) => n + m.refs.length, 0);
  $("brand-title").textContent = brand;
  $("brand-meta").textContent = `${lansari(refs)} (referințe) în ${plural(all.length, "model", "modele")} · ${current === "all" ? "toate sursele" : SOURCES.find(s => s.id === current).name}`;
  $("brand-filters").innerHTML = `
    <button class="chip${onlyHighlights ? "" : " is-active"}" data-filter="all">Toate modelele (${all.length})</button>
    <button class="chip${onlyHighlights ? " is-active" : ""}" data-filter="hl"${marked ? "" : " disabled"}>★ Doar highlight (${marked})</button>`;

  $("model-list").innerHTML = list.map(m => modelCard(m)).join("") ||
    `<li class="empty">${onlyHighlights ? "Niciun model marcat cu Highlight." : "Nicio lansare pentru această sursă."}</li>`;
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
      </header>
      <ul class="ref-list">${m.refs.map(refRow).join("")}</ul>
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
  $("view-about").hidden = view !== "about";
  if (view === "brand") {
    if (brand !== currentBrand) onlyHighlights = false;
    currentBrand = brand;
    renderBrand(brand);
  }
  if (view === "stats") renderList();
  if (view === "highlights") { confirmClear = false; renderHighlights(); }
  const hash = view === "brand" ? slug(brand) : view === "about" ? "despre" : view === "highlights" ? "highlights" : "";
  if (location.hash.slice(1) !== hash) history.replaceState(null, "", hash ? "#" + hash : location.pathname + location.search);
  window.scrollTo(0, 0);
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

renderChips();
renderList();
renderSources();
renderHlTab();

const start = location.hash.slice(1);
if (brandBySlug[start]) showView("brand", brandBySlug[start]);
else if (start === "despre") showView("about");
else if (start === "highlights") showView("highlights");
