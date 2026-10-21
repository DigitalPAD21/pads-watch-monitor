// Calculează numărul de lansări per brand, afișează lista și pagina fiecărui brand.

for (const s of SOURCES) {
  s.items = s.releases.map(([brand, model, img, url]) => ({
    brand, model, source: s,
    img: img ? s.imgBase + img : "",
    url: url ? s.urlBase + url : s.url
  }));
}

function countsFor(source) {
  const counts = {};
  for (const r of source.items) counts[r.brand] = (counts[r.brand] || 0) + 1;
  return counts;
}

const perSource = Object.fromEntries(SOURCES.map(s => [s.id, countsFor(s)]));

function combined() {
  const total = {};
  for (const s of SOURCES) {
    for (const [brand, n] of Object.entries(perSource[s.id])) total[brand] = (total[brand] || 0) + n;
  }
  return total;
}

// În română, de la 20 în sus (și la multipli de 100) se pune „de”: „43 de lansări”.
const lansari = n => {
  if (n === 1) return "1 lansare";
  const r = n % 100;
  return r >= 20 || (r === 0 && n > 0) ? `${n} de lansări` : `${n} lansări`;
};
const sum = obj => Object.values(obj).reduce((a, b) => a + b, 0);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const slug = b => b.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const allBrands = Object.keys(combined());
const brandBySlug = Object.fromEntries(allBrands.map(b => [slug(b), b]));

let current = "all";
let query = "";

const $ = id => document.getElementById(id);

function renderChips() {
  const chips = [{ id: "all", name: "Toate sursele" }, ...SOURCES];
  $("source-chips").innerHTML = chips.map(c => `
    <button class="chip${c.id === current ? " is-active" : ""}" data-source="${c.id}">${esc(c.name)}</button>`).join("");
}

function renderList() {
  const counts = current === "all" ? combined() : perSource[current];
  const rows = Object.entries(counts)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const max = rows.length ? rows[0][1] : 1;

  $("kpis").innerHTML = `
    <div class="kpi"><b>${sum(counts).toLocaleString("ro-RO")}</b><span>lansări</span></div>
    <div class="kpi"><b>${rows.length}</b><span>branduri</span></div>
    <div class="kpi"><b>${current === "all" ? SOURCES.length : 1}</b><span>${current === "all" ? "surse" : "sursă"}</span></div>`;

  $("source-note").textContent = current === "all"
    ? "Suma lansărilor raportate de fiecare sursă. Același ceas poate apărea în mai multe surse. Apasă pe un brand ca să vezi modelele."
    : SOURCES.find(s => s.id === current).note;

  const q = query.trim().toLowerCase();
  const visible = rows.map((r, i) => [i + 1, ...r]).filter(([, brand]) => brand.toLowerCase().includes(q));

  $("brand-list").innerHTML = visible.length ? visible.map(([rank, brand, n]) => {
    const split = current === "all"
      ? SOURCES.filter(s => perSource[s.id][brand]).map(s => `${esc(s.name)}: ${perSource[s.id][brand]}`).join(" · ")
      : "";
    return `<li>
      <span class="rank">${rank}.</span>
      <span class="line"><button class="brand-link" data-brand="${esc(brand)}">${esc(brand)}</button> - <span class="n">${lansari(n)}</span></span>
      <span class="bar"><i style="width:${(n / max) * 100}%"></i></span>
      ${split ? `<span class="split">${split}</span>` : ""}
    </li>`;
  }).join("") : `<li class="empty">Niciun brand găsit.</li>`;
}

function renderBrand(brand) {
  const sources = current === "all" ? SOURCES : SOURCES.filter(s => s.id === current);
  const items = sources.flatMap(s => s.items.filter(r => r.brand === brand));
  $("brand-title").textContent = brand;
  $("brand-meta").textContent = `${lansari(items.length)} · ${current === "all" ? "toate sursele" : sources[0].name}`;
  $("model-list").innerHTML = items.map(r => `
    <li class="model">
      <a class="thumb" href="${esc(r.url)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">
        ${r.img ? `<img src="${esc(r.img)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : ""}
        <span class="thumb-fallback">Imagine indisponibilă</span>
      </a>
      <div class="model-text">
        <h3 class="model-name">${esc(r.model)}</h3>
        <p class="model-src"><span class="src-tag">${esc(r.source.name)}</span>
          <a href="${esc(r.url)}" target="_blank" rel="noopener">Vezi la sursă</a></p>
      </div>
    </li>`).join("");
  // Dacă o imagine nu se încarcă, rămâne cadrul gri cu textul de rezervă.
  $("model-list").querySelectorAll("img").forEach(img => {
    const fail = () => img.closest(".thumb").classList.add("is-missing");
    img.addEventListener("error", fail, { once: true });
    if (img.complete && img.naturalWidth === 0) fail();
  });
}

function showView(view, brand) {
  document.querySelectorAll(".tab").forEach(t => {
    const on = t.dataset.view === (view === "brand" ? "stats" : view);
    t.classList.toggle("is-active", on);
    t.setAttribute("aria-selected", on);
  });
  $("view-stats").hidden = view !== "stats";
  $("view-brand").hidden = view !== "brand";
  $("view-about").hidden = view !== "about";
  if (view === "brand") renderBrand(brand);
  const hash = view === "brand" ? slug(brand) : view === "about" ? "despre" : "";
  if (location.hash.slice(1) !== hash) history.replaceState(null, "", hash ? "#" + hash : location.pathname + location.search);
  window.scrollTo(0, 0);
}

function renderSources() {
  $("source-table").innerHTML = SOURCES.map(s => `
    <li><strong>${esc(s.name)}</strong><span class="badge">${lansari(s.items.length)}</span><br>
      <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a><br>
      <span class="muted">${esc(s.note)}</span></li>`).join("");
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
$("search").addEventListener("input", e => { query = e.target.value; renderList(); });

renderChips();
renderList();
renderSources();

const start = location.hash.slice(1);
if (brandBySlug[start]) showView("brand", brandBySlug[start]);
else if (start === "despre") showView("about");
