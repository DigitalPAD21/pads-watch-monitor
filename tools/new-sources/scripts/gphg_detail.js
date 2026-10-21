const fs=require('fs');
const f=process.argv[2];
const h=fs.readFileSync(f,'utf8');let s='';const re=/self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;let m;
while((m=re.exec(h)))s+=JSON.parse('"'+m[1]+'"');
const t=h.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
console.log(t.slice(0,2500));
