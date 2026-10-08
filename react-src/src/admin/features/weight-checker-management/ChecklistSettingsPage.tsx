import { ChecklistSettingsTable, type ChecklistItem } from "../metal-xray-detection/ChecklistSettingsTable";

/** カテゴリの選択肢は確定デザイン 6296:133223（プルダウン展開）どおり */
const CHECKLIST_ITEMS = [
  "動作確認",
  "その他",
];

const INITIAL_ITEMS: ChecklistItem[] = [
  { id: "item-1", name: "動作確認", description: "分銅を乗せての校正点検" },
  { id: "item-2", name: "動作確認", description: "通過させる製品のパッケージ（印字）との照合" },
];

export function ChecklistSettingsPage() {
  return (
    <ChecklistSettingsTable
      unitLabel="ウェイトチェッカー管理"
      unitPath="weight-checkers"
      categories={CHECKLIST_ITEMS}
      initialItems={INITIAL_ITEMS}
    />
  );
}
