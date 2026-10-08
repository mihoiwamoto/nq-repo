#!/usr/bin/env python3
"""
React 実装（react-src/）の控えを取る。画面設計の更新履歴で、変更の前と後の画面を並べて見るため。
画面設計の枠に映っているのは React なので、プロトタイプ HTML の控え（snapshot.py）では前後の差が出ない（2026-10-07）。
控えはその時点のソースを /snapshots/react/<名前>/ の下で動くようにビルドしたもの（1つ 4MB 前後）。

  python3 .claude/react_snapshot.py daily                    今日の控えがまだ無ければ、いまの react-src を取る（1日1つ）
  python3 .claude/react_snapshot.py git <コミット> [日付]     コミットの時点を控えにする。日付を付けると「その日の朝」の控え（daily）にする
  python3 .claude/react_snapshot.py name <名前|日付> "名前"   あとから名前を付ける。"" で外す
  python3 .claude/react_snapshot.py list
  python3 .claude/react_snapshot.py hook                     Claude Code のフックから呼ぶ（標準入力に JSON）。react-src を
                                                               触る日の最初に、いまのソースを写してから裏でビルドする

置き場所：snapshots/react/
  2026-10-07/       その日の最初の変更の前（daily）。中身は vite build の出力
  index.js          一覧（window.REACT_SNAPSHOTS）。画面設計が <script> で読む
消すもの：名前の無い控えは 30 日を過ぎたら消す。名前付き・いちばん新しいものは消さない。
前の控えとソースが同じなら取らない。
"""
import datetime, hashlib, json, os, pathlib, re, shutil, subprocess, sys, tempfile

KEEP_DAYS = 30
ROOT = pathlib.Path(os.environ.get('CLAUDE_PROJECT_DIR') or pathlib.Path(__file__).resolve().parent.parent).resolve()
SRC = ROOT / 'react-src'
OUT = ROOT / 'snapshots' / 'react'
NAME_RE = re.compile(r'^\d{4}-\d{2}-\d{2}(?:-\d{4})?$')
SKIP = {'node_modules', '.shots', '.git'}
HEAD = ('/* react_snapshot.py が書き直す一覧。name だけは手で直してよい（次に走らせても残る）。\n'
        '   kind: daily＝その日の最初の変更の前 / git＝コミットから起こした。file は snapshots/react/ の下のフォルダ */\n')


def load():
    f = OUT / 'index.js'
    rows = []
    if f.exists():
        m = re.search(r'window\.REACT_SNAPSHOTS\s*=\s*(\[.*\])\s*;', f.read_text(encoding='utf-8'), re.S)
        if m:
            try: rows = json.loads(m.group(1))
            except ValueError: rows = []
    return [r for r in rows if (OUT / r.get('file', '') / 'index.html').is_file()]


def save(rows):
    rows.sort(key=lambda r: (r['date'], r.get('time') or '', r['file']))
    body = ',\n'.join('  ' + json.dumps(r, ensure_ascii=False) for r in rows)
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'index.js').write_text(f'{HEAD}window.REACT_SNAPSHOTS = [\n{body}\n];\n', encoding='utf-8')


def ignore(d, names):
    base = pathlib.Path(d).name
    return [n for n in names if n in SKIP or n.startswith('dist') and pathlib.Path(d) == SRC]


def tree_hash(d):
    """ビルドに効くファイルの中身から作る印。作業中のソースとコミットのソースで同じ値になる"""
    h = hashlib.sha1()
    for p in sorted(pathlib.Path(d).rglob('*')):
        rel = p.relative_to(d).as_posix()
        if not p.is_file() or rel.split('/')[0] not in ('src', 'public', 'images', 'index.html', 'package.json', 'vite.config.ts'):
            continue
        h.update(rel.encode()); h.update(b'\0'); h.update(p.read_bytes())
    return h.hexdigest()


def copy_work():
    tmp = pathlib.Path(tempfile.mkdtemp(prefix='nq-react-snap-'))
    shutil.copytree(SRC, tmp / 'react-src', ignore=ignore, symlinks=True)
    return tmp / 'react-src'


def copy_git(rev):
    tmp = pathlib.Path(tempfile.mkdtemp(prefix='nq-react-snap-'))
    arc = subprocess.run(['git', '-C', str(ROOT), 'archive', rev, 'react-src'], capture_output=True, check=True).stdout
    subprocess.run(['tar', '-x', '-C', str(tmp)], input=arc, check=True)
    return tmp / 'react-src'


def build(src, name):
    """src（写したソース）を /snapshots/react/<name>/ で動くようにビルドして、OUT/<name> に置く"""
    nm = src / 'node_modules'
    if not nm.exists(): nm.symlink_to(SRC / 'node_modules')
    dest = OUT / name
    tmp_out = OUT / f'.building-{name}'
    shutil.rmtree(tmp_out, ignore_errors=True)
    r = subprocess.run([str(SRC / 'node_modules' / '.bin' / 'vite'), 'build', f'--base=/snapshots/react/{name}/',
                        f'--outDir={tmp_out}', '--emptyOutDir', '--logLevel=error'],
                       cwd=src, capture_output=True, text=True)
    if r.returncode != 0 or not (tmp_out / 'index.html').is_file():
        shutil.rmtree(tmp_out, ignore_errors=True)
        raise RuntimeError(f'ビルドに失敗しました：\n{r.stdout}\n{r.stderr}')
    shutil.rmtree(dest, ignore_errors=True)
    tmp_out.rename(dest)


def prune(rows, today):
    limit = (today - datetime.timedelta(days=KEEP_DAYS)).isoformat()
    newest = rows[-1]['file'] if rows else None
    keep = []
    for r in rows:
        if r['date'] < limit and not r.get('name') and r['file'] != newest and NAME_RE.match(r['file']):
            shutil.rmtree(OUT / r['file'], ignore_errors=True)   # 自分で作った控えだけ。名前の形で確かめてから消す
            continue
        keep.append(r)
    return keep


def add(src, row, quiet=False):
    """写したソース src を控え row にする。前の控えとソースが同じなら取らない"""
    try:
        rows = load()
        row['src'] = tree_hash(src)
        dup = next((r for r in reversed(rows) if r.get('src') == row['src'] and r['date'] <= row['date']), None)
        if dup and row['kind'] == 'daily' and rows and rows[-1] is dup:
            if not quiet: print(f'前の控え（{dup["file"]}）とソースが同じなので取りませんでした')
            return None
        build(src, row['file'])
        rows = [r for r in load() if r['file'] != row['file']] + [row]
        save(prune(rows, datetime.date.today()))
        if not quiet: print(f'snapshots/react/{row["file"]}/ を取りました')
        return row['file']
    finally:
        shutil.rmtree(src.parent, ignore_errors=True)


def cmd_daily(quiet=False):
    now = datetime.datetime.now(); ds = now.date().isoformat()
    if any(r['date'] == ds and r['kind'] == 'daily' for r in load()):
        if not quiet: print('今日の控えはもうあります（1日1つ）')
        return None
    return add(copy_work(), {'file': ds, 'date': ds, 'time': now.strftime('%H:%M'), 'kind': 'daily', 'name': ''}, quiet)


def cmd_git(rev, day=''):
    info = subprocess.run(['git', '-C', str(ROOT), 'log', '-1', '--date=format-local:%Y-%m-%d %H:%M', '--format=%h%x09%ad%x09%s', rev],
                          capture_output=True, text=True, check=True).stdout.strip().split('\t')
    short, when, subject = info[0], info[1], info[2] if len(info) > 2 else ''
    if day:   # その日の朝の控え＝前の日までの最後のコミット
        row = {'file': day, 'date': day, 'time': '', 'kind': 'daily', 'name': ''}
    else:
        date, time = when.split(' ')
        row = {'file': f'{date}-{time.replace(":", "")}', 'date': date, 'time': time, 'kind': 'git', 'name': ''}
    row.update(commit=short, subject=subject)
    return add(copy_git(rev), row)


def cmd_name(which, name):
    rows = load()
    hit = [r for r in rows if r['file'] == which] or [r for r in rows if r['date'] == which]
    if not hit: sys.exit(f'{which} の控えがありません。list で確かめてください')
    hit[0]['name'] = name
    save(rows)
    print(f'snapshots/react/{hit[0]["file"]} の名前を' + (f'「{name}」にしました（消えません）' if name else '外しました（30日で消えます）'))


def cmd_list():
    rows = load()
    if not rows: print('控えはまだありません'); return
    for r in rows:
        print(f'{r["date"]} {r.get("time") or "     "}  {r["kind"]:>5} {r.get("commit", ""):>7}  {r.get("name") or "（名前なし）"}')


def cmd_hook():
    # フックは何があっても作業を止めない。失敗しても黙って 0 で抜ける
    try:
        data = json.load(sys.stdin)
        ti = data.get('tool_input') or {}
        hit = False
        for k in ('file_path', 'path', 'notebook_path'):
            v = ti.get(k)
            if isinstance(v, str) and v:
                try: hit = hit or SRC in pathlib.Path(v).resolve().parents
                except OSError: pass
        cmd = ti.get('command')
        if isinstance(cmd, str) and 'react-src' in cmd and not cmd.lstrip().startswith(('git ', 'ls', 'cat ', 'grep', 'rg ', 'find ', 'head', 'sed -n', 'du ')): hit = True
        if not hit: return
        ds = datetime.date.today().isoformat()
        mark = OUT / '.daily'
        if mark.is_file() and mark.read_text().strip() == ds: return
        OUT.mkdir(parents=True, exist_ok=True)
        mark.write_text(ds + '\n')
        if any(r['date'] == ds and r['kind'] == 'daily' for r in load()): return
        # 変更の前のソースをいま写し、ビルドは裏で（フックの時間制限に収まらないため）
        src = copy_work()
        now = datetime.datetime.now()
        row = {'file': ds, 'date': ds, 'time': now.strftime('%H:%M'), 'kind': 'daily', 'name': ''}
        subprocess.Popen([sys.executable, __file__, '_build', str(src), json.dumps(row, ensure_ascii=False)],
                         stdout=subprocess.DEVNULL, stderr=open(OUT / '.build.log', 'w'), start_new_session=True)
        print(json.dumps({'systemMessage': f'React の今日の控えを取っています（snapshots/react/{ds}/）。画面設計の更新履歴から、変更の前後を並べて見られます'},
                         ensure_ascii=False))
    except Exception:
        return


def main():
    a = sys.argv[1:]
    if not a or a[0] not in ('daily', 'git', 'name', 'list', 'hook', '_build'): sys.exit(__doc__)
    cmd, rest = a[0], a[1:]
    if cmd == 'daily': cmd_daily()
    elif cmd == 'git':
        if not rest: sys.exit('使い方: react_snapshot.py git <コミット> [その日の朝として扱う日付]')
        cmd_git(rest[0], rest[1] if len(rest) > 1 else '')
    elif cmd == 'name':
        if len(rest) < 2: sys.exit('使い方: react_snapshot.py name <名前か日付> "名前"')
        cmd_name(rest[0], rest[1])
    elif cmd == 'list': cmd_list()
    elif cmd == 'hook': cmd_hook()
    elif cmd == '_build': add(pathlib.Path(rest[0]), json.loads(rest[1]), quiet=True)


if __name__ == '__main__':
    main()
