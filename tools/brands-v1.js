// Date colectate pe 21.10.2026 din sursele de mai jos.
// Fiecare sursă are o listă de branduri (o intrare = o lansare) sau un obiect brand -> număr.

const SOURCES = [
  {
    id: "twp",
    name: "The Watch Pages",
    url: "https://www.thewatchpages.com/new-watches/2026",
    status: "ok",
    note: "843 de referințe listate pe 22 de pagini; numărate ca 726 de modele unice (referințele care diferă doar prin variantă au fost comasate).",
    counts: {
      "Jaeger-LeCoultre": 33, "Patek Philippe": 29, "Hublot": 26, "TAG Heuer": 18, "Doxa": 18,
      "Frederique Constant": 16, "Favre-Leuba": 16, "Zenith": 15, "Hermès": 15, "Czapek": 14,
      "Nomos": 14, "Chronoswiss": 14, "Arnold & Son": 13, "Richard Mille": 13, "Vacheron Constantin": 12,
      "IWC": 12, "Louis Vuitton": 12, "H. Moser & Cie.": 12, "Bianchet": 11, "Oris": 11,
      "Venezianico": 10, "Pequignet": 10, "Armin Strom": 10, "Mauron Musy": 10, "Cuervo y Sobrinos": 10,
      "Rolex": 9, "Louis Moinet": 9, "Ressence": 9, "Norqain": 9, "Alpina": 8, "Delma": 8,
      "Maurice Lacroix": 8, "Angelus": 8, "MB&F": 8, "Urwerk": 8, "Raymond Weil": 7, "Tutima": 7,
      "Hanhart": 7, "Audemars Piguet": 7, "Squale": 7, "Bremont": 7, "Perrelet": 7, "Ralph Lauren": 6,
      "Parmigiani Fleurier": 6, "Louis Erard": 6, "BA111OD": 6, "Longines": 6, "Roger Dubuis": 6,
      "Raketa": 6, "Praesidus": 6, "Panerai": 5, "Breitling": 5, "A. Lange & Söhne": 5, "Omega": 5,
      "Sartory Billard": 5, "Bimbu": 5, "De Bethune": 5, "Chopard": 5, "Speake-Marin": 5,
      "Bell & Ross": 5, "Van Cleef & Arpels": 5, "Greubel Forsey": 4, "Grand Seiko": 4,
      "De Rijke & Co": 4, "Ball": 4, "Trilobe": 4, "Titoni": 4, "L. Leroy": 4, "Blancpain": 4, "HYT": 4,
      "Delbana": 3, "Piaget": 3, "Glashütte Original": 3, "Moritz Grossmann": 3, "David Candaux": 3,
      "Daniel Roth": 3, "Gerald Genta": 3, "Tudor": 3, "Ferdinand Berthoud": 3, "Ulysse Nardin": 3,
      "Hautlence": 3, "Benrus": 3, "Briston": 2, "Baume & Mercier": 2, "Lorige": 2, "Corum": 2,
      "MeisterSinger": 2, "U-Boat": 2, "Maurice de Mauriac": 2, "Cyrus Genève": 2, "Jacob & Co.": 2,
      "Krayon": 2, "Fortis": 2, "TAOS": 2, "Bausele": 2, "Strehler": 1, "Massena LAB": 1,
      "Grönefeld": 1, "Emmanuel Bouchet": 1, "Ikepod": 1, "Cvstos": 1, "Montblanc": 1,
      "SevenFriday": 1, "Alexander Shorokhoff": 1, "Laurent Ferrier": 1, "Schwarz Etienne": 1,
      "Furlan Marri": 1, "ZRC": 1, "Jaquet Droz": 1, "GoS": 1, "Carl Suchy & Söhne": 1, "Breva": 1,
      "Vulcain": 1
    }
  },
  {
    id: "mono",
    name: "Monochrome Watches",
    url: "https://monochrome-watches.com/tag/2026/",
    status: "ok",
    note: "Toate cele 64 de pagini ale tag-ului 2026 (≈1.080 de articole). Au fost excluse interviurile, știrile din industrie, ghidurile de cumpărare și editorialele; articolele repetate despre același model au fost numărate o singură dată.",
    // paginile 1–10 (numărate direct)
    counts: {
      "Oris": 5, "MeisterSinger": 4, "Patek Philippe": 4, "Armin Strom": 3, "Frederique Constant": 3,
      "Hublot": 3, "IWC": 3, "Nomos": 3, "Panerai": 3, "Konstantin Chaykin": 2, "A. Lange & Söhne": 2,
      "Baume & Mercier": 2, "Bell & Ross": 2, "Breguet": 2, "Chopard": 2, "Cyma": 2, "Czapek": 2,
      "Formex": 2, "Glashütte Original": 2, "H. Moser & Cie.": 2, "Hamilton": 2, "Jacob & Co.": 2,
      "Louis Vuitton": 2, "MB&F": 2, "Mido": 2, "Pequignet": 2, "Raymond Weil": 2, "Ressence": 2,
      "RGM": 2, "Union Glashütte": 2, "Urwerk": 2, "Yema": 2, "Atelier de Chronométrie": 1,
      "Angelus": 1, "Arnold & Son": 1, "Baltic": 1, "Beauregard": 1, "Berneron": 1, "Blancpain": 1,
      "Bianchet": 1, "Bremont": 1, "Brellum": 1, "Buci": 1, "Charlie Paris": 1, "Chronoswiss": 1,
      "Citizen": 1, "Christiaan van der Klaauw": 1, "David Candaux": 1, "Delma": 1, "Depancel": 1,
      "De Rijke & Co": 1, "Greubel Forsey": 1, "Grönefeld": 1, "DUG Glashütte": 1, "Earthen": 1,
      "Favre-Leuba": 1, "Fortis": 1, "Gerald Charles": 1, "GoS": 1, "Grand Seiko": 1,
      "Girard-Perregaux": 1, "Hanhart": 1, "Hermès": 1, "Inercy Paris": 1, "Jaeger-LeCoultre": 1,
      "Kollokium": 1, "King Seiko": 1, "Kurono Tokyo": 1, "Lang & Heyne": 1, "Lebois & Co": 1,
      "Longines": 1, "Lorige": 1, "Louis Erard": 1, "Louis Moinet": 1, "Marcu": 1, "Minerva": 1,
      "Ming": 1, "Moritz Grossmann": 1, "Montblanc": 1, "Neode": 1, "Nivada Grenchen": 1,
      "Norqain": 1, "Omega": 1, "Peacock": 1, "Perrelet": 1, "Renaud Tixier": 1, "Rado": 1,
      "Roger Dubuis": 1, "Rolex": 1, "Schwarz Etienne": 1, "Seiko": 1, "Singer": 1,
      "Studio Underd0g": 1, "Tudor": 1, "Tutima": 1, "TAG Heuer": 1, "Titoni": 1, "Timex": 1,
      "Ulysse Nardin": 1, "Vacheron Constantin": 1, "Venezianico": 1, "Voxel": 1, "Vulcain": 1,
      "Watches": 1, "Marco Tedeschi": 1, "ArtyA": 1
    },
    // paginile 11–64 (o intrare = o lansare)
    list: [
      // p11
      "De Bethune","Gerald Charles","Baltic","Bulgari","Alpina","Czapek","Akhor","Bulgari","H. Moser & Cie.","Doxa","Oris","Maurice Lacroix","Gerald Genta","Oris","Trilobe","Girard-Perregaux","Daniel Roth",
      // p12
      "Frederique Constant","Bulgari","Zenith","Laurent Ferrier","Bremont","Tudor","Louis Erard","MAD Editions","Chopard","TAG Heuer","Chopard","Ferdinand Berthoud","Frederique Constant","Hamilton","Seiko","Alexandre Martin","O&Hora",
      // p13
      "Gagà Laboratorio","Stowa","Parmigiani Fleurier","Piaget","L. Leroy","Quantum","Fears","Hanhart","Vacheron Constantin","Bianchet","IWC","Awake","Tiffany & Co.","Formex","Atelier Wen","Bell & Ross",
      // p14
      "Ming","Maison Alcée","Seiko","Urwerk","Longines","Longines","Longines","Omega","Porsche Design","Peacock","Jacques Bianchi","Louis Vuitton","Frederique Constant","Tissot",
      // p15
      "Czapek","Glashütte Original","Blancpain","Minerva","Norqain","Henri Grandjean","Tutima","Baltic","Berneron","Porsche Design","Nomos","Kiwame Tokyo",
      // p16
      "MeisterSinger","Time+Tide","Albishorn","Nivada Grenchen","IWC","Seiko","Armin Strom","Seiko","Rado","Watch Ho & Co","Moritz Grossmann","Nomos","Maen","Ceon",
      // p17
      "Yema","Singer","Seiko","Favre-Leuba","Urwerk","Grøne","Baltic","Urban Jürgensen","Bell & Ross","Seiko","Audemars Piguet",
      // p18
      "Chronoswiss","Panerai","Seiko","Bell & Ross","Glashütte Original","Mido","Sicura","Ming","TAG Heuer","Dominique Renaud","Laine","Minerva","Rolex",
      // p19
      "Ulysse Nardin","Citizen","Atelier Pieters","Parmigiani Fleurier","Union Glashütte","Leica","Hanhart","Lebois & Co","Hanhart","Ressence","H. Moser & Cie.","Orient","Rolex","Hamilton",
      // p20
      "Seiko","Patek Philippe","Louis Vuitton","Chopard","RGM","Toledano & Chan","Roger Dubuis","Gerald Charles","Minerva","TAG Heuer","Bianchet",
      // p21
      "Bremont","Nomos","Romain Gauthier","Armin Strom","Bell & Ross","Doxa","Panerai","Krayon","Andersen Genève","Yema","Blancpain","Bulgari","Speake-Marin",
      // p22
      "1776 Atelier","Hublot","Panerai","TAG Heuer","Norqain","MAT Watches","Montblanc","Bulgari","TAG Heuer","Studio Underd0g","Oris","Ferdinand Berthoud","Zenith","Vacheron Constantin","Seiko","Chopard",
      // p23
      "Anoma","Hermès","IWC","March LA.B","Chronoswiss","Chronoswiss","IWC","Depancel","Longines","Bell & Ross","Rado","MB&F","Awake",
      // p24
      "Frederique Constant","Hamilton","Bremont","Czapek","Parmigiani Fleurier","Zenith","Tudor","Greubel Forsey","TAG Heuer","Mido","Maurice Lacroix","Breguet","Breguet","Van Cleef & Arpels",
      // p25
      "Union Glashütte","Baltic","Armin Strom","Blancpain","Akhor","Union Glashütte","De Bethune","Grand Seiko","Grand Seiko","Grand Seiko","Grand Seiko","Amida","Vincent Deprez","Arnold & Son","Titan","MeisterSinger",
      // p26
      "Panerai","Hublot","Bovet","Timex","Awake","Ochs und Junior","Bovet","Maen","Nomos","Cuervo y Sobrinos","Seiko","Certina","Bremont","H. Moser & Cie.",
      // p27
      "Ulysse Nardin","Hanhart","J.N. Shapiro","Tissot","Vacheron Constantin","De Rijke & Co","Monovant","Doxa","ArtyA","Angelus","Arnold & Son","Tudor","Mido",
      // p28
      "Chopard","Longines","Urwerk","Angelus","Christiaan van der Klaauw","MB&F","Seiko","DUG Glashütte","Yema","Chronoswiss","Blancpain","Kiwame Tokyo","Favre-Leuba","Raymond Weil","TAG Heuer","Hermès",
      // p29
      "Pequignet","Ming","Laps","Glashütte Original","Chopard","Girard-Perregaux","Seiko","Trilobe","Rado","Oris","Orient Star",
      // p30
      "Delma","Zenith","Squale","Oris","Audemars Piguet","Bell & Ross","Piaget","Kollokium","Parmigiani Fleurier","Favre-Leuba","Formex","Norqain","Albishorn","Zenith","Christiaan van der Klaauw",
      // p31
      "Oris","A. Lange & Söhne","Konstantin Chaykin","H. Moser & Cie.","Jaeger-LeCoultre","Tudor","Czapek","Bangalore Watch Company","Glashütte Original","Louis Erard","Sero","David Candaux","Akhor","Jaeger-LeCoultre","Marco Lang",
      // p32
      "Marco Tedeschi","MB&F","Alpina","Serica","Omega","March LA.B","Ressence","Armin Strom","Charlie Paris","Favre-Leuba","Kurono Tokyo","Bremont","Moritz Grossmann","King Seiko",
      // p33
      "Atelier Wen","Maen","Ochs und Junior","Longines","Bell & Ross","Horologically Unique","A. Lange & Söhne","Patek Philippe","Briston","Hamilton","Hublot","A. Lange & Söhne","Perrelet","Eska","MeisterSinger","Seiko",
      // p34
      "Seiko","Orient Star","H. Moser & Cie.","Parmigiani Fleurier","Audemars Piguet","ZRC","Ming","Urwerk","Rado","Timex","Oris","Bell & Ross","Rolex","Baltic","Louis Moinet","Lorige",
      // p35
      "The Armoury","Daniel Roth","Longines","Girard-Perregaux","Seiko","Havid Nagan","Squale","Baltic","Titan","Tudor","De Bethune","Panerai","MeisterSinger","Union Glashütte","Mido",
      // p36
      "Haute-Rive","Rolex","Moritz Grossmann","Anoma","Hajime Asaoka","Bradley Taylor","Certina","Naoya Hida","Zenith","Vanguart","Patek Philippe","Rolex","Farer","H. Moser & Cie.","Frederique Constant",
      // p37
      "Tudor","Cartier","Venezianico","Union Glashütte","L. Leroy","Otsuka Lotec","De Bethune","MeisterSinger","TAG Heuer","Rolex","Patek Philippe","Reservoir",
      // p38
      "Rolex","Tudor","IWC","Nomos","Jaeger-LeCoultre","Louis Erard","Hamilton","Grand Seiko","Chopard","IWC","Favre-Leuba","Panerai","Zenith","Oris","IWC",
      // p39
      "Jaeger-LeCoultre","Jaeger-LeCoultre","Hublot","Hautlence","Chopard","Christiaan van der Klaauw","Chanel","Chopard","Cartier","Bulgari","Chopard","Grand Seiko","Roger Dubuis","Vacheron Constantin","Parmigiani Fleurier","IWC",
      // p40
      "H. Moser & Cie.","Alpina","Vacheron Constantin","Schwarz Etienne","Bremont","Bulgari","IWC","Jaeger-LeCoultre","IWC","Cartier","Chopard","Favre-Leuba","Grand Seiko","Panerai","Piaget","Zenith",
      // p41
      "A. Lange & Söhne","Vacheron Constantin","Roger Dubuis","Bremont","Piaget","Armin Strom","Oris","Zenith","TAG Heuer","IWC","Hermès","Ulysse Nardin","Chopard","Jaeger-LeCoultre",
      // p42
      "Cartier","Grand Seiko","A. Lange & Söhne","Parmigiani Fleurier","Laurent Ferrier","H. Moser & Cie.","Vacheron Constantin","Panerai","IWC","Hublot",
      // p43
      "Patek Philippe","Patek Philippe","Grand Seiko","Patek Philippe","Rolex","Chopard","TAG Heuer","Bulgari","Cartier","Patek Philippe","Patek Philippe","De Bethune",
      // p44
      "Hautlence","Zeitwinkel","Sylvain Pinaud","Henri Grandjean","Norqain","Chronoswiss","Chronoswiss","Tissot","Czapek","Arnold & Son","Bianchet","Tangens","MB&F","Lebois & Co","Moritz Grossmann",
      // p45
      "Hamilton","Norqain","ArtyA","Jacob & Co.","Urwerk","Delbana","Qian GuoBiao","Union Glashütte","Anton Suhanov","Greubel Forsey","Trilobe","Corum",
      // p46
      "Hautlence","Rexhep Rexhepi","OraOrea","Winnerl","Maen","Earthen","Louis Moinet","Formex","Albishorn","Montblanc","Stéphane Pierre",
      // p47
      "Credor","Kiwame Tokyo","Nivada Grenchen","Cleguer","Chronoswiss","Credor","Credor","Raymond Weil","Gerald Charles","Fleming","Baltic","Tissot","Breguet","Ferdinand Berthoud","Bianchet","David Candaux","Singer",
      // p48
      "Parmigiani Fleurier","GoS","Holthinrichs","Maghnam Mohareb","Felipe Pikullik","Moritz Grossmann","Omega","Longines","Breva","Strehler","Bell & Ross","Jacob & Co.",
      // p49
      "Longines","ArtyA","Doxa","Krayon","Louis Erard","TAOS","Watch Ho & Co","Haute-Rive","Bamford London","Simon LeFrancois","Maen","Awake","Christopher Ward","Citizen",
      // p50
      "Juha Eskola","Delma","Seiko","King Seiko","Greubel Forsey","Tissot","Yema","Doxa","Akhor","Chopard","Beaubleu","Fortis",
      // p51
      "Serica","Farer","Kollokium","Eska","Mido","Junghans","Tudor","Vulcain","Glashütte Original","Benrus","De Rijke & Co",
      // p52
      "Bremont","Omega","Raymond Weil","Kurono Tokyo","Depancel","Parmigiani Fleurier","Lebois & Co","Nomos","Serica","Hanhart","Citizen","Ming","March LA.B","Gerald Charles","Norqain","Armin Strom",
      // p53
      "H. Moser & Cie.","Pequignet","Perrelet","Tutima","Tissot","IWC","Raymond Weil","Ressence","Kudoke","Studio Underd0g","Czapek","Chronoswiss","Hamilton","Chronoswiss",
      // p54
      "Panerai","Piaget","Mido","Krayon","Habring2","Ulysse Nardin","Citizen","Citizen","Moritz Grossmann","Nivada Grenchen","Orient Star","Seiko","Yema",
      // p55
      "H. Moser & Cie.","Girard-Perregaux","Horage","Louis Moinet","Orient Star","Bell & Ross","Orient","Louis Vuitton","MeisterSinger","Orient Star","Brellum",
      // p56
      "Armin Strom","Baltic","Bremont","Delbana","Jack Mason","Timex","Alpina","Hamilton","MB&F","Ming","Praesidus","Audemars Piguet",
      // p57
      "Laco","Sarpaneva","Farer","Parmigiani Fleurier","IWC","Niton","Audemars Piguet","Audemars Piguet","Audemars Piguet","Audemars Piguet","Audemars Piguet","Audemars Piguet","Audemars Piguet","Vacheron Constantin",
      // p58
      "Audemars Piguet","Audemars Piguet","Audemars Piguet","Audemars Piguet","Louis Vuitton","Norqain","Henri Grandjean","Angelus",
      // p59
      "Hermès","Bianchet","H. Moser & Cie.","Piaget","Atelier Wen","Toledano & Chan","Hanhart","Tissot","Louis Erard","Ochs und Junior","Citizen",
      // p60
      "Mermont","Tertium Quid","Bremont","Czapek","Oris","Hublot","Awake","Zenith","Blancpain","TAG Heuer","Hublot","MB&F","Louis Vuitton","Zenith",
      // p61
      "Omega","Hublot","Bulgari","Hublot","Louis Vuitton","Zenith","Tiffany & Co.","TAG Heuer","Bulgari","Hublot","Gerald Genta","Zenith","TAG Heuer","Daniel Roth","Louis Vuitton","Mido",
      // p62
      "Citizen","Maurice Lacroix","Rado","Pequignet","Armin Strom","VPC","Venezianico","Hamilton","Hazemann & Monnin","RGM","Independent Atelier","Gerald Charles","Oris","Arnold & Son",
      // p63
      "Omega","Yema","H. Moser & Cie.","Union Glashütte","Mido","L. Leroy","Toka","Vyntage Horology","Hublot","Credor","Seiko","Moritz Grossmann","Breguet","TAG Heuer",
      // p64
      "MIH","Oris","Seiko","Kurono Tokyo","Union Glashütte","Antti Rönkkö"
    ]
  },
  {
    id: "hodinkee",
    name: "Hodinkee",
    url: "https://www.hodinkee.com/packages/watches-and-wonders-2026",
    status: "blocked",
    note: "Site-ul blochează accesul automat; datele nu au putut fi colectate și nu sunt incluse în statistică.",
    counts: {}
  },
  {
    id: "ww",
    name: "Worn & Wound",
    url: "https://wornandwound.com/our-favorite-watches-of-2026-so-far/",
    status: "ok",
    note: "Articolul „Our Favorite Watches of 2026 (So Far)” din 3 iulie 2026: 9 ceasuri.",
    counts: { "Grand Seiko": 3, "Baltic": 1, "Zenith": 1, "Tudor": 1, "Fears": 1, "Doxa": 1, "Dryden": 1 }
  },
  {
    id: "wwg",
    name: "Watches and Wonders",
    url: "https://www.watchesandwonders.com/en/geneva-2026/novelties",
    status: "ok",
    note: "Pagina de noutăți Geneva 2026 (14–20 aprilie) prezintă câte o noutate reprezentativă pentru fiecare dintre cei 65 de expozanți.",
    list: [
      "A. Lange & Söhne","Alpina","Angelus","Armin Strom","Arnold & Son","ArtyA","Audemars Piguet","B.R.M","Baume & Mercier",
      "Behrens","Bianchet","Bremont","Bulgari","Cartier","Chanel","Charles Girardier","Charriol","Chopard",
      "Christiaan van der Klaauw","Chronoswiss","Corum","Credor","Cyrus Genève","Czapek","Eberhard & Co.","Favre-Leuba",
      "Ferdinand Berthoud","Frederique Constant","Genus","Gerald Charles","Grand Seiko","Grönefeld","H. Moser & Cie.",
      "Hautlence","Hermès","Hublot","IWC","Jaeger-LeCoultre","Marco Tedeschi","L'Epée 1839","Laurent Ferrier","Louis Moinet",
      "March LA.B","Nomos","Norqain","Oris","Panerai","Parmigiani Fleurier","Patek Philippe","Pequignet","Piaget",
      "Raymond Weil","Ressence","Roger Dubuis","Rolex","Rudis Sylva","Sinn","TAG Heuer","Trilobe","Tudor","U-Boat",
      "Ulysse Nardin","Vacheron Constantin","Van Cleef & Arpels","Zenith"
    ]
  }
];
