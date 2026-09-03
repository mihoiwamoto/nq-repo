#!/usr/bin/env node
/**
 * PreToolUse フック。
 * Claude がファイルを編集する「直前」の中身を .claude/.baseline/ に退避する。
 *
 * なぜ必要か:
 *   git diff だとリポジトリに元からあった未コミット変更まで混ざってしまい、
 *   「今回 Claude に頼んだ変更」だけを切り出せない。
 *   編集前スナップショットと比べれば、今回の差分だけが正確に取れる。
 *
 * 同じファイルを何度編集しても、最初の 1 回だけ退避する（＝セッション開始時の姿を保持）。
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BASELINE_DIR = path.join(__dirname, ".baseline");

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function main() {
  let filePath = null;
  const raw = readStdin();
  if (raw.trim()) {
    try {
      const payload = JSON.parse(raw);
      filePath = payload?.tool_input?.file_path || payload?.tool_input?.notebook_path || null;
    } catch {
      /* JSON でなければ引数にフォールバック */
    }
  }
  if (!filePath) filePath = process.argv[2];
  if (!filePath) return;

  const abs = path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
  const rel = path.relative(ROOT, abs);
  if (rel.startsWith("..") || rel.startsWith(".claude/")) return;

  fs.mkdirSync(BASELINE_DIR, { recursive: true });
  const snap = path.join(BASELINE_DIR, encodeURIComponent(rel));

  if (fs.existsSync(snap)) return; // 既に退避済み

  if (fs.existsSync(abs)) {
    fs.copyFileSync(abs, snap);
  } else {
    fs.writeFileSync(snap, ""); // 新規作成されるファイル
  }
}

try {
  main();
} catch {
  // フックは絶対に編集をブロックしない
}
