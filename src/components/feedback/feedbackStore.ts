/**
 * フィードバック機能のデータ層。
 *
 * どの画面にいても右下のボタンから「不具合・改善案・質問」を書き残せる。
 * 保存先は端末の localStorage（プロトタイプなので他の人には共有されない）。
 * 共有したいときはパネルの「コピー」で Markdown にして貼り付ける。
 *
 * 記入者名は画面説明キャンバスのコメントと同じキーを使い、どちらで入れても引き継がれる。
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { loadAuthor, saveAuthor } from "../../admin/features/guide/comments";
import { loadGoogleAccount } from "../../admin/features/guide/googleAccount";

export type FeedbackKind = "bug" | "improvement" | "question" | "other";
export type FeedbackStatus = "open" | "done";

/**
 * 「ここ」とピンポイントに選んだ場所。
 * 要素は #root からの nth-child パス（selector）で覚え、表示時に今の DOM から引き直す。
 * 要素の中でどこを押したかは、要素サイズに対する比率（0〜1）で持つので、幅が変わってもずれにくい。
 */
export type FeedbackSpot = {
  /**
   * 「PageTitleBar › h1」のような要素の名前。英語のコンポーネント名なので画面には出さない。
   * どの要素を指しているか後から追う手がかりとして持っておくだけ（表示は spotDisplay を使う）。
   */
  label: string;
  selector: string;
  /** 要素のテキストの先頭（一覧で場所を思い出す手がかり） */
  text: string;
  rx: number;
  ry: number;
};

export type FeedbackEntry = {
  id: string;
  kind: FeedbackKind;
  body: string;
  author: string;
  /** 画面上の場所。選ばなかったときは undefined */
  spot?: FeedbackSpot;
  /** 書いた時点の URL パス（/admin/ledger-management など） */
  pathname: string;
  /** 画面マップ上の画面 ID。マップに無い URL（/ や /admin/login 以外の未登録画面）は undefined */
  screenId?: string;
  /** 一覧に出すため、書いた時点の画面名・分類を持っておく */
  screenTitle: string;
  screenCategory: string;
  status: FeedbackStatus;
  createdAt: number;
  updatedAt: number;
};

export type NewFeedback = Omit<FeedbackEntry, "id" | "status" | "createdAt" | "updatedAt">;

export const KIND_LABELS: Record<FeedbackKind, string> = {
  bug: "不具合",
  improvement: "改善案",
  question: "質問",
  other: "その他",
};

export const KIND_ORDER: FeedbackKind[] = ["bug", "improvement", "question", "other"];

const STORAGE_KEY = "nq_feedback_v1";
/** 同じタブの別コンポーネントに「保存したよ」を知らせる（storage イベントは他タブにしか飛ばない） */
const CHANGED_EVENT = "nq-feedback-changed";

export function loadFeedback(): FeedbackEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as FeedbackEntry[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveFeedback(list: FeedbackEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* 容量超過などは無視（画面上の表示は続けられる） */
  }
  window.dispatchEvent(new CustomEvent(CHANGED_EVENT));
}

function newId(): string {
  return `fb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * 画面に出す「場所」の呼び名。
 * コンポーネント名（英語）は出さず、その場所に書かれている文言をそのまま使う。
 * 文言が取れない要素（アイコンだけ等）は「選択した場所」とする。
 */
export function spotDisplay(spot: FeedbackSpot): string {
  return spot.text ? `「${spot.text}」` : "選択した場所";
}

/** 「2026/09/14 13:05」 */
export function formatFeedbackTime(at: number): string {
  const d = new Date(at);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** 記入者名の初期値。Google 連携済みならその名前、無ければ前回入れた名前 */
export function initialAuthor(): string {
  return loadGoogleAccount()?.name || loadAuthor();
}

export { saveAuthor as saveFeedbackAuthor };

/**
 * フィードバックの読み書き。
 * 同じタブの別コンポーネント・別タブのどちらの変更にも追従する。
 */
export function useFeedback() {
  const [entries, setEntries] = useState<FeedbackEntry[]>(loadFeedback);

  useEffect(() => {
    const reload = () => setEntries(loadFeedback());
    window.addEventListener(CHANGED_EVENT, reload);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener(CHANGED_EVENT, reload);
      window.removeEventListener("storage", reload);
    };
  }, []);

  const write = useCallback((fn: (prev: FeedbackEntry[]) => FeedbackEntry[]) => {
    // 保存してから読み直す（他のタブ・他のコンポーネントとずれないように）
    const next = fn(loadFeedback());
    saveFeedback(next);
    setEntries(next);
    return next;
  }, []);

  const add = useCallback(
    (input: NewFeedback): FeedbackEntry => {
      const now = Date.now();
      const entry: FeedbackEntry = { ...input, id: newId(), status: "open", createdAt: now, updatedAt: now };
      write((prev) => [...prev, entry]);
      return entry;
    },
    [write]
  );

  const setStatus = useCallback(
    (id: string, status: FeedbackStatus) => {
      write((prev) => prev.map((e) => (e.id === id ? { ...e, status, updatedAt: Date.now() } : e)));
    },
    [write]
  );

  const remove = useCallback((id: string) => write((prev) => prev.filter((e) => e.id !== id)), [write]);

  const openCount = useMemo(() => entries.filter((e) => e.status === "open").length, [entries]);

  return { entries, openCount, add, setStatus, remove };
}

/** 新しいものが上に来るように並べる */
export function sortNewestFirst(list: FeedbackEntry[]): FeedbackEntry[] {
  return [...list].sort((a, b) => b.createdAt - a.createdAt);
}

/** 共有用の Markdown。画面ごとにまとめ、未対応 → 対応済みの順 */
export function feedbackToMarkdown(list: FeedbackEntry[]): string {
  if (list.length === 0) return "フィードバックはありません。";
  const byScreen = new Map<string, FeedbackEntry[]>();
  for (const e of sortNewestFirst(list)) {
    const key = `${e.screenCategory} › ${e.screenTitle}（${e.pathname}）`;
    (byScreen.get(key) ?? byScreen.set(key, []).get(key)!).push(e);
  }
  const lines: string[] = [`# フィードバック一覧（${list.length} 件）`, ""];
  for (const [screen, items] of byScreen) {
    lines.push(`## ${screen}`, "");
    for (const e of items) {
      const status = e.status === "done" ? "✅" : "⬜️";
      const who = e.author ? ` ${e.author}` : "";
      lines.push(`- ${status} **[${KIND_LABELS[e.kind]}]** ${formatFeedbackTime(e.createdAt)}${who}`);
      if (e.spot) lines.push(`  📍 ${spotDisplay(e.spot)}`);
      for (const bodyLine of e.body.split("\n")) lines.push(`  ${bodyLine}`);
    }
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}
