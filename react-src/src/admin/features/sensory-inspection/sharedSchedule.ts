import type { ComparisonSetting, ScheduleEntry } from "./types";

/**
 * 管理画面の帳票管理 › 官能検査記録 › 点検予定 で登録した内容を、アプリの官能検査記録（記録入力）から読むための置き場（2026-10-09）。
 * 管理画面とアプリは製品の id が別の見本（stp1… と p1…）なので、製品名で引く。
 * 同じタブの中で画面をまたいで持ち、sessionStorage にも写す（読み込み直しても残る）。
 */
type SharedEntry = { dateKey: string; items: { name: string; setting: ComparisonSetting }[] };

const KEY = "nq_sensory_admin_schedule";
let raw: Record<string, ScheduleEntry> = {};
let shared: Record<string, SharedEntry> = {};

try {
  const saved = sessionStorage.getItem(KEY);
  if (saved) ({ raw, shared } = JSON.parse(saved));
} catch {
  /* 読めなければ空から */
}

/** 管理画面の Context の初期値（前に登録したものを戻す） */
export function loadAdminSensorySchedule(): Record<string, ScheduleEntry> {
  return raw;
}

/** 管理画面で予定が変わるたびに呼ぶ。製品名は登録物の一覧から引く */
export function saveAdminSensorySchedule(entries: Record<string, ScheduleEntry>, nameOf: (id: string) => string | undefined) {
  raw = entries;
  shared = Object.fromEntries(
    Object.values(entries).map((entry) => [
      entry.dateKey,
      {
        dateKey: entry.dateKey,
        items: entry.productIds.flatMap((id) => {
          const name = nameOf(id);
          return name ? [{ name, setting: entry.comparisons?.[id] ?? { isComparison: null } }] : [];
        }),
      },
    ])
  );
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ raw, shared }));
  } catch {
    /* 保存できなくても画面は動く */
  }
}

/** 製品名でこの製品の予定を引く。実施日の予定を優先し、無ければいちばん新しい予定 */
export function adminSensoryPlanFor(name: string, date: string): ComparisonSetting | undefined {
  const hit = (dateKey: string) => shared[dateKey]?.items.find((item) => item.name === name)?.setting;
  return (
    hit(date) ??
    Object.keys(shared)
      .sort()
      .reverse()
      .map(hit)
      .find(Boolean)
  );
}
