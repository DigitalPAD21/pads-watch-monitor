# PAD's Watch Monitor

Agregator de știri despre lansările din lumea ceasurilor. Prima versiune afișează statistica lansărilor din 2026 pe branduri.

## Rulare locală

```bash
node server.js
```

Apoi deschide http://localhost:8080.

## Fișiere

- `index.html`: structura paginii (header, conținut, footer)
- `style.css`: stilurile
- `data.js`: datele colectate din surse
- `app.js`: calculul statisticii și afișarea
- `artifact.html`: varianta pentru publicarea pe claude.ai

## Publicare pe GitHub Pages

Site-ul e static, deci GitHub Pages îl servește direct din rădăcina branch-ului `main`.
Setarea se face în **Settings → Pages → Deploy from a branch → main / (root)**.
