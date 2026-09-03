#!/usr/bin/env node
/**
 * 編集マークを全部消して、今の状態を新しい基準（ベースライン）にする。
 * 「ここから先の変更だけ見たい」ときに実行する。
 *
 *   node .claude/reset-edits.cjs
 */
const fs = require("fs");
const path = require("path");

const BASELINE_DIR = path.join(__dirname, ".baseline");
const EDITS_PATH = path.join(__dirname, "edited_screens.json");
const DATA_JS_PATH = path.join(__dirname, "screen-data.js");

fs.rmSync(BASELINE_DIR, { recursive: true, force: true });

const fresh = {
  lastUpdated: null,
  startedAt: new Date().toISOString(),
  screens: {},
  files: {},
};
fs.writeFileSync(EDITS_PATH, JSON.stringify(fresh, null, 2));

try {
  const map = JSON.parse(fs.readFileSync(path.join(__dirname, "screen-map.json"), "utf8"));
  fs.writeFileSync(
    DATA_JS_PATH,
    "// 自動生成 — 直接編集しないでください\n" +
      "window.__SCREEN_MAP__ = " + JSON.stringify(map) + ";\n" +
      "window.__SCREEN_EDITS__ = " + JSON.stringify(fresh) + ";\n",
  );
} catch {
  /* screen-map.json がまだ無い場合は何もしない */
}

console.log("✓ 編集マークをリセットしました。今の状態が新しい基準です。");
