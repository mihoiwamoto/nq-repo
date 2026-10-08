const pg=await figma.getNodeByIdAsync('7688:98558');await figma.setCurrentPageAsync(pg);
const F='Noto Sans JP',WS={1:'Thin',2:'ExtraLight',3:'Light',4:'Regular',5:'Medium',6:'SemiBold',7:'Bold',8:'ExtraBold',9:'Black'};
await Promise.all(Object.values(WS).map(s=>figma.loadFontAsync({family:F,style:s})));
const u32=(a,i)=>((a[i]<<24)|(a[i+1]<<16)|(a[i+2]<<8)|a[i+3])>>>0;
const cat=l=>{let n=0;l.forEach(a=>n+=a.length);const o=new Uint8Array(n);let k=0;l.forEach(a=>{o.set(a,k);k+=a.length;});return o;};
async function load(h){const b=await figma.getImageByHash(h).getBytesAsync();let p=8,W=0;const id=[];while(p<b.length){const L=u32(b,p),t=String.fromCharCode(b[p+4],b[p+5],b[p+6],b[p+7]);if(t==='IHDR')W=u32(b,p+8);if(t==='IDAT')id.push(b.subarray(p+8,p+8+L));p+=12+L;}
const z=cat(id),pa=[];{let q=2;for(;;){const hd=z[q];q+=1;const L=z[q]|(z[q+1]<<8);q+=4;pa.push(z.subarray(q,q+L));q+=L;if(hd&1)break;}}
const raw=cat(pa),rb=W*3,H=raw.length/(rb+1),px=new Uint8Array(rb*H);for(let r=0;r<H;r++)px.set(raw.subarray(r*(rb+1)+1,(r+1)*(rb+1)),r*rb);
const n=u32(px,0),a=px.subarray(4,4+n);let s='',i=0;const ch=[];while(i<a.length){let c=a[i++];if(c>=0xf0){c=((c&7)<<18)|((a[i++]&63)<<12)|((a[i++]&63)<<6)|(a[i++]&63);c-=0x10000;ch.push(0xd800+(c>>10),0xdc00+(c&1023));}else if(c>=0xe0){ch.push(((c&15)<<12)|((a[i++]&63)<<6)|(a[i++]&63));}else if(c>=0xc0){ch.push(((c&31)<<6)|(a[i++]&63));}else ch.push(c);if(ch.length>8000){s+=String.fromCharCode.apply(null,ch);ch.length=0;}}s+=String.fromCharCode.apply(null,ch);return JSON.parse(s);}
const rgb=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
const al=h=>h.length>7?parseInt(h.slice(7,9),16)/255:1;
const P=h=>({type:'SOLID',color:rgb(h),opacity:al(h)});
const nn=v=>Math.max(0,v);
let D,IH;
function mk(x){let n;
 if(x.t!==undefined){n=figma.createText();n.fontName={family:F,style:WS[Math.min(9,Math.max(1,Math.round(x.fw/100)))]};n.characters=x.t;n.fontSize=x.fs;n.fills=[P(x.c)];
  if(x.lh)n.lineHeight={unit:'PIXELS',value:x.lh};if(x.ls)n.letterSpacing={unit:'PIXELS',value:x.ls};if(x.ta)n.textAlignHorizontal=x.ta==='C'?'CENTER':'RIGHT';if(x.u)n.textDecoration='UNDERLINE';
  if(x.sl)n.textAutoResize='WIDTH_AND_HEIGHT';else{n.resize(Math.max(1,x.w),Math.max(1,x.h));n.textAutoResize='HEIGHT';}
  if(x.el){n.textAutoResize='NONE';n.resize(Math.max(1,x.w),Math.max(1,x.h));n.textTruncation='ENDING';n.maxLines=x.el;}} // 省略記号（extract.js の el。2026-10-08）
 else if(x.sv!==undefined){try{n=figma.createNodeFromSvg(D.SV[x.sv]);}catch(e){n=figma.createFrame();n.resize(Math.max(0.01,x.w),Math.max(0.01,x.h));n.fills=[];}}
 else{n=figma.createFrame();n.resize(Math.max(0.01,x.w),Math.max(0.01,x.h));n.fills=x.im!==undefined?[{type:'IMAGE',scaleMode:'FILL',imageHash:IH[x.im]}]:x.f?[P(x.f)]:[];
  if(x.r!==undefined){if(Array.isArray(x.r)){n.topLeftRadius=x.r[0];n.topRightRadius=x.r[1];n.bottomRightRadius=x.r[2];n.bottomLeftRadius=x.r[3];}else n.cornerRadius=x.r;}
  if(x.s){n.strokes=[P(x.s)];n.strokeAlign='INSIDE';if(Array.isArray(x.sw)){n.strokeTopWeight=x.sw[0];n.strokeRightWeight=x.sw[1];n.strokeBottomWeight=x.sw[2];n.strokeLeftWeight=x.sw[3];}else n.strokeWeight=x.sw;}
  if(x.e)n.effects=x.e.map(e=>({type:'DROP_SHADOW',color:Object.assign(rgb(e[0]),{a:al(e[0])}),offset:{x:e[1],y:e[2]},radius:e[3],spread:e[4],visible:true,blendMode:'NORMAL'}));
  n.clipsContent=!!x.cl;
  if(x.al){const[d,g,p,ca]=x.al;n.layoutMode=d==='H'?'HORIZONTAL':'VERTICAL';n.primaryAxisSizingMode='FIXED';n.counterAxisSizingMode='FIXED';n.resize(Math.max(0.01,x.w),Math.max(0.01,x.h));
   n.itemSpacing=g;n.paddingTop=nn(p[0]);n.paddingRight=nn(p[1]);n.paddingBottom=nn(p[2]);n.paddingLeft=nn(p[3]);n.primaryAxisAlignItems=({SB:'SPACE_BETWEEN',C:'CENTER',E:'MAX'})[x.al[4]]||'MIN';n.counterAxisAlignItems=ca;}}
 if(x.o)n.opacity=x.o;n.name=x.n;return n;}
function build(x,parent){const n=mk(x);parent.appendChild(n);
 const pal=parent.type==='FRAME'&&parent.layoutMode&&parent.layoutMode!=='NONE';
 if(pal){if(x.a){n.layoutPositioning='ABSOLUTE';n.x=x.x;n.y=x.y;}else{const V=parent.layoutMode==='VERTICAL';
  if(x.t!==undefined&&x.sl){n.layoutSizingHorizontal='HUG';n.layoutSizingVertical='HUG';if(x.fx&&V&&x.ta)parent.counterAxisAlignItems=x.ta==='C'?'CENTER':'MAX';}
  else{n.layoutSizingHorizontal='FIXED';n.layoutSizingVertical='FIXED';if(x.fx){if(V)n.layoutSizingHorizontal='FILL';else n.layoutSizingVertical='FILL';}}}}
 else{n.x=x.x;n.y=x.y;}
 if(n.type==='FRAME'&&x.k&&x.sv===undefined)for(const k of x.k)build(k,n);return n;}
const isOv=(n,f)=>n.type==='FRAME'&&Array.isArray(n.fills)&&n.fills.some(p=>p.type==='SOLID'&&p.opacity>0.2&&p.opacity<0.9&&p.color.r<0.25&&p.color.g<0.25&&p.color.b<0.25)&&n.width>=f.width*0.6;
function centerPopup(f){const ov=f.findOne(n=>isOv(n,f));if(!ov)return;const w=ov.parent;if(w.id===f.id)return;const d=w.children.filter(k=>k!==ov).sort((a,b)=>b.width*b.height-a.width*a.height)[0];
 f.appendChild(w);w.layoutPositioning='ABSOLUTE';w.x=0;w.y=0;w.resize(f.width,f.height);
 if(w.layoutMode!=='NONE'){w.paddingTop=0;w.paddingBottom=0;w.paddingLeft=0;w.paddingRight=0;w.primaryAxisAlignItems='CENTER';w.counterAxisAlignItems='CENTER';}
 if(ov.layoutPositioning==='ABSOLUTE'||w.layoutMode==='NONE'){ov.x=0;ov.y=0;}ov.resize(f.width,f.height);
 if(d&&d.layoutMode&&d.layoutMode!=='NONE'){d.layoutSizingVertical='HUG';if(d.layoutSizingHorizontal==='FILL')d.layoutSizingHorizontal='FIXED';}}
function bringFront(f){// floating picker (年月/カレンダー) hidden behind later siblings
 const fb=f.absoluteBoundingBox;const cand=f.findAll(n=>n.type==='FRAME'&&n.layoutPositioning==='ABSOLUTE'&&n.width>=200&&n.width<=520&&n.height>=150&&n.findAll(t=>t.type==='TEXT'&&/^\d{1,2}(月)?$/.test(t.characters)).length>=10);
 const pop=cand[0];if(!pop)return;const main=f.findOne(n=>n.type==='FRAME'&&n.name==='main');
 const pb=pop.absoluteBoundingBox;let px=pb.x-fb.x,py=pb.y-fb.y;const over=Math.max(0,Math.round(py+pb.height-(fb.height-24)));
 if(over>0&&main){const c=main.children[0];c.layoutPositioning='ABSOLUTE';c.x=0;c.y=-over;py-=over;}
 f.appendChild(pop);pop.layoutPositioning='ABSOLUTE';pop.x=Math.round(px);pop.y=Math.round(py);}
function headerShadow(f){const h=f.findOne(n=>n.type==='FRAME'&&n.name==='header'&&n.height<=90&&n.width>=600);if(!h)return;let p=h.parent,bg=null;while(p&&p!==f){if(Array.isArray(p.fills)&&p.fills.length&&p.fills[0].type==='SOLID'){bg=p.fills[0];break;}p=p.parent;}
 h.fills=[bg?{type:'SOLID',color:bg.color,opacity:bg.opacity??1}:{type:'SOLID',color:{r:0xf1/255,g:0xef/255,b:0xea/255}}];if(!h.effects.length)h.effects=[{type:'DROP_SHADOW',color:{r:0.2,g:0.2,b:0.2,a:0.16},offset:{x:0,y:2},radius:2,spread:0,visible:true,blendMode:'NORMAL'}];const par=h.parent;if(par.children[0]===h&&par.children.length===2)par.itemReverseZIndex=true;}
function titleBar(f){const fb=f.absoluteBoundingBox;const inOv=n=>{let p=n.parent;while(p&&p!==f){if(p.layoutPositioning==='ABSOLUTE'&&Math.round(p.width)===Math.round(f.width))return true;p=p.parent;}return false;};
 const t=f.findAll(n=>n.type==='TEXT'&&n.fontSize>=24&&!inOv(n)&&n.absoluteBoundingBox.y-fb.y<160&&n.absoluteBoundingBox.x-fb.x>220).sort((a,b)=>a.absoluteBoundingBox.y-b.absoluteBoundingBox.y)[0];if(!t)return;
 let bar=t.parent;while(bar&&bar!==f&&!(bar.width>=900&&bar.height>=40))bar=bar.parent;if(!bar||bar===f||bar.layoutMode==='NONE')return;
 bar.paddingTop=0;bar.paddingBottom=0;bar.counterAxisAlignItems='CENTER';if(bar.layoutSizingVertical!=='FIXED')bar.layoutSizingVertical='FIXED';bar.resize(bar.width,88);
 // PageTitleBar は文字の入れ物も帯の高さいっぱい（FILL）なので、入れ物の中でも上下中央にする（2026-10-08）
 for(let p=t.parent;p&&p!==bar;p=p.parent){if(p.type!=='FRAME')continue;if(p.layoutMode==='HORIZONTAL')p.counterAxisAlignItems='CENTER';else if(p.layoutMode==='VERTICAL')p.primaryAxisAlignItems='CENTER';}
 for(const d of bar.findAll(n=>n.type==='FRAME'&&n.layoutSizingVertical==='FILL'&&/^(button|a:)/.test(n.name)&&Math.round(n.height)===88)){const p=d.parent;d.layoutSizingVertical='FIXED';d.resize(d.width,d.name==='button'?Math.round(d.width):40);
  for(const inner of d.findAll(n=>n.type==='FRAME'&&n.layoutSizingVertical==='FILL')){inner.layoutSizingVertical='FIXED';inner.resize(inner.width,Math.round(inner.width));}
  if(p.layoutMode==='HORIZONTAL')p.counterAxisAlignItems='CENTER';else if(p.layoutMode==='VERTICAL')p.primaryAxisAlignItems='CENTER';if(d.layoutMode==='HORIZONTAL')d.counterAxisAlignItems='CENTER';else if(d.layoutMode==='VERTICAL')d.primaryAxisAlignItems='CENTER';}}
const SBC=await (await figma.getNodeByIdAsync('7139:282837')).getMainComponentAsync(); // 確定デザインの「Status Bar_tab」
function greenComment(f){// React は未入力だとグレー（非活性）だが、Figma の書き出しは確定デザインどおり緑にする（2026-10-07）
 for(const t of f.findAll(n=>n.type==='TEXT'&&n.characters==='コメントを残す')){let b=t.parent;while(b&&b!==f&&b.type!=='FRAME')b=b.parent;if(b&&b!==f){b.fills=[{type:'SOLID',color:{r:0,g:0x99/255,b:0x44/255}}];t.fills=[{type:'SOLID',color:{r:1,g:1,b:1}}];}}}
const out=[],miss=[];const secs=Object.fromEntries(pg.children.filter(s=>s.type==='SECTION').map(s=>[s.name,s]));
for(const [h,name,secNames,pf] of S){D=await load(h);IH=D.IM.map(b=>figma.createImage(figma.base64Decode(b)).hash);
 for(const secName of secNames){const se=secs[secName];if(!se){miss.push('sec:'+secName);continue;}
  const old=se.children.filter(c=>c.type==='FRAME'&&c.name===name);if(!old.length){miss.push(name+'@'+secName);continue;}
  const X=old[0].x,Y=old[0].y;old.forEach(o=>o.remove());
  const r=build(D.root,se);r.name=name;r.x=X;r.y=Y;
  if(pf==='app')headerShadow(r);else{titleBar(r);greenComment(r);}
  if(/年月の選択|実施日の選択/.test(name))bringFront(r);else if(/ポップアップ|ダイアログ/.test(name))centerPopup(r);
  if(pf==='app'){// アプリは上に 48px のステータスバー（確定デザインと同じ）。React は 768×976 で撮る
   const w=figma.createFrame();w.name=name;w.fills=[];w.layoutMode='VERTICAL';w.counterAxisSizingMode='FIXED';w.resize(768,1024);w.primaryAxisSizingMode='AUTO';se.appendChild(w);w.x=X;w.y=Y;
   const sb=SBC.createInstance();w.appendChild(sb);sb.layoutSizingHorizontal='FILL';w.appendChild(r);r.layoutSizingHorizontal='FILL';r.name='画面';}
  out.push(name);}}
return {n:out.length,miss};