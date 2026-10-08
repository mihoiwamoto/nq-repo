# planK.json を作る（2026-10-08 夕）。清掃記録・薬品管理・添加物管理の Admin のセクションを全部 1440×960 で撮り直す。
# planF〜J（と、同じ日に撮り直した「データ一覧」系の作業メモ recap-list/plan.json があればそれも）の
# 3 列の Admin のセクションの行を (セクション, 画面名) で後勝ちにまとめ、管理画面は 1440×960・管理者で撮る。
# 同じ id（同じ撮り方）の行は 1 枚撮って複数のセクションに置く（sections にまとめる）。
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
COLS = ('清掃記録', '薬品管理', '添加物管理')
RECAP = '/private/tmp/claude-501/-Users-iwamotomiho-Documents-NQrepo/61dc6a15-5363-436f-ae59-85ceed0c7c82/scratchpad/recap-list/plan.json'
srcs = [os.path.join(HERE, f'plan{p}.json') for p in 'FGHIJ'] + ([RECAP] if os.path.exists(RECAP) else [])
rows, order = {}, []
for f in srcs:
    for e in json.load(open(f)):
        for s in e['sections']:
            if not (s.startswith('（Admin）') and s.rsplit('_', 1)[-1] in COLS):
                continue
            k = (s, e['name'])
            if k not in rows:
                order.append(k)
            rows[k] = {k2: v for k2, v in e.items() if k2 not in ('old', 'new', 'sections', 'sec')}
out, byid = [], {}
for k in order:
    d = rows[k]
    if '点検設定（' in k[1]:   # 改名前の名前。Figma に無い
        continue
    d['w'], d['h'], d['q'] = 1440, 960, '&role=administrator'
    if d['id'] in byid:
        if byid[d['id']]['hash'] != d['hash'] or byid[d['id']]['steps'] != d['steps']:
            d = dict(d); d['id'] = d['id'] + 'b'
        else:
            byid[d['id']]['sections'].append(k[0]); continue
    d = dict(d); d['sections'] = [k[0]]
    byid[d['id']] = d; out.append(d)
for i, d in enumerate(out):
    d['src'] = d['id']; d['id'] = f'K{i+1:03d}'
json.dump(out, open(os.path.join(HERE, 'planK.json'), 'w'), ensure_ascii=False, indent=0)
print(len(out), sum(len(d['sections']) for d in out))
