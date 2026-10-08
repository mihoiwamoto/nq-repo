# planJ.json を作る（2026-10-08）。機械器具点検の列を全部撮り直す。
# planF〜I の機械器具点検のセクションの行を (セクション, 画面名) で後勝ちにまとめ、管理画面は 1440×960 にする。
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
rows = {}
order = []
for p in 'FGHI':
    for e in json.load(open(os.path.join(HERE, f'plan{p}.json'))):
        for s in e['sections']:
            if not s.endswith('_機械器具点検'):
                continue
            k = (s, e['name'])
            if k not in rows:
                order.append(k)
            d = {k2: v for k2, v in e.items() if k2 not in ('old', 'new')}
            d['sec'] = s
            rows[k] = d
# 2026-10-08：確認待ちは一覧の行を押すと一覧の上に確認者のポップアップが出る（詳細へ先に移らない）。
# 確認者の選択の 2 枚は、一覧から行を押して撮る（直に /app/pending-review/p2 を開くと、空の一覧の上に出る）
CLICK = "[...document.querySelectorAll('button')].find(b=>/豆乳ライン/.test(b.innerText)&&/機械器具点検/.test(b.innerText)&&/{st}/.test(b.innerText)).click()"
PICK = {
    '確認待ち › 機械器具点検 › 確認待ちの詳細（ポップアップ：確認者の選択）': '点検済み',
    '確認待ち › 機械器具点検 › 確認待ちの詳細（差し戻し）（ポップアップ：確認者の選択）': '差し戻し',
}
out = []
for k in order:
    if '点検設定（' in k[1]:   # 改名前の名前（いまは「持ち場/ライン設定」）。Figma に無いので撮らない
        continue
    d = dict(rows[k])
    if k[1] in PICK:
        d['hash'] = 'app/pending-review'
        d['steps'] = [{'eval': CLICK.replace('{st}', PICK[k[1]]), 'after': 900}]
    if d['pf'] == 'admin':
        d['w'], d['h'] = 1440, 960
    out.append(d)
json.dump(out, open(os.path.join(HERE, 'planJ.json'), 'w'), ensure_ascii=False, indent=0)
print(len(out), len({d['id'] for d in out}))
