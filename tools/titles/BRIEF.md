# Brief: clean watch-article titles

Input: `chunkN.json` in this folder — an array of `{id, title, brand, cat}`.
`title` is a watch-magazine headline, `brand` is an automatic guess (may be empty or wrong), `cat` is the site category.

For EVERY item decide:

1. **Is it about one specific NEW watch (or one new collection / limited edition) released or announced in 2026?**
   If NOT, output `{"skip": true}`. Skip: reviews or long-term tests of watches launched before 2026, "best of"/top-N lists,
   roundups of several brands ("New releases from X, Y and more"), comparisons ("X vs Y"), interviews, podcasts,
   business/industry news, events, auctions, buying guides, straps/boxes/accessories, clocks, smartwatches only if not a
   real watch launch, non-watch items, and anything vague. When in doubt about the year, keep it only if the headline says
   new / introducing / unveils / launches / debuts / 2026 / Watches & Wonders 2026.
2. Otherwise output the **brand** (canonical spelling, e.g. "Patek Philippe", "Jaeger-LeCoultre", "TAG Heuer", "IWC",
   "H. Moser & Cie.", "A. Lange & Söhne", "Nomos", "Bulgari", "Grand Seiko") and the clean **model** name as a collector would
   write it, WITHOUT the brand and without editorial words ("Introducing", "Hands-On", "The New", "Unveils", "Debuts",
   adjectives, "(Live Pics)", "Video", trailing "…"). Keep collection, model, reference numbers, edition names and the key
   variant (dial colour/material) when part of the name. Collaborations: brand = the watchmaker, put the partner in
   parentheses, e.g. "Royal Pop (x Swatch)".

Use only the headline and general watch knowledge; do not browse.

Write with the Write tool to `new-outN.json` in the PARENT folder (`tools\titles\new-outN.json`, same N as the chunk)
a JSON object mapping every input id to either `{"skip": true}` or `{"brand": "...", "model": "..."}`.
Every id must appear. Reply with: items written, how many skipped, how many kept.
