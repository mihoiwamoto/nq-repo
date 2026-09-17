/**
 * 画面説明パネル・画面説明ページで共有する小さなヘルパー。
 * コンポーネントのファイルから分けているのは、Fast Refresh がコンポーネント以外の export を嫌うため。
 */
import { groupOf, type ScreenEntry } from "../../admin/features/guide/screenCatalog";

/** 帳票が追加されたバージョンごとのチップの色（画面一覧パネル・画面遷移図と同じ） */
export const VERSION_CHIP_CLASS: Record<string, string> = {
  "Ver.1.0": "bg-[#fdefe0] text-[#d97316]",
  "Ver.1.5": "bg-[#f1ebfd] text-[#7c4dcc]",
  "Ver.2.0": "bg-[#e7f1fe] text-[#2f7fd4]",
  "Ver.3.0": "bg-[#fdeaea] text-[var(--semantic-brand-danger)]",
  "Ver.4.0": "bg-[#e6f4ec] text-[var(--semantic-brand-primary)]",
};

/** 帳票名の接頭辞（「機械器具点検_工場選択」の「機械器具点検_」）を外した短い画面名 */
export function shortTitleOf(screen: ScreenEntry): string {
  const group = groupOf(screen);
  if (group.kind === "ledger" && screen.title.startsWith(`${group.label}_`)) {
    return screen.title.slice(group.label.length + 1);
  }
  return screen.title;
}
