/**
 * ルートの :factoryId などを、実際に存在するモックデータの ID に解決する。
 *
 * このリポジトリの ID は「エンティティ名の頭文字 + 連番」で統一されている
 * （factory→f1 / unit→u1 / record→r1 / chemical→c1 …）ので、それを既定値にし、
 * その画面の feature ディレクトリにある mockData から実在する ID を拾って上書きする。
 *
 * 自動解決が外れている場合は .claude/route-params.json を手で直せば、そちらが優先される。
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");

/** :factoryId → "factory" */
function entityOf(param) {
  return param.replace(/^:/, "").replace(/Id$/, "");
}

/** そのファイル群に出てくる id: "xxx" を集める */
function idsInDir(dir) {
  const out = [];
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return out;
  for (const entry of fs.readdirSync(abs)) {
    if (!/\.(ts|tsx)$/.test(entry)) continue;
    const src = fs.readFileSync(path.join(abs, entry), "utf8");
    for (const m of src.matchAll(/\bid:\s*"([^"]+)"/g)) out.push(m[1]);
  }
  return out;
}

/** 共有データ(src/data)から拾える ID */
function sharedIds() {
  const map = {};
  const dataDir = path.join(ROOT, "src/data");
  if (!fs.existsSync(dataDir)) return map;
  for (const entry of fs.readdirSync(dataDir)) {
    const m = entry.match(/^([a-z]+)\.ts$/);
    if (!m) continue;
    const src = fs.readFileSync(path.join(dataDir, entry), "utf8");
    const first = src.match(/\bid:\s*"([^"]+)"/);
    if (first) map[m[1].replace(/(ies|s)$/, (s) => (s === "ies" ? "y" : ""))] = first[1];
  }
  return map;
}

function buildResolver(screens) {
  const overridePath = path.join(ROOT, ".claude", "route-params.json");
  const overrides = fs.existsSync(overridePath)
    ? JSON.parse(fs.readFileSync(overridePath, "utf8"))
    : {};

  const shared = sharedIds();
  const dirCache = new Map();

  function resolveParam(param, screen) {
    // 1. 手動オーバーライド（画面別 → 全体）
    const byScreen = overrides.byScreen?.[screen.filePath]?.[param];
    if (byScreen) return byScreen;
    if (overrides.global?.[param]) return overrides.global[param];

    const entity = entityOf(param);

    // 日付キーは ID 規則から外れるので個別に扱う
    if (/date|Key$/i.test(entity)) return overrides.global?.[":__today"] || "2026-09-02";

    // 2. その画面の feature ディレクトリの mockData に実在する ID
    const dir = path.dirname(screen.filePath);
    if (!dirCache.has(dir)) dirCache.set(dir, idsInDir(dir));
    const localIds = dirCache.get(dir);
    const initial = entity[0]?.toLowerCase();
    const match = localIds.find((id) => id.toLowerCase() === `${initial}1`);
    if (match) return match;

    // 3. src/data 由来（factories.ts → factory）
    if (shared[entity]) return shared[entity];

    // 4. 命名規則からの推測（headletter + 1）
    if (initial) return `${initial}1`;
    return "1";
  }

  /** "/admin/.../factories/:factoryId" → "/admin/.../factories/f1" */
  function resolveRoute(route, screen) {
    return route.replace(/:([A-Za-z0-9_]+)/g, (_, name) => resolveParam(":" + name, screen));
  }

  return { resolveRoute, resolveParam };
}

/** 現状の解決結果を route-params.json のひな形として書き出す */
function writeTemplate(screens) {
  const { resolveParam } = buildResolver(screens);
  const params = new Set();
  for (const s of screens) {
    for (const r of s.routes || []) {
      for (const m of r.matchAll(/:([A-Za-z0-9_]+)/g)) params.add(":" + m[1]);
    }
  }
  const global = {};
  for (const p of [...params].sort()) {
    global[p] = resolveParam(p, screens.find((s) => (s.routes || []).some((r) => r.includes(p))));
  }
  return { global, byScreen: {} };
}

module.exports = { buildResolver, writeTemplate };
