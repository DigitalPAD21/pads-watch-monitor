const fs=require('fs');
const dir=process.argv[2];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 let last='fratellowatches.com-https:--www.fratellowatches.com-?p=387990', all=[], page=0;
 while(last){
  let arr=null;
  for(let t=0;t<5;t++){
   try{const r=await fetch('https://api.allwatchnews.com/latest?after='+encodeURIComponent(last),{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36'}});
    if(r.ok){arr=await r.json();break;} console.error('status',r.status); await sleep(30000);}catch(e){console.error(e.message);await sleep(30000);}
  }
  if(!arr||!arr.length)break;
  page++; fs.writeFileSync(dir+'/api-'+page+'.json',JSON.stringify(arr));
  all.push(...arr); last=arr[arr.length-1].id;
  const d=new Date(arr[arr.length-1].date).toISOString();
  console.error(page,all.length,d);
  if(d<'2025-12-25')break;
  await sleep(1100);
 }
 fs.writeFileSync(dir+'/all.json',JSON.stringify(all));
})();
