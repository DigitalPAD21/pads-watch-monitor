# PAD's Watch Monitor

Agregator de știri despre lansările din lumea ceasurilor. Site-ul arată referințele lansate în 2026, pe branduri
și modele, adunate din 14 surse, și o listă personală de modele marcate cu „Highlight”.

Site public: https://digitalpad21.github.io/pads-watch-monitor/

## Rulare locală

```bash
node server.js
```

Apoi deschide http://localhost:8080.

## Fișiere

- `index.html`: structura paginii (header, conținut, footer)
- `style.css`: stilurile
- `app.js`: statistica, pagina fiecărui brand, Highlight și secțiunea Highlights
- `data.js`: datele, generate de `tools/generate.js` (nu se editează de mână)
- `references.md`: raportul cu toate referințele, pe branduri și modele
- `artifact.html`: varianta pentru publicarea pe claude.ai
- `server.js`: server local minimal
- `tools/`: scripturile și datele intermediare din care se reface statistica (vezi [tools/README.md](tools/README.md))

## Refacerea statisticii

```bash
node tools/generate.js
```

Detaliile, inclusiv cum se descarcă date noi de pe site-uri, sunt în [tools/README.md](tools/README.md).

## Pagina pentru claude.ai

`artifact.html` e `index.html` fără antetul HTML, pe care platforma îl adaugă singură. După o modificare în `index.html`:

```bash
sed -E -e '/^<!doctype html>$/d' -e '/^<\/?html/d' -e '/^<\/?head>$/d' -e '/^<\/?body>$/d' -e '/<meta charset/d' -e 's#^  <meta name="viewport".*#  <meta name="claude:viewport-fit-sides" content="cover">#' index.html | sed -E 's/^  //' > artifact.html
```

## Publicare pe GitHub Pages

Site-ul e static, deci GitHub Pages îl servește direct din rădăcina branch-ului `main`
(**Settings → Pages → Deploy from a branch → main / (root)**). Fiecare `git push` îl republică în 1–2 minute.
