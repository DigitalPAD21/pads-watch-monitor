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
  },
  {
    "id": "d27a657a",
    "at": "2026-10-22 15:12",
    "type": "deleteRef",
    "brand": "Bulgari",
    "model": "Monete and Tubogas",
    "refs": [],
    "ref": "url:https://www.watchtime.com/brands/womens-watches/bulgari-monete-and-tubogas|",
    "label": "Referință nespecificată"
  },
  {
    "id": "85fd0a96",
    "at": "2026-10-22 15:12",
    "type": "deleteRef",
    "brand": "Bulgari",
    "model": "Octo Finissimo Perpetual Calendar Blue Titanium",
    "refs": [],
    "ref": "url:https://monochrome-watches.com/bulgari-octo-finissimo-perpetual-calendar-blue-titanium-worlds-thinnest-perpetual-calendar-introducing-price/|",
    "label": "Referință nespecificată"
  },
  {
    "id": "1eefb1bf",
    "at": "2026-10-22 15:13",
    "type": "deleteRef",
    "brand": "Bulgari",
    "model": "Titanio GMT",
    "refs": [],
    "ref": "url:https://www.watchcollectinglifestyle.com/home/bvlgari-titanio-gmt-review-live-photos|",
    "label": "Referință nespecificată"
  },
  {
    "id": "99b5977d",
    "at": "2026-10-22 15:13",
    "type": "deleteRef",
    "brand": "Bulgari",
    "model": "Titanio",
    "refs": [],
    "ref": "url:https://monochrome-watches.com/first-look-bulgari-bvlgari-titanio-gmt-chronograph-aluminium-geneva-watch-days-specs-price-review/|",
    "label": "Referință nespecificată"
  },
  {
    "id": "97efe892",
    "at": "2026-10-22 15:14",
    "type": "deleteRef",
    "brand": "Bulgari",
    "model": "Bulgari Bulgari Aluminium",
    "refs": [],
    "ref": "url:https://www.watchtime.com/brands/automatic-watches/bulgari-bulgari-aluminium-2026|",
    "label": "Referință nespecificată"
  },
  {
    "id": "8fce11be",
    "at": "2026-10-22 15:14",
    "type": "deleteRef",
    "brand": "Bulgari",
    "model": "Aluminium Summer References",
    "refs": [],
    "ref": "url:https://www.timeandwatches.com/2026/06/bulgari-aluminium-summer-editions-104335-104309.html|",
    "label": "Referință nespecificată"
  },
  {
    "id": "ce766c70",
    "at": "2026-10-22 15:15",
    "type": "editRef",
    "brand": "Bulgari",
    "model": "Aluminium Ice Blue and White",
    "refs": [],
    "ref": "url:https://monochrome-watches.com/new-2026-bulgari-aluminium-ice-blue-and-white-automatic-models-review-price/|",
    "label": "Referință nespecificată",
    "to": "104335 , 104335"
  },
  {
    "id": "d8f1bb4f",
    "at": "2026-10-22 15:52",
    "type": "editRef",
    "brand": "Bulgari",
    "model": "Aluminium Ice Blue and White",
    "refs": [
      "104335"
    ],
    "ref": "104335",
    "label": "104335",
    "to": "104335 , 104309"
  },
  {
    "id": "63ef1b54",
    "at": "2026-10-22 15:53",
    "type": "deleteModel",
    "brand": "Bulgari",
    "model": "Octo Finissimo Dual Time (x Vianney Halter)",
    "refs": []
  },
  {
    "id": "4205fa16",
    "at": "2026-10-26 16:45",
    "type": "deleteRef",
    "brand": "Jaeger-LeCoultre",
    "model": "Master Control Chronometre Collection",
    "refs": [],
    "ref": "url:https://monochrome-watches.com/jaeger-lecoultre-master-control-chronometre-collection-integrated-bracelet-2026-price-review/|",
    "label": "Referință nespecificată"
  },
  {
    "id": "400a8a04",
    "at": "2026-10-26 16:47",
    "type": "deleteRef",
    "brand": "Jaeger-LeCoultre",
    "model": "Reverso The Collectibles 5th Capsule Collection",
    "refs": [],
    "ref": "url:https://www.watchtime.com/brands/vintage/jaeger-lecoultre-the-collectibles-5th-capsule-collection|",
    "label": "Referință nespecificată"
  },
  {
    "id": "311b386b",
    "at": "2026-10-26 16:47",
    "type": "deleteRef",
    "brand": "Jaeger-LeCoultre",
    "model": "Reverso Hokusai Waterfall Series",
    "refs": [],
    "ref": "url:https://timeandtidewatches.com/jaeger-lecoultre-reverso-hokusai-waterfall-series-introducing/|",
    "label": "Referință nespecificată"
  },
  {
    "id": "7a2b6262",
    "at": "2026-10-26 16:47",
    "type": "deleteRef",
    "brand": "Jaeger-LeCoultre",
    "model": "Reverso Baguette",
    "refs": [],
    "ref": "url:https://watchesbysjx.com/2026/05/jaeger-lecoultre-reverso-tribute-or-deco-cocktail.html|",
    "label": "Referință nespecificată"
  },
  {
    "id": "bfacd44c",
    "at": "2026-10-26 16:47",
    "type": "deleteRef",
    "brand": "Jaeger-LeCoultre",
    "model": "Master Hybris Mechanica Ultra Thin Minute Repeater",
    "refs": [],
    "ref": "url:https://monochrome-watches.com/jaeger-lecoultre-master-hybris-mechanica-ultra-thin-minute-repeater-tourbillon-introducing/|",
    "label": "Referință nespecificată"
  },
  {
    "id": "e10ca070",
    "at": "2026-10-26 16:49",
    "type": "deleteRef",
    "brand": "Jaeger-LeCoultre",
    "model": "Duometre Heliotourbillon Perpetual Calendar Platinum",
    "refs": [],
    "ref": "url:https://www.ablogtowatch.com/mesmerizing-jaeger-lecoultre-duometre-heliotourbillon-perpetual-calendar-platinum-watch-hands-on/|",
    "label": "Referință nespecificată"
  },
  {
    "id": "f75d57ec",
    "at": "2026-10-26 16:50",
    "type": "deleteRef",
    "brand": "Jaeger-LeCoultre",
    "model": "Gyrotourbillon à Stratosphère",
    "refs": [],
    "ref": "url:https://watchesbysjx.com/2026/04/jaeger-lecoultre-gyrotourbillon-a-stratosphere-review.html|",
    "label": "Referință nespecificată"
  },
  {
    "id": "689315ac",
    "at": "2026-10-26 16:50",
    "type": "deleteRef",
    "brand": "Jaeger-LeCoultre",
    "model": "Marc Newson Atmos and Memovox",
    "refs": [],
    "ref": "url:https://timeandtidewatches.com/jaeger-lecoultre-marc-newson-atmos-introducing/|",
    "label": "Referință nespecificată"
  },
  {
    "id": "0d03cccd",
    "at": "2026-10-26 16:51",
    "type": "brandStatus",
    "brand": "Jaeger-LeCoultre",
    "verified": true
  }
];
