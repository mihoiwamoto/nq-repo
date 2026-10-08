import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { useFromProgress } from "../../layout/ProgressFlowContext";
import iconAttention from "../../../assets/figma/icons/common/attention.svg";
import { useCleaningRecord } from "./CleaningRecordContext";
import { LineProgressButton, LineProgressPanel } from "./LineProgressPanel";
import { ACTORS, cleaningPoints, type CleaningItemRecord } from "./mockData";

function keyFor(location: string, item: string) {
  return `${location}|${item}`;
}

type ConfirmState = {
  lineName: string;
  /** 見出しに出すライン名（進捗一覧・差し戻しから来たときは【頻度】付き） */
  lineTitle?: string;
  date: string;
  records: Record<string, CleaningItemRecord>;
  remarks: string;
  inspectorName?: string;
};

export function ConfirmPage() {
  const { lineId } = useParams<{ lineId: string }>();
  const navigate = useNavigate();
  const { lines, updateLineStatus } = useCleaningRecord();
  const [progressOpen, setProgressOpen] = useState(false);
  // 進捗一覧から来た確認画面には「点検済み n/m」のつまみを出さない（確定デザイン 7139:229260）
  const fromProgress = useFromProgress();
  const location = useLocation();
  const state = location.state as ConfirmState | null;
  const basePath = `/app/ledger-list/cleaning-record/lines/${lineId}`;

  if (!state) {
    return (
      <>
        <AppHeader title="確認画面" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-base text-[var(--semantic-text-secondary)]">
            点検内容が見つかりません。点検画面から操作してください。
          </p>
          <button
            type="button"
            onClick={() => navigate(basePath)}
            className="bg-[var(--semantic-brand-primary)] h-12 px-6 rounded-lg text-base text-white"
          >
            点検画面に戻る
          </button>
        </div>
      </>
    );
  }

  const { lineName, lineTitle = lineName, date, records, remarks, inspectorName = ACTORS[0].name } = state;

  // ヘッダー右の「点検済み n/m」は、このラインと同じ頻度のラインで数える（ラインの一覧と同じ）
  const frequency = lines.find((l) => l.id === lineId)?.frequency ?? "daily";
  const sameFrequency = lines.filter((l) => l.frequency === frequency);
  const inspectedCount = sameFrequency.filter((l) => l.status === "inspected" || l.status === "confirmed").length;

  function handleSubmit() {
    if (lineId) updateLineStatus(lineId, "inspected");
    navigate(`/app/ledger-list/cleaning-record/lines/${lineId}/complete`);
  }

  return (
    <>
      <AppHeader
        title={`清掃記録_${lineTitle}`}
        action={
          fromProgress ? undefined : <LineProgressButton
            inspectedCount={inspectedCount}
            total={sameFrequency.length}
            onClick={() => setProgressOpen(true)}
          />
        }
      />
      {/* 確定デザイン（7139:221957）：ヘッダーの下 24px に高さ 56 の注意の帯 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pt-6 pb-4 flex flex-col gap-4 items-center">
        <div className="bg-[#f7f292] flex gap-2 items-center h-14 px-4 rounded-lg w-full max-w-full shrink-0">
          <img src={iconAttention} alt="注意" className="size-6 shrink-0" />
          <p className="text-sm text-[var(--semantic-text-primary)]">
            実施者、入力内容に誤りがないか提出前にご確認ください。
          </p>
        </div>

        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{date.replaceAll("-", "/")}</p>
          </div>
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">実施者</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{inspectorName}</p>
          </div>
        </div>

        {/* 清掃箇所と備考は 1 枚のカードにまとめる（確定デザイン 7139:221957） */}
        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full">
          {cleaningPoints.map((point) => (
            <div key={point.id} className="flex flex-col gap-3 items-start w-full">
              {/* 確定デザイン（7139:221957）：清掃箇所の帯は高さ 32、項目は 58 間隔 */}
              <div className="bg-[var(--semantic-brand-primary)] flex items-center justify-between px-2 py-1 rounded-lg w-full">
                <p className="text-base text-white">清掃箇所</p>
                <p className="text-base text-white">{point.location}</p>
              </div>
              <div className="flex flex-col gap-3 items-start px-2 w-full">
                <p className="text-base text-[var(--semantic-brand-primary)]">清掃項目</p>
                {point.items.map((item) => {
                  const record = records[keyFor(point.location, item)];
                  return (
                    <div key={item} className="flex flex-col gap-2 items-end w-full">
                      <div className="flex items-center justify-between w-full gap-6">
                        <p className="text-base text-[var(--semantic-text-primary)]">{item}</p>
                        <span className="bg-[#19c95f] flex h-6 w-16 items-center justify-center rounded-lg text-xs text-white">
                          清掃済
                        </span>
                      </div>
                      {record?.timestamp && (
                        <p className="text-sm leading-none text-[var(--semantic-text-secondary)] text-right w-full font-normal">
                          {record.inspector} {record.timestamp}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
            </div>
          ))}
          <div className="flex flex-col gap-2 items-start w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
            <p className="text-base leading-[1.6] font-normal text-[var(--semantic-text-primary)] whitespace-pre-wrap">
              {remarks}
            </p>
          </div>
        </div>
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-white border border-[#333] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-xl text-white"
        >
          提出
        </button>
      </div>

      {progressOpen && (
        <LineProgressPanel
          lines={lines}
          inspectedLines={lines.filter((l) => l.status === "inspected")}
          onClose={() => setProgressOpen(false)}
        />
      )}
    </>
  );
}
