// In-page helper: run a list of UI steps (click by visible text, etc.). Returns the final path.
window.__act = async (steps) => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const vis = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const txt = el => (el.innerText || el.value || '').replace(/\s+/g, ' ').trim();
  const scope = s => s.in ? [...document.querySelectorAll('[role=dialog],[aria-modal=true],.fixed')].filter(vis).pop() || document : document;
  const find = (t, s) => {
    const root = scope(s);
    const all = [...root.querySelectorAll('button,a,[role=button],[role=tab],label,li,tr,td,div,span,p,h1,h2,h3,input')].filter(vis);
    let m = all.filter(e => txt(e) === t);
    if (!m.length && !s.exact) m = all.filter(e => txt(e).startsWith(t));
    if (!m.length && !s.exact) m = all.filter(e => txt(e).includes(t));
    if (!m.length) m = [...root.querySelectorAll('[aria-label],[title]')].filter(e => vis(e) && ((e.getAttribute('aria-label') || '') + (e.getAttribute('title') || '')).includes(t));
    // deepest matches first, then keep document order
    m = m.filter(e => !m.some(o => o !== e && e.contains(o)));
    return m[s.nth || 0];
  };
  const log = [];
  for (const s of steps) {
    if (s.wait) { await sleep(s.wait); continue; }
    if (s.eval) { await (0, eval)(s.eval); await sleep(s.after || 500); continue; }
    let el = null;
    if (s.pick) {
      const ov = [...document.querySelectorAll('.fixed,[role=dialog]')].filter(vis).pop() || document;
      el = [...ov.querySelectorAll('button')].filter(b => vis(b) && !/^(閉じる|次へ|キャンセル)$/.test(txt(b)))[0];
    } else
    if (s.sel) el = [...document.querySelectorAll(s.sel)].filter(vis)[s.nth || 0];
    else if (s.click) el = find(s.click, s);
    if (!el) { if (s.optional) { log.push('skip ' + (s.click || s.sel)); continue; } throw new Error('not found: ' + (s.click || s.sel)); }
    const target = s.raw ? el : (el.closest('button,a,[role=button],[role=tab],label,tr') || el);
    target.scrollIntoView && s.scrollTo && target.scrollIntoView({ block: 'center' });
    target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    target.click();
    log.push('click ' + (s.click || s.sel) + ' -> ' + txt(target).slice(0, 30));
    await sleep(s.after || 700);
  }
  return { path: location.pathname + location.hash, log };
};
