import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { DateFilterInput } from "../../components/DateFilterInput";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useSchedule } from "./ScheduleContext";
import type { LineFrequency } from "./types";

/**
 * 持ち場/ラインの編集（確定デザイン 7139:258646。2026-10-06）。
 * 直せるのはアプリ表示期間だけ。持ち場/ライン名・点検頻度・点検箇所・点検項目は登録した内容を灰色で見せるだけ（変えられない）。
 * 「保存」で詳細へ戻り「更新しました。」のトースト、「キャンセル」で詳細へ戻る。
 */
const FREQUENCY_OPTIONS: { key: LineFrequency; label: string }[] = [
  { key: "daily", label: "毎日" },
  { key: "weekly", label: "毎週" },
  { key: "monthly", label: "毎月" },
  { key: "yearly", label: "毎年" },
];

/** 変えられない入力欄（灰色の地・灰色の文字） */
function LockedField({ value, width = "w-[480px]" }: { value: string; width?: string }) {
  return (
    <div className={`bg-[#d0d0d0] flex h-12 items-center px-4 rounded-lg ${width}`}>
      <p className="flex-1 min-w-0 truncate text-base text-[var(--semantic-text-secondary)]">{value}</p>
    </div>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <div className="flex gap-2 items-center">
      <p className="text-xl text-[var(--semantic-text-primary)]">{label}</p>
      {required && <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>}
    </div>
  );
}

export function LineEditPage() {
  const { factoryId, lineId } = useParams<{ factoryId: string; lineId: string }>();
  const basePath = `/admin/ledger-management/equipment-inspection/factories/${factoryId}`;
  const detailPath = `${basePath}/lines/${lineId}`;
  const { lines, updateLineDisplayPeriod } = useSchedule();
  const navigate = useNavigate();
  const line = lines.find((l) => l.id === lineId);

  const [displayFrom, setDisplayFrom] = useState(line?.displayFrom ?? "");
  const [displayTo, setDisplayTo] = useState(line?.displayTo ?? "");

  if (!line) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">持ち場/ラインが見つかりません</p>
      </div>
    );
  }

  function handleSave() {
    updateLineDisplayPeriod(line!.id, displayFrom || undefined, displayTo || undefined);
    navigate(detailPath, { state: { justSaved: true } });
  }

  return (
    <div>
      <PageTitleBar title="編集" showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/equipment-inspection" },
          { label: "持ち場/ライン選択", to: basePath },
          { label: "詳細", to: detailPath },
          { label: "編集" },
        ]}
      />
      <div className="flex flex-col gap-10 items-start p-6">
        <div className="flex flex-col gap-6 items-start w-full">
          <div className="flex flex-col gap-1 items-start">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">アプリ表示期間</p>
              <span className="text-sm text-[var(--semantic-text-primary)]">※任意</span>
            </div>
            <p className="text-sm text-[var(--semantic-text-secondary)]">
              日付指定が無い場合は、常にアプリ上に表示されます。
            </p>
            <div className="flex gap-2 items-center">
              <DateFilterInput variant="form" value={displayFrom} onChange={setDisplayFrom} />
              <span className="text-[var(--semantic-text-primary)]">〜</span>
              <DateFilterInput variant="form" value={displayTo} onChange={setDisplayTo} />
            </div>
          </div>

          <div className="flex flex-col gap-1 items-start w-[480px]">
            <FieldLabel label="持ち場/ライン名" required />
            <p className="text-sm text-[var(--semantic-text-secondary)]">
              この点検構成を識別するための名称を入力してください。
            </p>
            <LockedField value={line.name} />
          </div>

          <div className="flex flex-col gap-1 items-start">
            <FieldLabel label="点検頻度" required />
            <div className="flex gap-2 items-center">
              {FREQUENCY_OPTIONS.map((option) => (
                <div
                  key={option.key}
                  aria-disabled="true"
                  className={`bg-[#d0d0d0] border h-10 w-[120px] rounded-lg shadow-[0px_2px_4px_rgba(51,51,51,0.24)] flex items-center justify-center text-base ${
                    line.frequency === option.key
                      ? "border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                      : "border-[#808080] text-[var(--semantic-text-secondary)]"
                  }`}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>

          {line.inspectionPoints.map((point) => (
            <div key={point.id} className="flex flex-col items-start">
              <div className="flex flex-col gap-1 items-start w-[480px]">
                <FieldLabel label="点検箇所" required />
                <LockedField value={point.location} />
              </div>
              <div className="flex gap-4 items-stretch px-6">
                <div className="w-px bg-[var(--semantic-text-primary)] shrink-0" />
                <div className="flex flex-col gap-1 items-start">
                  <div className="flex h-11 items-end">
                    <p className="text-xl text-[var(--semantic-text-primary)]">点検項目</p>
                  </div>
                  {point.items.map((item, i) => (
                    <LockedField key={i} value={item} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() => navigate(detailPath)}
            className="bg-white shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
