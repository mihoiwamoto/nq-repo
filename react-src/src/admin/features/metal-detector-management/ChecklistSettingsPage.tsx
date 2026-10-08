import { ChecklistSettingsTable, type ChecklistItem } from "../metal-xray-detection/ChecklistSettingsTable";

/** カテゴリの選択肢は確定デザイン 6296:133139（プルダウン展開）どおり */
const CHECKLIST_ITEMS = [
  "電源ON",
  "コンベア・プーリー・モーター",
  "設定",
  "はね板（フリッパー）",
  "その他",
];

const INITIAL_ITEMS: ChecklistItem[] = [
  { id: "item-1", name: "電源ON", description: "電源が正常に入り始動する" },
  { id: "item-2", name: "コンベア・プーリー・モーター", description: "ゆるみ、破損、汚れ、異音がなく正常に作動する" },
];

export function ChecklistSettingsPage() {
  return (
    <ChecklistSettingsTable
      unitLabel="金属探知機管理"
      unitPath="metal-detectors"
      categories={CHECKLIST_ITEMS}
      initialItems={INITIAL_ITEMS}
    />
  );
}
