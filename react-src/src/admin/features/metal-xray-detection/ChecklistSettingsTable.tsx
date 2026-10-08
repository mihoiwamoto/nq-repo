import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { Toast } from "../../components/Toast";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";
import iconPlus from "../../../assets/figma/icons/common/plus.svg";
import {
  checklistKey,
  useMetalXrayManagement,
  type ChecklistItem,
} from "./MetalXrayManagementContext";
import { AdminEmptyState } from "../../components/AdminEmptyState";

export type { ChecklistItem };

/**
 * 金属探知機・X線探知機・ウェイトチェッカーの動作確認項目設定（共通の作り）。
 * 確定デザイン 6296:133120（金属）・6296:133166（X線）・6296:133208（ウェイトチェッカー）どおり、
 * 見出し「カテゴリ」「確認内容」「操作」の表に 1 行ずつ並べ、表の下に「+ 行追加」、その下に キャンセル／保存。
 * 「保存」した行は工場ごと・機器の種類ごとに Context（MetalXrayManagementContext の checklists）へ持ち、
 * 次に開いたときはそれを初期行にする（本番は DB に保存し edit で読み込む。2026-10-08）。未保存なら initialItems。
 */
export function ChecklistSettingsTable({
  unitLabel,
  unitPath,
  categories,
  initialItems,
}: {
  /** パンくずの 4 つ目（金属探知機管理 など） */
  unitLabel: string;
  /** 機器の一覧の URL の末尾（metal-detectors など） */
  unitPath: string;
  /** カテゴリのプルダウンの選択肢 */
  categories: string[];
  initialItems: ChecklistItem[];
}) {
  const { factoryId } = useParams<{ factoryId: string }>();
  const navigate = useNavigate();
  const basePath = `/admin/ledger-management/metal-xray-detection/factories/${factoryId}`;
  const listPath = `${basePath}/${unitPath}`;

  const { checklists, saveChecklist } = useMetalXrayManagement();
  const storeKey = checklistKey(unitPath, factoryId);
  const [items, setItems] = useState<ChecklistItem[]>(() => checklists[storeKey] ?? initialItems);
  const [showToast, setShowToast] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const nextId = useRef(1000);

  function addItem() {
    setItems((prev) => [...prev, { id: `item-${nextId.current++}`, name: "", description: "" }]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setShowToast(true);
  }

  function updateItem(id: string, field: keyof Omit<ChecklistItem, "id">, value: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  return (
    <div>
      <PageTitleBar title="動作確認項目設定" showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/metal-xray-detection" },
          { label: "金属/X線探知機記録", to: basePath },
          { label: unitLabel, to: listPath },
          { label: "動作確認項目設定" },
        ]}
      />
      {showToast && <Toast message="削除されました。" onClose={() => setShowToast(false)} />}
      <div className="flex flex-col gap-10 items-start p-6">
        <div className="flex flex-col gap-2 items-start w-full">
          <div className="flex flex-col w-full rounded-lg overflow-hidden">
            <div className="bg-[#f6f6f6] flex h-[50px] items-center w-full">
              <div className="w-[320px] shrink-0 flex items-center justify-center p-2 h-full">
                <p className="text-sm text-[var(--semantic-brand-primary)]">カテゴリ</p>
              </div>
              <div className="flex-1 min-w-0 flex items-center justify-center p-2 h-full">
                <p className="text-sm text-[var(--semantic-brand-primary)]">確認内容</p>
              </div>
              <div className="w-[80px] shrink-0 flex items-center justify-center p-2 h-full">
                <p className="text-sm text-[var(--semantic-brand-primary)]">操作</p>
              </div>
            </div>
            {items.length === 0 ? (
              <AdminEmptyState className="mt-2" />
            ) : (
              items.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex h-14 items-center w-full ${index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}
                >
                  <div className="w-[320px] shrink-0 flex items-center p-2 h-full">
                    <div className="w-full">
                      <Pulldown
                        value={item.name}
                        onChange={(value) => updateItem(item.id, "name", value)}
                        options={categories.map((name) => ({ value: name, label: name }))}
                        placeholder="選択してください"
                        className="bg-white border border-[#d0d0d0] flex items-center h-10 px-4 py-2 rounded-lg w-full text-base text-[var(--semantic-text-primary)]"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex items-center p-2 h-full">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      className="bg-white border border-[#d0d0d0] w-full h-10 px-4 py-2 rounded-lg text-base text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
                    />
                  </div>
                  <div className="w-[80px] shrink-0 flex items-center justify-center p-2 h-full">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="bg-white border border-[var(--semantic-brand-danger)] size-10 rounded-lg flex items-center justify-center"
                    >
                      <img src={iconTrash} alt="削除" className="size-6" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg flex items-center justify-center gap-1 text-base text-[var(--semantic-brand-primary)]"
          >
            <img src={iconPlus} alt="" aria-hidden className="size-5" />
            行追加
          </button>
          {errors.map((message) => (
            <p key={message} className="text-sm text-[var(--semantic-brand-danger)]">
              {message}
            </p>
          ))}
        </div>

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() => navigate(listPath)}
            className="bg-white shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={() => {
              // 本番（OperationCheckItem/UpdateRequest）はカテゴリ・確認内容とも必須
              const next: string[] = [];
              if (items.some((item) => !item.name)) next.push("カテゴリを選択してください。");
              if (items.some((item) => !item.description.trim())) next.push("確認内容を入力してください。");
              setErrors(next);
              if (next.length > 0) return;
              saveChecklist(storeKey, items);
              navigate(listPath, { state: { justSaved: true } });
            }}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
