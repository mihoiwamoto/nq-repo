import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useSchedule } from "./ScheduleContext";
import { getFactoryName } from "../../../data/factories";
import type { LineFrequency } from "./types";

const FREQUENCY_TABS: { key: LineFrequency; label: string }[] = [
  { key: "daily", label: "毎日" },
  { key: "weekly", label: "毎週" },
  { key: "monthly", label: "毎月" },
  { key: "yearly", label: "毎年" },
];

function isCurrentlyDisplayed(displayFrom?: string, displayTo?: string) {
  if (!displayFrom && !displayTo) return true;
  const today = new Date().toISOString().slice(0, 10);
  if (displayFrom && today < displayFrom) return false;
  if (displayTo && today > displayTo) return false;
  return true;
}

export function LineSelectionPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const { lines } = useSchedule();
  const [visibility, setVisibility] = useState<"visible" | "hidden">("visible");
  const [frequency, setFrequency] = useState<LineFrequency>("daily");

  const factoryName = getFactoryName(factoryId);

  const filteredLines = lines.filter((line) => {
    const displayed = isCurrentlyDisplayed(line.displayFrom, line.displayTo);
    if (visibility === "visible" && !displayed) return false;
    if (visibility === "hidden" && displayed) return false;
    return line.frequency === frequency;
  });

  return (
    <div>
      <PageTitleBar
        title="機械器具点検"
        showBack
        action={
          <Link
            to={`/admin/ledger-management/equipment-inspection/factories/${factoryId}/lines/new`}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg flex items-center justify-center gap-1 text-white text-base"
          >
            + 新規登録
          </Link>
        }
      />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/equipment-inspection" },
          { label: "持ち場/ライン選択" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-[270px]">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        <div className="flex flex-col gap-2 items-start">
          <p className="text-2xl text-[var(--semantic-text-primary)]">点検の事前準備</p>
          <div className="flex gap-2 items-start">
            <div className="flex flex-col gap-2 items-start">
              <p className="text-sm text-[var(--semantic-text-primary)]">
                点検する持ち場/ラインの予定を組む
              </p>
              <Link
                to={`/admin/ledger-management/equipment-inspection/factories/${factoryId}/schedule`}
                className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] h-20 w-[270px] rounded-lg flex items-center px-4 text-xl text-[var(--semantic-text-primary)]"
              >
                点検予定
              </Link>
            </div>
            <div className="flex flex-col gap-2 items-start">
              <p className="text-sm text-[var(--semantic-text-primary)]">点検する確認内容を登録する</p>
              <Link
                to={`/admin/ledger-management/equipment-inspection/factories/${factoryId}/checklist-settings`}
                className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] h-20 w-[270px] rounded-lg flex items-center px-4 text-xl text-[var(--semantic-text-primary)]"
              >
                確認項目の設定
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 w-full">
          <div className="flex items-center border-b-2 border-[#d0d0d0] w-full">
            {(["visible", "hidden"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setVisibility(key)}
                className={`h-12 w-[156px] flex items-center justify-center border-b-2 text-xl ${
                  visibility === key
                    ? "border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                    : "border-transparent text-[var(--semantic-text-secondary)]"
                }`}
              >
                {key === "visible" ? "アプリ表示中" : "アプリ非表示"}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-6 w-full">
            <div className="bg-white flex h-10 items-center rounded-lg w-full">
              {FREQUENCY_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFrequency(tab.key)}
                  className={`flex-1 h-10 rounded-lg text-lg ${
                    frequency === tab.key
                      ? "bg-[var(--semantic-brand-primary)] text-white"
                      : "text-[var(--semantic-text-secondary)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {filteredLines.length === 0 ? (
              <p className="text-base text-[var(--semantic-text-secondary)]">
                該当する持ち場/ラインがありません
              </p>
            ) : (
              filteredLines.map((line) => (
                <Link
                  key={line.id}
                  to={`/admin/ledger-management/equipment-inspection/factories/${factoryId}/lines/${line.id}`}
                  className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] h-20 rounded-lg flex items-center px-6 text-lg text-[var(--semantic-text-primary)] w-full"
                >
                  {line.name}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
