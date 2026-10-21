// Reîncearcă, pe rând și cu pauză, articolele care au venit cu eroare (fișiere sub 5 KB).
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const dir = path.join(__dirname, "raw", "articles");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const sleep = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const lines = fs.readFileSync(path.join(__dirname, "article-urls.txt"), "utf8").trim().split("\n").map(l => l.split(" "));
let fixed = 0, failed = 0;
for (const [id, url] of lines) {
  const f = path.join(dir, id + ".html");
  if (fs.existsSync(f) && fs.statSync(f).size > 5000) continue;
  let ok = false;
  for (let attempt = 0; attempt < 4 && !ok; attempt++) {
    try { execFileSync("curl", ["-s", "-A", UA, "-o", f, url]); } catch {}
    ok = fs.existsSync(f) && fs.statSync(f).size > 5000;
    sleep(ok ? 1200 : 5000 * (attempt + 1));
  }
  ok ? fixed++ : failed++;
  if ((fixed + failed) % 50 === 0) console.log("progress", fixed, failed);
}
console.log("done fixed", fixed, "failed", failed);
