// Calculează numărul de lansări per brand pentru fiecare sursă și afișează lista.

function countsFor(source) {
  const counts = { ...(source.counts || {}) };
  for (const brand of source.list || []) counts[brand] = (counts[brand] || 0) + 1;
  return counts;
}

const perSource = Object.fromEntries(SOURCES.map(s => [s.id, countsFor(s)]));
const usable = SOURCES.filter(s => s.status === "ok");

function combined() {
  const total = {};
  for (const s of usable) {
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

let current = "all";
let query = "";

const $ = id => document.getElementById(id);

function renderChips() {
  const chips = [{ id: "all", name: "Toate sursele", status: "ok" }, ...SOURCES];
  $("source-chips").innerHTML = chips.map(c => `
    <button class="chip${c.id === current ? " is-active" : ""}" data-source="${c.id}"
      ${c.status !== "ok" ? 'disabled title="Sursă indisponibilă"' : ""}>${c.name}</button>`).join("");
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
    <div class="kpi"><b>${current === "all" ? `${usable.length} / ${SOURCES.length}` : 1}</b><span>${current === "all" ? "surse incluse" : "sursă"}</span></div>`;

  $("source-note").textContent = current === "all"
    ? "Suma lansărilor raportate de fiecare sursă. Același ceas poate apărea în mai multe surse."
    : SOURCES.find(s => s.id === current).note;

  const q = query.trim().toLowerCase();
  const visible = rows.map((r, i) => [i + 1, ...r]).filter(([, brand]) => brand.toLowerCase().includes(q));

  $("brand-list").innerHTML = visible.length ? visible.map(([rank, brand, n]) => {
    const split = current === "all"
      ? usable.filter(s => perSource[s.id][brand]).map(s => `${s.name}: ${perSource[s.id][brand]}`).join(" · ")
      : "";
    return `<li>
      <span class="rank">${rank}.</span>
      <span class="line">${brand} - <span class="n">${lansari(n)}</span></span>
      <span class="bar"><i style="width:${(n / max) * 100}%"></i></span>
      ${split ? `<span class="split">${split}</span>` : ""}
    </li>`;
  }).join("") : `<li class="empty">Niciun brand găsit.</li>`;
}

function renderSources() {
  $("source-table").innerHTML = SOURCES.map(s => {
    const n = sum(perSource[s.id]);
    const badge = s.status === "ok"
      ? `<span class="badge">${lansari(n)}</span>`
      : `<span class="badge blocked">indisponibilă</span>`;
    return `<li><strong>${s.name}</strong>${badge}<br><a href="${s.url}" target="_blank" rel="noopener">${s.url}</a><br><span class="muted">${s.note}</span></li>`;
  }).join("");
}

function showView(view) {
  document.querySelectorAll(".tab").forEach(t => {
    const on = t.dataset.view === view;
    t.classList.toggle("is-active", on);
    t.setAttribute("aria-selected", on);
  });
  $("view-stats").hidden = view !== "stats";
  $("view-about").hidden = view !== "about";
}

document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => showView(t.dataset.view)));
$("source-chips").addEventListener("click", e => {
  const btn = e.target.closest(".chip");
  if (!btn || btn.disabled) return;
  current = btn.dataset.source;
  renderChips();
  renderList();
});
$("search").addEventListener("input", e => { query = e.target.value; renderList(); });

renderChips();
renderList();
renderSources();
