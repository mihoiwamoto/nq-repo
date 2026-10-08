// use_figma: 画面を中身の下まで伸ばす（スクロールした先まで全部見せる）。COL に帳票名を入れて列ごとに実行。
// 組み立て（figma-builder.js）のあとに当てる。サイドメニュー（nav）は HUG なので FILL に直す（2026-10-06：760px で切れていた）。そのあと「行のそろえ直し」（README）をする。
const COL='機械器具点検';
const pg=await figma.getNodeByIdAsync('7688:98558');await figma.setCurrentPageAsync(pg);
function grow(n){if(n.type!=='FRAME')return;for(const c of n.children)if(c.type==='FRAME'&&c.layoutPositioning!=='ABSOLUTE')grow(c);
 if(!n.children.length)return;const old=n.height;
 if(n.layoutMode==='NONE'){const mb=Math.max(...n.children.filter(c=>c.visible).map(c=>c.y+c.height));if(mb>old+0.5)n.resize(n.width,Math.ceil(mb+24));return;}
 if(n.layoutMode==='VERTICAL')n.primaryAxisSizingMode='AUTO';else n.counterAxisSizingMode='AUTO';
 if(n.height<old-0.5){if(n.layoutMode==='VERTICAL')n.primaryAxisSizingMode='FIXED';else n.counterAxisSizingMode='FIXED';n.resize(n.width,old);}}
function expand(f){const h0=f.height;const vp=Math.round(f.width)===768?1024:960; // 管理画面は 1440×960（2026-10-08）
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
