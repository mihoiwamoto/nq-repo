import { useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { DateFilterInput } from "../../components/DateFilterInput";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Toast } from "../../components/Toast";
import { useSchedule } from "./ScheduleContext";
import { AddLineDialog } from "./AddLineDialog";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";
import iconPlus from "../../../assets/figma/icons/common/plus.svg";

const FREQUENCY_LABEL = { daily: "毎日", weekly: "毎週", monthly: "毎月", yearly: "毎年" } as const;

export function NewRegistrationPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const basePath = `/admin/ledger-management/equipment-inspection/factories/${factoryId}`;
  const { lines, entries, upsertEntry } = useSchedule();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialDate = searchParams.get("date") ?? "";
  const existingEntry = initialDate ? entries[initialDate] : undefined;
  const isEditing = Boolean(existingEntry);
  const duplicateLineIds = (location.state as { duplicateLineIds?: string[] } | null)?.duplicateLineIds;

  const [date, setDate] = useState(initialDate);
  const [lineIds, setLineIds] = useState<string[]>(existingEntry?.lineIds ?? duplicateLineIds ?? []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [lineToDelete, setLineToDelete] = useState<string | null>(null);

  const selectedLines = lineIds
    .map((id) => lines.find((l) => l.id === id))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));
  // 確定デザイン（7139:258366 → 7139:258392）：ごみ箱 →「持ち場/ライン設定の削除」→「削除」。
  // 登録済みの日の編集ではその場で保存して削除完了へ。新規登録ではまだ保存していないので外してトーストだけ
  function confirmDeleteLine() {
    if (!lineToDelete) return;
    const remaining = lineIds.filter((id) => id !== lineToDelete);
    setLineToDelete(null);
    if (isEditing) {
      upsertEntry(initialDate, remaining);
      navigate(`${basePath}/schedule/deleted?date=${initialDate}`);
      return;
    }
    setLineIds(remaining);
    setToastMessage("削除されました。");
    setShowToast(true);
  }

  function handleSubmit() {
    if (!date || lineIds.length === 0) {
      setError("点検日と持ち場/ラインは必須です");
      return;
    }
    upsertEntry(date, lineIds);
    if (isEditing) {
      navigate(`${basePath}/schedule`, { state: { justSaved: true, date } });
    } else {
      navigate(`${basePath}/schedule/register/complete?date=${date}`);
    }
  }

  return (
    <div>
      <PageTitleBar title={isEditing ? "編集" : "新規登録"} showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/equipment-inspection" },
          { label: "持ち場/ライン選択", to: basePath },
          { label: "点検予定", to: `${basePath}/schedule` },
          { label: isEditing ? "編集" : "新規登録" },
        ]}
      />
      <div className="flex flex-col gap-10 items-start p-6">
        <div className="flex flex-col gap-6 items-start w-full">
          <div className="flex flex-col gap-1 items-start">
            <div className="flex gap-2 items-center">
              <p className="text-xl font-semibold text-[var(--semantic-text-primary)]">点検日</p>
              <span className="text-sm font-semibold text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <DateFilterInput variant="form" value={date} onChange={setDate} />
          </div>

          <div className="flex flex-col items-start rounded-lg w-full overflow-hidden">
            <div className="bg-white flex gap-6 items-center p-4 w-full">
              <div className="flex-1 flex gap-2 items-center">
                <p className="text-xl font-semibold text-[var(--semantic-text-primary)]">持ち場/ライン</p>
                <span className="text-sm font-semibold text-[var(--semantic-brand-danger)]">※必須</span>
              </div>
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg flex items-center justify-center gap-1 text-base text-[var(--semantic-brand-primary)]"
              >
                <span
                  aria-hidden
                  className="inline-block size-5 shrink-0"
                  style={{
                    WebkitMaskImage: `url("${iconPlus}")`,
                    maskImage: `url("${iconPlus}")`,
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    backgroundColor: "var(--semantic-brand-primary)",
                  }}
                />
                追加
              </button>
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />
            {/* 確定デザイン（7139:258341・7139:258316）：行ごとに「持ち場/ライン名（左）／値」とゴミ箱、行の間に線 */}
            <div className="bg-white flex flex-col gap-4 items-center p-4 w-full">
              {selectedLines.length === 0 ? (
                <p className="text-base text-[var(--semantic-text-primary)] w-full">
                  データがありません。
                </p>
              ) : (
                selectedLines.map((line, i) => (
                  <div key={line.id} className="flex flex-col gap-4 w-full">
                    {i > 0 && <div className="border-t border-[#d0d0d0] w-full" />}
                    <div className="flex items-center w-full gap-4 h-10">
                      <span className="w-40 shrink-0 text-base text-[var(--semantic-text-primary)] whitespace-nowrap">
                        持ち場/ライン名
                      </span>
                      <span className="flex-1 min-w-0 text-base text-[var(--semantic-text-primary)]">
                        【{FREQUENCY_LABEL[line.frequency]}】{line.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setLineToDelete(line.id)}
                        className="bg-white border border-[var(--semantic-brand-danger)] size-10 rounded-lg flex items-center justify-center shrink-0"
                      >
                        <img src={iconTrash} alt="削除" className="size-6" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-[var(--semantic-brand-danger)]">{error}</p>}

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() => navigate(`${basePath}/schedule`)}
            className="bg-white shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
          >
            {isEditing ? "保存" : "登録"}
          </button>
        </div>
      </div>

      {dialogOpen && (
        <AddLineDialog
          selectedIds={lineIds}
          onClose={() => setDialogOpen(false)}
          onConfirm={(ids) => {
            setLineIds(ids);
            setDialogOpen(false);
          }}
        />
      )}

      {lineToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setLineToDelete(null)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px]">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                持ち場/ライン設定の削除
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)]">
                削除した情報は元に戻せません。本当に削除しますか？
              </p>
            </div>
            <div className="flex gap-6 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setLineToDelete(null)}
                className="bg-white shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={confirmDeleteLine}
                className="bg-[var(--semantic-brand-danger)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </div>
  );
}
