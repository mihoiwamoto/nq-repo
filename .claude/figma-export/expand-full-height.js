// use_figma: 画面を中身の下まで伸ばす（スクロールした先まで全部見せる）。COL に帳票名を入れて列ごとに実行。
// 組み立て（figma-builder.js）のあとに当てる。名前にポップアップ・ダイアログ・プルダウン・メニュー・トーストがある画面は伸ばさず crop() で基準の大きさに切る。サイドメニュー（nav）は HUG なので FILL に直す（2026-10-06：760px で切れていた）。そのあと「行のそろえ直し」（README）をする。
const COL='機械器具点検';
const pg=await figma.getNodeByIdAsync('7688:98558');await figma.setCurrentPageAsync(pg);
function grow(n){if(n.type!=='FRAME')return;for(const c of n.children)if(c.type==='FRAME'&&c.layoutPositioning!=='ABSOLUTE')grow(c);
 if(!n.children.length)return;const old=n.height;
 if(n.layoutMode==='NONE'){const mb=Math.max(...n.children.filter(c=>c.visible).map(c=>c.y+c.height));if(mb>old+8)n.resize(n.width,Math.ceil(mb+24));return;} // 8px 以下のはみ出し（枠線・影・今日の丸）は伸ばさない（2026-10-08：カレンダーの下に 24〜30px の空き、1280 のサイドメニューで 792px になっていた）
 if(n.layoutMode==='VERTICAL')n.primaryAxisSizingMode='AUTO';else n.counterAxisSizingMode='AUTO';
 if(n.height<old-0.5){if(n.layoutMode==='VERTICAL')n.primaryAxisSizingMode='FIXED';else n.counterAxisSizingMode='FIXED';n.resize(n.width,old);}}
// ポップアップ・ダイアログ・プルダウン・メニュー・トーストを開いた画面は伸ばさない（2026-10-08 夜、ユーザー指定：確定デザインと同じ 1440×960／768×1024 で切る）。
// 中身は縮めず切り取るだけ。幕は表示範囲（管理画面 960／アプリは「画面」の 976）いっぱい、ポップアップ・ダイアログの本体はその中央。プルダウン・メニュー・トーストは開いた位置のまま。
const POP_KW=['ポップアップ','ダイアログ','プルダウン','メニュー','トースト'];
function crop(f){const W=Math.round(f.width);const app=W===768;const vp=app?1024:960;const view=app?976:960;
 const scr=app?(f.children.find(c=>c.name==='画面')||f):f;const H0=scr.height;
 const ovs=scr.children.filter(c=>c.type==='FRAME'&&c.layoutPositioning==='ABSOLUTE'&&Math.round(c.width)===W&&c.height>=H0-1);
 f.primaryAxisSizingMode='FIXED';f.clipsContent=true;
 if(scr!==f){scr.layoutSizingVertical='FIXED';scr.primaryAxisSizingMode='FIXED';scr.resize(W,view);scr.clipsContent=true;}
 f.resize(W,vp);
 for(const c of scr.children)if(c.type==='FRAME'&&c.layoutPositioning!=='ABSOLUTE'){c.layoutSizingVertical='FILL';c.clipsContent=true;} // サイドメニュー（nav FILL）も 960 になる
 for(const o of ovs){o.resize(W,view);for(const k of o.children)if(k.layoutPositioning==='ABSOLUTE'&&k.width>=W-1)k.resize(W,view);
  const b=o.children.filter(k=>k.layoutPositioning!=='ABSOLUTE').sort((a,b)=>b.width*b.height-a.width*a.height)[0];if(!b)continue;
  if(b.layoutSizingVertical==='FILL'||b.height>view-1){const mb=Math.max(...b.children.filter(k=>k.visible).map(k=>k.y+k.height));b.layoutSizingVertical='FIXED';b.resize(b.width,Math.round(mb+40));} // 幕に引っぱられて伸びた本体を中身＋下の余白 40 に戻す
  const pt=Math.max(0,Math.round((view-b.height)/2));if(o.layoutMode!=='NONE')o.paddingTop=pt;else b.y=pt;}
 return [H0,f.height];}
function expand(f){if(POP_KW.some(k=>f.name.includes(k)))return crop(f);const h0=f.height;const vp=Math.round(f.width)===768?1024:960; // 管理画面は 1440×960（2026-10-08）
 const ovs=f.children.filter(c=>c.type==='FRAME'&&c.layoutPositioning==='ABSOLUTE'&&Math.round(c.width)===Math.round(f.width)&&Math.round(c.height)===Math.round(h0));
 grow(f);
 for(const h of f.findAll(n=>n.type==='FRAME'&&n.layoutMode==='HORIZONTAL'))for(const c of h.children)if(c.type==='FRAME'&&c.layoutPositioning!=='ABSOLUTE'&&(c.layoutSizingVertical==='FIXED'||c.name==='nav')&&(Math.round(c.height)===Math.round(h0)||Math.round(c.height)===vp)&&h.height>c.height+0.5)c.layoutSizingVertical='FILL';
 const h1=f.height;
 if(h1>h0+0.5)for(const w of ovs){const d=w.children.filter(k=>k.layoutPositioning!=='ABSOLUTE').sort((a,b)=>b.width*b.height-a.width*a.height)[0];
  w.resize(f.width,h1);for(const k of w.children)if(k.layoutPositioning==='ABSOLUTE')k.resize(f.width,h1);
  if(w.layoutMode!=='NONE'&&d){if(w.layoutMode==='VERTICAL')w.primaryAxisAlignItems='MIN';else w.counterAxisAlignItems='MIN';w.paddingTop=Math.max(0,Math.round((vp-d.height)/2));}}
 return [h0,h1];}
const out={};
for(const s of pg.children.filter(c=>c.type==='SECTION'&&c.name.endsWith('_'+COL))){
 const frames=s.children.filter(c=>c.type==='FRAME'&&c.name!=='種別');const rows0=[...new Set(frames.map(f=>Math.round(f.y)))].sort((a,b)=>a-b);
 const hBefore=Object.fromEntries(frames.map(f=>[f.id,f.height]));const yBefore=Object.fromEntries(frames.map(f=>[f.id,Math.round(f.y)]));const labs=s.children.filter(c=>c.type==='TEXT').map(l=>[l,l.y]);
 for(const f of frames)expand(f);
 let shift=0;
 for(let i=0;i<rows0.length;i++){const y=rows0[i];const row=frames.filter(f=>yBefore[f.id]===y);const extra=Math.max(...row.map(f=>f.height-hBefore[f.id]));
  if(shift){row.forEach(f=>f.y+=shift);labs.filter(([l,ly])=>ly<y&&ly>(i?rows0[i-1]:-1)).forEach(([l])=>l.y+=shift);}shift+=Math.max(0,extra);}
 if(shift>0)s.resizeWithoutConstraints(s.width,s.height+shift);
 out[s.name]=Math.round(shift);}
return out;
