import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { getFactoryName } from "../../../data/factories";
import { floors } from "../../../app/features/glass-plastic/mockData";
import { useRecords } from "./RecordsContext";
import { countByStatus } from "./types";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";
import iconArrowRight from "../../../assets/figma/icons/common/arrow-right.svg";
import iconPulldown from "../../../assets/figma/icons/common/pulldown.svg";

function formatDateShort(date: string) {
  const [y, m, d] = date.split("-");
  return `${y.slice(2)}.${m}.${d}`;
}

const MONTH_LABELS = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

const COLUMNS = [
  { label: "操作", width: "w-[96px]" },
  { label: "日付", width: "flex-1" },
  { label: "点検場所", width: "flex-1" },
  { label: "総点検箇所数", width: "flex-1" },
  { label: "正常", width: "flex-1" },
  { label: "異常あり", width: "flex-1" },
  { label: "実施者", width: "flex-1" },
  { label: "確認者", width: "flex-1" },
];

export function DataListPage() {
  const { factoryId, floorId } = useParams<{ factoryId: string; floorId: string }>();
  const { records } = useRecords();
  const factoryName = getFactoryName(factoryId);
  const floorName = floors.find((f) => f.id === floorId)?.name ?? "点検場所";
  const basePath = `/admin/data-search/glass-plastic/factories/${factoryId}/floors/${floorId}`;

  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(3);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const filtered = records
    .filter((r) => r.floorId === floorId)
    .filter((r) => {
      const [ry, rm] = r.date.split("-").map(Number);
      return ry === year && rm === month + 1;
    });

  function goToMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  return (
    <div>
      <PageTitleBar title="データ一覧" showBack />
      <Breadcrumb
        items={[
          { label: "データ検索", to: "/admin/data-search" },
          { label: "工場選択", to: "/admin/data-search/glass-plastic" },
          { label: "点検場所選択", to: `/admin/data-search/glass-plastic/factories/${factoryId}` },
          { label: "データ一覧" },
        ]}
      />
      <div className="flex flex-col gap-10 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
          <p className="text-xl text-[var(--semantic-text-primary)]">
            {factoryName} / {floorName}
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between relative">
            <button
              type="button"
              onClick={() => goToMonth(-1)}
              className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] size-10 rounded-lg flex items-center justify-center"
            >
              <span
                aria-hidden
                className="inline-block size-5 shrink-0"
                style={{
                  WebkitMaskImage: `url("${iconArrowLeft}")`,
                  maskImage: `url("${iconArrowLeft}")`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  backgroundColor: "var(--semantic-brand-primary)",
                }}
              />
            </button>
            <button
              type="button"
              onClick={() => setMonthPickerOpen((v) => !v)}
              className="flex items-center gap-1 text-xl text-[var(--semantic-text-primary)]"
            >
              {year}年{month + 1}月
              <span
                aria-hidden
                className="inline-block size-3 shrink-0"
                style={{
                  WebkitMaskImage: `url("${iconPulldown}")`,
                  maskImage: `url("${iconPulldown}")`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  backgroundColor: "currentColor",
                }}
              />
            </button>
            <button
              type="button"
              onClick={() => goToMonth(1)}
              className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] size-10 rounded-lg flex items-center justify-center"
            >
              <span
                aria-hidden
                className="inline-block size-5 shrink-0"
                style={{
                  WebkitMaskImage: `url("${iconArrowRight}")`,
                  maskImage: `url("${iconArrowRight}")`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  backgroundColor: "var(--semantic-brand-primary)",
                }}
              />
            </button>

            {monthPickerOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMonthPickerOpen(false)} />
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 bg-white shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col items-center p-4 w-[392px]">
                  <div className="flex items-center justify-between py-2 w-full">
                    <button
                      type="button"
                      onClick={() => setYear((y) => y - 1)}
                      className="text-[var(--semantic-text-primary)] text-xl"
                    >
                      <span
                        aria-hidden
                        className="inline-block size-5 shrink-0"
                        style={{
                          WebkitMaskImage: `url("${iconArrowLeft}")`,
                          maskImage: `url("${iconArrowLeft}")`,
                          WebkitMaskSize: "contain",
                          maskSize: "contain",
                          WebkitMaskRepeat: "no-repeat",
                          maskRepeat: "no-repeat",
                          backgroundColor: "currentColor",
                        }}
                      />
                    </button>
                    <p className="text-xl text-[var(--semantic-text-primary)]">{year}</p>
                    <button
                      type="button"
                      onClick={() => setYear((y) => y + 1)}
                      className="text-[var(--semantic-text-primary)] text-xl"
                    >
                      <span
                        aria-hidden
                        className="inline-block size-5 shrink-0"
                        style={{
                          WebkitMaskImage: `url("${iconArrowRight}")`,
                          maskImage: `url("${iconArrowRight}")`,
                          WebkitMaskSize: "contain",
                          maskSize: "contain",
                          WebkitMaskRepeat: "no-repeat",
                          maskRepeat: "no-repeat",
                          backgroundColor: "currentColor",
                        }}
                      />
                    </button>
                  </div>
                  <div className="flex flex-wrap w-[360px]">
                    {MONTH_LABELS.map((label, i) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          setMonth(i);
                          setMonthPickerOpen(false);
                        }}
                        className={`h-12 w-[120px] flex items-center justify-center text-base ${
                          i === month
                            ? "bg-[var(--semantic-brand-primary)] text-white"
                            : "text-[var(--semantic-text-primary)]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="w-full rounded-lg overflow-x-auto">
            <div className="flex flex-col min-w-[900px]">
              <div className="bg-[#f6f6f6] flex h-[50px] items-center">
                {COLUMNS.map((col) => (
                  <div
                    key={col.label}
                    className={`flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-brand-primary)] ${col.width}`}
                  >
                    {col.label}
                  </div>
                ))}
              </div>
              {filtered.length === 0 ? (
                <p className="bg-white p-6 text-base text-[var(--semantic-text-secondary)]">
                  該当するデータがありません
                </p>
              ) : (
                filtered.map((record, index) => {
                  const { total, normal, issue } = countByStatus(record);
                  return (
                    <div
                      key={record.id}
                      className={`flex h-14 items-center ${index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}
                    >
                      <div className="w-[96px] flex items-center justify-center p-2 h-full">
                        <Link
                          to={`${basePath}/records/${record.id}`}
                          className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-16 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                        >
                          詳細
                        </Link>
                      </div>
                      <div className="flex-1 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {formatDateShort(record.date)}
                      </div>
                      <div className="flex-1 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {record.floorName}
                      </div>
                      <div className="flex-1 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {total}件
                      </div>
                      <div className="flex-1 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {normal}件
                      </div>
                      <div
                        className={`flex-1 flex items-center justify-center p-2 h-full text-sm ${
                          issue > 0
                            ? "bg-[var(--semantic-status-error)] text-white"
                            : "text-[var(--semantic-text-primary)]"
                        }`}
                      >
                        {issue}件
                      </div>
                      <div className="flex-1 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {record.implementer}
                      </div>
                      <div className="flex-1 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {record.confirmer}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
