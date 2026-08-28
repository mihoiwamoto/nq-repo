import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { useSchedule } from "./ScheduleContext";
import type { ChecklistItem } from "./types";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";

let nextId = 1000;

export function ChecklistSettingsPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const basePath = `/admin/ledger-management/equipment-inspection/factories/${factoryId}`;
  const { checklistItems, saveChecklistItems } = useSchedule();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<ChecklistItem[]>(checklistItems);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function updateText(id: string, text: string) {
    setDraft((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)));
  }

  function addRow() {
    setDraft((prev) => [...prev, { id: `c${nextId++}`, text: "" }]);
  }

  function confirmDelete() {
    if (!pendingDeleteId) return;
    setDraft((prev) => prev.filter((item) => item.id !== pendingDeleteId));
    setPendingDeleteId(null);
  }

  function handleSave() {
    saveChecklistItems(draft.filter((item) => item.text.trim() !== ""));
    navigate(`${basePath}/schedule`);
  }

  return (
    <div>
      <PageTitleBar title="確認項目の設定" showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/equipment-inspection" },
          { label: "持ち場/ライン選択", to: basePath },
          { label: "確認項目の設定" },
        ]}
      />
      <div className="flex flex-col gap-6 items-start p-6">
        <div className="flex flex-col gap-2 items-start w-full">
          <div className="flex flex-col items-start rounded-lg overflow-hidden w-full">
            <div className="bg-[#f6f6f6] flex h-[50px] items-center w-full">
              <div className="flex-1 flex items-center justify-center p-2 h-full">
                <p className="text-sm text-[var(--semantic-brand-primary)]">確認内容</p>
              </div>
              <div className="w-20 flex items-center justify-center p-2 h-full">
                <p className="text-sm text-[var(--semantic-brand-primary)]">操作</p>
              </div>
            </div>
            {draft.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center w-full ${index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}
              >
                <div className="flex-1 p-2">
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateText(item.id, e.target.value)}
                    className="bg-white border border-[#d0d0d0] flex items-center min-h-10 px-4 py-2 rounded-lg w-full text-base text-[var(--semantic-text-primary)]"
                  />
                </div>
                <div className="w-20 flex items-center justify-center p-2">
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(item.id)}
                    className="bg-white border border-[var(--semantic-brand-danger)] size-10 rounded-lg flex items-center justify-center"
                  >
                    <img src={iconTrash} alt="削除" className="size-6" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addRow}
            className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg flex items-center justify-center gap-1 text-base text-[var(--semantic-brand-primary)]"
          >
            + 行追加
          </button>
        </div>

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() => navigate("/admin/ledger-management/equipment-inspection")}
            className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
          >
            保存
          </button>
        </div>
      </div>

      {pendingDeleteId && (
        <ConfirmDialog
          title="この確認項目を削除しますか？"
          onCancel={() => setPendingDeleteId(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
