/**
 * アプリの帳票の一覧で、点検対象が 1 件も無いときの表示（2026-10-07）。
 *
 * 見せ方を 3 パターン試している途中なので、プロトタイプの右下のフローティングボタンの左の切替
 * （KitSwitch.tsx の .nvempty）で一時的に切り替えられる。決まったら 1 つに絞って切替を外す。
 *   text … 「データがありません。」の文字だけ
 *   note … 「データがありません。」＋ 小さい説明文
 *   card … 一覧のカードと同じ白い枠の中に「データがありません。」
 * 選んだものは sessionStorage（nq_kit_empty_pattern）。何も選んでいなければ text。
 */
import { useEffect, useState } from "react";

export type EmptyPattern = "text" | "note" | "card";

export const EMPTY_PATTERNS: { key: EmptyPattern; label: string }[] = [
  { key: "text", label: "テキスト" },
  { key: "note", label: "説明文つき" },
  { key: "card", label: "白いカード" },
];

const KEY = "nq_kit_empty_pattern";
const EVENT = "nq-kit-empty-pattern-changed";

export function loadEmptyPattern(): EmptyPattern {
  try {
    const v = sessionStorage.getItem(KEY);
    if (v === "text" || v === "note" || v === "card") return v;
  } catch {
    /* 読めなければ既定 */
  }
  return "text";
}

export function saveEmptyPattern(p: EmptyPattern) {
  try {
    sessionStorage.setItem(KEY, p);
  } catch {
    /* 保存できなくても、この画面の間は切り替わる */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useEmptyPattern(): EmptyPattern {
  const [p, setP] = useState(loadEmptyPattern);
  useEffect(() => {
    const on = () => setP(loadEmptyPattern());
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return p;
}

const DEFAULT_NOTE = "管理画面の帳票管理で登録すると、ここに表示されます。";

export function AppEmptyState({ note = DEFAULT_NOTE }: { note?: string }) {
  const pattern = useEmptyPattern();

  if (pattern === "card") {
    return (
      <div
        data-nq-part="empty"
        className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] flex h-[200px] items-center justify-center py-10 rounded-lg w-full"
      >
        <p className="text-xl leading-none text-center text-[var(--semantic-text-primary)]">データがありません。</p>
      </div>
    );
  }

  return (
    <div data-nq-part="empty" className="flex flex-col gap-3 items-center justify-center py-10 w-full">
      <p className="text-xl leading-none text-center text-[var(--semantic-text-primary)]">データがありません。</p>
      {pattern === "note" && (
        <p className="text-base leading-normal text-center text-[var(--semantic-text-secondary)]">{note}</p>
      )}
    </div>
  );
}
