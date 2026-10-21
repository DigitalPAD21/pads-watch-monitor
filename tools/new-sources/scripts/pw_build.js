const fs=require('fs');const p=JSON.parse(fs.readFileSync('p1.json','utf8'));
const inc=[2,3,4,5,9,11,12,13,14,15,19,20,22,23,24,25,26,27,30,31,33,37,40,44,48,53,59,60,63,64,66,71,72,73,74,75];
const dec=s=>s.replace(/&#8217;/g,"'").replace(/&#8220;|&#8221;/g,'"').replace(/&#038;|&amp;/g,'&').replace(/&#8211;/g,'-');
const out=[];
for(const i of inc){const x=p[i];const txt=x.content.rendered.replace(/<[^>]+>/g,'\n');
 const refs=new Set();
 const re=/Ref(?:erence)?(?: Number| No)?\.?\s*(?:\n|:)?\s*([A-Z0-9][A-Za-z0-9\-\/\.]{3,})/g;let m;
 while((m=re.exec(txt))){if(/\d/.test(m[1]))refs.add(m[1].replace(/[.]$/,''))}
 const terms=(x._embedded&&x._embedded['wp:term']||[]);
 const cat=(terms[0]||[]).map(t=>t.name).join(', ');
 const img=x._embedded&&x._embedded['wp:featuredmedia']&&x._embedded['wp:featuredmedia'][0]&&x._embedded['wp:featuredmedia'][0].source_url||'';
 out.push({title:dec(x.title.rendered).trim(),url:x.link,img,date:x.date.slice(0,10),category:cat,brand:'',model:'',refs:[...refs]});}
fs.writeFileSync('../profwatches.json',JSON.stringify(out,null,1));
out.forEach(o=>console.log(o.date,o.title,'|',o.category,'|',o.refs.join(','),'|',o.img?'img':'noimg'));
