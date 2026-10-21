const fs=require('fs');const h=fs.readFileSync(''+(process.argv[2]||'raw-gphg/list.html')+'','utf8');
let s='';const re=/self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;let m;
while((m=re.exec(h)))s+=JSON.parse('"'+m[1]+'"');
fs.writeFileSync(process.argv[3]||'raw-gphg/flight.txt',s);console.log(s.length);
