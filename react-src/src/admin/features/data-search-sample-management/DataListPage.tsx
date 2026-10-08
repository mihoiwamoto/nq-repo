import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { DateFilterInput } from "../../components/DateFilterInput";
import { getFactoryName } from "../../../data/factories";
import { useRecords } from "./RecordsContext";
import { useDemoList } from "../../../components/demo/demoStore";
import { getDateStripeClasses } from "../../utils/tableStripe";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";
import iconArrowRight from "../../../assets/figma/icons/common/arrow-right.svg";
import iconDownload from "../../../assets/figma/icons/common/download.svg";
import iconPulldown from "../../../assets/figma/icons/common/pulldown.svg";
import iconMinus from "../../../assets/figma/icons/common/minus.svg";
import iconSearch from "../../../assets/figma/icons/common/search.svg";
import { downloadSampleCsv, downloadSamplePdf } from "./sampleExport";
import { PlusIcon } from "../../components/PlusIcon";
import { AdminEmptyState } from "../../components/AdminEmptyState";

// 本番（dataSearch/specimen/list.blade.php）は賞味期限・製造日・ロットNo. が無ければ空欄
function DateDisplay({ date }: { date: string | undefined }) {
  if (!date) {
    return null;
  }
  return <>{date.replaceAll("-", "/")}</>;
}


const MONTH_LABELS = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

const COLUMNS: { label: string; width: string; marginLeft?: string; justify?: string }[] = [
  { label: "操作", width: "w-[104px]" },
  { label: "実施日", width: "w-[96px]" },
  { label: "製品名", width: "w-[200px]" },
  { label: "ロットNo.", width: "w-[120px]", marginLeft: "ml-4" },
  { label: "賞味期限", width: "w-[96px]", marginLeft: "ml-4" },
  { label: "製造日", width: "w-[96px]", marginLeft: "ml-4" },
  { label: "検体種別", width: "w-[88px]", marginLeft: "ml-4" },
  { label: "検体数量", width: "w-[88px]" },
  { label: "単位", width: "w-[64px]" },
  { label: "保管場所", width: "w-[104px]" },
  /* 本番どおり 備考・破棄日・実施者・確認者 の列は出さない（詳細画面には出す。2026-10-08） */
  { label: "状態", width: "flex-1 min-w-[88px]" },
];

export function DataListPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const { records: allRecords } = useRecords();
  // 動作デモの「データが無い」を試している間は、記録が 1 件も無い状態にする
  const records = useDemoList(allRecords);
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/data-search/sample-management/factories/${factoryId}`;

  // 本番（dataSearch/*/searchBar.blade.php）は絞り込みの欄を閉じて開く（collapsed-card）
  const [filterOpen, setFilterOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"csv" | "pdf">("csv");
  // 入力中の値と、「検索」で当てた値を分ける（本番は検索を押して送るまで絞らない）
  const [dateInput, setDateInput] = useState("");
  const [productInput, setProductInput] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(3);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const productOptions = useMemo(
    () => Array.from(new Set(records.map((r) => r.productName))),
    [records]
  );

  // 日付で絞り込んでいる間は月送りを隠し、月ではなくその日で絞る（本番 dataSearch/list.blade.php の @if(!isSearching)、ScaleCheckResultService の isSearching＝search_date）
  const isSearching = Boolean(dateFilter);
  const filtered = records.filter((r) => {
    const [ry, rm] = r.date.split("-").map(Number);
    if (!isSearching && (ry !== year || rm !== month + 1)) return false;
    if (dateFilter && r.date !== dateFilter) return false;
    if (productFilter && r.productName !== productFilter) return false;
    return true;
  });
  // 日付順に並べ、日付が変わるたびに白 / 薄緑（Figma 6296:131118 と同じ。全帳票で統一。2026-10-08 ユーザー指定）
  filtered.sort((a, b) => a.date.localeCompare(b.date));
  const rowStripeClasses = getDateStripeClasses(filtered, (r) => r.date);

  function goToMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  function handleSearch() {
    setDateFilter(dateInput);
    setProductFilter(productInput);
  }

  // 本番のリセットは欄を空にして送り直す（search_clear_button は type="submit"）
  function handleReset() {
    setDateInput("");
    setProductInput("");
    setDateFilter("");
    setProductFilter("");
  }


  return (
    <div>
      <PageTitleBar
        title="データ一覧"
        showBack
        action={
          <button
            type="button"
            onClick={() => setDownloadDialogOpen(true)}
            disabled={filtered.length === 0}
            className="disabled:opacity-40 disabled:cursor-not-allowed bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] size-10 rounded-lg flex items-center justify-center text-[var(--semantic-brand-primary)]"
            title="CSVダウンロード"
          >
            <span
              aria-hidden
              className="inline-block size-5 shrink-0"
              style={{
                WebkitMaskImage: `url("${iconDownload}")`,
                maskImage: `url("${iconDownload}")`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                backgroundColor: "currentColor",
              }}
            />
          </button>
        }
      />
      <Breadcrumb
        items={[
          { label: "データ検索", to: "/admin/data-search" },
          { label: "工場選択", to: "/admin/data-search/sample-management" },
          { label: "データ一覧" },
        ]}
      />
      <div className="flex flex-col gap-10 p-6">
        <div className="flex items-start gap-4">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg">
            <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
          </div>
        </div>

        <div className="bg-white flex flex-col gap-4 items-start p-4 rounded-lg w-full">
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className="flex items-center gap-2 h-5 text-base text-[var(--semantic-brand-primary)]"
          >
            <span>絞り込み検索</span>
            {filterOpen ? (
              <span
                aria-hidden
                className="inline-block size-5 shrink-0"
                style={{
                  WebkitMaskImage: `url("${iconMinus}")`,
                  maskImage: `url("${iconMinus}")`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  backgroundColor: "var(--semantic-brand-primary)",
                }}
              />
            ) : (
              <PlusIcon />
            )}
          </button>
          {filterOpen && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex gap-6 items-center justify-end w-full"
            >
              <div className="flex flex-col gap-4 flex-1">
                <div className="flex gap-4 items-center">
                  <DateFilterInput value={dateInput} onChange={setDateInput} />
                  <Pulldown
                    value={productInput}
                    onChange={setProductInput}
                    options={productOptions.map((label) => ({ value: label, label }))}
                    placeholder="製品名"
                  />
                </div>
                {/* 確定デザイン（6296:131118）の絞り込みは 日付・製品名だけ。「差し戻しのものだけ表示」は出さない */}
              </div>
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-white border border-[#808080] h-10 w-20 rounded-lg text-sm text-[var(--semantic-text-secondary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)]"
                >
                  リセット
                </button>
                <button
                  type="submit"
                  className="bg-[var(--semantic-brand-primary)] h-10 w-[120px] rounded-lg text-base text-white flex items-center justify-center gap-1 shadow-[0px_2px_4px_rgba(51,51,51,0.24)]"
                >
                  <img src={iconSearch} alt="" className="size-5" />
                  検索
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full">
          {!isSearching && (
          <div className="flex items-center justify-between relative">
            <button
              type="button"
              onClick={() => goToMonth(-1)}
              className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] size-10 rounded-lg flex items-center justify-center"
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
              {year}年{String(month + 1).padStart(2, "0")}月
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
              className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] size-10 rounded-lg flex items-center justify-center"
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
          )}

          {/* 0 件のときの帯は横スクロールの箱の外に出し、見える幅いっぱいに置く（見出しだけ横に動く） */}
          <div className="w-full min-w-0">
            <div className="w-full rounded-lg overflow-x-auto">
              <div className="flex flex-col min-w-[1312px]">
                <div className="bg-[#f6f6f6] flex h-[50px] items-center">
                  {COLUMNS.map((col) => (
                    <div
                      key={col.label}
                      className={`flex items-center ${col.justify ?? "justify-center"} p-2 h-full text-sm text-[var(--semantic-brand-primary)] ${col.width} ${col.marginLeft ?? ""} ${col.width.startsWith("flex-1") ? "" : "shrink-0"}`}
                    >
                      {col.label}
                    </div>
                  ))}
                </div>
                {filtered.length === 0 ? null : (
                  filtered.map((record, index) => (
                    <div
                      key={record.id}
                      className={`flex h-14 items-center ${rowStripeClasses[index]}`}
                    >
                      <div className="w-[104px] shrink-0 flex items-center justify-center p-2 h-full">
                        <Link
                          to={`${basePath}/records/${record.id}`}
                          className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-10 w-16 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                        >
                          詳細
                        </Link>
                      </div>
                      <div className="w-[96px] shrink-0 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        <DateDisplay date={record.date} />
                      </div>
                      <div className="w-[200px] shrink-0 flex items-center justify-start p-2 h-full text-sm text-[var(--semantic-text-primary)] text-left whitespace-nowrap overflow-hidden text-ellipsis" title={record.productName}>
                        {record.productName}
                      </div>
                      {/* ロットNo. は管理画面で「記載する」とした製品だけに入る任意項目 */}
                      <div className="w-[120px] ml-4 shrink-0 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {record.lotNumber ?? ""}
                      </div>
                      <div className="w-[96px] ml-4 shrink-0 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        <DateDisplay date={record.expirationDate} />
                      </div>
                      <div className="w-[96px] ml-4 shrink-0 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        <DateDisplay date={record.manufactureDate} />
                      </div>
                      <div className="w-[88px] ml-4 shrink-0 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {record.sampleType}
                      </div>
                      <div className="w-[88px] shrink-0 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {record.sampleQuantity}
                      </div>
                      <div className="w-[64px] shrink-0 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {record.unit}
                      </div>
                      <div className="w-[104px] shrink-0 flex items-center justify-center p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)]">
                        {record.storageLocation}
                      </div>
                      <div className="flex-1 min-w-[88px] flex items-center justify-center p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)]">
                        {record.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            {filtered.length === 0 && <AdminEmptyState className="mt-2" />}
          </div>
        </div>
      </div>

      {downloadDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 本番どおり背景を押しても閉じない（data-bs-backdrop="static"。2026-10-08） */}
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-6 items-center px-6 py-10 w-[640px]">
            <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
              ダウンロード形式選択
            </h2>
            <div className="flex flex-col gap-2 items-start w-full">
              <p className="text-base text-[var(--semantic-text-primary)]">
                ダウンロード形式を選択してください
              </p>
              <div className="flex w-full rounded-lg overflow-hidden border border-[#d0d0d0]">
                <div className="bg-[var(--semantic-brand-primary)] flex items-center justify-center px-6 py-4 text-white text-base w-[160px] shrink-0">
                  ファイル形式
                </div>
                <div className="bg-white flex flex-col gap-3 justify-center px-6 py-4 flex-1">
                  <label className="flex items-center gap-2 text-base text-[var(--semantic-text-primary)]">
                    <input
                      type="radio"
                      name="downloadFormat"
                      value="csv"
                      checked={downloadFormat === "csv"}
                      onChange={() => setDownloadFormat("csv")}
                    />
                    CSV形式
                  </label>
                  <label className="flex items-center gap-2 text-base text-[var(--semantic-text-primary)]">
                    <input
                      type="radio"
                      name="downloadFormat"
                      value="pdf"
                      checked={downloadFormat === "pdf"}
                      onChange={() => setDownloadFormat("pdf")}
                    />
                    PDF形式
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-6 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setDownloadDialogOpen(false)}
                className="bg-white shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (downloadFormat === "csv") {
                    downloadSampleCsv(filtered, factoryName, year, month);
                  } else {
                    await downloadSamplePdf(filtered, factoryName, year, month);
                  }
                  setDownloadDialogOpen(false);
                }}
                className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
              >
                ダウンロード
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
