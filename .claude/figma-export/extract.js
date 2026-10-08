// Runs inside the page. Returns a compact tree describing what is on screen.
(() => {
  const VW = innerWidth, VH = innerHeight;
  const CV = document.createElement('canvas'); CV.width = CV.height = 1; const CC = new Map();
  const r1 = v => Math.round(v * 2) / 2;
  const hex2 = n => Math.round(n).toString(16).padStart(2, '0');
  const col = c => {
    if (!c) return null;
    let m = c.match(/^rgba?\(([^)]+)\)$/);
    if (!m) {
      if (c === 'transparent' || c === 'none') return null;
      if (!CC.has(c)) { const cx = CV.getContext('2d', { willReadFrequently: true }); cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; CC.set(c, `rgba(${d[0]}, ${d[1]}, ${d[2]}, ${d[3] / 255})`); }
      m = CC.get(c).match(/rgba?\(([^)]+)\)/);
    }
    const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
    const a = p.length > 3 ? p[3] : 1; if (a <= 0.01) return null;
    return '#' + hex2(p[0]) + hex2(p[1]) + hex2(p[2]) + (a < 0.995 ? hex2(a * 255) : '');
  };
  const SV = [], SVi = new Map(), IM = [], IMi = new Map();
  const svgId = s => { if (!SVi.has(s)) { SVi.set(s, SV.length); SV.push(s); } return SVi.get(s); };
  const fetchText = u => { try { const x = new XMLHttpRequest(); x.open('GET', u, false); x.send(); return x.status < 300 ? x.responseText : null; } catch (e) { return null; } };
  const cleanSvg = (s, w, h, color) => {
    s = s.replace(/<\?xml[^>]*>/, '').replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s(class|data-[\w-]+|aria-[\w-]+|style)="[^"]*"/g, '')
      .replace(/currentColor/g, color || '#000');
    s = s.replace(/<svg\b([^>]*)>/, (m, a) => {
      a = a.replace(/\s(width|height)=("[^"]*"|'[^']*')/g, '');
      return `<svg${a} width="${w}" height="${h}">`;
    });
    return s.replace(/\s+/g, ' ').replace(/> </g, '><').trim();
  };
  const fweight = w => +w || 400;
  const radius = cs => {
    const v = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'].map(k => parseFloat(cs[k]) || 0);
    if (v.every(x => x === 0)) return undefined;
    return v.every(x => x === v[0]) ? r1(v[0]) : v.map(r1);
  };
  const shadow = cs => {
    const s = cs.boxShadow; if (!s || s === 'none') return undefined;
    const out = [];
    for (const part of s.split(/,(?![^(]*\))/)) {
      const c = part.match(/(rgba?|oklab|oklch|color|lab|lch)\([^)]+\)/); const nums = part.replace(/(rgba?|oklab|oklch|color|lab|lch)\([^)]+\)/, '').trim().split(/\s+/).map(parseFloat);
      if (/inset/.test(part)) continue;
      const cc = col(c && c[0]); if (!cc) continue;
      out.push([cc, nums[0] || 0, nums[1] || 0, nums[2] || 0, nums[3] || 0]);
    }
    return out.length ? out : undefined;
  };
  const textStyle = (cs) => {
    const lh = cs.lineHeight === 'normal' ? 0 : r1(parseFloat(cs.lineHeight));
    const o = { fs: r1(parseFloat(cs.fontSize)), fw: fweight(cs.fontWeight), c: col(cs.color) || '#000000' };
    if (lh) o.lh = lh;
    const ls = parseFloat(cs.letterSpacing); if (ls) o.ls = r1(ls);
    if (cs.textAlign === 'center') o.ta = 'C'; else if (cs.textAlign === 'right' || cs.textAlign === 'end') o.ta = 'R';
    if (cs.textDecorationLine && cs.textDecorationLine.includes('underline')) o.u = 1;
    return o;
  };
  const labelOf = el => {
    const t = (el.getAttribute('aria-label') || el.innerText || el.value || el.placeholder || '').trim().replace(/\s+/g, ' ');
    return t ? t.slice(0, 24) : '';
  };
  const nameOf = el => {
    const tag = el.tagName.toLowerCase();
    if (/^(button|a|input|select|textarea|label|h\d|header|nav|main|aside|footer|table|thead|tbody|tr|th|td|ul|li|dialog)$/.test(tag)) {
      const l = labelOf(el); return l && !/^(table|thead|tbody|ul|main|nav|aside|header|footer)$/.test(tag) ? `${tag}: ${l}` : tag;
    }
    if (el.getAttribute('role')) return el.getAttribute('role');
    return tag;
  };

  // Try to express the in-flow children as one Figma auto layout. Returns params or null.
  const inferLayout = (W, H, kids, hint) => {
    if (!kids.length) return null;
    const tol = 1.01;
    const tryDir = dir => {
      const P = dir === 'H' ? ['x', 'w', W] : ['y', 'h', H], C = dir === 'H' ? ['y', 'h', H] : ['x', 'w', W];
      const ks = [...kids].sort((a, b) => a[P[0]] - b[P[0]]);
      for (let i = 1; i < ks.length; i++) if (ks[i][P[0]] < ks[i - 1][P[0]] + ks[i - 1][P[1]] - tol) return null; // overlap on primary axis
      const gaps = []; for (let i = 1; i < ks.length; i++) gaps.push(ks[i][P[0]] - (ks[i - 1][P[0]] + ks[i - 1][P[1]]));
      let gap = 0, sb = false;
      if (gaps.length) {
        gap = gaps[0];
        if (!gaps.every(g => Math.abs(g - gap) <= tol)) return null;
        if (gap < 0) return null;
      }
      const ps = ks[0][P[0]], pe = P[2] - (ks[ks.length - 1][P[0]] + ks[ks.length - 1][P[1]]);
      if (ps < -tol || pe < -tol) return null;
      // cross axis
      const L = ks.map(k => k[C[0]]), R = ks.map(k => C[2] - k[C[0]] - k[C[1]]);
      const eq = a => a.every(v => Math.abs(v - a[0]) <= tol);
      let ca, cl, cr;
      if (eq(L) && L[0] >= -tol) { ca = 'MIN'; cl = L[0]; cr = Math.max(0, Math.min(...R)); }
      else if (eq(R) && R[0] >= -tol) { ca = 'MAX'; cr = R[0]; cl = Math.max(0, Math.min(...L)); }
      else { const D = ks.map((k, i) => L[i] - R[i]); if (!eq(D)) return null; ca = 'CENTER'; cl = Math.max(0, D[0]); cr = Math.max(0, -D[0]); }
      const pad = dir === 'H' ? [cl, Math.max(0, pe), cr, Math.max(0, ps)] : [Math.max(0, ps), cr, Math.max(0, pe), cl]; // t r b l
      // fill flags for cross axis
      const inner = C[2] - cl - cr;
      return { d: dir, g: r1(gap), p: pad.map(r1), ca, order: ks, fillX: ks.map(k => Math.abs(k[C[1]] - inner) <= tol) };
    };
    // Prefer the direction that works; a single child works both ways, choose V.
    return hint === 'H' ? (tryDir('H') || tryDir('V')) : (tryDir('V') || tryDir('H'));
  };

  const walk = (el, pr) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return null;
    const rc = el.getBoundingClientRect();
    const tag = el.tagName.toLowerCase();
    if (/^(script|style|noscript|template|link|meta)$/.test(tag)) return null;
    const node = { n: nameOf(el), x: r1(rc.left - pr.left), y: r1(rc.top - pr.top), w: r1(rc.width), h: r1(rc.height) };
    const abs = cs.position === 'absolute' || cs.position === 'fixed';
    if (abs) node.a = 1;
    if (cs.position !== 'static') { const z = parseInt(cs.zIndex) || 0; node.pk = z < 0 ? -1000 + z : z > 0 ? 1000 + z : 2; }
    if (+cs.opacity < 1) node.o = +(+cs.opacity).toFixed(2);
    const bg = col(cs.backgroundColor); if (bg) node.f = bg;
    const rad = radius(cs); if (rad !== undefined) node.r = rad;
    const bw = ['Top', 'Right', 'Bottom', 'Left'].map(s => cs[`border${s}Style`] !== 'none' ? parseFloat(cs[`border${s}Width`]) || 0 : 0);
    if (bw.some(v => v > 0)) {
      const side = ['Top', 'Right', 'Bottom', 'Left'][bw.findIndex(v => v > 0)];
      const bc = col(cs[`border${side}Color`]);
      if (bc) { node.s = bc; node.sw = bw.every(v => v === bw[0]) ? bw[0] : bw; }
    }
    const sh = shadow(cs); if (sh) node.e = sh;
    if (cs.overflow !== 'visible' || cs.overflowX !== 'visible' || cs.overflowY !== 'visible') node.cl = 1;

    // leaf kinds
    if (tag === 'svg') {
      // resolve CSS variables (e.g. fill="var(--semantic-brand-primary)") to the computed colour
      const cl = el.cloneNode(true), src = [el, ...el.querySelectorAll('*')], dst = [cl, ...cl.querySelectorAll('*')];
      src.forEach((n, i) => { for (const a of ['fill', 'stroke']) { const v = n.getAttribute(a); if (v && /var\(/.test(v)) { const c = col(getComputedStyle(n)[a]); dst[i].setAttribute(a, c ? c.slice(0, 7) : 'none'); } } });
      node.sv = svgId(cleanSvg(cl.outerHTML, r1(rc.width), r1(rc.height), col(cs.color) || '#000'));
      delete node.f; return rc.width && rc.height ? node : null;
    }
    if (tag === 'img') {
      const src = el.getAttribute('src') || el.currentSrc || el.src;
      if (/^data:image\/svg\+xml/.test(src) || /\.svg(\?|$)/.test(src)) { const t = /^data:/.test(src) ? (/;base64,/.test(src) ? atob(src.split(',')[1]) : decodeURIComponent(src.slice(src.indexOf(',') + 1))) : fetchText(src); if (t) { node.sv = svgId(cleanSvg(t, r1(rc.width), r1(rc.height), '#000')); return node; } }
      try {
        if (!IMi.has(src)) {
          const cv = document.createElement('canvas'); const k = 2;
          cv.width = Math.max(1, Math.round(rc.width * k)); cv.height = Math.max(1, Math.round(rc.height * k));
          cv.getContext('2d').drawImage(el, 0, 0, cv.width, cv.height);
          IMi.set(src, IM.length); IM.push(cv.toDataURL('image/png').split(',')[1]);
        }
        node.im = IMi.get(src);
      } catch (e) { node.f = '#dddddd'; }
      return node;
    }
    const mask = cs.webkitMaskImage || cs.maskImage;
    if (mask && mask !== 'none') {
      const mm = mask.match(/url\("((?:[^"\\]|\\.)*)"\)/) || mask.match(/url\(([^)]+)\)/); const u = mm && mm[1].replace(/\\(.)/g, '$1');
      const t = u && (/^data:/.test(u) ? (/;base64,/.test(u) ? atob(u.split(',')[1]) : decodeURIComponent(u.slice(u.indexOf(',') + 1))) : fetchText(u));
      if (t) { const mc = bg || '#000000'; node.sv = svgId(cleanSvg(t, r1(rc.width), r1(rc.height), mc).replace(/(fill|stroke)=(["'])(?!none)[^"']*\2/g, `$1="${mc.slice(0, 7)}"`)); node.mc = mc; delete node.f; return node; }
    }

    const kids = [];
    if (/^(input|textarea|select)$/.test(tag)) {
      const type = (el.getAttribute('type') || '').toLowerCase();
      if (type === 'checkbox' || type === 'radio') { node.n = `${tag}[${type}]${el.checked ? ' ✓' : ''}`; if (!node.s) { node.s = '#767676'; node.sw = 1; } if (type === 'radio') node.r = r1(rc.width / 2); else if (!node.r) node.r = 2; if (el.checked) node.f = '#009944'; return node; }
      let val = tag === 'select' ? (el.selectedOptions[0] ? el.selectedOptions[0].text : '') : el.value;
      let ts = textStyle(cs);
      if (!val && el.placeholder) { val = el.placeholder; ts.c = col(getComputedStyle(el, '::placeholder').color) || '#9ca3af'; }
      if (val) {
        const pl = parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth), pt = parseFloat(cs.paddingTop) + parseFloat(cs.borderTopWidth);
        const pr2 = parseFloat(cs.paddingRight) + parseFloat(cs.borderRightWidth), pb = parseFloat(cs.paddingBottom) + parseFloat(cs.borderBottomWidth);
        const ih = rc.height - pt - pb, lh = ts.lh || ts.fs * 1.5;
        const ty = tag === 'textarea' ? pt : pt + Math.max(0, (ih - lh) / 2);
        kids.push(Object.assign({ n: 'value', t: val, x: r1(pl), y: r1(ty), w: r1(rc.width - pl - pr2), h: r1(tag === 'textarea' ? ih : lh), sl: tag !== 'textarea' ? 1 : 0 }, ts));
      }
      node.k = kids; node.al = null; return node;
    }

    for (const ch of el.childNodes) {
      if (ch.nodeType === 3) {
        const txt = ch.textContent.replace(/\s+/g, ' ');
        if (!txt.trim()) continue;
        const rg = document.createRange(); rg.selectNodeContents(ch);
        const rr = rg.getBoundingClientRect(); if (!rr.width || !rr.height) continue;
        const lines = [...rg.getClientRects()].filter(r => r.width > 0);
        const tops = new Set(lines.map(r => Math.round(r.top)));
        const ts = textStyle(cs);
        // Use the line box (lines × line-height), not the glyph box, so Figma's text height and the parent's padding match CSS.
        const nl = Math.max(1, tops.size), bh = ts.lh ? nl * ts.lh : rr.height, by = rr.top - (bh - rr.height) / 2;
        // 省略記号（truncate / line-clamp）は Figma でも「…」で切る（2026-10-08。ないとセルの端で文字が途中で切れて見える）
        const clamp = parseInt(cs.webkitLineClamp, 10);
        if (cs.textOverflow === 'ellipsis' || clamp > 0) {
          const ml = clamp > 0 ? clamp : 1;
          const availW = rc.right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth) - rr.left;
          const lhx = ts.lh || ts.fs * 1.5;
          if ((ml === 1 && tops.size <= 1 && rr.width > availW + 0.5) || (ml > 1 && tops.size > ml)) {
            kids.push(Object.assign({ n: txt.trim().slice(0, 30), t: txt.trim(), x: r1(rr.left - rc.left), y: r1((ml > 1 ? rr.top : by) - rc.top), w: r1(ml === 1 ? availW : rr.width), h: r1(ml === 1 ? bh : ml * lhx), sl: 0, el: ml }, ts));
            continue;
          }
        }
        kids.push(Object.assign({ n: txt.trim().slice(0, 30), t: txt.trim(), x: r1(rr.left - rc.left), y: r1(by - rc.top), w: r1(rr.width), h: r1(bh), sl: tops.size <= 1 ? 1 : 0 }, ts));
      } else if (ch.nodeType === 1) {
        const k = walk(ch, rc); if (k) { if (Array.isArray(k)) kids.push(...k); else kids.push(k); }
      }
    }
    // Collapse purely structural wrappers (no paint, same box as parent area is handled by caller)
    const painted = node.f || node.s || node.e || node.cl || node.r !== undefined || node.o;
    if (!painted && !abs && kids.length === 1 && Math.abs(kids[0].w - node.w) < 0.6 && Math.abs(kids[0].h - node.h) < 0.6) {
      const k = kids[0]; k.x = r1(k.x + node.x); k.y = r1(k.y + node.y); return k;
    }
    // Skip empty unpainted boxes
    if (!painted && !kids.length) return null;
    // Unpainted wrappers that are inline content (display: contents / inline) → hoist children
    if (!painted && !abs && (cs.display === 'contents' || (cs.display === 'inline' && !/^(a|button|label)$/.test(tag)))) {
      return kids.map(k => Object.assign(k, { x: r1(k.x + node.x), y: r1(k.y + node.y) }));
    }
    // Paint order as CSS stacks it: negative z, in-flow non-positioned, positioned (z auto/0), positive z.
    const pkOf = k => k.pk !== undefined ? k.pk : 1;
    kids.forEach((k, i) => k._i = i);
    kids.sort((a, b) => pkOf(a) - pkOf(b) || a._i - b._i);
    kids.forEach(k => { delete k._i; });
    node.k = kids;
    const flow = kids.filter(k => !k.a);
    const lay = inferLayout(node.w, node.h, flow, /flex/.test(cs.display) && /^row/.test(cs.flexDirection) ? 'H' : 'V');
    if (lay) {
      node.al = [lay.d, lay.g, lay.p, lay.ca];
      if (/flex/.test(cs.display) && flow.length >= 1) {
        const jc = cs.justifyContent, H = lay.d === 'H';
        const ps = parseFloat(H ? cs.paddingLeft : cs.paddingTop) + parseFloat(H ? cs.borderLeftWidth : cs.borderTopWidth);
        const pe = parseFloat(H ? cs.paddingRight : cs.paddingBottom) + parseFloat(H ? cs.borderRightWidth : cs.borderBottomWidth);
        const pa = jc === 'space-between' && flow.length >= 2 ? 'SB' : jc === 'center' ? 'C' : (jc === 'flex-end' || jc === 'end') ? 'E' : '';
        if (pa) { node.al.push(pa); if (H) { lay.p[3] = r1(ps); lay.p[1] = r1(pe); } else { lay.p[0] = r1(ps); lay.p[2] = r1(pe); } }
      }
      // reorder in-flow kids into layout order, absolute ones after
      lay.order.forEach((k, i) => { if (lay.fillX[i]) k.fx = 1; });
      let fi = 0; node.k = kids.map(k => k.a ? k : lay.order[fi++]);
    }
    return node;
  };
  const root = walk(document.body, { left: 0, top: 0 });
  const r = Array.isArray(root) ? { n: 'body', x: 0, y: 0, w: VW, h: VH, k: root } : root;
  r.x = 0; r.y = 0; r.w = VW; r.h = VH; r.cl = 1; if (!r.f) r.f = col(getComputedStyle(document.body).backgroundColor) || '#ffffff';
  return JSON.stringify({ root: r, SV, IM });
})()
