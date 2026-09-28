import { type CSSProperties } from "react";
import { Pulldown } from "../../components/Pulldown";
import { useRecords } from "./RecordsContext";
import {
  REPAIR_STATUS_COLORS,
  REPAIR_STATUS_LABELS,
  REPAIR_STATUS_NEXT_OPTIONS,
  type RepairStatus,
  type ScaleApprovalRecord,
} from "./types";

export function RepairStatusSection({ records }: { records: ScaleApprovalRecord[] }) {
  const { setRepairStatus } = useRecords();
  const ngRecords = records.filter((r) => !r.skipped && r.operationCheck === "ng");

  if (ngRecords.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 items-start w-full">
      <p className="text-xl text-[var(--semantic-text-primary)]">修理状況</p>
      <p className="text-sm text-[var(--semantic-text-secondary)]">
        異常があった箇所は、その後の対応状況に応じてステータスを更新してください。修理が完了した場合は「修理完了」ステータスに変更してください。
      </p>
      <div className="bg-white flex flex-col gap-3 items-start p-4 rounded-lg w-full">
        {ngRecords.map((record, index) => (
          <div key={record.id} className="flex flex-col gap-2 items-start w-full">
            {index > 0 && <div className="border-t border-[#d0d0d0] w-full" />}
            <div className="flex gap-4 items-center justify-between w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">{record.scaleLabel}</p>
              <Pulldown
                value={record.repairStatus ?? "action_needed"}
                onChange={(value) => setRepairStatus(record.id, value as RepairStatus)}
                options={REPAIR_STATUS_NEXT_OPTIONS[record.repairStatus ?? "action_needed"].map((opt) => ({
                  value: opt,
                  label: REPAIR_STATUS_LABELS[opt],
                }))}
                className="h-8 px-3 rounded-lg text-sm text-white shrink-0"
                style={{ backgroundColor: REPAIR_STATUS_COLORS[record.repairStatus ?? "action_needed"], "--arrow-color": "white" } as CSSProperties}
              />
            </div>
            <div className="flex flex-col gap-1 items-start px-2 text-base text-[var(--semantic-text-secondary)] w-full">
              <p>原因：{record.operationCause}</p>
              <p>対応：{record.operationAction}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
