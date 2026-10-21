cd "$(dirname "$0")/../raw-watchtime" || exit 1
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
node -e "require('./articles-sitemap.json').slice(0,720).forEach((u,i)=>console.log(i+' '+u.loc))" > list.txt
while read i u; do f=art/$i.html; [ -s $f ] && continue; c=$(curl -s -L -A "$UA" -o $f -w "%{http_code}" "$u"); [ "$c" != 200 ] && { echo "$i $c" >> errs.txt; sleep 20; c=$(curl -s -L -A "$UA" -o $f -w "%{http_code}" "$u"); echo "retry $i $c" >> errs.txt; }; sleep 1; done < list.txt
echo done > done.txt
