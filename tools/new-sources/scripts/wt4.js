const fs=require('fs');const R='raw-watchtime/';
const list=fs.readFileSync(R+'list.txt','utf8').trim().split('\n').map(l=>{const [i,u]=l.split(' ');return {i,u}});
const dec=s=>s.replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#0?39;|&rsquo;|&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#(\d+);/g,(m,n)=>String.fromCharCode(n));
const out=[];
for(const {i,u} of list){
  let h;try{h=fs.readFileSync(R+'art/'+i+'.html','utf8')}catch(e){continue}
  const g=(re)=>{const m=h.match(re);return m?m[1]:''};
  const date=g(/"datePublished":\s*"(\d{4}-\d\d-\d\d)/);
  const title=dec(g(/<h1 class="m-hero-article__headline">\s*([\s\S]*?)\s*<\/h1>/).trim())||dec(g(/"headline":\s*"([^"]*)"/));
  const sub=dec(g(/m-hero-article__subline"><h2>([\s\S]*?)<\/h2>/));
  const exc=dec(g(/m-hero-article__excerpt">\s*([\s\S]*?)\s*<\/div>/));
  const img=g(/og:image" content="([^"]*)"/);
  const cat=dec(g(/"articleSection":\s*"([^"]*)"/));
  const kw=(g(/"keywords":\s*\[([\s\S]*?)\]/).match(/"([^"]*)"/g)||[]).map(s=>dec(s.slice(1,-1)));
  const a=h.indexOf('m-hero-article__headline'),b=h.indexOf('o-article-extras"');
  const body=dec(h.slice(a,b>a?b:undefined).replace(/<script[\s\S]*?<\/script>/g,'').replace(/<(?!img)[^>]+>/g,' ').replace(/<img[^>]*alt="([^"]*)"[^>]*>/g,' $1 ').replace(/\s+/g,' '));
  const refs=new Set();
  for(const m of body.matchAll(/\b(?:Ref(?:erence)?s?\.?(?:\s*(?:No\.?|Number|#))?:?)\s+((?:[A-Z0-9][A-Za-z0-9.\-\/]{2,})(?:(?:,|\s(?:and|&|or))\s*(?:Ref\.?\s*)?[A-Z0-9][A-Za-z0-9.\-\/]{2,})*)/g)){
    for(const t of m[1].split(/,|\s(?:and|&|or)\s/)){const v=t.replace(/^Ref\.?\s*/,'').trim().replace(/[.,;:]+$/,'');if(/\d/.test(v)&&/^[A-Z0-9]/.test(v)&&v.length>=4&&!/^\d{4}$/.test(v)||(/^\d{4}$/.test(v)&&false))refs.add(v)}
  }
  out.push({i:+i,title,url:u,img,date,category:cat,sub,exc,kw,refs:[...refs]});
}
fs.writeFileSync('raw-watchtime/parsed.json',JSON.stringify(out));
const y=out.filter(o=>o.date>='2026-01-01');console.log(out.length,y.length,out.filter(o=>!o.date).length);
