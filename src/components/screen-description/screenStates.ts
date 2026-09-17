/**
 * 「今この画面に何が出ているか」を DOM から見て、説明を差し替えるための判定。
 *
 * アプリには「帳票一覧を開くと、まず実施者を選ぶポップアップが出る」のように、
 * URL は同じでも実際に見えているものが別画面、というところがいくつもある。
 * 画面説明は URL（＝ファイルパス）で引いているので、そのままだと
 * 実施者選択を見ているのに「帳票一覧です」という説明が出てしまう。
 *
 * そこで screenDescriptions.ts の `states` に「この見出しが出ていたらこの説明」を書いておき、
 * ここで画面に出ているポップアップの見出しと突き合わせる。
 * 合ったときは、その説明と「ポップアップの中だけ」を案内対象にする（root を返す）。
 *
 * ポップアップの見つけ方は Tailwind の `fixed inset-0`（このリポジトリのダイアログは
 * すべてこの形で全面に重ねている）。自分自身・フィードバック・動作デモの UI は除く。
 */
import type { ScreenDescription, ScreenStateDescription } from "./screenDescriptions";

/** ポップアップの土台（全面に重なる要素） */
const OVERLAY_SELECTOR = ".fixed.inset-0";

/** 案内の対象から外す UI（コーチマーク自身・フィードバック・動作デモ） */
const EXCLUDE_SELECTOR = "[data-nq-coach], [data-nq-feedback], #nq-demo-overlay, #nq-demo-panel";

export type ActiveScreenState = {
  state: ScreenStateDescription;
  /** ポップアップの土台。コーチマークはこの中だけを見る */
  root: HTMLElement;
};

function isVisible(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.width < 40 || rect.height < 40) return false;
  const style = getComputedStyle(el);
  return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
}

function headingTexts(root: HTMLElement): string[] {
  return Array.from(root.querySelectorAll("h1, h2, h3, [role=heading]")).map((h) => (h.textContent ?? "").trim());
}

/**
 * 今出ているポップアップに合う説明を探す。無ければ null（＝画面そのものの説明を使う）。
 * 複数重なっているときは、後ろにある（＝上に出ている）ものを優先する。
 */
export function findOpenScreenState(
  doc: Document,
  description: ScreenDescription | undefined,
): ActiveScreenState | null {
  const states = description?.states;
  if (!states?.length) return null;

  const overlays = Array.from(doc.querySelectorAll<HTMLElement>(OVERLAY_SELECTOR)).filter(
    (el) => !el.closest(EXCLUDE_SELECTOR) && isVisible(el),
  );

  for (let i = overlays.length - 1; i >= 0; i--) {
    const overlay = overlays[i];
    const headings = headingTexts(overlay);
    const state = states.find((s) => headings.some((t) => t.includes(s.whenHeading)));
    if (state) return { state, root: overlay };
  }
  return null;
}

/** 差し替え後の説明（ポップアップが出ていなければ元のまま） */
export function descriptionOfState(
  description: ScreenDescription | undefined,
  active: ActiveScreenState | null,
): ScreenDescription | undefined {
  if (!active) return description;
  const { summary, points, note, marks } = active.state;
  return { summary, points, note, marks };
}
