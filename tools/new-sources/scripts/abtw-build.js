const fs=require('fs');const d=process.argv[2];let all=[];
for(let p=1;p<=7;p++)all=all.concat(JSON.parse(fs.readFileSync(d+'/p'+p+'.json','utf8')));
const dec=s=>s.replace(/&#8217;|&#8216;|&rsquo;|&lsquo;/g,"'").replace(/&#8220;|&#8221;/g,'"').replace(/&#8211;/g,'-').replace(/&#8212;/g,'—').replace(/&#038;|&amp;/g,'&').replace(/&#(\d+);/g,(m,n)=>String.fromCharCode(n));
const out=[],ex=[],border=[];
for(const a of all){
 const t=(a._embedded['wp:term']||[]).flat();const cats=t.filter(x=>x.taxonomy=='category').map(x=>dec(x.name));
 const tags=t.filter(x=>x.taxonomy=='post_tag').map(x=>dec(x.name));
 const title=dec(a.title.rendered).trim();
 const r26=tags.includes('Watch Releases 2026');const rel=cats.includes('Watch Releases');
 const debut=/^(New Release|Hands[- ]On Debut|Hands On Debut|Introducing|Debut)/i.test(title);
 const bad=cats.some(c=>/Podcast|Giveaway|Round-Ups|Editors|Shows|Featured/.test(c)&&!r26)||/^(ICYMI|Top 10|The aBlogtoWatch Team Picks)/.test(title);
 const isList=/ICYMI|Top 10 (Timepieces|Releases)|Team Picks The Top/.test(title);
 const spon=/Perrelet Sets|Hanhart Celebrates|Pair Of Glash|Luminox Adventure|Panerai Expands|Corum Heritage Coin|CronusArt CM026|Ferragamo F-80|Vostok Europe Object X|Versace Unveils|Atomic Age Oppenheimer|Citizen Brings The ATTESA|Minute Repeater Flying Bridges|Glash.tte Original Pano|Victorinox Concept One|Collectibles: The Fifth|Zenith Defy Zero G|Bulgari Sets You Up|Triscope by Angles/.test(title);
 const hon=cats.includes('Hands-On')&&!/Review|Long-Term|Second Look|Bosphorus Leather|Smartlet/.test(title);
 let inc=!isList&&(r26||rel||debut||spon||hon);
 if(inc&&cats.some(c=>/Podcast|Giveaway/.test(c)))inc=false;
 if(!inc&&cats.includes('Hands-On')||!inc&&cats.includes('Sponsored post'))border.push(title+' ['+cats+']');
 if(!inc){ex.push(title);continue}
 const html=a.content.rendered;
 const refs=new Set();
 const txt=dec(html.replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ');
 const re=/\b(?:Reference(?: Number)?|Ref\.?|Model(?: Number| No\.?)?|Reference No\.?)\s*[:\-]?\s*([A-Z0-9][A-Za-z0-9.\-\/]{3,24}(?:\s*(?:\/|,|and)\s*[A-Z0-9][A-Za-z0-9.\-\/]{3,24})*)/g;
 let m;while(m=re.exec(txt)){for(const r of m[1].split(/\s*(?:\/|,|and)\s*/)){if(/\d/.test(r)&&!/^(20\d\d|\d{1,3}mm)$/.test(r))refs.add(r.replace(/[.,]$/,''))}}
 const img=a._embedded['wp:featuredmedia']&&a._embedded['wp:featuredmedia'][0]&&a._embedded['wp:featuredmedia'][0].source_url||'';
 out.push({title,url:a.link,img,date:a.date.slice(0,10),category:cats.join(' | '),brand:'',model:'',refs:[...refs],_t:tags.length});
}
out.forEach(o=>delete o._t);
fs.writeFileSync(process.argv[3],JSON.stringify(out,null,1));
console.log('inc',out.length,'ex',ex.length,'withRefs',out.filter(o=>o.refs.length).length);
console.log(border.length);console.log(border.join('\n'));
console.log(out.filter(o=>o.refs.length).slice(0,25).map(o=>o.title.slice(0,50)+' => '+o.refs.join(',')).join('\n'));
const ds=out.map(o=>o.date).sort();console.log(ds[0],ds[ds.length-1]);
