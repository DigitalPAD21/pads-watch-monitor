const fs=require("fs");const D=process.argv[2];
const a=JSON.parse(fs.readFileSync(D+"/raw-timeandwatches/all.json","utf8"));
const T="([A-Z0-9][A-Za-z0-9\\-\\.\\/]*[0-9][A-Za-z0-9\\-\\.\\/]*)";
const re=new RegExp("\\b(?:references?|refs?\\.)\\s+(?:no\\.?\\s*|number\\s*)?"+T+"(?:\\s*(?:,|and|or|\\/)\\s*"+T+")?","gi");
const out=[];let excl=0,withRefs=0;
for(const x of a){
  const cats=(x.category||[]).map(c=>c.term);
  if(!cats.includes("new watches")){excl++;continue}
  const html=x.content.$t;
  const t=html.replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ");
  const alts=[...html.matchAll(/alt="([^"]*)"/g)].map(m=>m[1]).join(" ");
  const refs=new Set();
  for(const m of (t+" "+alts).matchAll(re))for(const g of m.slice(1)){if(g){const v=g.replace(/[.,;]+$/,"");if(v.length>=3)refs.add(v)}}
  const im=html.match(/<img[^>]+src="([^"]+)"/);
  let img=im?im[1]:(x["media$thumbnail"]?x["media$thumbnail"].url:"");
  const link=(x.link.find(l=>l.rel==="alternate")||{}).href||"";
  if(refs.size)withRefs++;
  out.push({title:x.title.$t.trim(),url:link,img,date:x.published.$t.slice(0,10),category:"new watches",brand:"",model:"",refs:[...refs]});
}
out.sort((p,q)=>q.date.localeCompare(p.date));
fs.writeFileSync(D+"/timeandwatches.json",JSON.stringify(out,null,1));
fs.writeFileSync(D+"/timeandwatches.meta.json",JSON.stringify({source:"Time and Watches",listingUrls:["https://www.timeandwatches.com/feeds/posts/default?alt=json (Blogger feed, monthly published-min/max windows)"],pagesRead:16,itemsSeen:a.length,releases:out.length,excluded:excl,withRefs,dateRange:out[out.length-1].date+" to "+out[0].date,complete:true,notes:"Blogger JSON feed; all 336 posts of 2026 obtained via monthly windows (start-index pagination alone missed 13). Release = post carrying label 'new watches' (313); excluded 23 = industry news, features, interviews, auctions, exhibitions without that label. Brand/model left empty (labels mix brand, collection and topic tags). Article pages not fetched; no spec boxes exist, so refs were extracted by regex from feed body text/img alt where prose says 'reference/ref.' followed by a code containing a digit; refs are partial and only present when mentioned in prose."},null,1));
console.log(out.length,excl,withRefs);
