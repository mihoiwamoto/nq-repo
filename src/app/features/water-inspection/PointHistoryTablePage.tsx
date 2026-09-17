import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import iconXMark from "../../../assets/figma/icons/common/cancel-custom.svg";
import iconCheck from "../../../assets/figma/icons/common/checkmark-custom.svg";
import { AppHeader } from "../../layout/AppHeader";
import type { CheckItem, WaterInspectionRecord } from "./mockData";
import { useWaterInspection } from "./WaterInspectionContext";
import { useDemoList } from "../../../components/demo/demoStore";

const COLUMNS = [
  { key: "action", label: "操作", width: 80 },
  { key: "date", label: "日付", width: 80 },
  { key: "time", label: "点検時間", width: 72 },
  { key: "location", label: "点検場所", width: 80 },
  { key: "味", label: "味", width: 48 },
  { key: "臭い", label: "臭い", width: 48 },
  { key: "色", label: "色", width: 48 },
  { key: "濁り", label: "濁り", width: 48 },
  { key: "異物", label: "異物", width: 48 },
  { key: "ph", label: "ph値", width: 48 },
  { key: "chlorine", label: "残留塩素濃度(mg/ℓ)", width: 100 },
  { key: "uvHours", label: "UV殺菌灯稼働時間", width: 100 },
  { key: "uvLight", label: "UV表示灯", width: 100 },
  { key: "errorLight", label: "異常検出灯", width: 100 },
  { key: "inspector", label: "実施者名", width: 100 },
] as const;

function CheckCell({ item }: { item?: CheckItem }) {
  if (!item) return null;
  if (item.status === "ng") {
    return (
      <div className="w-full h-12 flex items-center justify-center bg-[#f85c5c] -my-4">
        <img src={iconXMark} alt="異常あり" className="size-5 text-white" />
      </div>
    );
  }
  return (
    <div className="w-full h-12 flex items-center justify-center -my-4">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 12.402L8.47059 16.5L19.0882 7" stroke="#3ba55c" strokeWidth="2.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function ChlorineCell({ value, toggle }: { value: string; toggle: { checked: boolean } }) {
  if (toggle.checked) {
    return (
      <div className="w-full h-12 flex flex-col items-center justify-center bg-[#f85c5c] text-white text-xs gap-0.5 -my-4">
        <span className="font-semibold">{value}</span>
        <span>補充</span>
      </div>
    );
  }
  return (
    <div className="w-full h-12 flex items-center justify-center text-sm text-[var(--semantic-text-primary)] -my-4">
      {value}
    </div>
  );
}

function checkFor(record: WaterInspectionRecord, label: string) {
  return record.checks.find((c) => c.label === label);
}

export function PointHistoryTablePage() {
  const { pointId } = useParams<{ pointId: string }>();
  const [sortAsc, setSortAsc] = useState(true);
  const { recordsByPoint } = useWaterInspection();
  // 動作デモの「データが無い」を試している間は、点検記録が 1 件も無い状態にする
  const pointRecords = useDemoList(pointId ? recordsByPoint[pointId] ?? [] : []);
  const records = [...pointRecords].sort((a, b) =>
    sortAsc ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
  );
  const location = records[0]?.location ?? "";

  return (
    <div className="flex flex-col h-screen">
      <AppHeader title={`使用水の点検${location ? `_${location}` : ""}`} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4">
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-[var(--semantic-text-primary)]">並び順：</span>
          <button
            type="button"
            onClick={() => setSortAsc((v) => !v)}
            className="bg-white flex items-center gap-1 h-11 px-4 rounded-lg border border-[var(--semantic-text-secondary)] text-sm text-[var(--semantic-text-primary)]"
          >
            日付
            <span className="text-xs">{sortAsc ? "▲" : "▼"}</span>
          </button>
        </div>

        <div className="bg-white rounded-lg overflow-x-auto">
          <table className="border-collapse w-full">
            <thead>
              <tr className="bg-[#094]">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    style={{ minWidth: col.width }}
                    className="text-white text-sm font-semibold px-2 py-3 whitespace-nowrap h-14"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="text-center text-[var(--semantic-text-secondary)] py-8">
                    まだ点検記録がありません
                  </td>
                </tr>
              ) : (
                records.map((record, index) => (
                  <tr
                    key={record.id}
                    className={`h-12 ${index % 2 === 0 ? 'bg-[#ddf3e7]' : 'bg-white'} hover:opacity-80`}
                  >
                    <td className="px-2 py-3 text-center">
                      <Link
                        to={`/app/ledger-list/water-inspection/points/${pointId}/records/${record.id}`}
                        className="inline-block bg-[var(--semantic-brand-primary)] text-white text-sm px-4 py-2 rounded-lg hover:opacity-80"
                      >
                        詳細
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <span className="text-sm text-[var(--semantic-text-primary)]">
                        {record.date.replaceAll("/", ".").slice(2)}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-center text-sm text-[var(--semantic-text-primary)]">
                      {record.time}
                    </td>
                    <td className="px-2 py-3 text-center text-sm text-[var(--semantic-text-primary)]">
                      {record.location}
                    </td>
                    {["味", "臭い", "色", "濁り", "異物"].map((label) => (
                      <td key={label} className="p-0">
                        <CheckCell item={checkFor(record, label)} />
                      </td>
                    ))}
                    <td className="px-2 py-3 text-center text-sm text-[var(--semantic-text-primary)]">
                      {record.phValue}
                    </td>
                    <td className="p-0">
                      <ChlorineCell value={record.residualChlorine} toggle={record.chlorineToggle} />
                    </td>
                    <td className="px-2 py-3 text-center text-sm text-[var(--semantic-text-primary)]">
                      {record.uvOperatingHours}
                    </td>
                    <td className="px-2 py-3 text-center text-sm text-[var(--semantic-text-primary)]">
                      {record.uvIndicatorLight}
                    </td>
                    <td className="px-2 py-3 text-center text-sm text-[var(--semantic-text-primary)]">
                      {record.errorIndicatorLight}
                    </td>
                    <td className="px-2 py-3 text-center text-sm text-[var(--semantic-text-primary)] whitespace-nowrap">
                      {record.inspector}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
        <Link
          to="/app/ledger-list/water-inspection"
          className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          戻る
        </Link>
        <Link
          to={`/app/ledger-list/water-inspection/points/${pointId}/new`}
          className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
        >
          今日の記録をする
        </Link>
      </div>
    </div>
  );
}
