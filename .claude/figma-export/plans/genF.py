# planF.json を作る。Figma「📺 AI書き出し」の全フレーム（frames.txt。use_figma で読んだ一覧）を React で撮り直すための plan。
# 使い方: python3 genF.py  → planF.json（同じ名前のフレームは 1 件にまとめ、sections に全部並べる）
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))

# ---- 共通の操作 ----
pick = {"pick": 1}
nxt = {"click": "次へ", "in": 1}
scroll_bottom = {"eval": "[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+10&&/(auto|scroll)/.test(getComputedStyle(e).overflowY)).forEach(e=>{e.scrollTop=e.scrollHeight;e.dispatchEvent(new Event('scroll'))})"}
trash = {"eval": "(()=>{const b=[...document.querySelectorAll('button')].filter(b=>!b.innerText.trim()&&b.getBoundingClientRect().x>900&&b.getBoundingClientRect().y>120);b[b.length-1].click();})()", "after": 900}
dl = {"click": "CSVダウンロード", "after": 900}
datepick = {"eval": "(()=>{const i=[...document.querySelectorAll('input')].find(e=>/\\d{4}\\/\\d{2}\\/\\d{2}/.test(e.value)||/日付/.test(e.placeholder));const t=(i&&(i.closest('label')||i.parentElement));const btn=t&&t.querySelector('button,svg,img');(btn||i).dispatchEvent(new MouseEvent('mousedown',{bubbles:true}));(btn||i).click();i&&i.focus();})()", "after": 900}
TYPE = "window.__type=(ph,val)=>{const el=[...document.querySelectorAll('input,textarea')].find(e=>e.placeholder===ph);const proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,val);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));el.dispatchEvent(new Event('blur',{bubbles:true}));};"
def typ(ph, val):
    return {"eval": TYPE + f"__type({json.dumps(ph, ensure_ascii=False)},{json.dumps(val, ensure_ascii=False)});", "after": 400}
collapse_all = {"eval": "[...document.querySelectorAll('button')].filter(b=>b.innerText.trim()==='−').forEach(b=>b.click())", "after": 700}

R = {}  # name -> (pf, hash, steps)
def A(name, h, steps=None): R[name] = ('admin', h, steps or [])
def P(name, h, steps=None): R[name] = ('app', h, steps or [])

# ================= 共通の入口 =================
A('帳票管理 › 帳票選択', 'admin/ledger-management')
A('承認申請管理', 'admin/approvals')
A('データ検索 › 帳票選択', 'admin/data-search')
P('帳票一覧', 'app/ledger-list')
P('確認待ち', 'app/pending-review')
P('確認待ち（ポップアップ：絞り込み条件）', 'app/pending-review', [{"click": "絞り込み検索"}])
P('確認待ち（差し戻しのある一覧）', 'app/pending-review', [scroll_bottom])
P('進捗一覧', 'app/progress')
P('進捗一覧（ポップアップ：絞り込み条件）', 'app/progress', [{"click": "絞り込み検索"}])
P('進捗一覧（未点検）', 'app/progress', [{"eval": "[...document.querySelectorAll('button')].find(b=>b.innerText.trim().startsWith('未点検')).click()", "after": 700}])
P('進捗一覧（アコーディオンを閉じた状態）', 'app/progress', [collapse_all])
P('点検予定', 'app/schedule')
P('点検予定（ポップアップ：新規登録）', 'app/schedule', [{"click": "新規登録", "exact": 1}])
P('点検予定（ポップアップ：新規登録・登録済み）', 'app/schedule', [{"click": "新規登録", "exact": 1}, {"click": "機械器具点検", "in": 1}])
P('点検予定（ポップアップ：新規登録・帳票なし）', 'app/schedule', [
    {"eval": "window.postMessage({nvideo:'go',hash:'app/schedule',flags:{hide:'equipment-inspection,cleaning-record,sensory-inspection'}},'*')", "after": 900},
    {"click": "2", "exact": 1, "nth": 0}, {"click": "1", "exact": 1, "nth": 0}, {"click": "新規登録", "exact": 1}])
# 保管場所管理（薬品・添加物の両方の帳票管理にある）
A('保管場所管理', 'admin/storage')
A('保管場所管理 › 新規登録', 'admin/storage/new')
A('保管場所管理 › 登録完了', 'admin/storage/new/complete')
A('保管場所管理 › 詳細', 'admin/storage/s1')
A('保管場所管理 › 編集', 'admin/storage/s1/edit')
A('保管場所管理 › 削除完了', 'admin/storage/deleted')
A('保管場所管理 › 詳細（トースト：更新されました。）', 'admin/storage/s1/edit', [{"click": "保存", "exact": 1, "after": 500}])

# ================= 機械器具点検 =================
J = '機械器具点検'; B = 'admin/ledger-management/equipment-inspection/factories/f1'
A(f'帳票管理 › {J} › 工場選択', 'admin/ledger-management/equipment-inspection')
A(f'帳票管理 › {J} › ラインの一覧', B)
A(f'帳票管理 › {J} › ラインの新規登録', B + '/lines/new')
A(f'帳票管理 › {J} › 登録完了', B + '/lines/registered')
A(f'帳票管理 › {J} › ラインの詳細', B + '/lines/l8')
A(f'帳票管理 › {J} › 確認項目の設定', B + '/checklist-settings')
A(f'帳票管理 › {J} › 確認項目の設定（ダイアログ：確認項目の削除）', B + '/checklist-settings', [{"sel": 'img[alt="削除"]'}])
A(f'帳票管理 › {J} › 確認項目の削除完了', B + '/checklist-settings/deleted')
A(f'帳票管理 › {J} › 点検予定', B + '/schedule')
A(f'帳票管理 › {J} › 予定の新規登録', B + '/schedule/register')
A(f'帳票管理 › {J} › 予定の新規登録（ポップアップ：持ち場/ライン名の追加）', B + '/schedule/register', [{"click": "追加"}])
A(f'帳票管理 › {J} › 予定の登録完了', B + '/schedule/register/complete')
A(f'帳票管理 › {J} › 点検予定（メニュー：⋮）', B + '/schedule', [{"sel": 'img[alt="メニュー"]'}])
A(f'帳票管理 › {J} › 点検予定（トースト：削除されました）', B + '/schedule', [{"sel": 'img[alt="メニュー"]'}, {"click": "削除", "exact": 1, "after": 500}])
A(f'帳票管理 › {J} › 予定の編集', B + '/schedule', [{"click": "編集", "exact": 1}])
A(f'帳票管理 › {J} › 予定の新規登録（ライン追加後）', B + '/schedule/register', [{"click": "追加"}, {"click": "【毎週】豆乳ライン", "in": 1}, {"click": "【毎週】ゆばライン（その他）", "in": 1}, {"click": "追加", "exact": 1, "in": 1}])
A(f'帳票管理 › {J} › 点検予定（トースト：更新されました）', B + '/schedule', [{"click": "編集", "exact": 1}, {"click": "保存", "exact": 1, "after": 400}])

a = 'app/ledger-list/equipment-inspection'
P(f'帳票一覧 › {J}（ポップアップ：実施者の選択）', 'app/ledger-list', [{"click": J}])
P(f'帳票一覧 › {J} › ラインの一覧', a)
P(f'帳票一覧 › {J} › ラインの一覧（パネル：点検済み）', a, [{"click": "点検済み"}])
P(f'帳票一覧 › {J} › ラインの点検', a + '/lines/l10')
P(f'帳票一覧 › {J} › ラインの点検（ポップアップ：点検見送り）', a + '/lines/l10', [{"click": "点検見送り"}])
P(f'帳票一覧 › {J} › ラインの点検（ポップアップ：異常あり）', a + '/lines/l10', [{"click": "異常あり", "nth": 0}])
P(f'帳票一覧 › {J} › 翌日分のラインの一覧', a + '/next-day', [{"click": "毎週"}])
P(f'帳票一覧 › {J} › ラインの点検（ポップアップ：途中保存）', a + '/lines/l10', [{"click": "途中保存"}])
P(f'帳票一覧 › {J} › 提出内容の確認', a + '/lines/l8/confirm')
P(f'帳票一覧 › {J} › 点検見送り確認', a + '/lines/l8/skip-confirm')
P(f'帳票一覧 › {J} › 提出完了', a + '/lines/l8/complete')
P(f'帳票一覧 › {J} › ラインの一覧（毎週）', a, [{"click": "毎週"}])
P(f'帳票一覧 › {J} › ラインの点検（ポップアップ：点検見送り・毎週）', a, [{"click": "毎週"}, {"click": "原料受入ライン"}, {"click": "点検見送り"}])
skip_weekly = [{"click": "毎週"}, {"click": "原料受入ライン"}, {"click": "点検見送り"}, {"click": "はい", "exact": 1, "in": 1}, typ("理由を記入してください。", "設備メンテナンスのため"), {"click": "点検を見送る", "in": 1}, {"click": "提出", "exact": 1}]
P(f'帳票一覧 › {J} › ラインの一覧（見送り後）', a, skip_weekly + [{"click": "機械器具点検を続ける"}, {"click": "毎週", "optional": 1}])
P(f'帳票一覧 › {J} › 翌日分のラインの一覧（見送り後）', a, skip_weekly + [{"click": "機械器具点検を続ける"}, {"eval": "history.pushState(null,'','/react/app/ledger-list/equipment-inspection/next-day');dispatchEvent(new PopStateEvent('popstate'))", "after": 900}, {"click": "毎週", "optional": 1}])
P(f'帳票一覧 › {J} › ラインの点検（全て異常なし）', a + '/lines/l8', [{"click": "全て異常なし", "nth": 0}, {"click": "全て異常なし", "nth": 1}])
P(f'帳票一覧 › {J} › ラインの点検（ポップアップ：異常あり・その他）', a + '/lines/l8', [{"click": "異常あり", "nth": 0}, {"click": "その他", "exact": 1, "nth": 0, "in": 1}, {"click": "その他", "exact": 1, "nth": 1, "in": 1}])
S = 'app/schedule/equipment-inspection'
P(f'点検予定 › {J} 点検設定（新規登録）', S + '/2025-04-09')
P(f'点検予定 › {J} 点検設定（登録済みの詳細）', S + '/2025-04-01')
P(f'点検予定 › {J} 点検設定（編集）', S + '/2025-04-01', [{"click": "編集", "exact": 1}])
P(f'点検予定 › {J} 点検設定（ポップアップ：持ち場/ライン名の追加）', S + '/2025-04-09', [{"click": "追加"}])
P(f'点検予定 › {J} 点検設定（ダイアログ：削除）', S + '/2025-04-01', [{"click": "編集", "exact": 1}, {"sel": 'img[alt="削除"]'}])
P(f'点検予定 › {J} 点検設定（保存完了）', S + '/2025-04-01', [{"click": "編集", "exact": 1}, {"click": "保存", "exact": 1}])
P(f'点検予定 › {J} 点検設定（予定なしの日）', 'app/schedule', [{"click": "2", "exact": 1, "nth": 0}])
P(f'点検予定 › {J} 点検設定（休業日）', 'app/schedule', [{"click": "6 休業日", "exact": 1}])
P(f'点検予定 › {J} 点検設定（登録完了）', S + '/2025-04-09', [{"click": "追加"}, {"click": "【毎週】原料受入ライン", "in": 1}, {"click": "追加", "exact": 1, "in": 1}, {"click": "登録", "exact": 1}])

P(f'確認待ち › {J} › 確認待ちの詳細（ポップアップ：確認者の選択）', 'app/pending-review/p2')
P(f'確認待ち › {J} › 確認待ちの詳細', 'app/pending-review/p2', [pick, nxt])
P(f'確認待ち › {J} › 確認待ちの詳細（ポップアップ：提出完了）', 'app/pending-review/p2', [pick, nxt, {"click": "提出", "exact": 1}])
filt = lambda L: [{"click": "絞り込み検索"}, {"click": L, "in": 1}, {"click": "絞り込み", "exact": 1, "in": 1}]
P(f'確認待ち › {J}（絞り込み後）', 'app/pending-review', filt(J))

A(f'承認申請管理 › {J} › データ一覧', 'admin/approvals/equipment-inspection')
A(f'承認申請管理 › {J} › データ一覧（ダイアログ：承認の確認）', 'admin/approvals/equipment-inspection', [{"click": "承認する", "exact": 1}])
A(f'承認申請管理 › {J} › 詳細', 'admin/approvals/equipment-inspection/records/a1')
A(f'承認申請管理 › {J} › 詳細（ダイアログ：承認の確認）', 'admin/approvals/equipment-inspection/records/a1', [{"click": "承認待ち", "exact": 1}, {"click": "承認済み", "exact": 1}])
A(f'承認申請管理 › {J} › 詳細（ダイアログ：差し戻し理由）', 'admin/approvals/equipment-inspection/records/a1', [{"click": "承認待ち", "exact": 1}, {"click": "差し戻し", "exact": 1}])
A(f'承認申請管理 › {J} › 詳細（点検見送り）', 'admin/approvals/equipment-inspection/records/a4')

rj = [pick, nxt]
P(f'確認待ち › {J} › 確認待ちの詳細（差し戻し）（ポップアップ：確認者の選択）', 'app/pending-review/p14')
P(f'確認待ち › {J} › 差し戻しの内容', 'app/pending-review/p14', rj)
P(f'確認待ち › {J} › 差し戻しの内容（ポップアップ：実施者の選択）', 'app/pending-review/p14', rj + [{"click": "点検内容を修正する"}])
fix = rj + [{"click": "点検内容を修正する"}, pick, nxt]
P(f'確認待ち › {J} › 点検内容の修正', 'app/pending-review/p14', fix)
P(f'確認待ち › {J} › 内容の修正（ポップアップ：点検見送り）', 'app/pending-review/p14', fix + [{"click": "点検見送り"}])
P(f'確認待ち › {J} › 差し戻しの内容（ポップアップ：差し戻し対応完了）', 'app/pending-review/p14', fix + [{"click": "編集を保存", "exact": 1}, scroll_bottom, {"click": "差し戻し対応完了", "exact": 1}])

pg = [{"click": "【毎日】ゆばライン（つまみ関係）"}]
P(f'進捗一覧 › {J}（ポップアップ：実施者の選択）', 'app/progress', pg)
pg2 = pg + [pick, nxt]
P(f'進捗一覧 › {J} › ラインの点検', 'app/progress', pg2)
pg3 = pg2 + [{"click": "全て異常なし", "nth": 0}, {"click": "全て異常なし", "nth": 1}, {"click": "終業", "exact": 1}, {"click": "全て異常なし", "nth": 0}, {"click": "全て異常なし", "nth": 1}, {"click": "確認画面へ", "exact": 1}]
P(f'進捗一覧 › {J} › 提出内容の確認', 'app/progress', pg3)
P(f'進捗一覧 › {J} › 提出完了', 'app/progress', pg3 + [{"click": "提出", "exact": 1}])
P(f'進捗一覧 › {J}（絞り込み後）', 'app/progress', filt(J))

ds = 'admin/data-search/equipment-inspection'
A(f'データ検索 › {J} › 工場選択', ds)
A(f'データ検索 › {J} › データ一覧', ds + '/factories/f1')
A(f'データ検索 › {J} › データ一覧（ポップアップ：年月の選択）', ds + '/factories/f1', [{"click": "2025年4月", "exact": 1}])
A(f'データ検索 › {J} › データ一覧（ダイアログ：ダウンロード形式選択）', ds + '/factories/f1', [{"wait": 800}, dl])
A(f'データ検索 › {J} › 詳細', ds + '/factories/f1/records/r1')
A(f'データ検索 › {J} › 詳細（点検見送り）', ds + '/factories/f1/records/r4')

# ================= 清掃記録 =================
J = '清掃記録'; B = 'admin/ledger-management/cleaning-record/factories/f1'
A(f'帳票管理 › {J} › 工場選択', 'admin/ledger-management/cleaning-record')
A(f'帳票管理 › {J} › ラインの一覧', B)
A(f'帳票管理 › {J} › ラインの新規登録', B + '/lines/new')
A(f'帳票管理 › {J} › 登録完了', B + '/lines/registered')
A(f'帳票管理 › {J} › ラインの詳細', B + '/lines/c1')
A(f'帳票管理 › {J} › 点検予定', B + '/schedule')
A(f'帳票管理 › {J} › 予定の新規登録', B + '/schedule/register')
A(f'帳票管理 › {J} › 予定の新規登録（ポップアップ：持ち場/ライン名の追加）', B + '/schedule/register', [{"click": "追加"}])
A(f'帳票管理 › {J} › 予定の登録完了', B + '/schedule/registered')
A(f'帳票管理 › {J} › 点検予定（メニュー：⋮）', B + '/schedule', [{"sel": 'img[alt="メニュー"]'}])
A(f'帳票管理 › {J} › 点検予定（トースト：削除されました）', B + '/schedule', [{"sel": 'img[alt="メニュー"]'}, {"click": "削除", "exact": 1, "after": 500}])
A(f'帳票管理 › {J} › 予定の編集', B + '/schedule', [{"click": "編集", "exact": 1}])
A(f'帳票管理 › {J} › 予定の新規登録（ライン追加後）', B + '/schedule/register', [{"click": "追加"}, {"click": "【毎週】豆乳ライン", "in": 1}, {"click": "【毎週】殺菌ライン", "in": 1}, {"click": "追加", "exact": 1, "in": 1}])
A(f'帳票管理 › {J} › 点検予定（トースト：更新されました）', B + '/schedule', [{"click": "編集", "exact": 1}, {"click": "保存", "exact": 1, "after": 400}])

a = 'app/ledger-list/cleaning-record'
P(f'帳票一覧 › {J}（ポップアップ：実施者の選択）', 'app/ledger-list', [{"click": J}])
P(f'帳票一覧 › {J} › ラインの一覧', a)
P(f'帳票一覧 › {J} › ラインの一覧（パネル：点検済み）', a, [{"click": "点検済み"}])
P(f'帳票一覧 › {J} › 翌日分のラインの一覧', a + '/next-day', [{"click": "毎週"}])
P(f'帳票一覧 › {J} › 清掃の記録入力', a + '/lines/c4')
P(f'帳票一覧 › {J} › 清掃の記録入力（ポップアップ：点検見送り）', a + '/lines/c4', [{"click": "点検見送り"}])
P(f'帳票一覧 › {J} › 清掃の記録入力（ポップアップ：途中保存）', a + '/lines/c4', [{"click": "途中保存"}])
P(f'帳票一覧 › {J} › 提出内容の確認', a + '/lines/c1/confirm')
P(f'帳票一覧 › {J} › 点検見送り確認', a + '/lines/c1/skip-confirm')
P(f'帳票一覧 › {J} › 提出完了', a + '/lines/c1/complete')
P(f'帳票一覧 › {J} › ラインの一覧（毎週）', a, [{"click": "毎週"}])
P(f'帳票一覧 › {J} › 清掃の記録入力（ポップアップ：点検見送り・毎週）', a, [{"click": "毎週"}, {"click": "原料受入ライン"}, {"click": "点検見送り"}])
skip_weekly = [{"click": "毎週"}, {"click": "原料受入ライン"}, {"click": "点検見送り"}, {"click": "はい", "exact": 1, "in": 1}, typ("理由を記入してください。", "設備メンテナンスのため"), {"click": "点検を見送る", "in": 1}, {"click": "提出", "exact": 1}]
P(f'帳票一覧 › {J} › ラインの一覧（見送り後）', a, skip_weekly + [{"click": "清掃記録を続ける"}, {"click": "毎週", "optional": 1}])
P(f'帳票一覧 › {J} › 翌日分のラインの一覧（見送り後）', a, skip_weekly + [{"click": "清掃記録を続ける"}, {"eval": "history.pushState(null,'','/react/app/ledger-list/cleaning-record/next-day');dispatchEvent(new PopStateEvent('popstate'))", "after": 900}, {"click": "毎週", "optional": 1}])
P(f'帳票一覧 › {J} › 清掃の記録入力（全て清掃済み）', a + '/lines/c4', [{"click": "全て清掃済み", "nth": 0}, {"click": "全て清掃済み", "nth": 1}])
S = 'app/schedule/cleaning-record'
P(f'点検予定 › {J} 記録管理（登録済みの詳細）', S + '/2025-04-01')
P(f'点検予定 › {J} 記録管理（編集）', S + '/2025-04-01', [{"click": "編集", "exact": 1}])
P(f'点検予定 › {J} 記録管理（ダイアログ：削除）', S + '/2025-04-01', [{"click": "編集", "exact": 1}, {"sel": 'img[alt="削除"]'}])
P(f'点検予定 › {J} 記録管理（保存完了）', S + '/2025-04-01', [{"click": "編集", "exact": 1}, {"click": "保存", "exact": 1}])
P(f'点検予定 › {J} 記録管理（削除完了）', S + '/2025-04-01', [{"click": "編集", "exact": 1}, {"eval": "(()=>{const go=()=>{const b=document.querySelector('img[alt=\"削除\"]');if(!b)return;b.closest('button').click();setTimeout(()=>{const d=[...document.querySelectorAll('button')].find(x=>x.innerText.trim()==='削除');d&&d.click();setTimeout(go,300)},300)};go();})()", "after": 4000}, {"click": "保存", "exact": 1}])
P(f'点検予定 › {J} 記録管理（新規登録）', S + '/2025-04-09')
P(f'点検予定 › {J} 記録管理（ポップアップ：持ち場/ライン名の追加）', S + '/2025-04-09', [{"click": "追加"}])
P(f'点検予定 › {J} 記録管理（ライン追加後）', S + '/2025-04-09', [{"click": "追加"}, {"click": "【毎週】豆乳ライン", "in": 1}, {"click": "【毎週】殺菌ライン", "in": 1}, {"click": "追加", "exact": 1, "in": 1}])
P(f'点検予定 › {J} 記録管理（登録完了）', S + '/2025-04-09', [{"click": "追加"}, {"click": "【毎週】豆乳ライン", "in": 1}, {"click": "追加", "exact": 1, "in": 1}, {"click": "登録", "exact": 1}])

P(f'確認待ち › {J} › 確認待ちの詳細（ポップアップ：確認者の選択）', 'app/pending-review/p8')
P(f'確認待ち › {J} › 確認待ちの詳細', 'app/pending-review/p8', [pick, nxt])
P(f'確認待ち › {J} › 確認待ちの詳細（ポップアップ：提出完了）', 'app/pending-review/p8', [pick, nxt, {"click": "提出", "exact": 1}])
P(f'確認待ち › {J}（絞り込み後）', 'app/pending-review', filt(J))

A(f'承認申請管理 › {J} › データ一覧', 'admin/approvals/cleaning-record')
A(f'承認申請管理 › {J} › データ一覧（ダイアログ：承認の確認）', 'admin/approvals/cleaning-record', [{"click": "承認する", "exact": 1}])
A(f'承認申請管理 › {J} › 詳細', 'admin/approvals/cleaning-record/records/a1')
A(f'承認申請管理 › {J} › 詳細（ダイアログ：承認の確認）', 'admin/approvals/cleaning-record/records/a1', [{"click": "承認待ち", "exact": 1}, {"click": "承認済み", "exact": 1}])
A(f'承認申請管理 › {J} › 詳細（ダイアログ：差し戻し理由）', 'admin/approvals/cleaning-record/records/a1', [{"click": "承認待ち", "exact": 1}, {"click": "差し戻し", "exact": 1}])
A(f'承認申請管理 › {J} › 詳細（点検見送り）', 'admin/approvals/cleaning-record/records/a2')

P(f'確認待ち › {J} › 確認待ちの詳細（差し戻し）（ポップアップ：確認者の選択）', 'app/pending-review/p15')
P(f'確認待ち › {J} › 差し戻しの内容', 'app/pending-review/p15', rj)
P(f'確認待ち › {J} › 差し戻しの内容（ポップアップ：実施者の選択）', 'app/pending-review/p15', rj + [{"click": "点検内容を修正する"}])
P(f'確認待ち › {J} › 点検内容の修正', 'app/pending-review/p15', fix)
P(f'確認待ち › {J} › 内容の修正（ポップアップ：点検見送り）', 'app/pending-review/p15', fix + [{"click": "点検見送り"}])
P(f'確認待ち › {J} › 差し戻しの内容（ポップアップ：差し戻し対応完了）', 'app/pending-review/p15', fix + [{"click": "編集を保存", "exact": 1}, scroll_bottom, {"click": "差し戻し対応完了", "exact": 1}])

pg = [{"click": "【毎週】ゆばライン"}]
P(f'進捗一覧 › {J}（ポップアップ：実施者の選択）', 'app/progress', pg)
pg2 = pg + [pick, nxt]
P(f'進捗一覧 › {J} › 清掃の記録入力', 'app/progress', pg2)
pg3 = pg2 + [{"click": "全て清掃済み", "nth": 0}, {"click": "全て清掃済み", "nth": 1}, {"click": "確認画面へ", "exact": 1}]
P(f'進捗一覧 › {J} › 提出内容の確認', 'app/progress', pg3)
P(f'進捗一覧 › {J} › 提出完了', 'app/progress', pg3 + [{"click": "提出", "exact": 1}])
P(f'進捗一覧 › {J}（絞り込み後）', 'app/progress', filt(J))

ds = 'admin/data-search/cleaning-record'
A(f'データ検索 › {J} › 工場選択', ds)
A(f'データ検索 › {J} › データ一覧', ds + '/factories/f1')
A(f'データ検索 › {J} › データ一覧（ポップアップ：年月の選択）', ds + '/factories/f1', [{"click": "2025年4月", "exact": 1}])
A(f'データ検索 › {J} › データ一覧（ダイアログ：ダウンロード形式選択）', ds + '/factories/f1', [{"wait": 800}, dl])
A(f'データ検索 › {J} › 詳細', ds + '/factories/f1/records/r1')
A(f'データ検索 › {J} › 詳細（点検見送り）', ds + '/factories/f1/records/r2')

# ================= 薬品管理・添加物管理 =================
# (帳票名, slug, 管理画面の登録物の集まり, id, 登録物の名前, アプリの対象の hash, アプリの記録, 確認待ち, 差し戻し, 承認の詳細, データ検索の詳細, 進捗で開く行, 一覧の名前, 確認完了の行, 選択の文字)
L = [('薬品管理', 'chemical-management', 'chemicals', 'c1', '薬品', 'c3', 'records/r5', 'p18', 'p16', 'ch2', 'dch1', 'にがり（塩化マグネシウム）', '薬品の一覧', 'グルコノデルタラクトン', '選択してください'),
     ('添加物管理', 'additive-management', 'additives', 'a1', '添加物', 'products/a3', 'records/r4', 'p1', 'p17', 'a1', 'add1', 'にがり（塩化マグネシウム）', '製品の一覧', 'グルコノデルタラクトン', '選択をしてください')]
for J, slug, coll, iid, X, item, rec, p, pr, ap, dsr, prow, lname, done_row, selbtn in L:
    nth = 0 if J == '薬品管理' else 1
    unit_ph = '例）g' if J == '薬品管理' else '例）ml'
    opt1 = '次亜塩素酸ナトリウム' if J == '薬品管理' else 'ソルビン酸カリウム'  # 進捗一覧で 薬品管理 の行が先に並ぶ
    B = f'admin/ledger-management/{slug}/factories/f1'
    A(f'帳票管理 › {J} › 工場選択', f'admin/ledger-management/{slug}')
    A(f'帳票管理 › {J} › {X}の一覧', B)
    A(f'帳票管理 › {J} › {X}の新規登録', B + f'/{coll}/new')
    A(f'帳票管理 › {J} › 登録完了', B + f'/{coll}/registered')
    A(f'帳票管理 › {J} › {X}の詳細', B + f'/{coll}/{iid}')
    A(f'帳票管理 › {J} › {X}の詳細（ダイアログ：削除）', B + f'/{coll}/{iid}', [{"wait": 800}, trash])
    A(f'帳票管理 › {J} › {X}の編集', B + f'/{coll}/{iid}/edit')
    A(f'帳票管理 › {J} › 削除完了', B + f'/{coll}/deleted')
    A(f'帳票管理 › {J} › {X}の詳細（トースト：更新されました。）', B + f'/{coll}/{iid}/edit', [{"click": "保存", "exact": 1, "after": 500}])
    A(f'帳票管理 › {J} › {X}の新規登録（プルダウン：単位）', B + f'/{coll}/new', [{"click": unit_ph, "exact": 1}])
    A(f'帳票管理 › {J} › {X}の新規登録（プルダウン：保管場所）', B + f'/{coll}/new', [{"click": "例）小型物置", "exact": 1}])

    ab = f'app/ledger-list/{slug}'
    P(f'帳票一覧 › {J}（ポップアップ：実施者の選択）', 'app/ledger-list', [{"click": J}])
    P(f'帳票一覧 › {J} › {lname}', ab)
    P(f'帳票一覧 › {J} › 記録の一覧', f'{ab}/{item}')
    P(f'帳票一覧 › {J} › 記録の一覧（ポップアップ：実施日の選択）', f'{ab}/{item}', [{"wait": 600}, datepick])
    P(f'帳票一覧 › {J} › 記録入力', f'{ab}/{item}/new')
    P(f'帳票一覧 › {J} › 記録入力（プルダウン：区分）', f'{ab}/{item}/new', [{"click": selbtn}])
    P(f'帳票一覧 › {J} › 記録の詳細', f'{ab}/{item}/{rec}')
    P(f'帳票一覧 › {J} › 提出内容の確認', f'{ab}/{item}/confirm')
    P(f'帳票一覧 › {J} › 提出完了', f'{ab}/{item}/confirm/complete' if J == '薬品管理' else f'{ab}/{item}/complete')

    P(f'確認待ち › {J} › 確認待ちの詳細（ポップアップ：確認者の選択）', f'app/pending-review/{p}')
    P(f'確認待ち › {J} › 確認待ちの詳細', f'app/pending-review/{p}', [pick, nxt])
    P(f'確認待ち › {J} › 確認待ちの詳細（ポップアップ：提出完了）', f'app/pending-review/{p}', [pick, nxt, {"click": "提出", "exact": 1}])

    A(f'承認申請管理 › {J} › データ一覧', f'admin/approvals/{slug}')
    A(f'承認申請管理 › {J} › データ一覧（ダイアログ：承認の確認）', f'admin/approvals/{slug}', [{"click": "承認する", "exact": 1}])
    A(f'承認申請管理 › {J} › 詳細', f'admin/approvals/{slug}/records/{ap}')
    A(f'承認申請管理 › {J} › 詳細（ダイアログ：承認の確認）', f'admin/approvals/{slug}/records/{ap}', [{"click": "承認待ち", "exact": 1}, {"click": "承認済み", "exact": 1}])
    A(f'承認申請管理 › {J} › 詳細（ダイアログ：差し戻し理由）', f'admin/approvals/{slug}/records/{ap}', [{"click": "承認待ち", "exact": 1}, {"click": "差し戻し", "exact": 1}])

    P(f'確認待ち › {J} › 確認待ちの詳細（差し戻し）（ポップアップ：確認者の選択）', f'app/pending-review/{pr}')
    P(f'確認待ち › {J} › 差し戻しの一覧', f'app/pending-review/{pr}', rj)
    P(f'確認待ち › {J} › 差し戻しの一覧（ポップアップ：差し戻し対応完了）', f'app/pending-review/{pr}', rj + [{"click": "差し戻し対応完了", "exact": 1}])
    det = rj + [{"click": "詳細", "exact": 1, "nth": 1}]
    P(f'確認待ち › {J} › 記録の詳細（差し戻し）', f'app/pending-review/{pr}', det)
    P(f'確認待ち › {J} › 記録の詳細（差し戻し）（ポップアップ：実施者の選択）', f'app/pending-review/{pr}', det + [{"click": "点検内容を修正する"}])
    P(f'確認待ち › {J} › 内容の修正', f'app/pending-review/{pr}', det + [{"click": "点検内容を修正する"}, pick, nxt])

    pg = [{"click": prow, "nth": nth}]
    P(f'進捗一覧 › {J}（ポップアップ：実施者の選択）', 'app/progress', pg)
    st = pg + [pick, nxt]
    P(f'進捗一覧 › {J} › 記録の一覧', 'app/progress', st)
    st2 = st + [{"click": "記録を追加"}]
    P(f'進捗一覧 › {J} › 記録入力', 'app/progress', st2)
    st3 = st2 + [{"click": selbtn}, {"click": "入庫", "exact": 1}, typ('例）1,000', '100'), {"click": "自動計算", "exact": 1, "optional": 1}, {"click": "保存", "exact": 1}, {"click": "確認画面へ", "exact": 1, "optional": 1}]
    P(f'進捗一覧 › {J} › 提出内容の確認', 'app/progress', st3)
    P(f'進捗一覧 › {J} › 提出完了', 'app/progress', st3 + [{"click": "提出", "exact": 1}])
    P(f'進捗一覧 › {J}（絞り込み後）', 'app/progress', filt(J))
    P(f'進捗一覧 › {J}（絞り込み後・折りたたみ）', 'app/progress', filt(J) + [collapse_all])
    P(f'進捗一覧 › {J} › 記録の一覧（確認完了）', 'app/progress', [{"click": done_row, "nth": nth}, pick, nxt])

    dsb = f'admin/data-search/{slug}/factories/f1'
    A(f'データ検索 › {J} › 工場選択', f'admin/data-search/{slug}')
    A(f'データ検索 › {J} › データ一覧', dsb)
    A(f'データ検索 › {J} › データ一覧（ポップアップ：年月の選択）', dsb, [{"click": "2025年4月", "exact": 1}])
    A(f'データ検索 › {J} › データ一覧（ダイアログ：ダウンロード形式選択）', dsb, [{"wait": 800}, dl])
    A(f'データ検索 › {J} › 詳細', f'{dsb}/records/{dsr}')
    A(f'データ検索 › {J} › データ一覧（プルダウン：{X}名）', dsb, [{"click": f'{X}名', "exact": 1}])
    A(f'データ検索 › {J} › データ一覧（プルダウン：保管場所）', dsb, [{"click": '保管場所名', "exact": 1}])
    A(f'データ検索 › {J} › データ一覧（絞り込み後）', dsb, [{"click": f'{X}名', "exact": 1}, {"click": opt1, "exact": 1}, {"click": "検索", "exact": 1}])

# ---- frames.txt から plan を組み立てる ----
order, secs, missing = [], {}, []
sec = None
for line in open(os.path.join(HERE, 'frames.txt'), encoding='utf-8'):
    line = line.rstrip('\n')
    if not line: continue
    if line.startswith('#'): sec = line[1:]; continue
    fid, w, name = line.split('\t')
    if name not in secs: order.append(name); secs[name] = []
    secs[name].append(sec)
plan = []
for i, name in enumerate(order):
    if name not in R: missing.append(name); continue
    pf, h, steps = R[name]
    w, hh, q = (1280, 760, '&role=administrator') if pf == 'admin' else (768, 976, '')
    plan.append(dict(id=f'F{len(plan)+1:03d}', name=name, pf=pf, hash=h, steps=steps, w=w, h=hh, q=q, sections=secs[name]))
json.dump(plan, open(os.path.join(HERE, 'planF.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('frames', sum(len(v) for v in secs.values()), 'unique', len(order), 'plan', len(plan))
for m in missing: print('MISSING', m)
for k in R:
    if k not in secs: print('UNUSED', k)
