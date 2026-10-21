const fs=require('fs');
const out=JSON.parse(fs.readFileSync('gphg.json','utf8'));
const res={};
function flight(h){let s='';const re=/self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;let m;while((m=re.exec(h)))s+=JSON.parse('"'+m[1]+'"');return s;}
function field(s,name){
  const m=s.match(new RegExp('^([0-9a-f]+):"'+name+'"$','m'));
  const key=m?('\\$L'+m[1]):name;
  const r=new RegExp('"children":"'+key+'"\\}\\],\\["\\$","div",null,\\{"className":"field-items","children":"([^"]*)"');
  const v=s.match(r);return v?v[1]:'';
}
(async()=>{
  for(let i=0;i<out.length;i++){
    const o=out[i];
    if(o.category==='Mechanical Clock')continue;
    const slug=o.url.split('/').pop();
    const f='raw-gphg/d/'+slug+'.html';
    if(!fs.existsSync(f)){
      const r=await fetch(o.url,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'}});
      const t=await r.text();
      if(r.status!==200){console.log('ERR',r.status,o.url);}
      fs.writeFileSync(f,t);
      await new Promise(r=>setTimeout(r,1200));
    }
    const s=flight(fs.readFileSync(f,'utf8'));
    const ref=field(s,'Reference'),ld=field(s,'Launch date');
    res[o.url]={ref,ld};
    console.log(i,o.title,'|',ref,'|',ld);
  }
  fs.writeFileSync('raw-gphg/refs.json',JSON.stringify(res,null,1));
})();
