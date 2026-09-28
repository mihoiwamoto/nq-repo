import type { MachineSearchRecord } from "./types";

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

function formatDateTime(date: string, time: string) {
  return `${formatDate(date)} ${time}`;
}

const RESULT_LABELS: Record<"OK" | "NG", string> = { OK: "正常", NG: "異常あり" };
const RESULT_COLORS: Record<"OK" | "NG", string> = {
  OK: "var(--semantic-status-success)",
  NG: "var(--semantic-status-error)",
};

function ResultTag({ result }: { result: "OK" | "NG" }) {
  return (
    <span
      className="h-6 w-16 rounded-lg flex items-center justify-center text-xs text-white shrink-0"
      style={{ backgroundColor: RESULT_COLORS[result] }}
    >
      {RESULT_LABELS[result]}
    </span>
  );
}

export function DeleteRecordDialog({
  record,
  onCancel,
  onConfirm,
}: {
  record: MachineSearchRecord;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-6 items-start px-8 py-8 w-[680px]">
        {/* Title */}
        <p className="text-2xl font-semibold text-[var(--semantic-text-primary)] text-center w-full">
          点検記録の削除
        </p>

        {/* Message */}
        <p className="text-base text-[var(--semantic-text-primary)] w-full text-center">
          削除した情報は元に戻せません。本当に削除しますか？
        </p>

        {/* Preview */}
        <div className="bg-[#f9f9f9] border border-[#d0d0d0] rounded-lg p-4 w-full">
          <p className="text-sm text-[var(--semantic-text-secondary)] mb-2">削除対象:</p>
          <p className="text-base font-semibold text-[var(--semantic-text-primary)] mb-1">
            {formatDate(record.date)} {record.machineName}
          </p>
          <p className="text-sm text-[var(--semantic-text-secondary)]">
            実施時間: {record.records[0]?.time || "ー"} / 確認者: {record.confirmer}
          </p>
        </div>

        {/* Table */}
        <div className="w-full rounded-lg overflow-x-auto">
          <div className="flex flex-col min-w-full">
            {/* Table Header */}
            <div className="bg-[var(--semantic-brand-primary)] flex h-12 items-center text-white text-sm font-semibold">
              <div className="w-20 flex items-center justify-center px-2 h-full">実施区分</div>
              <div className="w-24 flex items-center justify-center px-2 h-full">点検時間</div>
              <div className="w-24 flex items-center justify-center px-2 h-full">点検内容</div>
              <div className="flex-1 min-w-32 flex items-center justify-start px-2 h-full">通過製品</div>
              <div className="w-20 flex items-center justify-center px-2 h-full">結果</div>
              <div className="w-24 flex items-center justify-center px-2 h-full">備考</div>
              <div className="w-28 flex items-center justify-center px-2 h-full">実施者</div>
            </div>

            {/* Table Body */}
            {record.records.map((item, index) => (
              <div
                key={item.id}
                className={`flex h-14 items-center ${index % 2 === 0 ? "bg-white" : "bg-[#f9f9f9]"}`}
              >
                <div className="w-20 flex items-center justify-center px-2 h-full text-sm text-[var(--semantic-text-primary)]">
                  {item.category}
                </div>
                <div className="w-24 flex items-center justify-center px-2 h-full text-sm text-[var(--semantic-text-primary)]">
                  {item.time}
                </div>
                <div className="w-24 flex items-center justify-center px-2 h-full text-sm text-[var(--semantic-text-primary)]">
                  {item.content}
                </div>
                <div className="flex-1 min-w-32 flex items-center justify-start px-2 h-full text-sm text-[var(--semantic-text-primary)]">
                  {item.passedProduct}
                </div>
                <div className="w-20 flex items-center justify-center px-2 h-full">
                  <ResultTag result={item.result} />
                </div>
                <div className="w-24 flex items-center justify-center px-2 h-full text-sm text-[var(--semantic-text-primary)] truncate">
                  {item.remarks || "ー"}
                </div>
                <div className="w-28 flex items-center justify-center px-2 h-full text-sm text-[var(--semantic-text-primary)] truncate">
                  {item.inspectorName || "ー"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 items-center w-full mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-12 rounded-lg border-2 border-[#333] text-base font-semibold text-[var(--semantic-text-primary)] hover:bg-[#f9f9f9]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 h-12 rounded-lg bg-[#ff4757] text-base font-semibold text-white hover:bg-[#ff3838]"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}
