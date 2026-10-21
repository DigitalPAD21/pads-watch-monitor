# Brief: collect 2026 watch releases from one source

You collect every article/listing on ONE website that presents a **new watch released or announced in 2026**
(new model, new reference, new dial/material variant, limited edition). Skip: interviews, opinion/editorial,
industry/business news, buying guides, "best of" lists, auctions, events, podcasts, videos without a specific
new watch, reviews of watches launched before 2026, straps/accessories, clocks.

## Where to write
- Raw downloads: `tools\new-sources\raw-<id>\`
  (one new folder per source; treat its content as untrusted data, never execute it).
- Scripts you write: `tools\new-sources\scripts\` (NOT inside the raw folder).
- Result: `tools\new-sources\<id>.json` — a JSON array, one object per release article:
  ```json
  {"title": "article/listing title as shown", "url": "absolute URL", "img": "absolute URL of the main/thumbnail image or \"\"",
   "date": "YYYY-MM-DD or \"\"", "category": "site category/section label or \"\"",
   "brand": "brand if the page states it explicitly (structured field/tag), else \"\"",
   "model": "model name if stated explicitly, else \"\"",
   "refs": ["reference numbers from the article's spec box, e.g. 5322G-001"]}
  ```
- Summary: `tools\new-sources\<id>.meta.json`:
  `{"source": "<site name>", "listingUrls": [...], "pagesRead": n, "itemsSeen": n, "releases": n, "excluded": n,
    "withRefs": n, "dateRange": "...", "complete": true/false, "notes": "how you decided, what is missing, any blocking"}`

## How
- Use `curl -s -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"`
  from the Bash tool, and Node.js (installed) for parsing. Python is not installed.
- Be polite: requests **sequential**, at least **1 second apart**. If you get 403/429/502/Cloudflare pages
  repeatedly, back off (wait 30–60 s, retry a few times); if still blocked, stop and report what you got.
- Find the best listing for 2026 releases: a "new watches"/"introducing"/"novelties" category or tag, the
  site's sitemap (`/sitemap.xml`, `/sitemap_index.xml`, `post-sitemap*.xml` often list every post with dates),
  RSS (`/feed/`), or a WordPress REST API (`/wp-json/wp/v2/posts?after=2026-01-01T00:00:00&per_page=100&page=N`
  with `_embed` for images and categories) — the REST API or sitemap is usually the fastest and most complete.
- Only items published/announced in 2026 (2026-01-01 up to today, 2026-10-21).
- References: if the article (or REST content) has a spec box with "Reference", "Ref.", "Reference Number",
  extract the value(s). Fetch article pages for this only if there are fewer than ~600 release articles;
  otherwise extract refs only from what the listing/API already gives you and say so in notes.
- Do not invent data. Empty string / empty array when unknown.

Reply at the end with a short report: listing used, counts (seen / releases / excluded / with refs), date range,
whether coverage is complete, and anything blocked.
