// 2026-10-07 に書き換えた文字をヒラギノ角ゴ ProN に戻す。
//  ・Ver.4.0 のファイル：「検体の管理」→「検体管理」（確定デザイン 2 ページ・画面フロー共有用・AI書き出し）
//  ・Ver.3.0 のファイル：金属/X線探知機記録の詳細の「〜No.」→「金属探知機名・X線探知機名・ウェイトチェッカー名」（確定デザイン・画面フロー図 2 ページ・仕様検討・デザイン検討）
//  ・Ver.4.0 のファイル：機械器具点検の古い枠の「【点検内容】」→「【確認項目】」（確定デザイン 10 か所）
// どちらのファイルで実行してもよい（無いページは飛ばす）。use_figma からはヒラギノを読めず、書き換えのときに Noto Sans JP にしてあるため。
// 部品の元の文字に文字スタイルがあればそれを当て直し、無ければ Noto の太さから W3／W6 を選ぶ。
(async () => {
  const FAMILY = 'Hiragino Kaku Gothic ProN';
  const PAGES = ['3:94', '9:3', '6322:95889', '7688:98558', '10903:28923', '10903:65890', '9:6', '3:95'];
  const WORDS = ['検体管理', '金属探知機名', 'X線探知機名', 'ウェイトチェッカー名', '【確認項目】'];
  try {
    await figma.loadFontAsync({ family: FAMILY, style: 'W3' });
    await figma.loadFontAsync({ family: FAMILY, style: 'W6' });
  } catch (e) {
    return figma.closePlugin('ヒラギノ角ゴ ProN（W3／W6）を読み込めませんでした');
  }
  let styled = 0, swapped = 0;
  for (const id of PAGES) {
    const page = await figma.getNodeByIdAsync(id);
    if (!page || page.type !== 'PAGE') continue;
    await figma.setCurrentPageAsync(page);
    const texts = page.findAllWithCriteria({ types: ['TEXT'] })
      .filter(t => WORDS.some(w => t.characters.includes(w)) && t.fontName !== figma.mixed && t.fontName.family === 'Noto Sans JP');
    for (const t of texts) {
      await figma.loadFontAsync(t.fontName);
      // 部品の中の文字なら、元（部品の定義）の文字スタイルを当て直す
      let styleId = '';
      const src = t.id.startsWith('I') ? await figma.getNodeByIdAsync(t.id.split(';').pop()).catch(() => null) : null;
      if (src && src.type === 'TEXT' && typeof src.textStyleId === 'string') styleId = src.textStyleId;
      if (styleId) {
        try { await t.setTextStyleIdAsync(styleId); styled++; continue; } catch (e) { /* 下で書体だけ替える */ }
      }
      const bold = /Bold|Black|SemiBold/.test(t.fontName.style);
      t.fontName = { family: FAMILY, style: bold ? 'W6' : 'W3' };
      swapped++;
    }
  }
  figma.closePlugin(`書き換えた文字を ${styled + swapped} 件ヒラギノに戻しました（文字スタイル ${styled} 件・書体だけ ${swapped} 件）`);
})();
