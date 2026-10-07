# planG.json を作る（2026-10-07）。React に作った「React に無かった画面」の新しいフレームと、
# 同じ日の直しで見た目・名前が変わった既存のフレームの撮り直し。new=1 は Figma にまだ無いフレーム、old は Figma での元の名前。
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
F = {e['id']: e for e in json.load(open(os.path.join(HERE, 'planF.json')))}
out = []
def ren(n):
    return n.replace('機械器具点検 点検設定', '機械器具点検 持ち場/ライン設定').replace('清掃記録 記録管理', '清掃記録 持ち場/ライン設定')
# ---- 撮り直し ----
for i in ['F008','F045','F046','F047','F048','F049','F050','F051','F052','F053','F054','F061','F062','F063',
          'F074','F075','F076','F077','F078','F079','F080','F081','F082',
          'F111','F112','F113','F114','F115','F116','F118','F119','F121','F122','F233']:
    e = dict(F[i]); e['id'] = 'G' + i[1:]; e['old'] = e['name']; e['name'] = ren(e['name']); out.append(e)
# ---- 新しいフレーム ----
ADM = {'pf': 'admin', 'w': 1280, 'h': 760, 'q': '&role=administrator', 'new': 1}
APP = {'pf': 'app', 'w': 768, 'h': 976, 'q': '', 'new': 1}
trash = {"sel": 'img[alt="削除"]'}
for slug, J in [('equipment-inspection', '機械器具点検'), ('cleaning-record', '清掃記録')]:
    B = f'admin/ledger-management/{slug}/factories/f1'
    sec = [f'（Admin）帳票管理_{J}']
    ed = [{"click": "編集", "exact": 1}]
    out.append({**ADM, 'id': f'N{len(out):03d}', 'name': f'帳票管理 › {J} › 予定の編集（ダイアログ：持ち場/ライン設定の削除）', 'hash': B + '/schedule', 'steps': ed + [trash], 'sections': sec})
    out.append({**ADM, 'id': f'N{len(out):03d}', 'name': f'帳票管理 › {J} › 予定の削除完了', 'hash': B + '/schedule', 'steps': ed + [trash, {"click": "削除", "exact": 1, "in": 1}], 'sections': sec})
out.append({**ADM, 'id': f'N{len(out):03d}', 'name': '帳票管理 › 清掃記録 › ラインの編集', 'hash': 'admin/ledger-management/cleaning-record/factories/f1/lines/c1/edit', 'steps': [], 'sections': ['（Admin）帳票管理_清掃記録']})
for J, nth in [('薬品管理', 0), ('添加物管理', 1)]:
    out.append({**APP, 'id': f'N{len(out):03d}', 'name': f'確認待ち › {J}（絞り込み後）', 'hash': 'app/pending-review',
                'steps': [{"click": "絞り込み検索"}, {"click": J, "in": 1}, {"click": "絞り込み", "exact": 1, "in": 1}], 'sections': [f'（App）確認待ち_{J}']})
    out.append({**APP, 'id': f'N{len(out):03d}', 'name': f'進捗一覧 › {J} › 記録の一覧（点検済み）', 'hash': 'app/progress',
                'steps': [{"click": "ソルビン酸", "nth": nth}, {"pick": 1}, {"click": "次へ", "in": 1}], 'sections': [f'（App）進捗一覧_{J}']})
json.dump(out, open(os.path.join(HERE, 'planG.json'), 'w'), ensure_ascii=False, indent=0)
print(len(out))
