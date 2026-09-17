import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { ApprovalStatusBadge } from "../../components/ApprovalStatusBadge";
import { ApprovalConfirmDialog } from "../../components/ApprovalConfirmDialog";
import { useRecords } from "./RecordsContext";
import { useDemoList } from "../../../components/demo/demoStore";
import { getDateStripeClasses } from "../../utils/tableStripe";
import { useApprovalConfirm } from "../../hooks/useApprovalConfirm";
import { approvalRequests, updateApprovalRequestStatus } from "../../data/approvals";
import iconDownload from "../../../assets/figma/icons/common/download.svg";
import { downloadElementAsPdf } from "../../utils/pdf";

function HyphenIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="7" y1="11.5" x2="17" y2="11.5" stroke="#333333" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function DateDisplay({ date }: { date: string | undefined }) {
  if (!date) {
    return <HyphenIcon />;
  }
  return <>{date.replaceAll("-", "/")}</>;
}

function downloadCsv(rows: string[][], filename: string) {
  const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const COLUMNS: { label: string; width: string }[] = [
  { label: "操作", width: "w-[104px]" },
  { label: "ステータス", width: "w-[96px]" },
  { label: "実施日", width: "w-[111px]" },
  { label: "製品名", width: "w-[280px]" },
  { label: "ロットNo.", width: "w-[111px]" },
  { label: "賞味期限", width: "w-[111px]" },
  { label: "製造日", width: "w-[111px]" },
  { label: "検体種別", width: "w-[80px]" },
  { label: "検体数量", width: "w-[80px]" },
  { label: "単位", width: "w-[80px]" },
  { label: "保管場所", width: "w-[120px]" },
  { label: "備考", width: "flex-1 min-w-[280px]" },
  { label: "状態", width: "w-[111px]" },
  { label: "破棄日", width: "w-[111px]" },
  { label: "実施者", width: "w-[100px]" },
  { label: "確認者", width: "w-[100px]" },
];

export function ApprovalRecordsListPage() {
  const navigate = useNavigate();
  const { records: allRecords } = useRecords();
  // 動作デモの「データが無い」を試している間は、記録が 1 件も無い状態にする
  const records = useDemoList(allRecords);
  const tableRef = useRef<HTMLDivElement>(null);
  const { showConfirmDialog, requestApproval, confirmApproval, cancelApproval } = useApprovalConfirm();
  const request = approvalRequests.find((r) => r.ledgerSlug === "sample-management");

  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"csv" | "pdf">("csv");

  const rowStripeClasses = getDateStripeClasses(records, (r) => r.date);

  function handleDownload() {
    const header = [
      "実施日",
      "製品名",
      "ロットNo.",
      "賞味期限",
      "製造日",
      "検体種別",
      "検体数量",
      "単位",
      "保管場所",
      "備考",
      "状態",
      "破棄日",
      "実施者",
      "確認者",
    ];
    const rows = records.map((r) => [
      r.date,
      r.productName,
      r.lotNumber ?? "",
      r.expirationDate,
      r.manufactureDate,
      r.sampleType,
      r.sampleQuantity,
      r.unit,
      r.storageLocation,
      r.remarks,
      r.status,
      r.discardedDate ?? "",
      r.implementer,
      r.confirmer,
    ]);
    downloadCsv([header, ...rows], "データ一覧.csv");
  }

  const handleApprove = () => {
    requestApproval(() => {
      if (request) updateApprovalRequestStatus(request.id, "approved");
      navigate("/admin/approvals", { state: { statusChanged: "approved" } });
    });
  };

  return (
    <div>
      {showConfirmDialog && (
        <ApprovalConfirmDialog onCancel={cancelApproval} onConfirm={confirmApproval} />
      )}
      <PageTitleBar
        title="データ一覧"
        showBack
        action={
          <button
            type="button"
            onClick={() => setDownloadDialogOpen(true)}
            className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] size-10 rounded-lg flex items-center justify-center text-[var(--semantic-brand-primary)]"
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
          { label: "承認申請管理", to: "/admin/approvals" },
          { label: "データ一覧" },
        ]}
      />
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="flex flex-col gap-6 items-start w-full">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
            <p className="text-xl text-[var(--semantic-text-primary)]">㈱西原食品 本社工場</p>
          </div>
          <div className="flex flex-col gap-2 items-start w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">25年4月点検分</p>
            <div ref={tableRef} className="w-full rounded-lg overflow-x-auto">
              <div className="flex flex-col min-w-[1986px]">
                <div className="bg-[#f6f6f6] flex h-[50px] items-center">
                  {COLUMNS.map((col) => (
                    <div
                      key={col.label}
                      className={`flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-brand-primary)] ${col.width} ${col.width.startsWith("flex-1") ? "" : "shrink-0"}`}
                    >
                      {col.label}
                    </div>
                  ))}
                </div>
                {records.length === 0 ? (
                  <p className="bg-white p-6 text-base text-[var(--semantic-text-secondary)]">
                    該当するデータがありません
                  </p>
                ) : (
                  records.map((record, index) => (
                    <div
                      key={record.id}
                      className={`flex h-14 items-center ${rowStripeClasses[index]}`}
                    >
                      <div className="w-[104px] shrink-0 flex items-center justify-center p-2 h-full">
                        <Link
                          to={`/admin/approvals/sample-management/records/${record.id}`}
                          className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                        >
                          詳細
                        </Link>
                      </div>
                      <div className="w-[96px] shrink-0 flex items-center justify-center p-2 h-full">
                        <ApprovalStatusBadge status={record.approvalStatus} />
                      </div>
                      <div className="w-[111px] shrink-0 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        <DateDisplay date={record.date} />
                      </div>
                      <div className="w-[280px] shrink-0 flex items-center justify-start p-2 h-full text-sm text-[var(--semantic-text-primary)] text-left whitespace-nowrap overflow-hidden text-ellipsis" title={record.productName}>
                        {record.productName}
                      </div>
                      {/* ロットNo. は管理画面で「記載する」とした製品だけに入る任意項目 */}
                      <div className="w-[111px] shrink-0 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {record.lotNumber || <HyphenIcon />}
                      </div>
                      <div className="w-[111px] shrink-0 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        <DateDisplay date={record.expirationDate} />
                      </div>
                      <div className="w-[111px] shrink-0 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        <DateDisplay date={record.manufactureDate} />
                      </div>
                      <div className="w-[80px] shrink-0 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {record.sampleType}
                      </div>
                      <div className="w-[80px] shrink-0 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {record.sampleQuantity}
                      </div>
                      <div className="w-[80px] shrink-0 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        {record.unit}
                      </div>
                      <div className="w-[120px] shrink-0 flex items-center justify-center p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)]">
                        {record.storageLocation}
                      </div>
                      <div className="flex-1 min-w-[280px] flex items-center justify-start p-2 h-full text-sm text-[var(--semantic-text-primary)] text-left">
                        {record.remarks}
                      </div>
                      <div className="w-[111px] shrink-0 flex items-center justify-center p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)]">
                        {record.status}
                      </div>
                      <div className="w-[111px] shrink-0 flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                        <DateDisplay date={record.discardedDate} />
                      </div>
                      <div className="w-[100px] shrink-0 flex items-center justify-center p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)]">
                        {record.implementer}
                      </div>
                      <div className="w-[100px] shrink-0 flex items-center justify-center p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)]">
                        {record.confirmer}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleApprove}
          className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[400px] rounded-lg text-xl text-white"
        >
          承認する
        </button>
      </div>

      {downloadDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDownloadDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-6 items-center px-6 py-10 w-[640px]">
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
                className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (downloadFormat === "csv") {
                    handleDownload();
                  } else if (tableRef.current) {
                    await downloadElementAsPdf(tableRef.current, "データ一覧.pdf");
                  }
                  setDownloadDialogOpen(false);
                }}
                className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
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
