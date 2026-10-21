const fs=require('fs');const x=fs.readFileSync('sitemap.xml','utf8');
const urls=[...x.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m=>({loc:m[1].match(/<loc>(.*?)</)[1],lm:(m[1].match(/<lastmod>(.*?)</)||[])[1]}));
const a=urls.filter(u=>u.loc.split('/').length>=6);
console.log(a.length);
const by={};a.forEach(u=>{const m=u.lm.slice(0,7);by[m]=(by[m]||0)+1});console.log(by);
console.log(a.slice(0,5), a.filter(u=>u.lm>'2026-10-15').length);
fs.writeFileSync('articles-sitemap.json',JSON.stringify(a));
