/**
 * 変更履歴ページ（/admin/guide/screens）へ「Claude がどの画面のどこを変えたか」を渡す
 * 開発サーバー用プラグイン。
 *
 * 元ネタは編集追跡システムの生成物:
 *   .claude/edited_screens.json … 画面ごとの 直接編集 / 波及・変更セクション・差分（hunks）
 *   .claude/shots-index.json    … 画面ごとの 変更前/変更後スクリーンショットとピクセル差分
 *
 * edited_screens.json は 5MB 超あり、そのまま import すると画面を開くたびに丸ごと読むことになる。
 * なので差分本体（hunks）は落とした一覧と、1 画面ぶんの詳細を別々に返す。
 *
 *   GET /__claude-changes/stamp.json      … 更新時刻だけ（数秒おきのポーリング用）
 *   GET /__claude-changes/index.json      … 全画面の変更サマリ（hunks 抜き）
 *   GET /__claude-changes/screen/<id>.json… その画面の差分 + ピクセル差分の矩形
 *
 * dev サーバー専用。ビルドした静的ファイルには載らない（.claude/ は配布物ではないため）。
 */
import fs from "node:fs";
import path from "node:path";
import type { Connect, Plugin } from "vite";

const BASE = "/__claude-changes";
/** 一覧に載せる「変わった部分」の数 */
const SECTION_LIMIT = 12;

type RawSection = { name: string; kind: string; lines: number };
type RawHunk = { startLine: number; context: string; lines: { t: string; n: number | null; s: string }[] };
type RawScreen = {
  id: string;
  displayName: string;
  filePath: string;
  category: string;
  feature: string;
  routes: string[];
  level: "direct" | "impact";
  added: number;
  removed: number;
  changedSections?: RawSection[];
  hunks?: RawHunk[];
  via?: string[];
  firstEditedAt?: string;
  lastEditedAt?: string;
  editCount?: number;
};
type RawEdits = { lastUpdated?: string; startedAt?: string; screens: Record<string, RawScreen> };

type RawShot = {
  capturedAt?: string;
  /** その画面を撮ったビューポート幅（アプリは 768、管理画面は 1280） */
  viewportWidth?: number;
  hasBefore?: boolean;
  hasAfter?: boolean;
  diff?: { ratio: number; changed: number; total: number; shift?: number; boxes?: { x: number; y: number; w: number; h: number }[] };
};
type RawShots = { capturedAt?: string; viewportWidth?: number; screens: Record<string, RawShot> };

/** mtime が変わったときだけ読み直す（毎リクエスト 5MB の JSON.parse を避ける） */
function cachedJson<T>() {
  let mtime = -1;
  let value: T | null = null;
  return (file: string): T | null => {
    let stat: fs.Stats;
    try {
      stat = fs.statSync(file);
    } catch {
      return null;
    }
    if (stat.mtimeMs !== mtime) {
      try {
        value = JSON.parse(fs.readFileSync(file, "utf8")) as T;
        mtime = stat.mtimeMs;
      } catch {
        // 追跡スクリプトが書いている途中は壊れた JSON を読むことがある。前回の内容で凌ぐ。
        return value;
      }
    }
    return value;
  };
}

const readEdits = cachedJson<RawEdits>();
const readShots = cachedJson<RawShots>();

function mtimeOf(file: string): number {
  try {
    return fs.statSync(file).mtimeMs;
  } catch {
    return 0;
  }
}

function send(res: Parameters<Connect.NextHandleFunction>[1], body: unknown) {
  const json = JSON.stringify(body);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  // 追跡結果は数秒で変わるのでキャッシュさせない
  res.setHeader("Cache-Control", "no-store");
  res.end(json);
}

function summarize(screen: RawScreen, shot: RawShot | undefined) {
  return {
    id: screen.id,
    displayName: screen.displayName,
    filePath: screen.filePath,
    category: screen.category,
    feature: screen.feature,
    routes: screen.routes,
    level: screen.level,
    added: screen.added,
    removed: screen.removed,
    editCount: screen.editCount ?? 0,
    firstEditedAt: screen.firstEditedAt ?? null,
    lastEditedAt: screen.lastEditedAt ?? null,
    // 一覧では変わった部分の上位だけ返す（全部返すと 300 画面ぶんで数百 KB になる）
    sections: (screen.changedSections ?? []).slice(0, SECTION_LIMIT),
    sectionTotal: (screen.changedSections ?? []).length,
    via: screen.via ?? [],
    hunkCount: screen.hunks?.length ?? 0,
    hasBefore: !!shot?.hasBefore,
    hasAfter: !!shot?.hasAfter,
    shotAt: shot?.capturedAt ?? null,
    shotWidth: shot?.viewportWidth ?? null,
    diffRatio: shot?.diff ? shot.diff.ratio : null,
    diffShift: shot?.diff?.shift ?? null,
  };
}

export default function claudeChanges(): Plugin {
  let root = process.cwd();
  const editsFile = () => path.join(root, ".claude", "edited_screens.json");
  const shotsFile = () => path.join(root, ".claude", "shots-index.json");

  return {
    name: "nq-claude-changes",
    apply: "serve",
    configResolved(config) {
      root = config.root;
    },
    configureServer(server) {
      server.middlewares.use(BASE, (req, res, next) => {
        const url = (req.url ?? "/").split("?")[0];
        const edits = readEdits(editsFile());

        if (url === "/stamp.json") {
          return send(res, {
            available: !!edits,
            lastUpdated: edits?.lastUpdated ?? null,
            startedAt: edits?.startedAt ?? null,
            // ファイルの更新時刻も返す。lastUpdated が同じでも撮り直しには追従したい。
            mtime: `${mtimeOf(editsFile())}:${mtimeOf(shotsFile())}`,
          });
        }

        if (url === "/index.json") {
          if (!edits) return send(res, { available: false, screens: [] });
          const shots = readShots(shotsFile())?.screens ?? {};
          const screens = Object.values(edits.screens ?? {})
            .map((s) => summarize(s, shots[s.id]))
            .sort((a, b) => (b.lastEditedAt ?? "").localeCompare(a.lastEditedAt ?? ""));
          return send(res, {
            available: true,
            lastUpdated: edits.lastUpdated ?? null,
            startedAt: edits.startedAt ?? null,
            shotsCapturedAt: readShots(shotsFile())?.capturedAt ?? null,
            shotWidth: readShots(shotsFile())?.viewportWidth ?? null,
            screens,
          });
        }

        const detail = /^\/screen\/([A-Za-z0-9_]+)\.json$/.exec(url);
        if (detail) {
          const screen = edits?.screens?.[detail[1]];
          if (!screen) return send(res, { available: false, screen: null });
          const shot = readShots(shotsFile())?.screens?.[screen.id];
          return send(res, {
            available: true,
            screen: {
              ...summarize(screen, shot),
              sections: screen.changedSections ?? [],
              hunks: screen.hunks ?? [],
              diffBoxes: shot?.diff?.boxes ?? [],
            },
          });
        }

        next();
      });
    },
  };
}
