// Corecțiile manuale (ștergere, redenumire, editare referință, comasare) aplicate peste datele generate.
// Același cod rulează în pagină (fereastra globală) și în tools/generate.js (Node), ca rezultatul să fie identic.
//
// Un model: { brand, name, articleOnly, refs: [{ ref, dial, material, img, url, variant }], coverage: [...], aliases: [] }
// O corecție are mereu id, type, at (data) și brand + model (numele modelului la momentul corecției),
// plus refs: codurile referințelor modelului, folosite ca să-l regăsim dacă între timp i s-a schimbat numele.
(function (root) {
  const fold = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const norm = r => String(r || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

  // Mai multe referințe scrise într-un singur câmp, separate prin virgulă, punct și virgulă, „/” cu spații sau „&”.
  // „/” fără spații rămâne parte din cod (ex. 7200/50G-012).
  const splitRefs = text => String(text || "").split(/\s*[,;&]\s*|\s+\/\s+/).map(s => s.trim()).filter(Boolean);

  // Cheia unei referințe: codul ei sau, dacă nu are, linkul și varianta.
  const refKey = r => (r.ref ? norm(r.ref) : "url:" + r.url + "|" + (r.variant || ""));
  const refCodes = m => m.refs.map(r => r.ref).filter(Boolean);

  function findModel(list, brand, name, refs) {
    const b = fold(brand), n = fold(name);
    const same = list.filter(m => fold(m.brand) === b);
    return same.find(m => fold(m.name) === n) ||
      same.find(m => (m.aliases || []).some(a => fold(a) === n)) ||
      // Numele s-a schimbat între timp (ex. date noi): modelul care are toate referințele salvate.
      (refs && refs.length ? same.find(m => refs.every(r => m.refs.some(x => norm(x.ref) === norm(r)))) : null) ||
      null;
  }

  function apply(models, corrections) {
    let list = models.map(m => ({ ...m, refs: [...m.refs], coverage: [...m.coverage], aliases: [...(m.aliases || [])] }));
    const status = [];
    // Starea de verificare a fiecărui brand („Verificat” / „Neverificat”); lipsa unei corecții înseamnă „Neverificat”.
    // last = data ultimei verificări: data corecției când e „Verificat”, altfel cea păstrată din verificarea anterioară.
    const verified = {};
    for (const c of corrections || []) {
      if (c.type === "brandStatus") {
        verified[fold(c.brand)] = { verified: !!c.verified, last: c.verified ? c.at : (c.lastVerified || null) };
        status.push({ id: c.id, applied: true, reason: "" });
        continue;
      }
      const m = findModel(list, c.brand, c.model, c.refs);
      if (!m) { status.push({ id: c.id, applied: false, reason: "Modelul nu mai există în date." }); continue; }
      let ok = true, reason = "";
      if (c.type === "deleteModel") {
        list = list.filter(x => x !== m);
      } else if (c.type === "renameModel") {
        if (m.name !== c.to) { m.aliases.push(m.name); m.name = c.to; }
      } else if (c.type === "deleteRef" || c.type === "editRef") {
        const r = m.refs.find(x => refKey(x) === c.ref);
        if (!r) { ok = false; reason = "Referința nu mai există în model."; }
        else if (c.type === "deleteRef") {
          m.refs = m.refs.filter(x => x !== r);
          // Un model rămas fără nicio referință nu mai are nicio lansare.
          if (!m.refs.length) list = list.filter(x => x !== m);
        } else {
          // „HAB001, HAB002” devine două referințe separate; codurile repetate sau deja existente în model contează o dată.
          const i = m.refs.indexOf(r);
          const others = new Set(m.refs.filter(x => x !== r).map(x => norm(x.ref)).filter(Boolean));
          const seen = new Set();
          const codes = splitRefs(c.to).filter(code => {
            const k = norm(code);
            if (!k || seen.has(k) || others.has(k)) return false;
            seen.add(k);
            return true;
          });
          if (!codes.length) { ok = false; reason = "Referința nouă există deja în model."; }
          else m.refs.splice(i, 1, ...codes.map(code => ({ ...r, ref: code })));
        }
      } else if (c.type === "merge") {
        const into = findModel(list.filter(x => x !== m), c.brand, c.into, c.intoRefs);
        if (!into) { ok = false; reason = "Modelul în care se comasează nu mai există."; }
        else {
          const have = new Set(into.refs.map(refKey));
          // Un rând „Referință nespecificată” nu aduce o lansare nouă dacă modelul ales are deja referințe.
          const placeholder = r => !r.ref && !r.variant;
          for (const r of m.refs) {
            if (placeholder(r) && into.refs.length) continue;
            if (!have.has(refKey(r))) { into.refs.push(r); have.add(refKey(r)); }
          }
          into.coverage.push(...m.coverage);
          into.aliases.push(m.name, ...m.aliases);
          into.articleOnly = into.articleOnly && m.articleOnly;
          list = list.filter(x => x !== m);
        }
      } else { ok = false; reason = "Tip de corecție necunoscut."; }
      status.push({ id: c.id, applied: ok, reason });
    }
    return {
      models: list, status,
      isVerified: brand => !!(verified[fold(brand)] && verified[fold(brand)].verified),
      brandState: brand => verified[fold(brand)] || { verified: false, last: null }
    };
  }

  const api = { apply, refKey, refCodes, findModel, fold, norm, splitRefs };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Corrections = api;
})(typeof window !== "undefined" ? window : globalThis);
