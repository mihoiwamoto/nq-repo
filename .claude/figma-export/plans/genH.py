# planH.json を作る（2026-10-07 夕）。機械器具点検の見比べのあとで直した React（確認待ちの見送り・差し戻しの見送り・翌日の毎日のタブ・
# 管理画面のトースト・登録の日付欄・ラインの詳細の行間・点検予定の完了画面・進捗一覧の確認完了の色と実施者の選択・絞り込みの高さ・
# 差し戻しの編集の実施日・確認待ちのコメント 255）を AI書き出しへ撮り直す。new=1 は Figma にまだ無いフレーム。
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
F = json.load(open(os.path.join(HERE, 'planF.json')))
G = json.load(open(os.path.join(HERE, 'planG.json')))
gid = {e['id'][1:]: e for e in G if e['id'].startswith('G')}
base = [dict(gid.get(e['id'][1:], e)) for e in F] + [dict(e) for e in G if e['id'].startswith('N')]
def want(n):
    return ('トースト' in n or n.startswith('確認待ち') or n.startswith('進捗一覧')
            or n.startswith('帳票管理 › 機械器具点検') or n.startswith('帳票管理 › 清掃記録')
            or n.startswith('帳票一覧 › 機械器具点検')
            or (n.startswith('点検予定 ›') and ('保存完了' in n or '登録完了' in n)))
out = []
for e in base:
    if want(e['name']):
        e = {k: v for k, v in e.items() if k not in ('old',)}
        e['new'] = 0; e['id'] = 'H' + e['id'][1:] if e['id'][0] in 'FG' else 'H' + e['id']
        out.append(e)
APP = {'pf': 'app', 'w': 768, 'h': 976, 'q': '', 'new': 1}
pick, nxt = {"pick": 1}, {"click": "次へ", "in": 1}
out += [
 {**APP, 'id': 'Hn1', 'name': '確認待ち › 機械器具点検 › 確認待ちの詳細（見送り）', 'hash': 'app/pending-review/p20', 'steps': [pick, nxt], 'sections': ['（App）確認待ち_機械器具点検']},
 {**APP, 'id': 'Hn2', 'name': '確認待ち › 機械器具点検 › 差し戻しの内容（見送り）', 'hash': 'app/pending-review/p19', 'steps': [pick, nxt], 'sections': ['（App）確認待ち_差し戻し_機械器具点検']},
 {**APP, 'id': 'Hn3', 'name': '確認待ち › 機械器具点検 › 点検内容の修正（見送り）', 'hash': 'app/pending-review/p19', 'steps': [pick, nxt, {"click": "点検内容を修正する"}, pick, nxt], 'sections': ['（App）確認待ち_差し戻し_機械器具点検']},
 {**APP, 'id': 'Hn4', 'name': '帳票一覧 › 機械器具点検 › 翌日分のラインの一覧（毎日）', 'hash': 'app/ledger-list/equipment-inspection/next-day', 'steps': [{"eval": "[...document.querySelectorAll('button')].find(b=>b.innerText.trim().startsWith('毎日')).click()", "after": 700}], 'sections': ['（App）帳票一覧_機械器具点検']},
]
json.dump(out, open(os.path.join(HERE, 'planH.json'), 'w'), ensure_ascii=False, indent=0)
print(len(out), sum(len(e['sections']) for e in out))
