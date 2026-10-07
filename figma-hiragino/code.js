// 「📺 AI書き出し」ページの編集できるレイヤー（静止画の下、y > 8900）の文字を
// ヒラギノ角ゴ ProN に置き換える。ProN は W3／W6 の 2 つだけなので、ブラウザと同じく
// 300〜500 → W3、600 以上 → W6 にする。
(async () => {
  const FAMILY = 'Hiragino Kaku Gothic ProN';
  const WEIGHT = { Thin: 100, ExtraLight: 200, Light: 300, Regular: 400, Medium: 500, SemiBold: 600, Bold: 700, ExtraBold: 800, Black: 900 };
  const page = figma.root.children.find(p => p.name.includes('AI書き出し'));
  if (!page) return figma.closePlugin('「AI書き出し」ページが見つかりません');
  await figma.setCurrentPageAsync(page);
  try {
    await figma.loadFontAsync({ family: FAMILY, style: 'W3' });
    await figma.loadFontAsync({ family: FAMILY, style: 'W6' });
  } catch (e) {
    return figma.closePlugin('ヒラギノ角ゴ ProN（W3／W6）を読み込めませんでした');
  }
  const texts = [];
  for (const n of page.children) {
    if (n.y <= 8900) continue;
    if (n.type === 'TEXT') texts.push(n);
    else if ('findAllWithCriteria' in n) texts.push(...n.findAllWithCriteria({ types: ['TEXT'] }));
  }
  let done = 0, skipped = 0;
  for (const t of texts) {
    if (t.fontName === figma.mixed) { skipped++; continue; }
    if (t.fontName.family === FAMILY) continue;
    await figma.loadFontAsync(t.fontName);
    const w = WEIGHT[t.fontName.style] || 400;
    t.fontName = { family: FAMILY, style: w >= 600 ? 'W6' : 'W3' };
    done++;
  }
  figma.closePlugin(`${done} 件の文字をヒラギノ角ゴ ProN に変えました` + (skipped ? `（書体が混ざった ${skipped} 件は飛ばしました）` : ''));
})();
