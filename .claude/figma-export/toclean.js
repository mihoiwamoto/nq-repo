(() => {
  const texts = root => { const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); const ns = []; while (tw.nextNode()) ns.push(tw.currentNode); return ns; };
  if (window.__ADD_CLEAN) {
    // add a 清掃記録 点検管理 entry as its own item, right after each 機械器具点検 点検管理 item (calendar cell, day list, new-registration popup)
    const leafs = [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && (e.textContent || '').trim() === '機械器具点検 点検管理' && !e.closest('header'));
    for (const l of leafs) {
      let item = l;
      while (item.parentElement && ![...item.parentElement.children].some(c => c !== item && /官能検査記録/.test(c.textContent))) item = item.parentElement;
      if (!item.parentElement) continue;
      const c = item.cloneNode(true);
      texts(c).forEach(t => { t.nodeValue = t.nodeValue.replace(/機械器具点検/g, '清掃記録'); });
      c.querySelectorAll('img').forEach(i => { i.src = i.src.replace(/equipment-inspection-[\w-]+\.png/, 'cleaning-record-CrryIwou.png'); });
      item.after(c);
    }
    return;
  }
  texts(document.body).forEach(t => { t.nodeValue = t.nodeValue.replace(/機械器具点検/g, '清掃記録').replace(/ゆばライン（その他）/g, '冷蔵倉庫ライン'); });
  // 【毎年】豆乳ライン -> 【毎年】冷蔵倉庫ライン (the row is split into several text nodes)
  texts(document.body).filter(t => t.nodeValue === '豆乳ライン').forEach(t => { let p = t.parentElement; for (let i = 0; i < 3 && p; i++, p = p.parentElement) { if (p.textContent.length < 30 && /毎年/.test(p.textContent)) { t.nodeValue = '冷蔵倉庫ライン'; break; } } });
})()
