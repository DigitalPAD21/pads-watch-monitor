// Server local pentru dezvoltare și pentru modul editare: node server.js -> http://localhost:8080
// Servește fișierele site-ului și, doar local, salvează corecțiile manuale în corrections.js.
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".md": "text/markdown" };
const root = __dirname;
const CORRECTIONS_FILE = path.join(root, "corrections.js");
const HEADER = "// Corecțiile manuale, în ordinea în care au fost făcute. Se editează din modul editare (node server.js)\n" +
  "// sau de mână; vezi corrections-lib.js pentru ce înseamnă fiecare tip.\n";
const TYPES = new Set(["deleteModel", "renameModel", "deleteRef", "editRef", "merge", "brandStatus"]);

function readCorrections() {
  const src = fs.readFileSync(CORRECTIONS_FILE, "utf8");
  const m = src.match(/const CORRECTIONS = ([\s\S]*);\s*$/);
  return m ? JSON.parse(m[1]) : [];
}
function writeCorrections(list) {
  fs.writeFileSync(CORRECTIONS_FILE, HEADER + "const CORRECTIONS = " + JSON.stringify(list, null, 2) + ";\n");
}

// Data și ora după ceasul calculatorului (nu UTC), ca în pagină: „2026-10-22 19:01”.
const localStamp = () => {
  const d = new Date(), p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

const json = (res, code, body) => {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
};

// Doar pagina deschisă de pe acest calculator poate modifica: alt site nu poate trimite cereri aici.
const localOrigin = req => {
  const o = req.headers.origin || "";
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o);
};

function handleApi(req, res) {
  if (req.url === "/api/edit" && req.method === "GET") return json(res, 200, { enabled: true });
  if (req.url !== "/api/corrections" || req.method !== "POST") return json(res, 404, { error: "Not found" });
  if (!localOrigin(req) || !/application\/json/.test(req.headers["content-type"] || "")) {
    return json(res, 403, { error: "Corecțiile se pot face doar din pagina deschisă local." });
  }
  let body = "";
  req.on("data", c => { body += c; if (body.length > 100000) req.destroy(); });
  req.on("end", () => {
    try {
      const msg = JSON.parse(body);
      const list = readCorrections();
      if (msg.add) {
        const c = msg.add;
        if (!TYPES.has(c.type) || !c.brand || (c.type !== "brandStatus" && !c.model)) return json(res, 400, { error: "Corecție incompletă." });
        const entry = { id: crypto.randomUUID().slice(0, 8), at: localStamp(), ...c };
        if (c.type === "brandStatus") {
          // O singură stare per brand. „Verificat” reține data (câmpul at); la revenirea la „Neverificat”
          // se păstrează data ultimei verificări, ca să se vadă când a fost făcut ultimul review.
          const prev = list.filter(x => x.type === "brandStatus" && x.brand === c.brand).pop();
          const lastVerified = prev ? (prev.verified ? prev.at : prev.lastVerified) : null;
          for (let i = list.length - 1; i >= 0; i--) if (list[i].type === "brandStatus" && list[i].brand === c.brand) list.splice(i, 1);
          if (c.verified) list.push({ ...entry, verified: true });
          else if (lastVerified) list.push({ ...entry, verified: false, lastVerified });
        } else list.push(entry);
      } else if (msg.remove) {
        const i = list.findIndex(c => c.id === msg.remove);
        if (i < 0) return json(res, 404, { error: "Corecția nu există." });
        list.splice(i, 1);
      } else return json(res, 400, { error: "Cerere necunoscută." });
      writeCorrections(list);
      json(res, 200, { corrections: list });
    } catch (e) {
      json(res, 400, { error: "Cerere invalidă: " + e.message });
    }
  });
}

http.createServer((req, res) => {
  if (req.url.startsWith("/api/")) return handleApi(req, res);
  const pathname = decodeURIComponent(req.url.split("?")[0]);
  const file = path.join(root, pathname === "/" ? "index.html" : path.normalize(pathname));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    const headers = { "Content-Type": (types[path.extname(file)] || "application/octet-stream") + "; charset=utf-8" };
    if (path.basename(file) === "corrections.js") headers["Cache-Control"] = "no-store";
    res.writeHead(200, headers);
    res.end(data);
  });
}).listen(8080, "127.0.0.1", () => console.log("http://localhost:8080 (mod editare activ)"));
