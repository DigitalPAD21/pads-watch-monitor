const fs=require('fs');
const all=JSON.parse(fs.readFileSync('gphg.json','utf8'));const refs=JSON.parse(fs.readFileSync('raw-gphg/refs.json','utf8'));
const junk=new Set(['Titanium','Silver','Time Jumper - Stainless Steel','DC6 Night Forest','Tourbillon 30s','37.06']);
const un=x=>{try{return JSON.parse('"'+x+'"')}catch(e){return x}};
const out=[];let withRefs=0;
for(const o of all){
  if(o.category==='Mechanical Clock')continue;
  const r=refs[o.url]||{};
  o.brand=un(o.brand);o.model=un(o.model).replace(/\s+/g,' ').trim();o.title=(o.brand+' '+o.model).trim();
  const ref=un(r.ref||'').trim();
  o.refs=ref&&!junk.has(ref)?[ref]:[];
  if(o.refs.length)withRefs++;
  const m=(r.ld||'').match(/^(\d\d)\/(\d{4})$/);
  o.date=m?m[2]+'-'+m[1]+'-01':'';
  o.category=o.category.replace(/[“”]/g,'"');
  out.push(o);
}
fs.writeFileSync('gphg.json.out',JSON.stringify(out,null,1));fs.renameSync('gphg.json.out','gphg.json');
const dates=out.map(o=>o.date).filter(Boolean).sort();
fs.writeFileSync('gphg.meta.json',JSON.stringify({source:"Grand Prix d'Horlogerie de Genève (GPHG 2026 nominated timepieces)",listingUrls:["https://www.gphg.org/en/gphg-2026/nominated-timepieces"],pagesRead:1+out.length,itemsSeen:84,releases:out.length,excluded:84-out.length,withRefs,dateRange:dates[0]+' .. '+dates.slice(-1)[0]+' (launch month from detail page, day set to 01)',complete:true,notes:"Next.js page; entries parsed from embedded RSC payload (14 categories x 6 nominees = 84). Excluded the 6 'Mechanical Clock' nominees (clocks). All 78 watches kept as 2026 competition entries even though some have launch dates of 2025 (Jun-Nov 2025) per detail page. Dates are the 'Launch date' month (MM/YYYY) with day 01, so approximate. Refs taken from 'Reference' field on each detail page; removed 6 values that are not references (Titanium, Silver, Time Jumper - Stainless Steel, DC6 Night Forest, Tourbillon 30s, 37.06). Some refs are SKU-like or have prefixes (e.g. '#BL140...', 'SKU 76537801' for Tiffany). Category labels are GPHG prize categories as shown (e.g. 'Complication', 'Time Only'), without Men's/Ladies' prefix since the site doesn't use one."},null,1));
console.log(out.length,withRefs,dates[0],dates.slice(-1)[0]);
console.log(out.filter(o=>/\\|"/.test(o.title)).map(o=>o.title));
