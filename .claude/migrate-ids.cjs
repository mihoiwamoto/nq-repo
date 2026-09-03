#!/usr/bin/env node
/**
 * 画面 ID を新方式（ファイルパス由来）へ移行する。
 *
 * 旧方式は走査順の連番（screen_1, screen_2 …）だったため、
 * Page.tsx が 1 つ増減すると以降の ID が全部ずれ、
 * 撮影済みスクリーンショットや編集記録との対応が黙って壊れていた。
 *
 * shots-index.json / edited_screens.json は各エントリに filePath を持っているので、
 * それを手がかりに新 ID を計算し直し、画像ファイルもリネームする。
 * 撮り直しは不要。
 *
 *   node .claude/migrate-ids.cjs
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SHOTS = path.join(__dirname, ".shots");
const SUBDIRS = { before: "png", after: "png", diff: "png", thumb: "jpg" };

function screenId(relPath) {
  return "scr_" + crypto.createHash("sha1").update(relPath).digest("hex").slice(0, 10);
}

function loadJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

const map = loadJson(path.join(__dirname, "screen-map.json"));
if (!map) {
  console.error("screen-map.json がありません。先に generate-screen-map.cjs を実行してください。");
  process.exit(1);
}
const validIds = new Set(map.screens.map((s) => s.id));
const byPath = new Map(map.screens.map((s) => [s.filePath, s.id]));

let renamed = 0;
let dropped = 0;
let kept = 0;

/* ---- shots-index.json ---- */
const shotsPath = path.join(__dirname, "shots-index.json");
const shots = loadJson(shotsPath);

if (shots?.screens) {
  const next = {};
  const renames = []; // [oldId, newId]

  for (const [oldId, entry] of Object.entries(shots.screens)) {
    if (validIds.has(oldId)) {
      next[oldId] = entry; // すでに新方式
      kept++;
      continue;
    }
    const newId = entry.filePath ? byPath.get(entry.filePath) : null;
    if (!newId) {
      // 対応する画面が無くなっている（ファイルが削除された等）
      dropped++;
      for (const [dir, ext] of Object.entries(SUBDIRS)) {
        const f = path.join(SHOTS, dir, `${oldId}.${ext}`);
        if (fs.existsSync(f)) fs.rmSync(f);
      }
      continue;
    }
    next[newId] = entry;
    renames.push([oldId, newId]);
  }

  // 一時名を経由してリネームする（旧IDと新IDが衝突しうるため）
  for (const [oldId, newId] of renames) {
    for (const [dir, ext] of Object.entries(SUBDIRS)) {
      const from = path.join(SHOTS, dir, `${oldId}.${ext}`);
      if (!fs.existsSync(from)) continue;
      fs.renameSync(from, path.join(SHOTS, dir, `__mig_${newId}.${ext}`));
    }
  }
  for (const [, newId] of renames) {
    for (const [dir, ext] of Object.entries(SUBDIRS)) {
      const tmp = path.join(SHOTS, dir, `__mig_${newId}.${ext}`);
      if (!fs.existsSync(tmp)) continue;
      fs.renameSync(tmp, path.join(SHOTS, dir, `${newId}.${ext}`));
      renamed++;
    }
  }

  shots.screens = next;
  shots.migratedAt = new Date().toISOString();
  fs.writeFileSync(shotsPath, JSON.stringify(shots, null, 2));
}

/* ---- edited_screens.json ---- */
const editsPath = path.join(__dirname, "edited_screens.json");
const edits = loadJson(editsPath);
let editsFixed = 0;

if (edits?.screens) {
  const next = {};
  for (const [oldId, entry] of Object.entries(edits.screens)) {
    if (validIds.has(oldId)) {
      next[oldId] = entry;
      continue;
    }
    const newId = entry.filePath ? byPath.get(entry.filePath) : null;
    if (!newId) continue; // 画面が無くなった
    next[newId] = { ...entry, id: newId };
    editsFixed++;
  }
  edits.screens = next;
  fs.writeFileSync(editsPath, JSON.stringify(edits, null, 2));
}

/* ---- 孤児ファイルの掃除 ---- */
let orphans = 0;
for (const [dir, ext] of Object.entries(SUBDIRS)) {
  const d = path.join(SHOTS, dir);
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) {
    if (!f.endsWith("." + ext)) continue;
    const id = f.slice(0, -(ext.length + 1));
    if (!validIds.has(id)) {
      fs.rmSync(path.join(d, f));
      orphans++;
    }
  }
}

console.log("✓ 画面 ID を移行しました");
console.log(`  画像リネーム: ${renamed} 件`);
console.log(`  そのまま維持: ${kept} 件`);
console.log(`  画面が消えたため破棄: ${dropped} 件`);
console.log(`  編集記録の付け替え: ${editsFixed} 件`);
console.log(`  孤児ファイル削除: ${orphans} 件`);
