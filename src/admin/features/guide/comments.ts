/**
 * 画面説明キャンバスのコメント。
 *
 * 画面の好きな場所にピンを立てて「ここ直したい」を書き残しておける。
 * 書いたものは /admin/guide/comments（コメント一覧）から後でまとめて見返せる。
 *
 * 保存先は端末の localStorage。プロトタイプなので他の人には共有されない。
 */
import { useCallback, useEffect, useMemo, useState } from "react";

export type ScreenComment = {
  id: string;
  screenId: string;
  /** 一覧に画面名を出すため、書いた時点の画面情報を持っておく（画面 ID だけだと後で引けない） */
  screenTitle: string;
  screenRoute: string;
  screenCategory: string;
  /** ピンの位置。画面の左上からの px（スクロールを含むドキュメント座標） */
  x: number;
  y: number;
  /** ピンを立てた要素の名前（「PageTitleBar › h1」）。要素が特定できないときは「画面」 */
  target: string;
  body: string;
  author: string;
  createdAt: number;
  updatedAt: number;
  resolved: boolean;
};

const STORAGE_KEY = "nq_screen_comments_v1";
const AUTHOR_KEY = "nq_screen_comment_author";
/** 同じタブの中で「保存したよ」を知らせる（localStorage の storage イベントは他タブにしか飛ばない） */
const CHANGED_EVENT = "nq-screen-comments-changed";

export type NewComment = Omit<ScreenComment, "id" | "createdAt" | "updatedAt" | "resolved">;

export function loadComments(): ScreenComment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as ScreenComment[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveComments(list: ScreenComment[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* 容量超過などは無視（画面上の表示は続けられる） */
  }
  window.dispatchEvent(new CustomEvent(CHANGED_EVENT));
}

export function loadAuthor(): string {
  try {
    return localStorage.getItem(AUTHOR_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveAuthor(name: string) {
  try {
    localStorage.setItem(AUTHOR_KEY, name);
  } catch {
    /* 無視 */
  }
}

function newId(): string {
  return `cmt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/** 「2026/09/14 13:05」 */
export function formatCommentTime(at: number): string {
  const d = new Date(at);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export type ScreenCommentCount = { total: number; open: number };

/**
 * コメントの読み書き。キャンバスと一覧ページの両方から使う。
 * 同じタブの別コンポーネント・別タブのどちらの変更にも追従する。
 */
export function useScreenComments() {
  const [comments, setComments] = useState<ScreenComment[]>(loadComments);

  useEffect(() => {
    const reload = () => setComments(loadComments());
    window.addEventListener(CHANGED_EVENT, reload);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener(CHANGED_EVENT, reload);
      window.removeEventListener("storage", reload);
    };
  }, []);

  const write = useCallback((fn: (prev: ScreenComment[]) => ScreenComment[]) => {
    // 保存してから読み直す（他のタブ・他のコンポーネントとずれないように）
    const next = fn(loadComments());
    saveComments(next);
    setComments(next);
    return next;
  }, []);

  const add = useCallback(
    (input: NewComment): ScreenComment => {
      const now = Date.now();
      const comment: ScreenComment = { ...input, id: newId(), createdAt: now, updatedAt: now, resolved: false };
      write((prev) => [...prev, comment]);
      return comment;
    },
    [write]
  );

  const update = useCallback(
    (id: string, patch: Partial<Pick<ScreenComment, "body" | "resolved" | "author">>) => {
      write((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c)));
    },
    [write]
  );

  const remove = useCallback((id: string) => write((prev) => prev.filter((c) => c.id !== id)), [write]);

  const removeMany = useCallback(
    (ids: string[]) => {
      const set = new Set(ids);
      write((prev) => prev.filter((c) => !set.has(c.id)));
    },
    [write]
  );

  /** 画面 ID → 件数（画面一覧のバッジ用） */
  const countsByScreen = useMemo(() => {
    const out: Record<string, ScreenCommentCount> = {};
    for (const c of comments) {
      const entry = (out[c.screenId] ??= { total: 0, open: 0 });
      entry.total += 1;
      if (!c.resolved) entry.open += 1;
    }
    return out;
  }, [comments]);

  return { comments, countsByScreen, add, update, remove, removeMany };
}

/** その画面のコメントを、ピン番号の順（書いた順）に並べて返す */
export function commentsOfScreen(comments: ScreenComment[], screenId: string | undefined): ScreenComment[] {
  if (!screenId) return [];
  return comments.filter((c) => c.screenId === screenId).sort((a, b) => a.createdAt - b.createdAt);
}
