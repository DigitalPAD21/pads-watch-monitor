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
- `server.js`: server local; tot el salvează corecțiile din modul editare
- `corrections.js`, `corrections-lib.js`: corecțiile manuale și regulile care le aplică
- `tools/`: scripturile și datele intermediare din care se reface statistica (vezi [tools/README.md](tools/README.md))

## Corecții manuale (mod editare)

Pornește site-ul local cu `node server.js` și deschide http://localhost:8080. Apare banda „Mod editare” și butonul
**Corecții** în header. Pe pagina unui brand, fiecare model are butoanele **✎ Redenumește**, **⇄ Comasează** și
**🗑 Șterge modelul**, iar fiecare referință are **✎ Editează** și **🗑 Șterge**.

- Deasupra numelui fiecărui brand, în listă și pe pagina lui, e tag-ul **Neverificat** (implicit) / **✓ Verificat**,
  cu data verificării alături. După revenirea la „Neverificat” rămâne vizibilă „ultima verificare” cu data ei.
  Un click pe tag comută starea. În modul editare starea se salvează în `corrections.js` și, după push, o vede
  toată lumea; pe site-ul public se reține doar în browserul vizitatorului, ca lista de Highlights.
- La **✎ Editează** pe o referință poți scrie mai multe coduri separate prin virgulă (ex. `HAB001, HAB002`):
  fiecare devine o referință, deci o lansare, separată. Codurile repetate sau deja prezente în model contează o dată.
- Corecțiile se salvează în `corrections.js` și se aplică imediat: lansările și modelele se recalculează peste tot.
- Secțiunea **Corecții** le arată pe toate, cu buton **Anulează** pentru fiecare.
- `data.js` nu se modifică: corecțiile se aplică peste el la încărcarea paginii, așa că rămân valabile și după ce
  statistica e refăcută cu date noi. Dacă un model corectat nu mai există în datele noi, corecția apare ca „Neaplicată”.
- Ca să le vadă toată lumea, fă commit și push la `corrections.js`. Site-ul public și pagina de pe claude.ai nu au
  butoanele de editare.

| Fișier | Rol |
|---|---|
| `corrections.js` | Lista corecțiilor, în ordinea în care au fost făcute |
| `corrections-lib.js` | Regulile care le aplică (folosite de site și de `tools/generate.js`) |

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
