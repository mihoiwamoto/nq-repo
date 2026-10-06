/**
 * 「セクションごとの注釈」を出しているか（右下の切替の「i」ボタンで切り替える）。
 *
 * 画面説明（? のコーチマーク）とは別のパターン。番号の吹き出しを重ねるのではなく、
 * 部品のすぐ下に「①持ち場/ラインの登録はここから」のような文字だけの注釈を出す。
 * 注釈の文は各ページの <SectionNote> に直に書く（2026-10-06 に 帳票管理 › 機械器具点検 の持ち場/ラインの一覧で試す）。
 * 開閉はタブ単位で覚える（画面を移っても、リロードしても開いたまま）。
 */
import { useSyncExternalStore } from "react";

const KEY = "nq_section_notes_open";
const EVENT = "nq-section-notes";

function read(): boolean {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setSectionNotesOpen(open: boolean) {
  try {
    if (open) sessionStorage.setItem(KEY, "1");
    else sessionStorage.removeItem(KEY);
  } catch {
    /* 無視 */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export function useSectionNotesOpen(): boolean {
  return useSyncExternalStore(subscribe, read, () => false);
}
