#!/usr/bin/env node
/**
 * PostToolUse フック。
 * 編集直後のファイルを .claude/.baseline/ のスナップショットと比較して
 *   1. どの画面が変わったか（直接編集 / 共通部品経由の波及）
 *   2. その画面の「どの部分」が変わったか（見出し・セクション単位）
 *   3. 実際の差分（追加/削除行）
 * を .claude/edited_screens.json に記録する。
 *
 * 単体テスト:  node .claude/track-edits.cjs src/admin/features/account/AccountPage.tsx
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { extractSections, sectionsForLines } = require("./lib/analyze.cjs");

const ROOT = path.resolve(__dirname, "..");
const BASELINE_DIR = path.join(__dirname, ".baseline");
const MAP_PATH = path.join(__dirname, "screen-map.json");
const IMPACT_PATH = path.join(__dirname, "impact-index.json");
const EDITS_PATH = path.join(__dirname, "edited_screens.json");
const DATA_JS_PATH = path.join(__dirname, "screen-data.js");

const MAX_HUNKS = 12;
const MAX_HUNK_LINES = 24;

/* ------------------------------------------------------------------ */
/* 入力                                                                */
/* ------------------------------------------------------------------ */

function resolveTargetFile() {
  let filePath = null;
  try {
    const raw = fs.readFileSync(0, "utf8");
    if (raw.trim()) {
      const payload = JSON.parse(raw);
      filePath =
        payload?.tool_input?.file_path || payload?.tool_input?.notebook_path || null;
    }
  } catch {
    /* stdin が無い / JSON でない場合は引数へ */
  }
  if (!filePath) filePath = process.argv[2];
  if (!filePath) return null;

  const abs = path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
  const rel = path.relative(ROOT, abs);
  if (rel.startsWith("..") || rel.startsWith(".claude/")) return null;
  return { abs, rel };
}

/* ------------------------------------------------------------------ */
/* 差分                                                                */
/* ------------------------------------------------------------------ */

/** ベースラインと現在の内容を比較して hunk 配列を返す */
function diffAgainstBaseline(abs, rel) {
  const snap = path.join(BASELINE_DIR, encodeURIComponent(rel));
  const before = fs.existsSync(snap) ? fs.readFileSync(snap, "utf8") : null;
  const after = fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : "";

  // スナップショットが無い＝この画面は今回のセッションで初めて触られていない
  if (before === null) return null;
  if (before === after) return { added: 0, removed: 0, hunks: [], changedLines: [] };

  let raw = "";
  try {
    raw = execFileSync(
      "git",
      ["diff", "--no-index", "--no-color", "--unified=3", "--", snap, abs],
      { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
    );
  } catch (e) {
    // git diff は差分があると exit 1 を返す（＝正常系）
    raw = e.stdout ? e.stdout.toString() : "";
  }
  return parseUnifiedDiff(raw);
}

function parseUnifiedDiff(raw) {
  const hunks = [];
  const changedLines = [];
  let added = 0;
  let removed = 0;
  let current = null;
  let newLineNo = 0;

  for (const line of raw.split("\n")) {
    const header = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@(.*)$/);
    if (header) {
      newLineNo = parseInt(header[1], 10);
      current = {
        startLine: newLineNo,
        context: header[3].trim().slice(0, 60),
        lines: [],
      };
      hunks.push(current);
      continue;
    }
    if (!current) continue;
    if (line.startsWith("+++") || line.startsWith("---")) continue;

    if (line.startsWith("+")) {
      added++;
      changedLines.push(newLineNo);
      if (current.lines.length < MAX_HUNK_LINES)
        current.lines.push({ t: "+", n: newLineNo, s: line.slice(1) });
      newLineNo++;
    } else if (line.startsWith("-")) {
      removed++;
      if (current.lines.length < MAX_HUNK_LINES)
        current.lines.push({ t: "-", n: null, s: line.slice(1) });
    } else if (line.startsWith(" ")) {
      if (current.lines.length < MAX_HUNK_LINES)
        current.lines.push({ t: " ", n: newLineNo, s: line.slice(1) });
      newLineNo++;
    }
  }

  return { added, removed, hunks: hunks.slice(0, MAX_HUNKS), changedLines };
}

/* ------------------------------------------------------------------ */
/* 記録                                                                */
/* ------------------------------------------------------------------ */

function loadJson(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return fallback;
  }
}

function emptyState() {
  return { lastUpdated: null, startedAt: new Date().toISOString(), screens: {}, files: {} };
}

function main() {
  const target = resolveTargetFile();
  if (!target) return;

  const { abs, rel } = target;
  const map = loadJson(MAP_PATH, null);
  if (!map) {
    console.error("screen-map.json がありません。node .claude/generate-screen-map.cjs を実行してください");
    return;
  }

  const diff = diffAgainstBaseline(abs, rel);
  if (!diff || (diff.added === 0 && diff.removed === 0)) return;

  const impact = loadJson(IMPACT_PATH, { impact: {} }).impact;
  const state = loadJson(EDITS_PATH, emptyState());
  state.screens ||= {};
  state.files ||= {};
  const now = new Date().toISOString();

  // このファイル自体の変更記録
  state.files[rel] = {
    filePath: rel,
    added: diff.added,
    removed: diff.removed,
    hunks: diff.hunks,
    lastEditedAt: now,
    editCount: (state.files[rel]?.editCount || 0) + 1,
  };

  const screenByPath = new Map(map.screens.map((s) => [s.filePath, s]));
  const directScreen = screenByPath.get(rel);

  if (directScreen) {
    /* --- 画面ファイルそのものを編集した --- */
    const source = fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : "";
    const sections = extractSections(source);
    const changedSections = sectionsForLines(sections, diff.changedLines).slice(0, 8);

    const prev = state.screens[directScreen.id];
    state.screens[directScreen.id] = {
      id: directScreen.id,
      displayName: directScreen.displayName,
      filePath: rel,
      category: directScreen.category,
      feature: directScreen.feature,
      routes: directScreen.routes,
      level: "direct",
      added: (prev?.level === "direct" ? prev.added : 0) + diff.added,
      removed: (prev?.level === "direct" ? prev.removed : 0) + diff.removed,
      changedSections,
      hunks: diff.hunks,
      via: [],
      firstEditedAt: prev?.firstEditedAt || now,
      lastEditedAt: now,
      editCount: (prev?.editCount || 0) + 1,
    };
  } else {
    /* --- 共通部品を編集した → 波及先の画面に印をつける --- */
    const affected = impact[rel] || [];
    for (const id of affected) {
      const screen = map.screens.find((s) => s.id === id);
      if (!screen) continue;
      const prev = state.screens[id];
      if (prev?.level === "direct") {
        // 直接編集の印のほうが強いので上書きしない。経由ファイルだけ足す
        prev.via = [...new Set([...(prev.via || []), rel])];
        prev.lastEditedAt = now;
        continue;
      }
      state.screens[id] = {
        id,
        displayName: screen.displayName,
        filePath: screen.filePath,
        category: screen.category,
        feature: screen.feature,
        routes: screen.routes,
        level: "impact",
        added: 0,
        removed: 0,
        changedSections: [],
        hunks: [],
        via: [...new Set([...(prev?.via || []), rel])],
        firstEditedAt: prev?.firstEditedAt || now,
        lastEditedAt: now,
        editCount: (prev?.editCount || 0) + 1,
      };
    }
  }

  state.lastUpdated = now;
  fs.writeFileSync(EDITS_PATH, JSON.stringify(state, null, 2));
  writeDataJs(map, state);

  const list = Object.values(state.screens);
  const direct = list.filter((s) => s.level === "direct").length;
  const indirect = list.length - direct;
  const label = directScreen ? directScreen.displayName : rel;
  console.log(
    `[screen-map] ${label}  +${diff.added}/-${diff.removed}  ` +
      `(直接 ${direct} 画面 / 波及 ${indirect} 画面)`,
  );
}

/**
 * file:// でダッシュボードを直接開いても動くように、
 * JSON を <script> で読める JS としても書き出す。
 */
function writeDataJs(map, state) {
  const js =
    "// 自動生成 — 直接編集しないでください\n" +
    "window.__SCREEN_MAP__ = " + JSON.stringify(map) + ";\n" +
    "window.__SCREEN_EDITS__ = " + JSON.stringify(state) + ";\n";
  fs.writeFileSync(DATA_JS_PATH, js);
}

try {
  main();
} catch (err) {
  console.error("[screen-map] 追跡に失敗:", err.message);
}
