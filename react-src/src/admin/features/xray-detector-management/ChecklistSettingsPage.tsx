import { ChecklistSettingsTable, type ChecklistItem } from "../metal-xray-detection/ChecklistSettingsTable";

/** カテゴリの選択肢は本番どおり（確定デザイン 6296:133184 の「設定」は本番に無いので外した。2026-10-08） */
const CHECKLIST_ITEMS = [
  "電源ON",
  "コンベア・センサー",
  "はね板（フリッパー）",
  "その他",
];

const INITIAL_ITEMS: ChecklistItem[] = [
  { id: "item-1", name: "電源ON", description: "電源が正常に入り始動する" },
  { id: "item-2", name: "コンベア・センサー", description: "ゆるみ、破損、汚れ、異音がなく正常に作動する" },
];

export function ChecklistSettingsPage() {
  return (
    <ChecklistSettingsTable
      unitLabel="X線探知機管理"
      unitPath="xray-detectors"
      categories={CHECKLIST_ITEMS}
      initialItems={INITIAL_ITEMS}
    />
  );
}
