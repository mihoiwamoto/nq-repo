import { useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useRecords } from "./RecordsContext";
import { METAL_DETECTOR_CHECKLIST, XRAY_DETECTOR_CHECKLIST } from "./mockData";
import { AnomalyDialog, type AnomalyData } from "./AnomalyDialog";
import type { ChecklistGroup, InspectionRecord, InspectionResult, MachineApprovalRecord } from "./types";

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

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

const StatusTag = ({ status = "正常" }: { status?: string }) => (
  <span className="bg-[#19c95f] flex items-center justify-center h-7 w-[88px] rounded-lg text-sm text-white shrink-0">
    {status}
  </span>
);

function FactoryBadge() {
  return (
    <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
      <p className="text-xl font-semibold text-[var(--semantic-text-primary)]">㈱西原食品 本社工場</p>
    </div>
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
            <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full mt-1 font-normal">
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
                  <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full mt-1 font-normal">
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

function OperationCheckDetail({
  record,
  item,
  onAnomalyClick,
}: {
  record: MachineApprovalRecord;
  item: InspectionRecord;
  onAnomalyClick: (itemLabel: string, equipmentName?: string, checkItem?: string) => void;
}) {
  if (!item.checklistDetail) return null;
  return (
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

      <ChecklistBlock
        label="金属探知機"
        time={item.checklistDetail.metalTime}
        timeTimestamp={item.checklistDetail.metalTimeTimestamp}
        checklist={METAL_DETECTOR_CHECKLIST}
        checks={item.checklistDetail.metalChecks}
        machineName={record.machineName}
        timestamps={item.checklistDetail.metalTimestamps}
        onAnomalyClick={onAnomalyClick}
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
        onAnomalyClick={onAnomalyClick}
      />
      <div className="border-t border-[#d0d0d0] w-full" />

      <div className="flex flex-col gap-2 items-start w-full">
        <p className="text-xl text-[var(--semantic-text-primary)]">備考</p>
        {item.remarks && (
          <p className="text-base text-[var(--semantic-text-primary)] font-normal text-left">
            {item.remarks}
          </p>
        )}
      </div>
    </div>
  );
}

const TEST_PIECE_DATA = {
  metalDetector: {
    model: "GM-500S",
    inspectorName: "佐藤花子",
    items: [
      {
        time: "08:25",
        pieces: [
          { name: "テストピース：Fe", value: "2.0" },
          { name: "検知確認：Fe", status: "正常" },
          { name: "テストピース：Sus", value: "3.0" },
          { name: "検知確認：Sus", status: "正常" },
        ],
      },
    ],
  },
  xrayDetector: {
    model: "XR-300",
    inspectorName: "山田次郎",
    items: [
      {
        time: "08:25",
        pieces: [
          { name: "テストピース：Sus球", value: "2.0" },
          { name: "検知確認：Sus球", status: "正常" },
          { name: "テストピース：Sus線", value: "3.0" },
          { name: "検知確認：Sus線", status: "正常" },
          { name: "テストピース：ガラス球", value: "3.0" },
          { name: "検知確認：ガラス球", status: "正常" },
          { name: "テストピース：セラミック", value: "3.0" },
          { name: "検知確認：セラミック", status: "正常" },
          { name: "テストピース：ゴム球", value: "3.0" },
          { name: "検知確認：ゴム球", status: "正常" },
        ],
      },
    ],
  },
};

function TestPieceMachineSection({
  title,
  model,
  items,
  inspectorName,
  dateStr,
}: {
  title: string;
  model: string;
  items: Array<{ time: string; pieces: Array<{ name: string; value?: string; status?: string }> }>;
  inspectorName: string;
  dateStr: string;
}) {
  return (
    <>
      <div className="px-4">
        <div className="border-t border-[#d0d0d0]" />
      </div>
      <div className="flex flex-col gap-3 px-4 py-6">
        <div className="bg-[var(--semantic-brand-primary)] flex flex-col gap-2 items-start justify-center p-2 rounded-lg w-full">
          <div className="flex gap-6 items-center justify-center w-full">
            <div className="flex-1">
              <p className="text-xl font-semibold text-white">{title}</p>
            </div>
            <p className="text-xl font-semibold text-white">{model}</p>
          </div>
        </div>

        {items.map((item, itemIndex) => {
          const timestamp = `${inspectorName} ${dateStr} ${item.time}`;
          return (
            <div key={itemIndex} className="flex flex-col gap-3 w-full">
              <div className="flex items-center justify-between w-full">
                <p className="text-xl text-[var(--semantic-text-primary)]">点検時間</p>
                <p className="text-xl text-[var(--semantic-text-primary)]">{item.time}</p>
              </div>
              {item.time && (
                <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">{timestamp}</p>
              )}
              {itemIndex === 0 && item.pieces.length > 0 && <div className="border-t border-[#d0d0d0]" />}

              {item.pieces.map((piece, pieceIndex) => {
                const isStatus = piece.status !== undefined;
                return (
                  <div key={pieceIndex} className="flex flex-col gap-2 w-full">
                    <div className="flex items-center justify-between w-full">
                      <p className="text-xl text-[var(--semantic-text-primary)]">{piece.name}</p>
                      {isStatus ? <StatusTag status={piece.status} /> : <p className="text-xl text-[var(--semantic-text-primary)]">{piece.value}</p>}
                    </div>
                    {pieceIndex < item.pieces.length - 1 && (isStatus ? piece.status : piece.value) && (
                      <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">{timestamp}</p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}

function TestPieceDetail({
  item,
  record,
  onAnomalyClick,
}: {
  item: InspectionRecord;
  record: MachineApprovalRecord;
  onAnomalyClick: () => void;
}) {
  const dateStr = formatDate(record.date);
  const timestamp = `${item.inspectorName} ${dateStr} ${item.time}`;
  return (
    <div className="bg-white rounded-lg w-full overflow-hidden">
      <div className="flex flex-col gap-3 px-4 py-6">
        <div className="flex items-center justify-between w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">実施者</p>
          <p className="text-xl text-[var(--semantic-text-primary)]">{item.inspectorName}</p>
        </div>
      </div>
      <div className="px-4">
        <div className="border-t border-[#d0d0d0]" />
      </div>
      <div className="flex flex-col gap-3 px-4 py-6">
        <div className="flex items-center justify-between w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">点検内容</p>
          <p className="text-xl text-[var(--semantic-text-primary)]">{item.content}</p>
        </div>
      </div>
      <div className="px-4">
        <div className="border-t border-[#d0d0d0]" />
      </div>
      <div className="flex flex-col gap-3 px-4 py-6">
        <div className="flex items-center justify-between w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">実施区分</p>
          <p className="text-xl text-[var(--semantic-text-primary)]">{item.category}</p>
        </div>
      </div>
      <div className="px-4">
        <div className="border-t border-[#d0d0d0]" />
      </div>
      <div className="flex flex-col gap-2 px-4 py-6">
        <div className="flex items-center justify-between w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">通過製品/カテゴリ</p>
          <p className="text-xl text-[var(--semantic-text-primary)]">{item.passedProduct}</p>
        </div>
        {item.passedProduct && (
          <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">{timestamp}</p>
        )}
      </div>
      <div className="px-4">
        <div className="border-t border-[#d0d0d0]" />
      </div>
      <div className="flex flex-col gap-3 px-4 py-6">
        <div className="flex items-center justify-between w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">結果</p>
          <ResultTag result={item.result} onClick={item.result === "NG" ? onAnomalyClick : undefined} />
        </div>
      </div>

      <TestPieceMachineSection
        title="金属探知機"
        model={TEST_PIECE_DATA.metalDetector.model}
        items={TEST_PIECE_DATA.metalDetector.items}
        inspectorName={TEST_PIECE_DATA.metalDetector.inspectorName}
        dateStr={dateStr}
      />
      <TestPieceMachineSection
        title="X線探知機"
        model={TEST_PIECE_DATA.xrayDetector.model}
        items={TEST_PIECE_DATA.xrayDetector.items}
        inspectorName={TEST_PIECE_DATA.xrayDetector.inspectorName}
        dateStr={dateStr}
      />

      <div className="px-4">
        <div className="border-t border-[#d0d0d0]" />
      </div>
      <div className="flex flex-col gap-2 px-4 py-6">
        <p className="text-xl font-semibold text-[var(--semantic-text-primary)]">備考</p>
        <p className="text-base text-[var(--semantic-text-primary)]">
          {item.remarks}
        </p>
      </div>
    </div>
  );
}

function PassedProductDetail({
  item,
  record,
  onAnomalyClick,
}: {
  item: InspectionRecord;
  record: MachineApprovalRecord;
  onAnomalyClick: () => void;
}) {
  const timestamp = `${item.inspectorName} ${formatDate(record.date)} ${item.time}`;
  return (
    <div className="bg-white rounded-lg w-full overflow-hidden">
      <div className="flex flex-col gap-0">
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#d0d0d0] mx-4">
          <p className="text-2xl font-bold text-[var(--semantic-text-primary)] w-48">実施者</p>
          <p className="text-2xl font-bold text-[var(--semantic-text-primary)]">{item.inspectorName}</p>
        </div>

        <div className="flex items-center justify-between px-4 py-4 border-b border-[#d0d0d0] mx-4">
          <p className="text-2xl font-bold text-[var(--semantic-text-primary)] w-48">点検内容</p>
          <p className="text-2xl font-bold text-[var(--semantic-text-primary)]">{item.content}</p>
        </div>

        <div className="flex items-center justify-between px-4 py-4 border-b border-[#d0d0d0] mx-4">
          <p className="text-2xl font-bold text-[var(--semantic-text-primary)] w-48">実施区分</p>
          <p className="text-2xl font-bold text-[var(--semantic-text-primary)]">{item.category}</p>
        </div>

        <div className="flex flex-col px-4 py-4 border-b border-[#d0d0d0] mx-4">
          <div className="flex items-center mb-2">
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)] w-48 whitespace-nowrap">通過製品/カテゴリ</p>
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)] whitespace-nowrap ml-auto">{item.passedProduct}</p>
          </div>
          {item.passedProduct && (
            <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">{timestamp}</p>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-4 border-b border-[#d0d0d0] mx-4">
          <p className="text-2xl font-bold text-[var(--semantic-text-primary)] w-48">結果</p>
          <ResultTag result={item.result} onClick={item.result === "NG" ? onAnomalyClick : undefined} />
        </div>

        <div className="border-t border-[#d0d0d0] mx-4" />
        <div className="bg-[var(--semantic-brand-primary)] px-4 py-2 rounded-lg m-4 text-white font-bold text-2xl mb-2">
          ウェイトチェッカー <span className="float-right">WC-2024-001</span>
        </div>

        <div className="px-4 py-4 border-b border-[#d0d0d0] mx-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)] w-48">点検時間</p>
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)]">{item.time}</p>
          </div>
          {item.time && (
            <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">{timestamp}</p>
          )}
        </div>

        <div className="px-4 py-4 border-b border-[#d0d0d0] mx-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)] w-48">重量下限値（g）</p>
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)]">1</p>
          </div>
          {item.time && (
            <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">{timestamp}</p>
          )}
        </div>

        <div className="px-4 py-4 border-b border-[#d0d0d0] mx-4">
          <p className="text-2xl font-bold text-[var(--semantic-brand-primary)] mb-4">動作確認</p>

          <div className="flex items-center justify-between mb-2">
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)] w-80">分銅を乗せての校正点検</p>
            <StatusTag status="正常" />
          </div>
          {item.time && (
            <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal mb-4">{timestamp}</p>
          )}

          <div className="flex items-center justify-between mb-2">
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)] w-80">通過させる製品のパッケージ（印字）との照合</p>
            <StatusTag status="正常" />
          </div>
          {item.time && (
            <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal mb-4">{timestamp}</p>
          )}
        </div>

        <div className="border-t border-[#d0d0d0] mx-4" />
        <div className="bg-[var(--semantic-brand-primary)] px-4 py-2 rounded-lg m-4 text-white font-bold text-2xl mb-2">
          シーリング <span className="float-right">SL-2024-005</span>
        </div>

        <div className="px-4 py-4 border-b border-[#d0d0d0] mx-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)] w-48">点検時間</p>
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)]">{item.time}</p>
          </div>
          {item.time && (
            <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">{timestamp}</p>
          )}
        </div>

        <div className="px-4 py-4 border-b border-[#d0d0d0] mx-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)] w-48">動作確認</p>
            <StatusTag status="正常" />
          </div>
          {item.time && (
            <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">{timestamp}</p>
          )}
        </div>

        <div className="border-t border-[#d0d0d0] mx-4" />

        <div className="flex flex-col px-4 py-4 mx-4">
          <p className="text-2xl font-bold text-[var(--semantic-text-primary)] mb-2 w-48">備考</p>
          <p className="text-base text-[var(--semantic-text-primary)]">
            {item.remarks}
          </p>
        </div>
      </div>
    </div>
  );
}

function AbnormalReactionDetail({ item, record }: { item: InspectionRecord; record: MachineApprovalRecord }) {
  const timestamp = `${item.inspectorName} ${formatDate(record.date)} ${item.time}`;

  return (
    <div className="bg-white flex flex-col gap-0 rounded-lg overflow-hidden">
      <div className="px-4 py-6">
        <div className="flex items-center justify-between pb-6 border-b border-[#d0d0d0]">
          <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">実施者</p>
          <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">{item.inspectorName}</p>
        </div>
      </div>

      <div className="px-4 pt-0 pb-6">
        <div className="flex items-center justify-between pb-6 border-b border-[#d0d0d0]">
          <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">点検内容</p>
          <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">{item.content}</p>
        </div>
      </div>

      <div className="px-4 pt-0 pb-6">
        <div className="flex items-center justify-between pb-6 border-b border-[#d0d0d0]">
          <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">点検時間</p>
          <div className="text-right">
            <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">{item.time}</p>
            {item.time && (
              <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">{timestamp}</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-0 pb-6">
        <div className="flex items-center justify-between pb-6 border-b border-[#d0d0d0]">
          <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">異常製品</p>
          <div className="text-right">
            <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">{item.passedProduct}</p>
            {item.passedProduct && (
              <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">{timestamp}</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-0 pb-6">
        <div className="flex items-start justify-between pb-3">
          <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">原因</p>
          <div className="text-right">
            <p className="text-[20px] text-[var(--semantic-text-primary)]">{item.cause || "異物混入"}</p>
          </div>
        </div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <p className="text-base text-[var(--semantic-text-secondary)] leading-relaxed max-w-[60%]">
            検査工程で異物が検出されました。金属探知機により異物混入が確認されたため、当該製品は廃棄処分としました。
          </p>
          {item.time && (
            <p className="text-sm text-[var(--semantic-text-secondary)] text-right flex-shrink-0 font-normal">{timestamp}</p>
          )}
        </div>
        <div className="border-b border-[#d0d0d0]" />
      </div>

      <div className="px-4 pt-0 pb-3">
        <div className="flex items-start justify-between pb-3">
          <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">対応</p>
          <div className="text-right">
            <p className="text-[20px] text-[var(--semantic-text-primary)]">{item.response || "点検調整"}</p>
          </div>
        </div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <p className="text-base text-[var(--semantic-text-secondary)] leading-relaxed max-w-[60%]">
            金属探知機の感度を再調整し、校正用テストピースで動作確認を実施しました。その後、製品の再処理ラインで検査を再開しています。
          </p>
          {item.time && (
            <p className="text-sm text-[var(--semantic-text-secondary)] text-right flex-shrink-0 font-normal">{timestamp}</p>
          )}
        </div>
        <div className="border-b border-[#d0d0d0]" />
      </div>

      <div className="flex flex-col px-4 pt-0 pb-6">
        <p className="text-[20px] text-[var(--semantic-text-primary)]">備考</p>
        <p className="text-base text-[var(--semantic-text-primary)] leading-relaxed mt-2">
          {item.remarks}
        </p>
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
    const type = item!.content === "テストピース" ? "test-piece" : "product";
    setAnomalyDialog({
      isOpen: true,
      type,
      itemName: itemLabel,
      equipmentName,
      checkItem,
    });
  }

  function handleGenericAnomalyClick() {
    setAnomalyDialog({
      isOpen: true,
      type: "product",
      itemName: item!.category || "製品",
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
        <FactoryBadge />

        {item.content === "動作確認" && item.checklistDetail ? (
          <OperationCheckDetail record={record} item={item} onAnomalyClick={handleAnomalyClick} />
        ) : item.content === "テストピース" ? (
          <TestPieceDetail item={item} record={record} onAnomalyClick={handleGenericAnomalyClick} />
        ) : item.content === "製品通過" ? (
          <PassedProductDetail item={item} record={record} onAnomalyClick={handleGenericAnomalyClick} />
        ) : item.content === "異常反応" ? (
          <AbnormalReactionDetail item={item} record={record} />
        ) : (
          <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">実施者</p>
              <p className="text-xl text-[var(--semantic-text-primary)]">{item.inspectorName}</p>
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />
            <div className="flex flex-col gap-2 items-start w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">備考</p>
              {item.remarks && (
                <p className="text-base text-[var(--semantic-text-primary)] font-normal text-left">{item.remarks}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
