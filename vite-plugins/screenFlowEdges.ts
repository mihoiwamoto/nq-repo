/**
 * 画面遷移図（/admin/guide/flow）用に、各画面のソースから「どこへ遷移するか」を抜き出す Vite プラグイン。
 *
 * `virtual:screen-flow-edges` を import すると、
 *   { from: 画面ファイル, to: 画面ファイル, target: 遷移先の URL パターン }[]
 * が得られる。from/to は .claude/screen-map.json の filePath と同じ文字列。
 *
 * 抜き出し方は正規表現ベースの簡易なもの:
 *   - navigate("...") / navigate(`${basePath}/...`) / navigate(pathVar)
 *   - <Link to="..."> / to={`...`} / href= / backTo= など
 *   - `const basePath = \`/admin/.../${factoryId}\`` のような変数は中身を展開する
 *   - `${...}` の残りは「何でもよい 1 セグメント」として扱い、画面のルート定義（:param）と突き合わせる
 * ボタン単位まで完全ではないが、URL の親子関係だけで組むより実際の遷移に近い。
 *
 * ソース（*Page.tsx）を編集すると仮想モジュールを無効化するので、遷移図を再読み込みすれば追従する。
 */
import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

const VIRTUAL_ID = "virtual:screen-flow-edges";
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

type Screen = { filePath: string; routes: string[] };
export type CodeEdge = { from: string; to: string; target: string };

const LITERAL_RE = /`[^`]*`|"[^"\n]*"|'[^'\n]*'/g;
const IDENT_RE = /^[A-Za-z_$][\w$]*$/;
/** 遷移先として拾う JSX 属性 */
const NAV_ATTRS = ["to", "href", "backTo", "backPath", "backHref", "returnTo", "nextPath", "cancelTo", "listPath", "detailPath"];

function unquote(lit: string): string {
  return lit.slice(1, -1);
}

/** ファイル内の `const 名前 = リテラル` を集める（パス変数の展開用） */
function collectVars(src: string): Map<string, string> {
  const vars = new Map<string, string>();
  const re = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(`[^`]*`|"[^"\n]*"|'[^'\n]*')/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const val = unquote(m[2]);
    if (val.startsWith("/") || val.includes("${")) vars.set(m[1], val);
  }
  return vars;
}

/** `${basePath}` のような変数参照を展開し、残った `${...}` を `*` にする */
function expand(lit: string, vars: Map<string, string>, depth = 0): string {
  return lit.replace(/\$\{([^{}]*)\}/g, (_, expr: string) => {
    const name = expr.trim();
    if (depth < 4 && IDENT_RE.test(name) && vars.has(name)) return expand(vars.get(name)!, vars, depth + 1);
    return "*";
  });
}

function toSegments(p: string): string[] {
  return p.split(/[?#]/)[0].split("/").filter((s) => s && s !== ".");
}

/** 相対パス（"new" / ".." / `factories/${id}`）を、その画面のルート定義に対して解決する */
function resolveRelative(target: string, ownRoute: string): string {
  const base = toSegments(ownRoute);
  for (const seg of toSegments(target)) {
    if (seg === "..") base.pop();
    else base.push(seg);
  }
  return `/${base.join("/")}`;
}

/** 遷移先っぽいリテラル・識別子を、遷移コンテキスト（navigate( / to= など）から拾う */
function collectTargetExprs(src: string): string[] {
  const out: string[] = [];
  // navigate( ... ) : 直後 240 文字の中のリテラルと先頭の識別子
  const navRe = /\bnavigate\(\s*/g;
  let m: RegExpExecArray | null;
  while ((m = navRe.exec(src))) {
    const chunk = src.slice(m.index + m[0].length, m.index + m[0].length + 240);
    const firstArg = chunk.split(/[,)]/)[0].trim();
    if (IDENT_RE.test(firstArg)) out.push(`@${firstArg}`);
    const lits = chunk.split(/\n\s*\}\s*\)/)[0].match(LITERAL_RE) ?? [];
    for (const l of lits) out.push(unquote(l));
  }
  // to= / href= / backTo= …
  const attrRe = new RegExp(`\\b(?:${NAV_ATTRS.join("|")})=\\{?\\s*(\`[^\`]*\`|"[^"\\n]*"|'[^'\\n]*'|[A-Za-z_$][\\w$]*)`, "g");
  while ((m = attrRe.exec(src))) {
    const v = m[1];
    if (IDENT_RE.test(v)) out.push(`@${v}`);
    else out.push(unquote(v));
  }
  // ファイル内のどこかにある絶対パスのリテラル（/admin/… /app/…）
  const absRe = /`\/(?:admin|app)\/[^`]*`|"\/(?:admin|app)\/[^"\n]*"|'\/(?:admin|app)\/[^'\n]*'/g;
  while ((m = absRe.exec(src))) out.push(unquote(m[0]));
  return out;
}

/** 1 ファイルから、正規化済みの遷移先パターン（セグメント配列）を返す */
function extractTargets(src: string, ownRoutes: string[]): string[][] {
  const vars = collectVars(src);
  const results = new Set<string>();
  for (const raw of collectTargetExprs(src)) {
    let lit: string | undefined;
    if (raw.startsWith("@")) {
      lit = vars.get(raw.slice(1));
      if (!lit) continue;
    } else {
      lit = raw;
    }
    // パスに見えないもの（空白を含む、URL でない文字列）は捨てる
    if (!lit || /\s/.test(lit) || /^(https?:|mailto:|#)/.test(lit)) continue;
    const expanded = expand(lit, vars);
    if (expanded.startsWith("/")) {
      results.add(toSegments(expanded).join("/"));
    } else if (/^(\.\.|[a-z0-9*]+[a-z0-9*/${}.-]*)$/i.test(expanded) && !/^\d+$/.test(expanded)) {
      for (const own of ownRoutes) results.add(toSegments(resolveRelative(expanded, own)).join("/"));
    }
  }
  return Array.from(results).map((s) => s.split("/"));
}

/** 遷移先パターンとルート定義の一致（同じ段数で、各段が一致するか、どちらかがワイルドカード/パラメータ） */
function segMatch(target: string[], route: string[]): { ok: boolean; literalHits: number; expandedWildcard: boolean } {
  if (target.length !== route.length) return { ok: false, literalHits: 0, expandedWildcard: false };
  let literalHits = 0;
  let expandedWildcard = false;
  for (let i = 0; i < target.length; i++) {
    const t = target[i];
    const r = route[i];
    if (t === r) literalHits += 1;
    else if (r.startsWith(":")) {
      /* パラメータには何でも入る */
    } else if (t === "*") expandedWildcard = true;
    else return { ok: false, literalHits: 0, expandedWildcard: false };
  }
  return { ok: true, literalHits, expandedWildcard };
}

export function buildEdges(root: string): CodeEdge[] {
  const mapPath = path.join(root, ".claude", "screen-map.json");
  if (!fs.existsSync(mapPath)) return [];
  const screens = (JSON.parse(fs.readFileSync(mapPath, "utf8")) as { screens: Screen[] }).screens.filter((s) => s.routes.length > 0);
  const routeSegs = screens.map((s) => ({ screen: s, routes: s.routes.map(toSegments) }));

  const edges = new Map<string, CodeEdge>();
  for (const s of screens) {
    const abs = path.join(root, s.filePath);
    if (!fs.existsSync(abs)) continue;
    const src = fs.readFileSync(abs, "utf8");
    for (const target of extractTargets(src, s.routes)) {
      // 一致候補: ワイルドカードがパラメータに当たった「汎用」候補があればそれだけ、無ければリテラル展開の候補
      const generic: { screen: Screen; hits: number }[] = [];
      const expanded: { screen: Screen; hits: number }[] = [];
      for (const cand of routeSegs) {
        if (cand.screen.filePath === s.filePath) continue;
        for (const r of cand.routes) {
          const res = segMatch(target, r);
          if (!res.ok) continue;
          (res.expandedWildcard ? expanded : generic).push({ screen: cand.screen, hits: res.literalHits });
          break;
        }
      }
      let picked = generic;
      if (!picked.length) picked = expanded.length <= 15 ? expanded : [];
      if (!picked.length) continue;
      const best = Math.max(...picked.map((p) => p.hits));
      for (const p of picked.filter((p) => p.hits === best)) {
        const key = `${s.filePath}→${p.screen.filePath}`;
        if (!edges.has(key)) edges.set(key, { from: s.filePath, to: p.screen.filePath, target: `/${target.join("/")}` });
      }
    }
  }
  return Array.from(edges.values());
}

export default function screenFlowEdges(): Plugin {
  let root = process.cwd();
  return {
    name: "nq-screen-flow-edges",
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null;
    },
    load(id) {
      if (id !== RESOLVED_ID) return null;
      return `export default ${JSON.stringify(buildEdges(root))};`;
    },
    configureServer(server) {
      // 画面ファイルが変わったら仮想モジュールを無効化する（遷移図を再読み込みすれば新しい遷移になる）
      const invalidate = (file: string) => {
        if (!/Page\.tsx$/.test(file) && !file.endsWith("screen-map.json")) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
      };
      server.watcher.on("change", invalidate);
      server.watcher.on("add", invalidate);
      server.watcher.on("unlink", invalidate);
    },
  };
}
