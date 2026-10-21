# Cum se reface statistica

Scripturile de aici produc `data.js` (datele site-ului) și `references.md` (raportul pe branduri și modele).
Toate rulează cu Node.js, din rădăcina proiectului sau din `tools/`.

## Varianta rapidă: din datele salvate

Datele intermediare sunt în repo, deci statistica se poate reface fără nicio descărcare:

```bash
node tools/generate.js
```

Rezultatul trebuie să fie identic cu `data.js` din repo. Folosește varianta asta când schimbi doar regulile
de grupare, de legare sau de afișare.

## Ce face fiecare fișier

| Fișier | Rol |
|---|---|
| `generate.js` | Pasul final. Grupează referințele pe modele, leagă articolele de modele, scrie `data.js` și `references.md`. |
| `build.js` | Citește paginile descărcate din `raw/` pentru primele 5 surse și scrie `releases.json`. |
| `extract-refs.js` | Citește referințele din specificațiile articolelor Monochrome și Hodinkee (`raw/articles/`) și scrie `article-refs.json`. |
| `retry-articles.js` | Reîncearcă, încet, articolele care au venit cu eroare. |
| `dedupe.js` | Regulile de duplicate: aceeași referință sau același nume, cu diferențe doar descriptive. |
| `brands.js` | Detectarea brandului în titluri; folosește alias-urile din `build.js` și brandurile din `data.js`. |
| `brands-v1.js` | Lista de branduri din prima versiune a site-ului, folosită de detectare. |
| `releases.json` | Lansările din primele 5 surse (The Watch Pages, Monochrome, Hodinkee, Worn & Wound, Watches and Wonders). |
| `article-refs.json` | Referințele citite din articole (Monochrome: 278 din 888 de articole; Hodinkee: toate). |
| `article-urls.txt`, `twp-slugs.txt` | Listele de pagini de descărcat pentru articole și pentru fișele The Watch Pages. |
| `titles/out*.json` | Numele de model curățate pentru titlurile Monochrome și Hodinkee. |
| `titles/new-out*.json` | Brandul și modelul (sau excluderea) pentru fiecare titlu din sursele noi. |
| `titles/BRIEF.md` | Regulile după care au fost curățate titlurile. |
| `new-sources/<sursă>.json` | Articolele despre lansări din fiecare sursă nouă, cu `<sursă>.meta.json` (ce s-a citit, cât e de complet). |
| `new-sources/sources.json` | Numele, linkul și descrierea surselor noi, afișate în „Despre Proiect”. |
| `new-sources/BRIEF.md` | Regulile după care au fost colectate sursele noi. |
| `new-sources/scripts/` | Scripturile de prelucrare pentru sursele noi (vezi mai jos). |

## Varianta completă: date noi de pe site-uri

### 1. Primele 5 surse

Descarcă paginile în `tools/raw/` (folderul nu e în repo), cu un User-Agent de browser:

```bash
cd tools && mkdir -p raw/twp-detail raw/articles
```

- The Watch Pages: `https://www.thewatchpages.com/new-watches/2026` și `/new-watches/2026/page-2` … `page-22` → `raw/twp-1.html` … `raw/twp-22.html`;
  apoi fișa fiecărui ceas din `twp-slugs.txt`: `https://www.thewatchpages.com/watches/<slug>` → `raw/twp-detail/<slug>.html`.
- Monochrome: `https://monochrome-watches.com/tag/2026/` și `/tag/2026/page/2/` … → `raw/mono-1.html` …
- Watches and Wonders: `https://www.watchesandwonders.com/en/geneva-2026/novelties` → `raw/wwg.html`.
- Worn & Wound: `https://wornandwound.com/our-favorite-watches-of-2026-so-far/` → `raw/ww.html` (ceasurile sunt trecute direct în `build.js`).
- Hodinkee: `https://www.hodinkee.com/api/v1/homepage/packages/152` → `raw/hod-152.json`.
- Articolele din `article-urls.txt` (format `<id> <url>`) → `raw/articles/<id>.html`.

Apoi:

```bash
node build.js
node extract-refs.js
```

Monochrome limitează cererile repetate (răspunde cu 502). Descarcă articolele lor rar, câte unul, sau rulează
`node retry-articles.js`, care reîncearcă încet doar ce lipsește.

### 2. Sursele noi

Fiecare sursă a fost citită prin API-ul ei sau prin harta site-ului; linkurile exacte sunt în `new-sources/<sursă>.meta.json`
(`listingUrls`). Descărcările se pun în `new-sources/raw-<sursă>/` (nici acestea nu sunt în repo), apoi scriptul sursei
scrie `new-sources/<sursă>.json`:

| Sursă | Ce se descarcă | Script |
|---|---|---|
| aBlogtoWatch | `wp-json/wp/v2/posts?after=2026-01-01&per_page=100&_embed`, paginile 1–7 → `raw-abtw/p1.json` … | `abtw-build.js raw-abtw abtw.json` |
| Fratello | `wp-json/wp/v2/posts/?after=2026-01-01T00:00:00&per_page=100&_embed`, paginile 1–10 → `raw-fratello/p1.json` … | `fr6.js` |
| Professional Watches | `wp-json/wp/v2/posts?after=2026-01-01&per_page=100&_embed` → `raw-profwatches/p1.json` | `pw_build.js` (din `raw-profwatches`) |
| Time and Watches | `feeds/posts/default?alt=json`, lună cu lună (`published-min` / `published-max`) → `raw-timeandwatches/all.json` | `build_tw.js` |
| WatchTime | `https://www.watchtime.com/sitemap` → `raw-watchtime/sitemap.xml`; apoi articolele | `wt2.js`, `wt3.sh`, `wt4.js`, `wt5.js` |
| All Watch News | `https://api.allwatchnews.com/latest?after=<id>` | `awn_crawl.js`, apoi `awn_classify.js` |
| GPHG 2026 | pagina nominalizărilor și pagina fiecărui ceas | `gphg_flight.js`, `gphg_parse.js`, `gphg_refs.js`, `gphg_final.js` |
| WatchesWorld, GMT Post | — (un articol, respectiv niciunul) | — |

Scripturile au fost scrise pentru o singură rulare și presupun că sunt pornite din `new-sources/`. Verifică-le
înainte de a le rula din nou; formatul site-urilor se poate schimba.

### 3. Titlurile noi

Fiecare titlu nou trebuie redus la brand și model, sau exclus dacă nu e o lansare 2026, după regulile din `titles/BRIEF.md`.
Rezultatul se pune în `titles/new-out<N>.json`, cu cheia `<sursă>:<poziție>`. Pasul acesta a fost făcut de Claude;
titlurile fără rezultat sunt folosite așa cum vin, ceea ce produce nume mai puțin curate.

### 4. Generarea

```bash
node tools/generate.js
```

Apoi refă pagina pentru claude.ai (vezi README-ul principal), fă commit și push.
