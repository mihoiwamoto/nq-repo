/**
 * フィードバック機能のデータ層。
 *
 * どの画面にいても右下のボタンから「不具合・改善案・質問」を書き残せる。
 * 保存先は端末の localStorage（プロトタイプなので他の人には共有されない）。
 *
 * 記入者名は画面説明キャンバスのコメントと同じキーを使い、どちらで入れても引き継がれる。
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { loadAuthor, saveAuthor } from "../../admin/features/guide/comments";
import { loadGoogleAccount } from "../../admin/features/guide/googleAccount";

/** 右下のボタン以外（動作デモのツールバーなど）からパネルを開くための合図 */
export const FEEDBACK_OPEN_EVENT = "nq-feedback:open";

export type FeedbackOpenDetail = {
  /** 対象にしたい画面のパス。省略すると今いる画面 */
  pathname?: string;
};

/**
 * フィードバックパネルを開く。
 * `pathname` を渡すと、今いる画面ではなくその画面へのフィードバックとして扱う
 * （動作デモの端末枠に出している画面など）。
 */
export function openFeedbackPanel(pathname?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<FeedbackOpenDetail>(FEEDBACK_OPEN_EVENT, { detail: { pathname } }));
}

export type FeedbackKind = "bug" | "improvement" | "question" | "other";

/** 記入者の所属。誰からの意見か（お客様／開発側）が一覧で分かるようにする */
export type FeedbackCompany = "nishihara" | "lanstech";

/**
 * 対応状況。書きっぱなしにせず「今どこまで進んでいるか」を追えるようにする。
 * 値は保存済みデータとの互換のため open / done をそのまま残している。
 */
export type FeedbackStatus = "open" | "investigating" | "inProgress" | "waiting" | "done" | "onHold";

export const STATUS_LABELS: Record<FeedbackStatus, string> = {
  open: "未対応",
  investigating: "調査中",
  inProgress: "対応中",
  waiting: "確認待ち",
  done: "完了",
  onHold: "保留",
};

/** 絞り込みチップと状態変更メニューの並び順 */
export const STATUS_ORDER: FeedbackStatus[] = ["open", "investigating", "inProgress", "waiting", "done", "onHold"];

/** チップの丸ポチの色 */
export const STATUS_DOT_COLOR: Record<FeedbackStatus, string> = {
  open: "#2f7fd4",
  investigating: "#c2703a",
  inProgress: "#333333",
  waiting: "#7c4dcc",
  done: "var(--semantic-brand-primary)",
  onHold: "#808080",
};

/** 一覧のステータスバッジ（淡い背景＋濃い文字） */
export const STATUS_CHIP_CLASS: Record<FeedbackStatus, string> = {
  open: "bg-[#e7f1fe] text-[#2f7fd4]",
  investigating: "bg-[#fdefe0] text-[#c2703a]",
  inProgress: "bg-[#ececec] text-[#333333]",
  waiting: "bg-[#f1ebfd] text-[#7c4dcc]",
  done: "bg-[#e6f4ec] text-[var(--semantic-brand-primary)]",
  onHold: "bg-[#f0f0f0] text-[#808080]",
};

/** まだ手が離れていない状態（右下ボタンのバッジに出す件数） */
export function isUnresolved(status: FeedbackStatus): boolean {
  return status !== "done" && status !== "onHold";
}

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

/** フィードバック 1 件に付くやり取り。管理画面の詳細ポップアップで書く */
export type FeedbackComment = {
  id: string;
  author: string;
  /** 書いた人の所属。会社を選べるようになる前のコメントには無い */
  company?: FeedbackCompany;
  body: string;
  createdAt: number;
};

export type FeedbackEntry = {
  id: string;
  /** 一覧で呼びやすくするための通し番号（No.12）。付けたら変わらない */
  no: number;
  kind: FeedbackKind;
  /** 件名。入力時は必須だが、必須化より前に書かれたデータには無い（その場合は本文の 1 行目を見出しに使う） */
  title?: string;
  body: string;
  author: string;
  /** 記入者の所属。会社を選べるようになる前のデータには無い */
  company?: FeedbackCompany;
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
  /** 書いた端末・ブラウザ（不具合の再現環境の手がかり）。古いデータには無い */
  ua?: string;
  /** 管理画面で書き足したやり取り */
  comments?: FeedbackComment[];
  createdAt: number;
  updatedAt: number;
};

export type NewFeedback = Omit<FeedbackEntry, "id" | "no" | "status" | "comments" | "createdAt" | "updatedAt">;

/** 一覧の見出し。件名が無いものは本文の 1 行目で代用する */
export function feedbackHeadline(entry: FeedbackEntry): string {
  const title = entry.title?.trim();
  if (title) return title;
  const first = entry.body.split("\n").find((line) => line.trim() !== "");
  return first?.trim() ?? "(内容なし)";
}

/** 見出しに使った行を除いた本文。件名があるときは本文をそのまま返す */
export function feedbackDetail(entry: FeedbackEntry): string {
  if (entry.title?.trim()) return entry.body.trim();
  const lines = entry.body.split("\n");
  const firstIndex = lines.findIndex((line) => line.trim() !== "");
  return lines.slice(firstIndex + 1).join("\n").trim();
}

export const KIND_LABELS: Record<FeedbackKind, string> = {
  bug: "不具合",
  improvement: "改善案",
  question: "質問",
  other: "その他",
};

export const KIND_ORDER: FeedbackKind[] = ["bug", "improvement", "question", "other"];

export const COMPANY_LABELS: Record<FeedbackCompany, string> = {
  nishihara: "西原商会",
  lanstech: "ランステック",
};

export const COMPANY_ORDER: FeedbackCompany[] = ["nishihara", "lanstech"];

/** 未選択のときはお客様側（西原商会）として扱う */
export const DEFAULT_COMPANY: FeedbackCompany = "nishihara";

/** 記入者の所属名。会社を持たない古いデータは空文字 */
export function companyLabel(company: FeedbackCompany | undefined): string {
  return company ? COMPANY_LABELS[company] : "";
}

const STORAGE_KEY = "nq_feedback_v1";
/** 前回選んだ所属（名前と同じく、次に書くときの初期値にする） */
const COMPANY_KEY = "nq_feedback_company";
/** 同じタブの別コンポーネントに「保存したよ」を知らせる（storage イベントは他タブにしか飛ばない） */
const CHANGED_EVENT = "nq-feedback-changed";

/**
 * 古い形式（通し番号が無い・知らないステータス）を今の形にそろえて返す。
 * 番号は書いた順に振るので、あとから読み直しても同じ番号になる。
 */
function normalize(list: FeedbackEntry[]): FeedbackEntry[] {
  const byOldest = [...list].sort((a, b) => a.createdAt - b.createdAt);
  let next = byOldest.reduce((max, e) => Math.max(max, typeof e.no === "number" ? e.no : 0), 0);
  const numbered = new Map<string, number>();
  for (const e of byOldest) numbered.set(e.id, typeof e.no === "number" ? e.no : ++next);
  return list.map((e) => ({
    ...e,
    no: numbered.get(e.id) ?? 0,
    status: STATUS_ORDER.includes(e.status) ? e.status : "open",
    comments: Array.isArray(e.comments) ? e.comments : [],
  }));
}

export function loadFeedback(): FeedbackEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as FeedbackEntry[]) : [];
    return Array.isArray(list) ? normalize(list) : [];
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

/** 所属の初期値。前回選んだ会社、初めてなら西原商会 */
export function initialCompany(): FeedbackCompany {
  try {
    const saved = localStorage.getItem(COMPANY_KEY);
    if (saved && COMPANY_ORDER.includes(saved as FeedbackCompany)) return saved as FeedbackCompany;
  } catch {
    /* 読めなければ既定値 */
  }
  return DEFAULT_COMPANY;
}

export function saveFeedbackCompany(company: FeedbackCompany) {
  try {
    localStorage.setItem(COMPANY_KEY, company);
  } catch {
    /* 無視（次回また選び直せばよい） */
  }
}

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
      const no = loadFeedback().reduce((max, e) => Math.max(max, e.no), 0) + 1;
      const entry: FeedbackEntry = {
        ...input,
        id: newId(),
        no,
        status: "open",
        comments: [],
        createdAt: now,
        updatedAt: now,
      };
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

  /** 詳細ポップアップからのやり取りを 1 件足す。updatedAt は動かす（並び順の「作成日」には影響しない） */
  const addComment = useCallback(
    (id: string, author: string, body: string, company?: FeedbackCompany) => {
      const comment: FeedbackComment = { id: newId(), author, company, body, createdAt: Date.now() };
      write((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, comments: [...(e.comments ?? []), comment], updatedAt: comment.createdAt } : e
        )
      );
    },
    [write]
  );

  const removeComment = useCallback(
    (id: string, commentId: string) => {
      write((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, comments: (e.comments ?? []).filter((c) => c.id !== commentId), updatedAt: Date.now() } : e
        )
      );
    },
    [write]
  );

  /** まだ対応が終わっていない件数（完了・保留を除く） */
  const openCount = useMemo(() => entries.filter((e) => isUnresolved(e.status)).length, [entries]);

  /** ステータスごとの件数（絞り込みチップに出す） */
  const statusCounts = useMemo(() => {
    const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0])) as Record<FeedbackStatus, number>;
    for (const e of entries) counts[e.status] += 1;
    return counts;
  }, [entries]);

  return { entries, openCount, statusCounts, add, setStatus, remove, addComment, removeComment };
}

/** 新しいものが上に来るように並べる */
export function sortNewestFirst(list: FeedbackEntry[]): FeedbackEntry[] {
  return [...list].sort((a, b) => b.createdAt - a.createdAt);
}
