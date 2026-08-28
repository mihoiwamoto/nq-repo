import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useSchedule } from "./ScheduleContext";
import { AddLineDialog } from "./AddLineDialog";

const FREQUENCY_LABEL = { daily: "毎日", weekly: "毎週", monthly: "毎月", yearly: "毎年" } as const;

export function NewRegistrationPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const basePath = `/admin/ledger-management/equipment-inspection/factories/${factoryId}`;
  const { lines, entries, upsertEntry } = useSchedule();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialDate = searchParams.get("date") ?? "";
  const existingEntry = initialDate ? entries[initialDate] : undefined;
  const isEditing = Boolean(existingEntry);

  const [date, setDate] = useState(initialDate);
  const [lineIds, setLineIds] = useState<string[]>(existingEntry?.lineIds ?? []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState("");

  const selectedLines = lineIds
    .map((id) => lines.find((l) => l.id === id))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));

  function handleSubmit() {
    if (!date || lineIds.length === 0) {
      setError("点検日と持ち場/ラインは必須です");
      return;
    }
    upsertEntry(date, lineIds);
    navigate(`${basePath}/schedule`, { state: { justSaved: true, date } });
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
          <div className="flex flex-col gap-1 items-start w-[300px]">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">点検日</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full"
            />
          </div>

          <div className="flex flex-col items-start rounded-lg w-full overflow-hidden">
            <div className="bg-white flex gap-6 items-center p-4 w-full">
              <div className="flex-1 flex gap-2 items-center">
                <p className="text-xl text-[var(--semantic-text-primary)]">持ち場/ライン</p>
                <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
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
                      onClick={() => setLineIds((prev) => prev.filter((id) => id !== line.id))}
                      className="text-sm text-[var(--semantic-text-secondary)]"
                    >
                      削除
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
            登録
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
    </div>
  );
}
