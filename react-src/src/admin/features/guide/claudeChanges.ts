/**
 * 「Claude がどの画面のどこを変えたか」を読むためのデータ層。
 *
 * 中身は編集追跡システム（.claude/edited_screens.json）の生成物で、
 * vite プラグイン（vite-plugins/claudeChanges.ts）が dev サーバー上で配っている。
 *   - 一覧（hunks 抜き）は 1 回だけ取る
 *   - 数秒おきに更新時刻だけ見に行き、変わったときだけ取り直す
 *   - 差分の中身は開いている画面のぶんだけ取る
 *
 * dev サーバー以外（ビルドした静的ファイル）では取得できないので、
 * その場合は available:false として画面側でその旨を出す。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const BASE = "/__claude-changes";
/** 追跡結果を見に行く間隔 */
const POLL_MS = 6000;

export type ChangeLevel = "direct" | "impact";
export type SectionKind = "label" | "heading" | "comment" | "code";

/** 変わった「部分」（見出し・日本語ラベル・JSX のセクションコメント・関数名） */
export type ChangedSection = { name: string; kind: SectionKind; lines: number };

export type ScreenChange = {
  id: string;
  displayName: string;
  filePath: string;
  category: string;
  feature: string;
  routes: string[];
  /** direct = その画面のファイルを直接編集 / impact = 共通部品経由の波及 */
  level: ChangeLevel;
  added: number;
  removed: number;
  editCount: number;
  firstEditedAt: string | null;
  lastEditedAt: string | null;
  sections: ChangedSection[];
  sectionTotal: number;
  /** 波及元の共通ファイル */
  via: string[];
  hunkCount: number;
  hasBefore: boolean;
  hasAfter: boolean;
  shotAt: string | null;
  /** その画面を撮った幅。アプリはタブレット縦（768）、管理画面は 1280 */
  shotWidth: number | null;
  diffRatio: number | null;
  diffShift: number | null;
};

export type DiffLine = { t: string; n: number | null; s: string };
export type DiffHunk = { startLine: number; context: string; lines: DiffLine[] };
export type ScreenChangeDetail = ScreenChange & { hunks: DiffHunk[]; diffBoxes: { x: number; y: number; w: number; h: number }[] };

export type ChangesIndex = {
  available: boolean;
  lastUpdated: string | null;
  startedAt: string | null;
  shotsCapturedAt: string | null;
  shotWidth: number | null;
  screens: ScreenChange[];
};

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * 全画面ぶんの変更サマリ。
 * `stamp` は「追跡結果が更新された印」で、開いている画面の差分もこれに合わせて取り直す。
 */
export function useClaudeChanges() {
  const [index, setIndex] = useState<ChangesIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [stamp, setStamp] = useState<string>("");
  const stampRef = useRef("");

  const load = useCallback(async (nextStamp: string) => {
    const data = await getJson<ChangesIndex>(`${BASE}/index.json`);
    setIndex(data ?? { available: false, lastUpdated: null, startedAt: null, shotsCapturedAt: null, shotWidth: null, screens: [] });
    setLoading(false);
    stampRef.current = nextStamp;
    setStamp(nextStamp);
  }, []);

  const reload = useCallback(() => {
    void load(`manual:${Date.now()}`);
  }, [load]);

  useEffect(() => {
    let alive = true;
    const check = async () => {
      const s = await getJson<{ available: boolean; lastUpdated: string | null; mtime: string }>(`${BASE}/stamp.json`);
      if (!alive) return;
      const next = s ? `${s.lastUpdated ?? ""}|${s.mtime}` : "unavailable";
      if (next !== stampRef.current) void load(next);
    };
    void check();
    const timer = setInterval(check, POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [load]);

  const byId = useMemo(() => {
    const map = new Map<string, ScreenChange>();
    for (const s of index?.screens ?? []) map.set(s.id, s);
    return map;
  }, [index]);

  return { index, byId, loading, stamp, reload };
}

/** 開いている画面ぶんの差分（hunks）。画面を変えた・追跡結果が更新されたときに取り直す */
export function useScreenChangeDetail(screenId: string | undefined, stamp: string) {
  const [detail, setDetail] = useState<ScreenChangeDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!screenId) {
      setDetail(null);
      return;
    }
    let alive = true;
    setLoading(true);
    void getJson<{ available: boolean; screen: ScreenChangeDetail | null }>(`${BASE}/screen/${screenId}.json`).then((res) => {
      if (!alive) return;
      setDetail(res?.screen ?? null);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [screenId, stamp]);

  return { detail, loading };
}

/** 「変わった部分」のうち、画面上の文字として探せるもの（ラベル・見出し）だけ */
export function isLocatableSection(section: ChangedSection): boolean {
  return (section.kind === "label" || section.kind === "heading") && section.name.trim().length > 0 && section.name.length <= 40;
}

export const SECTION_KIND_LABELS: Record<SectionKind, string> = {
  label: "画面の文字",
  heading: "見出し",
  comment: "セクション",
  code: "処理",
};

/** 「9/16 17:06」のような短い表記。日付が無いときは空文字 */
export function shortStamp(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
