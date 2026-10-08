# planI.json を作る（2026-10-07 夜）。planH のあとに入れた React の直し（帳票一覧のタブの数字・帳票名「金属/X線探知機記録」・
# 備考が空のときの案内文「補足事項や連絡事項があればご記入ください。」）が写るフレームを撮り直す。
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
F = json.load(open(os.path.join(HERE, 'planF.json')))
G = json.load(open(os.path.join(HERE, 'planG.json')))
H = json.load(open(os.path.join(HERE, 'planH.json')))
gid = {e['id'][1:]: e for e in G if e['id'].startswith('G')}
base = [dict(gid.get(e['id'][1:], e)) for e in F] + [dict(e) for e in G if e['id'].startswith('N')] + [dict(e) for e in H if e['id'].startswith('Hn')]
COMMON = {'帳票管理 › 帳票選択', '帳票一覧', 'データ検索 › 帳票選択', '承認申請管理', '確認待ち', '確認待ち（ポップアップ：絞り込み条件）',
          '確認待ち（差し戻しのある一覧）', '進捗一覧', '進捗一覧（ポップアップ：絞り込み条件）', '進捗一覧（未点検）', '進捗一覧（アコーディオンを閉じた状態）'}
def want(n):
    return (n in COMMON
            or n.startswith('帳票一覧 › 機械器具点検') or n.startswith('帳票一覧 › 清掃記録')
            or (n.startswith(('帳票一覧 ›', '進捗一覧 ›')) and '（ポップアップ：実施者の選択）' in n)
            or n.startswith('確認待ち › 機械器具点検') or n.startswith('進捗一覧 › 機械器具点検')
            or n.startswith('承認申請管理 › 機械器具点検 › 詳細') or n.startswith('データ検索 › 機械器具点検 › 詳細'))
out = []
for e in base:
    if want(e['name']):
        e = {k: v for k, v in e.items() if k not in ('old', 'new')}
        e['id'] = 'I' + e['id'].lstrip('FGHN')
        out.append(e)
seen = set(); uniq = []
for e in out:
    if e['id'] in seen: e['id'] += 'x'
    seen.add(e['id']); uniq.append(e)
json.dump(uniq, open(os.path.join(HERE, 'planI.json'), 'w'), ensure_ascii=False, indent=0)
print(len(uniq), sum(len(e['sections']) for e in uniq))
