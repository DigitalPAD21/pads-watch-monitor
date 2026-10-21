const fs=require('fs');const s=fs.readFileSync('raw-gphg/flight.txt','utf8');
const re=/"id":"(2026_PRE_[^"]+)","children":"([^"]*)"|"href":"(\/en\/watches\/[^"]+)","children":\["\$","img",null,\{"src":"([^"]*)"\}\]\}\]\}\],\["\$","div",null,\{"className":"title","children":\["\$","h4",null,\{"children":"([^"]*)"\}\]\}\],\["\$","div",null,\{"className":"sub-title","children":\["\$","p",null,\{"dangerouslySetInnerHTML":\{"__html":"([^"]*)"/g;
let m,cat='',out=[],seen=new Set();
while((m=re.exec(s))){
 if(m[1]){cat=m[2];continue;}
 const url='https://www.gphg.org'+m[3];
 out.push({title:(m[5]+' '+m[6]).replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim(),url,img:m[4],date:'',category:cat,brand:m[5],model:m[6].replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim(),refs:[]});
}
console.log(out.length);
const cnt={};out.forEach(o=>cnt[o.category]=(cnt[o.category]||0)+1);console.log(cnt);
fs.writeFileSync('gphg.json',JSON.stringify(out,null,1));
