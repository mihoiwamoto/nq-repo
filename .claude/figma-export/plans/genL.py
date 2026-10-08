# planL.json を作る（2026-10-08 夜）。機械器具点検の列（Admin・App の 7 セクション）を最新の React で全部撮り直す。
# planJ（機械器具点検の 93 行）と、同じ日に撮り直した「データ一覧」系の作業メモ recap-list/plan.json（あれば）を
# (セクション, 画面名) で後勝ちにまとめる。置き換えるのは機械器具点検の列だけ（sections は機械器具点検のセクションだけ）。
# 同じ撮り方の行（帳票一覧など）は 1 枚撮って sections に並べる。管理画面は 1440×960・管理者。
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
RECAP = '/private/tmp/claude-501/-Users-iwamotomiho-Documents-NQrepo/61dc6a15-5363-436f-ae59-85ceed0c7c82/scratchpad/recap-list/plan.json'
rows, order = {}, []
def add(sec, e):
    k = (sec, e['name'])
    if k not in rows:
        order.append(k)
    rows[k] = {k2: v for k2, v in e.items() if k2 not in ('old', 'new', 'sections', 'sec', 'src')}
for e in json.load(open(os.path.join(HERE, 'planJ.json'))):
    add(e['sec'], e)
if os.path.exists(RECAP):
    for e in json.load(open(RECAP)):
        for s in e['sections']:
            if s.endswith('_機械器具点検'):
                add(s, e)
# 2026-10-08 夜：React の変更に合わせた操作の直し（FIX[画面名] = 直す項目）
FIX = {
    # 進捗一覧のアコーディオンの開閉は「−」の文字ではなくマスクのアイコン（aria-label「閉じる」）になった
    '進捗一覧（アコーディオンを閉じた状態）': {'steps': [{'eval': "[...document.querySelectorAll('button[aria-label=閉じる]')].forEach(b=>b.click())", 'after': 700}]},
}
out, byid = [], {}
for k in order:
    d = dict(rows[k]); d.update(FIX.get(k[1], {}))
    if d['pf'] == 'admin':
        d['w'], d['h'], d['q'] = 1440, 960, '&role=administrator'
    key = json.dumps([d['hash'], d['steps'], d.get('q', '')], ensure_ascii=False)
    if key in byid:
        byid[key]['sections'].append(k[0]); continue
    d['sections'] = [k[0]]; d['src'] = d['id']
    byid[key] = d; out.append(d)
for i, d in enumerate(out):
    d['id'] = f'L{i+1:03d}'
json.dump(out, open(os.path.join(HERE, 'planL.json'), 'w'), ensure_ascii=False, indent=0)
print(len(out), sum(len(d['sections']) for d in out))
