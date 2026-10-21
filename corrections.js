// Corecțiile manuale, în ordinea în care au fost făcute. Se editează din modul editare (node server.js)
// sau de mână; vezi corrections-lib.js pentru ce înseamnă fiecare tip.
const CORRECTIONS = [
  {
    "id": "ee0edbe2",
    "at": "2026-10-21 20:39",
    "type": "editRef",
    "brand": "Seiko",
    "model": "Presage Classic Series Silk-Inspired Dials 38mm",
    "refs": [
      "HCC001",
      "? HCC002",
      "?HCC003",
      "? HCC008"
    ],
    "ref": "HCC002",
    "label": "? HCC002",
    "to": "HCC002"
  },
  {
    "id": "65669709",
    "at": "2026-10-21 20:39",
    "type": "editRef",
    "brand": "Seiko",
    "model": "Presage Classic Series Silk-Inspired Dials 38mm",
    "refs": [
      "HCC001",
      "HCC002",
      "?HCC003",
      "? HCC008"
    ],
    "ref": "HCC008",
    "label": "? HCC008",
    "to": "HCC008"
  },
  {
    "id": "a544894b",
    "at": "2026-10-21 20:43",
    "type": "merge",
    "brand": "Seiko",
    "model": "Pandagraph",
    "refs": [],
    "into": "Power Design Project Collection 2 HHK001 and HHK002 \"Panda Dial\"",
    "intoRefs": []
  },
  {
    "id": "964c178e",
    "at": "2026-10-21 20:44",
    "type": "deleteRef",
    "brand": "Seiko",
    "model": "Presage Classic HCC009J1 Bonsai",
    "refs": [],
    "ref": "url:https://www.fratellowatches.com/seiko-watches/seiko-explores-the-unique-art-of-bonsai-in-its-new-presage-classic-hcc009j1/|",
    "label": "Referință nespecificată"
  },
  {
    "id": "0e1d83a5",
    "at": "2026-10-21 20:46",
    "type": "deleteRef",
    "brand": "Seiko",
    "model": "Rowing Blazers Collaboration (x Rowing Blazers)",
    "refs": [],
    "ref": "url:https://www.watchtime.com/brands/seiko/seiko-5-sports-rowing-blazers-2026|",
    "label": "Referință nespecificată"
  },
  {
    "id": "5520fdb5",
    "at": "2026-10-21 20:46",
    "type": "deleteRef",
    "brand": "Seiko",
    "model": "Seiko 5 Sports Divers (x Wind Vintage x Rowing Blazers)",
    "refs": [],
    "ref": "url:https://www.fratellowatches.com/were-so-back-a-pair-of-seiko-5-sports-x-wind-vintage-x-rowing-blazers-divers-arrives/|",
    "label": "Referință nespecificată"
  },
  {
    "id": "85c3e44e",
    "at": "2026-10-21 20:46",
    "type": "deleteRef",
    "brand": "Seiko",
    "model": "5 Sports Diver (x Rowing Blazers x Wind Vintage)",
    "refs": [],
    "ref": "url:https://www.ablogtowatch.com/seiko-5-x-rowing-blazers-x-wind-vintage-rally-diver-38mm-green-42mm-blue-watches-hands-on/|",
    "label": "Referință nespecificată"
  },
  {
    "id": "932fbc3a",
    "at": "2026-10-21 20:47",
    "type": "deleteRef",
    "brand": "Seiko",
    "model": "Seiko 5 Sports Motocompo Limited Edition (x Honda)",
    "refs": [],
    "ref": "url:https://wornandwound.com/introducing-the-seiko-5-sports-motocompo-limited-edition/|",
    "label": "Referință nespecificată"
  },
  {
    "id": "2e9f9ddf",
    "at": "2026-10-21 20:48",
    "type": "editRef",
    "brand": "Seiko",
    "model": "5 Sports SRPM09 (x HUF) Limited Edition",
    "refs": [],
    "ref": "url:https://www.fratellowatches.com/introducing-the-seiko-5-sports-srpm09-huf-limited-edition/|",
    "label": "Referință nespecificată",
    "to": "SRPM09"
  },
  {
    "id": "f67c4452",
    "at": "2026-10-21 20:49",
    "type": "deleteRef",
    "brand": "Seiko",
    "model": "5 Sports HUF Green",
    "refs": [],
    "ref": "url:https://www.watchtime.com/brands/automatic-watches/seiko-5-sports-huf-limited-edition-srpm09|",
    "label": "Referință nespecificată"
  },
  {
    "id": "5ab5607b",
    "at": "2026-10-21 20:49",
    "type": "deleteRef",
    "brand": "Seiko",
    "model": "5 Sports HUF Limited Edition SRPM09 Time Sonar",
    "refs": [],
    "ref": "url:https://professionalwatches.com/seiko-5-sports-huf-limited-edition-srpm09-time-sonar/|",
    "label": "Referință nespecificată"
  },
  {
    "id": "2ec03f46",
    "at": "2026-10-21 21:00",
    "type": "deleteRef",
    "brand": "Seiko",
    "model": "Astron GPS Solar Limited Edition",
    "refs": [],
    "ref": "url:https://timeandtidewatches.com/seiko-astron-gps-solar-hab005j1-hab006j1-introducing/|",
    "label": "Referință nespecificată"
  },
  {
    "id": "88a5651d",
    "at": "2026-10-21 21:01",
    "type": "editRef",
    "brand": "Seiko",
    "model": "Astron 5X63 Crystal Pink and Crystal Green",
    "refs": [],
    "ref": "url:https://twobrokewatchsnobs.com/seiko-astron-gps-solar-dual-time-chronograph-calibre-5x63-limited-edition/|",
    "label": "Referință nespecificată",
    "to": "HAB005 , HAB006"
  },
  {
    "id": "a0c924c1",
    "at": "2026-10-21 21:03",
    "type": "editRef",
    "brand": "Seiko",
    "model": "Astron GPS Chronograph",
    "refs": [],
    "ref": "url:https://twobrokewatchsnobs.com/seiko-astron-solar-dual-time-chronograph-calibre-5x63-145th-anniversary/|",
    "label": "Referință nespecificată",
    "to": "HAB001 , HAB002 , HAB003 , HAB004"
  },
  {
    "id": "a6163c6b",
    "at": "2026-10-21 21:03",
    "type": "renameModel",
    "brand": "Seiko",
    "model": "Astron GPS Chronograph",
    "refs": [
      "HAB001 , HAB002 , HAB003 , HAB004"
    ],
    "to": "Seiko Astron GPS Chronograph"
  }
];
