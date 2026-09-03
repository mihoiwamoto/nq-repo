#!/usr/bin/env node
/**
 * 今回のセッションで何が変わったかを端末に要約する。
 * Claude は作業の最後にこれを実行して、結果をユーザーに日本語で報告すること。
 *
 *   node .claude/report.cjs          … 要約
 *   node .claude/report.cjs --full   … 波及先の画面名も全部出す
 */
const fs = require("fs");
const path = require("path");

const EDITS = path.join(__dirname, "edited_screens.json");
const SHOTS = path.join(__dirname, "shots-index.json");
const full = process.argv.includes("--full");

let state;
try {
  state = JSON.parse(fs.readFileSync(EDITS, "utf8"));
} catch {
  console.log("まだ変更は記録されていません。");
  process.exit(0);
}

let shots = { screens: {} };
try {
  shots = JSON.parse(fs.readFileSync(SHOTS, "utf8"));
} catch { /* まだ撮影していない */ }

/** 「見た目 12.3%」の一行。差分が無ければ空文字。 */
function visual(id) {
  const d = shots.screens?.[id]?.diff;
  if (!d) return "";
  if (d.changed === 0) return "  見た目: 変化なし";
  const shift = d.shift
    ? `　※ 大半は${d.shift.dy > 0 ? "下" : "上"}に ${Math.abs(d.shift.dy)}px ずれただけ`
    : "";
  return `  見た目: ${(d.ratio * 100).toFixed(2)}% が変化 (${d.boxes.length} 箇所)` +
    (d.sizeChanged ? " ※ページの高さが変わっています" : "") + shift;
}

const screens = Object.values(state.screens || {});
const files = Object.values(state.files || {});

if (!screens.length && !files.length) {
  console.log("今回のセッションでの画面変更はありません。");
  process.exit(0);
}

const direct = screens.filter((s) => s.level === "direct");
const impact = screens.filter((s) => s.level === "impact");

console.log("━━━ 今回の変更 ━━━");
console.log(`ファイル ${files.length} 件 / 直接編集 ${direct.length} 画面 / 波及 ${impact.length} 画面\n`);

if (direct.length) {
  console.log("🔴 直接編集した画面");
  for (const s of direct.sort((a, b) => b.added + b.removed - (a.added + a.removed))) {
    const parts = s.changedSections.map((p) => p.name).slice(0, 4).join(" / ") || "—";
    console.log(`  ${s.displayName}  (+${s.added} −${s.removed})`);
    console.log(`    ${s.filePath}`);
    if (s.routes?.length) console.log(`    ${s.routes.join("  ")}`);
    console.log(`    変わった部分: ${parts}`);
    const v = visual(s.id);
    if (v) console.log(`  ${v}`);
  }
  console.log("");
}

if (impact.length) {
  const viaCount = {};
  for (const s of impact) for (const v of s.via) viaCount[v] = (viaCount[v] || 0) + 1;

  console.log("🟠 共通部品の変更が波及した画面");
  for (const [file, n] of Object.entries(viaCount).sort((a, b) => b[1] - a[1])) {
    const f = state.files[file];
    console.log(`  ${file}  (+${f?.added ?? 0} −${f?.removed ?? 0})  → ${n} 画面に波及`);
  }
  if (full) {
    console.log("\n  波及先:");
    for (const s of impact.sort((a, b) => a.displayName.localeCompare(b.displayName, "ja"))) {
      console.log(`    ・${s.displayName}  (${s.feature})`);
    }
  } else {
    const sample = impact.slice(0, 6).map((s) => s.displayName).join(", ");
    console.log(`  例: ${sample}${impact.length > 6 ? " …" : ""}`);
    console.log("  （全部見るには node .claude/report.cjs --full）");
  }
  console.log("");
}

const untracked = files.filter(
  (f) => !screens.some((s) => s.filePath === f.filePath) &&
         !screens.some((s) => (s.via || []).includes(f.filePath)),
);
if (untracked.length) {
  console.log("⚪️ 画面に紐づかない変更");
  for (const f of untracked) console.log(`  ${f.filePath}  (+${f.added} −${f.removed})`);
  console.log("");
}

const noShots = screens.filter((s) => !shots.screens?.[s.id]?.diff).length;
if (noShots && Object.keys(shots.screens || {}).length) {
  console.log(`（${noShots} 画面はまだピクセル比較していません: node .claude/capture-screens.cjs）`);
} else if (!Object.keys(shots.screens || {}).length) {
  console.log("（実画面の比較は未設定: node .claude/capture-screens.cjs --baseline で基準を作れます）");
}

console.log("マップで見る → node .claude/serve-map.cjs");
