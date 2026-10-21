const fs=require('fs');const d=process.argv[2],out=process.argv[3];let all=[];
for(let i=1;i<=10;i++){all=all.concat(JSON.parse(fs.readFileSync(d+'/raw-fratello/p'+i+'.json','utf8')))}
const dec=s=>s.replace(/&#8217;|&#8216;/g,"'").replace(/&#8220;|&#8221;/g,'"').replace(/&#8211;/g,'–').replace(/&#8212;/g,'—').replace(/&#038;|&amp;/g,'&').replace(/&#(\d+);/g,(m,n)=>String.fromCharCode(n)).replace(/<[^>]+>/g,'');
const strip=s=>dec(s.replace(/<(script|style)[\s\S]*?<\/\1>/g,'').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ');
const ev=['Watches and Wonders 2026','Geneva Watch Days 2026','LVMH Watch Week'];
const badTitle=/\bTop 5\b|Best 5|Favorite[^—]*Watches And Wonders|Silent Sleepers|Photo Report|Preview Of British|Roundup —|I Came To Be Dazzled|Showdown|Alternatives To/i;
const res=[];let seen=all.length,exc=0;const excl=[];
for(const p of all){const t=((p._embedded&&p._embedded['wp:term'])||[]).flat();
 const cats=t.filter(x=>x.taxonomy=='category').map(x=>dec(x.name));const tags=t.filter(x=>x.taxonomy=='post_tag').map(x=>x.name);
 const cat=cats.includes('Watch Releases'),tag=tags.includes('Watch Releases 2026'),ho=cats.includes('Hands-On')&&tags.some(x=>ev.includes(x));
 const title=dec(p.title.rendered);
 let ok=cat||tag||ho;
 if(ok){
  if(badTitle.test(title))ok=false;
  else if(cats.some(c=>['Sunday Morning Showdown','Podcast','Manufacture Visits','Events & Auctions'].includes(c))&&!cats.includes('Watch Releases'))ok=false;
  else if(cats.includes('Watch Talk')&&!cats.includes('Watch Releases')&&!cats.includes('Hands-On'))ok=false;
  else if(tags.includes('Watch Releases 2025')&&!tag)ok=false;
  else if(cats.includes('Manufacture Visits'))ok=false;
 }
 if(!ok){if(cat||tag||ho){exc++;excl.push(title)}continue}
 const text=title+' '+strip(p.content.rendered).slice(0,3000);
 const refs=new Set();const re=/\b[Rr]ef(?:erence|\.|s\.)?\s*(?:no\.?|number)?\s*:?\s*([A-Z0-9][A-Za-z0-9.\-\/]{2,}(?:-[A-Z0-9]+)?)/g;let m;
 while(m=re.exec(text)){let r=m[1].replace(/[.\-\/]+$/,'');if(/\d/.test(r)&&!/^(19|20)\d\d$/.test(r))refs.add(r)}
 const media=p._embedded&&p._embedded['wp:featuredmedia']&&p._embedded['wp:featuredmedia'][0];
 const brands=t.filter(x=>x.taxonomy=='watchbrands').map(x=>dec(x.name));
 res.push({title,url:p.link,img:(media&&media.source_url)||p.jetpack_featured_media_url||'',date:p.date.slice(0,10),category:cats.filter(c=>c!='Watch Releases').join(', ')||'Watch Releases',brand:brands.length==1?brands[0]:'',model:'',refs:[...refs]});
}
fs.writeFileSync(out+'/fratello.json',JSON.stringify(res,null,1));
const dates=res.map(r=>r.date).sort();
const wr=res.filter(r=>r.refs.length).length;
fs.writeFileSync(out+'/fratello.meta.json',JSON.stringify({source:"Fratello",listingUrls:["https://www.fratellowatches.com/wp-json/wp/v2/posts/?after=2026-01-01T00:00:00&per_page=100&page=1..10&_embed (category 'Watch Releases', tag 'Watch Releases 2026')"],pagesRead:10,itemsSeen:seen,releases:res.length,excluded:exc,withRefs:wr,dateRange:dates[0]+' to '+dates[dates.length-1],complete:true,notes:"WordPress REST API, all 960 posts since 2026-01-01 (10 pages x100). Release = category 'Watch Releases' OR tag 'Watch Releases 2026' OR Hands-On with tag Watches and Wonders 2026/Geneva Watch Days 2026/LVMH Watch Week. Excluded (counted in excluded, only among those candidates): Top 5/favorites/roundup lists, Sunday Morning Showdown, Watch Talk-only, events, manufacture visits, items tagged only 'Watch Releases 2025'. Other 365 posts not candidates (podcasts, showdowns, reviews, untagged hands-ons of mostly older watches, ~38 untagged Hands-On posts, some may be 2026 novelties but are unmarked). Fratello has no structured spec box: refs are regex-extracted from 'ref./reference X' mentions in title + first 3000 chars of article text (from REST content, no page fetches), so coverage is partial. brand filled only when exactly one watchbrands taxonomy term; model empty. Image is featured media source_url."},null,1));
console.log(res.length,exc,wr,dates[0],dates[dates.length-1]);console.log(excl.slice(0,40).join('\n'));
console.log(JSON.stringify(res.slice(0,3)));
