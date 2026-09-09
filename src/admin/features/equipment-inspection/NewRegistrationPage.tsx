import { useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { DateFilterInput } from "../../components/DateFilterInput";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Toast } from "../../components/Toast";
import { useSchedule } from "./ScheduleContext";
import { AddLineDialog } from "./AddLineDialog";

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

  const selectedLines = lineIds
    .map((id) => lines.find((l) => l.id === id))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));

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
      <PageTitleBar title={isEditing ? "点検予定の編集" : "新規登録"} showBack />
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
            <DateFilterInput value={date} onChange={setDate} />
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
                className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg flex items-center justify-center gap-1 text-base text-[var(--semantic-brand-primary)]"
              >
                + 追加
              </button>
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />
            <div className="bg-white flex flex-col gap-4 items-center p-4 w-full">
              {selectedLines.length === 0 ? (
                <p className="text-sm text-[var(--semantic-text-primary)] w-full">
                  登録された持ち場/ラインがありません
                </p>
              ) : (
                selectedLines.map((line) => (
                  <div key={line.id} className="flex items-center w-full gap-4">
                    <span className="flex-1 text-sm text-[var(--semantic-text-primary)]">
                      【{FREQUENCY_LABEL[line.frequency]}】{line.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setLineIds((prev) => prev.filter((id) => id !== line.id));
                        setToastMessage("削除されました。");
                        setShowToast(true);
                      }}
                      className="flex items-center justify-center w-8 h-8 rounded border border-[var(--semantic-brand-danger)] text-[var(--semantic-brand-danger)]"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="削除">
                        <path
                          d="M7.3077 20.5C6.80898 20.5 6.38302 20.3234 6.02982 19.9702C5.67661 19.617 5.5 19.191 5.5 18.6923V6.00005H4.5V4.50008H8.99997V3.61548H15V4.50008H19.5V6.00005H18.5V18.6923C18.5 19.1975 18.325 19.625 17.975 19.975C17.625 20.325 17.1974 20.5 16.6922 20.5H7.3077ZM17 6.00005H6.99997V18.6923C6.99997 18.7821 7.02883 18.8558 7.08652 18.9135C7.14422 18.9712 7.21795 19.0001 7.3077 19.0001H16.6922C16.7692 19.0001 16.8397 18.968 16.9038 18.9039C16.9679 18.8398 17 18.7693 17 18.6923V6.00005ZM9.40385 17.0001H10.9038V8.00005H9.40385V17.0001ZM13.0961 17.0001H14.5961V8.00005H13.0961V17.0001Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
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
            className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
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

      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </div>
  );
}
