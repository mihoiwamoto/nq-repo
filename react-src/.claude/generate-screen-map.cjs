#!/usr/bin/env node
/**
 * Screen Map Generator
 *
 * src 配下の *Page.tsx を全てスキャンし、以下を screen-map.json に書き出す:
 *   - 画面ID / 表示名 / ファイルパス / カテゴリ / feature名
 *   - ルート(URL)      … App.tsx の <Route> ツリーを解析して対応付け
 *   - structure        … サムネイル(ワイヤーフレーム)描画用の構造ブロック
 *   - sections         … ファイル内の「部分」= 関数/コンポーネント単位の行範囲
 *
 * 使い方: node .claude/generate-screen-map.js
 */

const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const APP_TSX = path.join(SRC, "App.tsx");
const { extractStructure, extractSections } = require("./lib/analyze.cjs");

/* ------------------------------------------------------------------ */
/* 1. Page.tsx を全部集める                                            */
/* ------------------------------------------------------------------ */

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      walk(full, out);
    } else if (entry.isFile() && /Page\.tsx$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* 2. App.tsx のルート解析                                             */
/* ------------------------------------------------------------------ */

/** import { A as B } from "./x" → { B: "src/x.tsx" } */
function parseImports(source) {
  const map = {};
  const re = /import\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(source))) {
    const spec = m[2];
    if (!spec.startsWith(".")) continue;
    const resolved = resolveImport(spec);
    if (!resolved) continue;
    for (const part of m[1].split(",")) {
      const [orig, alias] = part.split(/\s+as\s+/).map((s) => s.trim());
      if (!orig) continue;
      map[alias || orig] = resolved;
    }
  }
  return map;
}

function resolveImport(spec) {
  const base = path.resolve(SRC, spec);
  for (const cand of [base + ".tsx", base + ".ts", path.join(base, "index.tsx")]) {
    if (fs.existsSync(cand)) return path.relative(ROOT, cand);
  }
  return null;
}

/**
 * <Route> ツリーを走査して コンポーネント名 → URL の一覧を作る。
 * element={<Foo />} の中の `/>` を誤検出しないよう、波括弧の深さを見ながら
 * タグの終端を手で探す簡易スキャナ。
 */
function parseRoutes(source) {
  const result = {}; // componentName -> [url, ...]
  const stack = []; // 親の path セグメント
  let i = 0;

  while (i < source.length) {
    const openIdx = source.indexOf("<Route", i);
    const closeIdx = source.indexOf("</Route>", i);

    if (openIdx === -1 && closeIdx === -1) break;

    if (closeIdx !== -1 && (openIdx === -1 || closeIdx < openIdx)) {
      stack.pop();
      i = closeIdx + 8;
      continue;
    }

    // タグ終端を探す（{} の外側にある '>' ）
    let depth = 0;
    let j = openIdx + 6;
    let end = -1;
    for (; j < source.length; j++) {
      const ch = source[j];
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
      else if (ch === ">" && depth === 0) {
        end = j;
        break;
      }
    }
    if (end === -1) break;

    const tag = source.slice(openIdx, end + 1);
    const selfClosing = /\/\s*>$/.test(tag);

    const pathMatch = tag.match(/\bpath\s*=\s*["']([^"']*)["']/);
    const elMatch = tag.match(/\belement\s*=\s*\{\s*<\s*([A-Za-z0-9_]+)/);
    const seg = pathMatch ? pathMatch[1] : "";

    const url = joinPath(stack, seg);
    if (elMatch) {
      (result[elMatch[1]] ||= []).push(url);
    }

    if (!selfClosing) stack.push(seg);
    i = end + 1;
  }
  return result;
}

function joinPath(stack, seg) {
  const parts = [...stack, seg].filter(Boolean).join("/");
  const url = "/" + parts.replace(/^\/+/, "").replace(/\/{2,}/g, "/");
  return url === "/" ? "/" : url.replace(/\/$/, "");
}

/* ------------------------------------------------------------------ */
/* 3.5 依存グラフ（共通コンポーネント → 影響を受ける画面）              */
/* ------------------------------------------------------------------ */

const importCache = new Map();

/** そのファイルが直接 import しているプロジェクト内ファイル */
function directDeps(relPath) {
  if (importCache.has(relPath)) return importCache.get(relPath);
  const abs = path.join(ROOT, relPath);
  let deps = [];
  if (fs.existsSync(abs)) {
    const src = fs.readFileSync(abs, "utf8");
    const re = /(?:from\s*|import\s*\(\s*)["'](\.[^"']+)["']/g;
    let m;
    while ((m = re.exec(src))) {
      const resolved = resolveFrom(abs, m[1]);
      if (resolved) deps.push(resolved);
    }
    deps = [...new Set(deps)];
  }
  importCache.set(relPath, deps);
  return deps;
}

function resolveFrom(fromAbs, spec) {
  const base = path.resolve(path.dirname(fromAbs), spec);
  const cands = [
    base + ".tsx", base + ".ts",
    path.join(base, "index.tsx"), path.join(base, "index.ts"),
  ];
  for (const c of cands) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return path.relative(ROOT, c);
  }
  return null;
}

/** 画面から辿れる全ファイル（深さ制限つき） */
function collectDeps(entry, maxDepth = 5) {
  const seen = new Set();
  const queue = [[entry, 0]];
  while (queue.length) {
    const [file, depth] = queue.shift();
    if (depth >= maxDepth) continue;
    for (const dep of directDeps(file)) {
      if (seen.has(dep)) continue;
      seen.add(dep);
      queue.push([dep, depth + 1]);
    }
  }
  return seen;
}

/** filePath -> 影響を受ける画面ID の逆引き表を作る */
function buildImpactIndex(screens) {
  const index = {};
  for (const screen of screens) {
    for (const dep of collectDeps(screen.filePath)) {
      (index[dep] ||= []).push(screen.id);
    }
  }
  return index;
}

/* ------------------------------------------------------------------ */
/* 4. メタ情報                                                          */
/* ------------------------------------------------------------------ */

/**
 * 画面 ID はファイルパスから決める。
 *
 * 以前は走査順の連番（screen_1, screen_2 …）にしていたが、
 * Page.tsx を 1 つ追加・削除するだけで以降の ID が全部ずれてしまい、
 * 撮影済みスクリーンショットや編集記録との対応が黙って壊れた。
 * パス由来なら、他のファイルが増えても減っても ID は動かない。
 */
function screenId(relPath) {
  return "scr_" + crypto.createHash("sha1").update(relPath).digest("hex").slice(0, 10);
}

/**
 * 画面カードのタイトルを、コンポーネント名ではなく実際にアプリ上で
 * 表示される見出し（Figma でいう「フレーム名」）にする。
 * PageTitleBar / AppHeader の title props から拾う。
 */
function extractFrameTitle(source) {
  const m = source.match(/<(?:PageTitleBar|AppHeader)\b[^>]*?\btitle=(?:"([^"]*)"|\{([^}]*)\})/);
  if (!m) return null;
  if (m[1] != null) return m[1].trim() || null;

  const expr = m[2];

  // テンプレートリテラル: `金属/X線探知機記録_${machine.name}` → 固定部分だけ使う
  const tpl = expr.match(/`([^`]*)`/);
  if (tpl) {
    const head = tpl[1].split("${")[0].replace(/[_\-\s]+$/, "").trim();
    if (head) return head;
  }

  // 三項演算子など: isEditing ? "編集" : "新規登録" → 最後の文字列（既定側）を使う
  const strings = [...expr.matchAll(/"([^"]*)"/g)].map((x) => x[1]);
  if (strings.length) return strings[strings.length - 1];

  return null;
}

function humanize(fileName) {
  return fileName
    .replace(/Page\.tsx$/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim() || "Index";
}

function categoryOf(rel) {
  if (rel.startsWith("src/admin/")) return "Admin";
  if (rel.startsWith("src/app/")) return "App";
  return "Common";
}

/** src/admin/features/account/AccountPage.tsx → "account" */
function featureOf(rel) {
  const parts = rel.split("/");
  const fIdx = parts.indexOf("features");
  if (fIdx !== -1 && parts[fIdx + 1]) return parts[fIdx + 1];
  const pIdx = parts.indexOf("pages");
  if (pIdx !== -1) return "pages";
  return parts[1] || "root";
}

/* ------------------------------------------------------------------ */
/* 5. 実行                                                              */
/* ------------------------------------------------------------------ */

function main() {
  const appSource = fs.existsSync(APP_TSX) ? fs.readFileSync(APP_TSX, "utf8") : "";
  const importMap = parseImports(appSource);
  const routeMap = parseRoutes(appSource);

  // filePath -> [url]
  const fileRoutes = {};
  for (const [component, urls] of Object.entries(routeMap)) {
    const file = importMap[component];
    if (file) (fileRoutes[file] ||= []).push(...urls);
  }

  const files = walk(SRC).sort();
  const screens = files.map((abs) => {
    const rel = path.relative(ROOT, abs);
    const source = fs.readFileSync(abs, "utf8");
    return {
      id: screenId(rel),
      displayName: humanize(path.basename(abs)),
      frameTitle: extractFrameTitle(source) || humanize(path.basename(abs)),
      filePath: rel,
      category: categoryOf(rel),
      feature: featureOf(rel),
      routes: [...new Set(fileRoutes[rel] || [])],
      lineCount: source.split("\n").length,
      structure: extractStructure(source),
      sections: extractSections(source).map(({ name, startLine, endLine, kind }) => ({
        name,
        startLine,
        endLine,
        kind,
      })),
    };
  });

  const out = {
    generatedAt: new Date().toISOString(),
    screenCount: screens.length,
    screens,
  };

  fs.writeFileSync(
    path.join(__dirname, "screen-map.json"),
    JSON.stringify(out, null, 2),
  );

  // 共通コンポーネントを触ったときに「どの画面に波及するか」を引くための索引
  const impact = buildImpactIndex(screens);
  fs.writeFileSync(
    path.join(__dirname, "impact-index.json"),
    JSON.stringify({ generatedAt: out.generatedAt, impact }, null, 2),
  );

  const withRoutes = screens.filter((s) => s.routes.length).length;
  console.log(`✓ screen-map.json を生成しました`);
  console.log(`  画面数: ${screens.length}  (Admin ${screens.filter(s=>s.category==='Admin').length} / App ${screens.filter(s=>s.category==='App').length} / Common ${screens.filter(s=>s.category==='Common').length})`);
  console.log(`  ルート紐付け済み: ${withRoutes} 画面`);
  console.log(`✓ impact-index.json を生成しました (${Object.keys(impact).length} ファイルの波及先)`);
}

main();
