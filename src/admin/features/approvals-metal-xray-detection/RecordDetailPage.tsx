import { useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useRecords } from "./RecordsContext";
import { METAL_DETECTOR_CHECKLIST, XRAY_DETECTOR_CHECKLIST } from "./mockData";
import { AnomalyDialog, type AnomalyData } from "./AnomalyDialog";
import type { ChecklistGroup, InspectionResult } from "./types";

function ResultTag({ result, onClick }: { result: InspectionResult; onClick?: () => void }) {
  const label = result === "OK" ? "正常" : "異常あり";
  const color = result === "OK" ? "var(--semantic-status-success)" : "var(--semantic-status-error)";
  return (
    <button
      type="button"
      onClick={onClick}
      className={result === "OK" ? "" : "cursor-pointer hover:opacity-80"}
      disabled={result === "OK"}
    >
      <span
        className="h-6 w-16 rounded-lg flex items-center justify-center text-xs text-white shrink-0"
        style={{ backgroundColor: color }}
      >
        {label}
      </span>
    </button>
  );
}

function ChecklistBlock({
  label,
  time,
  timeTimestamp,
  checklist,
  checks,
  machineName,
  timestamps,
  onAnomalyClick,
}: {
  label: string;
  time: string;
  timeTimestamp?: string;
  checklist: ChecklistGroup[];
  checks: Record<string, InspectionResult>;
  machineName?: string;
  timestamps?: Record<string, string>;
  onAnomalyClick?: (itemLabel: string, equipmentName?: string, checkItem?: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 items-start w-full">
      <div className="bg-[var(--semantic-brand-primary)] flex items-center justify-between gap-4 px-3 py-2 rounded-lg w-full">
        <p className="text-base font-semibold text-white">{label}</p>
        {machineName && <p className="text-base font-semibold text-white">{machineName}</p>}
      </div>
      <div className="flex flex-col gap-3 items-start px-2 w-full">
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">点検時間</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{time}</p>
          </div>
          {timeTimestamp && (
            <p className="text-sm text-[var(--semantic-text-secondary)] text-right mt-1 font-normal">
              {timeTimestamp}
            </p>
          )}
        </div>
        <div className="border-t border-[#d0d0d0] w-full" />
        {checklist.map((group, groupIndex) => (
          <div key={group.title} className="flex flex-col gap-3 items-start w-full">
            <p className="text-base text-[var(--semantic-brand-primary)]">{group.title}</p>
            {group.items.map((item) => (
              <div key={item.key} className="flex flex-col w-full">
                <div className="flex items-center justify-between gap-4 w-full">
                  <p className="text-base text-[var(--semantic-text-primary)]">{item.label}</p>
                  {checks[item.key] && (
                    <ResultTag
                      result={checks[item.key]}
                      onClick={
                        checks[item.key] === "NG"
                          ? () => onAnomalyClick?.(item.label, label, item.label)
                          : undefined
                      }
                    />
                  )}
                </div>
                {timestamps?.[item.key] && (
                  <p className="text-sm text-[var(--semantic-text-secondary)] text-right mt-1 font-normal">
                    {timestamps[item.key]}
                  </p>
                )}
              </div>
            ))}
            {groupIndex < checklist.length - 1 && <div className="border-t border-[#d0d0d0] w-full" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecordDetailPage() {
  const { recordId, itemId } = useParams<{ recordId: string; itemId: string }>();
  const { records } = useRecords();
  const [anomalyDialog, setAnomalyDialog] = useState<{
    isOpen: boolean;
    type: "test-piece" | "product";
    itemName: string;
    equipmentName?: string;
    checkItem?: string;
  } | null>(null);

  const record = records.find((r) => r.id === recordId);
  const item = record?.records.find((r) => r.id === itemId);

  if (!record || !item) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">データが見つかりません</p>
      </div>
    );
  }

  const basePath = "/admin/approvals/metal-xray-detection";

  function handleAnomalyClick(itemLabel: string, equipmentName?: string, checkItem?: string) {
    const type = item.content === "テストピース" ? "test-piece" : "product";
    setAnomalyDialog({
      isOpen: true,
      type,
      itemName: itemLabel,
      equipmentName,
      checkItem,
    });
  }

  function handleAnomalyConfirm(data: AnomalyData) {
    console.log("Anomaly recorded:", data);
    setAnomalyDialog(null);
  }

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "承認申請管理", to: "/admin/approvals" },
          { label: "データ一覧", to: basePath },
          { label: "点検内容一覧", to: `${basePath}/records/${record.id}` },
          { label: "詳細" },
        ]}
      />
      <AnomalyDialog
        isOpen={anomalyDialog?.isOpen ?? false}
        type={anomalyDialog?.type ?? "test-piece"}
        itemName={anomalyDialog?.itemName ?? ""}
        equipmentName={anomalyDialog?.equipmentName}
        checkItem={anomalyDialog?.checkItem}
        onClose={() => setAnomalyDialog(null)}
        onConfirm={handleAnomalyConfirm}
      />
      <div className="flex flex-col gap-4 p-6">
        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施者</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{item.inspectorName}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">点検内容</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{item.content}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

          {item.content === "動作確認" && item.checklistDetail ? (
            <>
              <ChecklistBlock
                label="金属探知機"
                time={item.checklistDetail.metalTime}
                timeTimestamp={item.checklistDetail.metalTimeTimestamp}
                checklist={METAL_DETECTOR_CHECKLIST}
                checks={item.checklistDetail.metalChecks}
                machineName={record.machineName}
                timestamps={item.checklistDetail.metalTimestamps}
                onAnomalyClick={handleAnomalyClick}
              />
              <div className="border-t border-[#d0d0d0] w-full" />
              <ChecklistBlock
                label="X線探知機"
                time={item.checklistDetail.xrayTime}
                timeTimestamp={item.checklistDetail.xrayTimeTimestamp}
                checklist={XRAY_DETECTOR_CHECKLIST}
                checks={item.checklistDetail.xrayChecks}
                machineName="X線1号機"
                timestamps={item.checklistDetail.xrayTimestamps}
                onAnomalyClick={handleAnomalyClick}
              />
              <div className="border-t border-[#d0d0d0] w-full" />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between w-full">
                <p className="text-xl text-[var(--semantic-text-primary)]">実施区分</p>
                <p className="text-xl text-[var(--semantic-text-primary)]">{item.category}</p>
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex items-center justify-between w-full">
                <p className="text-xl text-[var(--semantic-text-primary)]">点検時間</p>
                <p className="text-xl text-[var(--semantic-text-primary)]">{item.time}</p>
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex items-center justify-between w-full">
                <p className="text-xl text-[var(--semantic-text-primary)]">通過製品</p>
                <p className="text-xl text-[var(--semantic-text-primary)]">{item.passedProduct}</p>
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex items-center justify-between w-full">
                <p className="text-xl text-[var(--semantic-text-primary)]">結果</p>
                <ResultTag
                  result={item.result}
                  onClick={
                    item.result === "NG"
                      ? () =>
                          setAnomalyDialog({
                            isOpen: true,
                            type: "product",
                            itemName: item.category || "製品",
                          })
                      : undefined
                  }
                />
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
            </>
          )}

          <div className="flex flex-col gap-2 items-start w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">備考</p>
            {item.remarks && (
              <p className="text-base text-[var(--semantic-text-primary)] font-normal text-left">
                {item.remarks}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
