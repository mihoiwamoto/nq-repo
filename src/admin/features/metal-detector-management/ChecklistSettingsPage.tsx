import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { Toast } from "../../components/Toast";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";

const CHECKLIST_ITEMS = [
  "電源ON",
  "コンベア・プーリー・モーター",
  "設定",
  "はね板（フリッパー）",
];

type ChecklistItem = {
  id: string;
  name: string;
  description: string;
};

export function ChecklistSettingsPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const navigate = useNavigate();
  const basePath = `/admin/ledger-management/metal-xray-detection/factories/${factoryId}`;

  const [items, setItems] = useState<ChecklistItem[]>([
    { id: "item-1", name: "電源ON", description: "電源が正常に入り始動する" },
    { id: "item-2", name: "コンベア・プーリー・モーター", description: "ゆるみ、破損、汚れ、異音がなく正常に作動する" },
  ]);
  const [showToast, setShowToast] = useState(false);

  let nextId = 1000;

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: `item-${nextId++}`, name: "", description: "" },
    ]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setShowToast(true);
  }

  function updateItem(id: string, field: keyof Omit<ChecklistItem, "id">, value: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function handleConfirm() {
    navigate(`${basePath}/metal-detectors`, { state: { justSaved: true } });
  }

  return (
    <div>
      <PageTitleBar title="動作確認項目設定" showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/metal-xray-detection" },
          { label: "金属/X線探知機記録", to: basePath },
          { label: "金属探知機管理", to: `${basePath}/metal-detectors` },
          { label: "動作確認項目設定" },
        ]}
      />
      {showToast && <Toast message="削除されました。" onClose={() => setShowToast(false)} />}
      <div className="flex flex-col gap-6 p-6">
        <div className="bg-white rounded-lg p-6 flex flex-col gap-4 w-full max-w-[800px]">
          <h2 className="text-2xl font-bold text-[var(--semantic-text-primary)]">
            動作確認項目設定
          </h2>

          <div className="flex flex-col gap-3 items-start w-full">
            {items.map((item, index) => (
              <div key={item.id} className="flex gap-2 items-start w-full">
                <Pulldown
                  value={item.name}
                  onChange={(value) => updateItem(item.id, "name", value)}
                  options={CHECKLIST_ITEMS.map((name) => ({
                    value: name,
                    label: name,
                  }))}
                  placeholder=""
                  className="bg-white border border-[#d0d0d0] flex items-center h-10 px-4 py-2 rounded-lg w-[240px] text-base text-[var(--semantic-text-primary)]"
                />
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, "description", e.target.value)}
                  placeholder="説明を入力"
                  className="bg-white border border-[#d0d0d0] flex-1 h-10 px-4 py-2 rounded-lg text-base text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="bg-white border border-[#ef4444] size-10 rounded-lg flex items-center justify-center shrink-0"
                >
                  <img src={iconTrash} alt="削除" className="size-5" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg flex items-center justify-center gap-1 text-base text-[var(--semantic-brand-primary)]"
          >
            + 行追加
          </button>

          <div className="flex gap-4 items-center pt-4">
            <button
              type="button"
              onClick={() => navigate(`${basePath}/metal-detectors`)}
              className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
