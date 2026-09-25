#!/usr/bin/env python3
"""
プロトタイプの控え（スナップショット）を取る。仕様ページの更新履歴から、変更の前と後の画面を並べて見るため。
画像ではなく HTML をそのままコピーする。1つ 250KB 前後、git に入れても差分だけで済む。

  python3 .claude/snapshot.py daily nqrepo-demo.html                今日の控えがまだ無ければ取る（1日1つ）
  python3 .claude/snapshot.py take  nqrepo-demo.html ["名前"]        いまの状態を取る。名前を付けると消えない
  python3 .claude/snapshot.py name  nqrepo-demo.html 2026-09-24 "初回打合せ前"   あとから名前を付ける。"" で外す
  python3 .claude/snapshot.py git   nqrepo-demo.html 14fdef1 ["名前"] コミットの時点を控えにする（始める前の分を起こす）
  python3 .claude/snapshot.py list  nqrepo-demo.html
  python3 .claude/snapshot.py hook  nqrepo-demo.html                Claude Code のフックから呼ぶ（標準入力に JSON）

置き場所：プロトタイプと同じフォルダの snapshots/
  2026-09-24.html         その日の最初の変更の前（daily）。フックが取る
  2026-09-24-1530.html    手で取ったもの（take）・コミットから起こしたもの（git）
  index.js                一覧。仕様ページが <script> で読む（file:// でも読めるよう JSON ではなく JS にしてある）

消すもの：名前の無い控えは 30 日を過ぎたら消す。名前付き・いちばん新しいものは消さない。
中身は1文字も変えない。控えは「その時点のプロトタイプ」そのもの。
"""
import datetime, hashlib, json, os, pathlib, re, subprocess, sys

KEEP_DAYS = 30
DIRNAME = 'snapshots'
FILE_RE = re.compile(r'^(\d{4}-\d{2}-\d{2})(?:-(\d{2})(\d{2}))?\.html$')
HEAD = ('/* snapshot.py が書き直す一覧。name だけは手で直してよい（次に走らせても残る）。\n'
        '   kind: daily＝その日の最初の変更の前 / take＝手で取った / git＝コミットから起こした */\n')


def resolve(proto):
    p = pathlib.Path(proto)
    if not p.is_absolute():
        p = pathlib.Path(os.environ.get('CLAUDE_PROJECT_DIR') or os.getcwd()) / p
    return p.resolve(), p.resolve().parent / DIRNAME


def digest(path):
    return hashlib.sha1(path.read_bytes()).hexdigest()


def load(d):
    f = d / 'index.js'
    rows = []
    if f.exists():
        m = re.search(r'window\.SNAPSHOTS\s*=\s*(\[.*\])\s*;', f.read_text(encoding='utf-8'), re.S)
        if m:
            try: rows = json.loads(m.group(1))
            except ValueError: rows = []
    # 一覧と実物を突き合わせる。消えたファイルは落とし、一覧に無いファイルは拾う
    rows = [r for r in rows if (d / r.get('file', '')).is_file()]
    have = {r['file'] for r in rows}
    for p in sorted(d.glob('*.html')) if d.is_dir() else []:
        m = FILE_RE.match(p.name)
        if not m or p.name in have: continue
        rows.append({'file': p.name, 'date': m.group(1),
                     'time': f'{m.group(2)}:{m.group(3)}' if m.group(2) else '',
                     'kind': 'take' if m.group(2) else 'daily', 'name': ''})
    return rows


def save(d, rows):
    rows.sort(key=lambda r: (r['date'], r.get('time') or '', r['file']))
    body = ',\n'.join('  ' + json.dumps(r, ensure_ascii=False) for r in rows)
    (d / 'index.js').write_text(f'{HEAD}window.SNAPSHOTS = [\n{body}\n];\n', encoding='utf-8')


def warn_contract(text, where):
    # 仕様の中に並べるには ?frame=1 と postMessage の約束が要る（CLAUDE.md §3）
    if "has('frame')" not in text and 'has("frame")' not in text:
        print(f'注意：{where} のプロトタイプは ?frame=1 に対応していません。仕様の中では端末の枠つきで出ます', file=sys.stderr)


def prune(d, rows, today):
    limit = (today - datetime.timedelta(days=KEEP_DAYS)).isoformat()
    newest = rows[-1]['file'] if rows else None
    keep = []
    for r in rows:
        old = r['date'] < limit and not r.get('name') and r['file'] != newest
        if old and FILE_RE.match(r['file']):
            (d / r['file']).unlink(missing_ok=True)   # 自分で作った控えだけ。名前の形で確かめてから消す
            continue
        keep.append(r)
    return keep


def write_copy(src_bytes, d, fname):
    d.mkdir(exist_ok=True)
    (d / fname).write_bytes(src_bytes)


def same_as(d, rows, data):
    h = hashlib.sha1(data).hexdigest()
    for r in reversed(rows):
        if digest(d / r['file']) == h: return r
    return None


def cmd_daily(proto, quiet=False):
    p, d = resolve(proto)
    if not p.is_file(): return None
    now = datetime.datetime.now(); today = now.date(); ds = today.isoformat()
    mark = d / '.daily'
    if mark.is_file() and mark.read_text().strip() == ds:   # 今日はもう見た
        if not quiet: print('今日はもう確かめてあります（控えは1日1つ）。いまの状態を残すなら take を使う')
        return None
    rows = load(d)
    data = p.read_bytes()
    made = None
    if not any(r['date'] == ds and r['kind'] == 'daily' for r in rows):
        # 最後の控えと中身が同じなら取らない（前の日から変わっていない）。今日の「変更前」はその控えで足りる
        last = rows[-1] if rows else None
        if not (last and digest(d / last['file']) == hashlib.sha1(data).hexdigest()):
            fname = f'{ds}.html'
            write_copy(data, d, fname)
            rows.append({'file': fname, 'date': ds, 'time': now.strftime('%H:%M'), 'kind': 'daily', 'name': ''})
            made = fname
    d.mkdir(exist_ok=True)
    rows = prune(d, rows, today)
    save(d, rows)
    mark.write_text(ds + '\n')
    if not quiet:
        print(f'{DIRNAME}/{made} を取りました' if made else '今日の控えはもうあるか、前の控えから変わっていません')
    return made


def cmd_take(proto, name=''):
    p, d = resolve(proto)
    now = datetime.datetime.now()
    rows = load(d)
    data = p.read_bytes()
    warn_contract(data.decode('utf-8', 'replace'), 'いま')
    dup = same_as(d, rows, data)
    if dup:
        # 中身が同じ控えがあれば増やさず、そちらに名前を付ける
        if name: dup['name'] = name if not dup.get('name') else dup['name'] + '／' + name
        save(d, rows)
        print(f'{DIRNAME}/{dup["file"]} と中身が同じなので、新しくは取りませんでした' + (f'（名前「{dup["name"]}」）' if name else ''))
        return dup['file']
    fname = now.strftime('%Y-%m-%d-%H%M') + '.html'
    write_copy(data, d, fname)
    rows.append({'file': fname, 'date': now.date().isoformat(), 'time': now.strftime('%H:%M'), 'kind': 'take', 'name': name})
    rows = prune(d, rows, now.date())
    save(d, rows)
    print(f'{DIRNAME}/{fname} を取りました' + (f'（名前「{name}」）' if name else '（名前なし。30日で消えます）'))
    return fname


def cmd_git(proto, rev, name=''):
    p, d = resolve(proto)
    top = subprocess.run(['git', '-C', str(p.parent), 'rev-parse', '--show-toplevel'],
                         capture_output=True, text=True, check=True).stdout.strip()
    rel = p.relative_to(pathlib.Path(top).resolve()).as_posix()
    data = subprocess.run(['git', '-C', top, 'show', f'{rev}:{rel}'], capture_output=True, check=True).stdout
    info = subprocess.run(['git', '-C', top, 'log', '-1', '--date=format-local:%Y-%m-%d %H:%M', '--format=%h%x09%ad%x09%s', rev],
                          capture_output=True, text=True, check=True).stdout.strip().split('\t')
    short, when, subject = info[0], info[1], info[2] if len(info) > 2 else ''
    date, time = when.split(' ')
    warn_contract(data.decode('utf-8', 'replace'), short)
    rows = load(d)
    dup = same_as(d, rows, data)
    if dup:
        print(f'{DIRNAME}/{dup["file"]} と中身が同じなので、新しくは取りませんでした'); return dup['file']
    fname = f'{date}-{time.replace(":", "")}.html'
    write_copy(data, d, fname)
    rows.append({'file': fname, 'date': date, 'time': time, 'kind': 'git', 'name': name, 'commit': short, 'subject': subject})
    save(d, rows)
    print(f'{DIRNAME}/{fname} を {short}（{when}）から起こしました' + (f'（名前「{name}」）' if name else ''))
    return fname


def cmd_name(proto, which, name):
    p, d = resolve(proto)
    rows = load(d)
    hit = [r for r in rows if r['file'] in (which, which + '.html')]
    if not hit:
        same_day = [r for r in rows if r['date'] == which]
        # 日付だけのときは、その日の朝の控え（daily）を優先する。無ければその日の最後のもの
        hit = [r for r in same_day if r['kind'] == 'daily'] or same_day[-1:]
    if not hit: sys.exit(f'{which} の控えがありません。list で確かめてください')
    hit[0]['name'] = name
    save(d, rows)
    print(f'{DIRNAME}/{hit[0]["file"]} の名前を' + (f'「{name}」にしました（消えません）' if name else '外しました（30日で消えます）'))


def cmd_list(proto):
    p, d = resolve(proto)
    rows = load(d)
    if not rows: print('控えはまだありません'); return
    kinds = {'daily': '朝', 'take': '手動', 'git': 'git'}
    for r in rows:
        size = (d / r['file']).stat().st_size // 1024
        extra = f' {r["commit"]}' if r.get('commit') else ''
        print(f'{r["date"]} {r.get("time") or "     "}  {kinds.get(r["kind"], r["kind"]):>3}{extra}  {size:>4}KB  {r.get("name") or "（名前なし）"}')


def cmd_hook(proto):
    # フックは何があっても作業を止めない。失敗しても黙って 0 で抜ける
    try:
        data = json.load(sys.stdin)
        ti = data.get('tool_input') or {}
        p, _ = resolve(proto)
        hit = False
        for k in ('file_path', 'path', 'notebook_path'):
            v = ti.get(k)
            if isinstance(v, str) and v:
                try: hit = hit or pathlib.Path(v).resolve() == p
                except OSError: pass
        cmd = ti.get('command')
        if isinstance(cmd, str) and p.name in cmd: hit = True   # 読むだけのコマンドでも取る。変更の前であることに変わりはない
        if not hit or not p.is_file(): return
        made = cmd_daily(proto, quiet=True)
        if made:
            print(json.dumps({'systemMessage': f'プロトタイプの今日の控えを取りました（{DIRNAME}/{made}）。仕様の更新履歴から、変更の前後を並べて見られます'},
                             ensure_ascii=False))
    except Exception:
        return


def main():
    a = sys.argv[1:]
    if len(a) < 2 or a[0] not in ('daily', 'take', 'git', 'name', 'list', 'hook'):
        sys.exit(__doc__)
    cmd, proto, rest = a[0], a[1], a[2:]
    if cmd == 'daily': cmd_daily(proto)
    elif cmd == 'take': cmd_take(proto, rest[0] if rest else '')
    elif cmd == 'git':
        if not rest: sys.exit('使い方: snapshot.py git <プロトタイプ> <コミット> ["名前"]')
        cmd_git(proto, rest[0], rest[1] if len(rest) > 1 else '')
    elif cmd == 'name':
        if len(rest) < 2: sys.exit('使い方: snapshot.py name <プロトタイプ> <日付かファイル名> "名前"')
        cmd_name(proto, rest[0], rest[1])
    elif cmd == 'list': cmd_list(proto)
    elif cmd == 'hook': cmd_hook(proto)


if __name__ == '__main__':
    main()
