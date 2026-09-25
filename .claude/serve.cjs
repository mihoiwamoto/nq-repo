const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');   /* このフォルダ（改名しても動く） */
const port=Number(process.env.PORT||8791);
/* React 実装（npm run build:kit で作った dist-kit）を同じサーバーの /react/ の下で配る。画面設計はこれを iframe で映す（PROJECT.demo.href）。
   同じオリジンにするのは、別ポートだと Chrome が別プロセスの iframe として扱い、描画が止まる画面があったため（2026-09-25）。
   dist-kit が無ければ配らず、画面設計はプロトタイプ HTML（PROJECT.demo.fallback）に戻る。置き場は REACT_DIST で変えられる */
/* 無ければ、Vercel 用にこのフォルダへ写した react/（React の dist-kit の写し）を使う */
const rdistSrc=path.join(root,'..','other','NQrepo（old）','dist-kit');
const rdist=process.env.REACT_DIST||(fs.existsSync(path.join(rdistSrc,'index.html'))?rdistSrc:path.join(root,'react'));
const hasReact=fs.existsSync(path.join(rdist,'index.html'));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.md':'text/markdown; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf'};
const ctype=f=>({'Content-Type':mime[path.extname(f).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});
http.createServer((req,res)=>{
  let p=decodeURIComponent(req.url.split('?')[0]); if(p==='/')p='/index.html';
  const send=f=>(e,d)=>{ if(e){res.writeHead(404);res.end('not found');return;} res.writeHead(200,ctype(f)); res.end(d); };
  if(hasReact && (p==='/react'||p.startsWith('/react/'))){
    const rel=p.replace(/^\/react\/?/,'');
    /* 画面説明の撮影済みスクリーンショット（.claude/.shots）は dist に入らないので、React のフォルダから直に配る */
    if(rel.startsWith('.claude/')){ const g=path.join(rdist,'..',rel); fs.readFile(g,send(g)); return; }
    let f=path.join(rdist,rel);
    fs.stat(f,(e,st)=>{ if(e||st.isDirectory()) f=path.join(rdist,'index.html');   /* BrowserRouter：知らないパスは index.html（SPA） */
      fs.readFile(f,send(f)); });
    return;
  }
  const f=path.join(root,p);
  /* snapshots/ の控え（プロトタイプの丸ごとのコピー）が images/ を相対で引くと snapshots/images/ になる。無ければ 1 つ上を見る */
  fs.readFile(f,(e,d)=>{ if(e && /^\/snapshots\//.test(p)) fs.readFile(path.join(root,p.replace(/^\/snapshots/,'')),send(f)); else send(f)(e,d); });
}).on('error',e=>{ console.error(e.code==='EADDRINUSE' ? `port ${port} は使用中です。先に止めるか PORT= で変えてください` : e.message); process.exit(1); })
  .listen(port,'127.0.0.1',()=>console.log('kit server on',port, hasReact ? `（React 実装を /react/ で配る：${rdist}）` : `（React の dist-kit が無いので、画面設計はプロトタイプ HTML を映す）`));
