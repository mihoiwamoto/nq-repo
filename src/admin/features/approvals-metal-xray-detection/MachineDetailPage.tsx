import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { useRecords } from "./RecordsContext";
import type { ApprovalStatus } from "../../data/approvals";
import type { InspectionResult } from "./types";

const STATUS_OPTIONS: { value: ApprovalStatus; label: string }[] = [
  { value: "pending", label: "承認待ち" },
  { value: "approved", label: "承認済み" },
  { value: "rejected", label: "差し戻し" },
];

const RESULT_LABELS: Record<InspectionResult, string> = { OK: "正常", NG: "異常あり" };
const RESULT_COLORS: Record<InspectionResult, string> = {
  OK: "var(--semantic-status-success)",
  NG: "var(--semantic-status-error)",
};

function ResultTag({ result }: { result: InspectionResult }) {
  return (
    <span
      className="h-6 w-16 rounded-lg flex items-center justify-center text-xs text-white shrink-0"
      style={{ backgroundColor: RESULT_COLORS[result] }}
    >
      {RESULT_LABELS[result]}
    </span>
  );
}

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

const COLUMNS = [
  { label: "操作", width: "w-[80px]" },
  { label: "実施区分", width: "w-[80px]" },
  { label: "点検時間", width: "w-[80px]" },
  { label: "点検内容", width: "w-[100px]" },
  { label: "通過製品", width: "flex-1 min-w-[160px]" },
  { label: "結果", width: "w-[88px]" },
  { label: "備考", width: "flex-1 min-w-[160px]" },
  { label: "実施者", width: "w-[100px]" },
];

export function MachineDetailPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const { records, setApprovalStatus, addComment } = useRecords();

  const record = records.find((r) => r.id === recordId);
  const [comment, setComment] = useState(record?.comment ?? "");

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">データが見つかりません</p>
      </div>
    );
  }

  return (
    <div>
      <PageTitleBar title="点検内容一覧" showBack />
      <Breadcrumb
        items={[
          { label: "承認申請管理", to: "/admin/approvals" },
          { label: "データ一覧", to: "/admin/approvals/metal-xray-detection" },
          { label: "点検内容一覧" },
        ]}
      />
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between w-full">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg">
            <p className="text-xl text-[var(--semantic-text-primary)]">㈱西原食品 本社工場</p>
          </div>
          <Pulldown
            value={record.approvalStatus}
            onChange={(value) => setApprovalStatus(record.id, value as ApprovalStatus)}
            options={STATUS_OPTIONS}
            className="bg-[#808080] border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-white w-[240px]"
          />
        </div>

        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{formatDate(record.date)}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">確認者</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.confirmer}</p>
          </div>
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
            {record.records.map((item, index) => (
              <div
                key={item.id}
                className={`flex h-14 items-center ${index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}
              >
                <div className="w-[80px] flex items-center justify-center p-2 h-full">
                  <Link
                    to={`/admin/approvals/metal-xray-detection/records/${record.id}/items/${item.id}`}
                    className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-16 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                  >
                    詳細
                  </Link>
                </div>
                <div className="w-[80px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                  {item.category}
                </div>
                <div className="w-[80px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                  {item.time}
                </div>
                <div className="w-[100px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                  {item.content}
                </div>
                <div className="flex-1 min-w-[160px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)] text-center">
                  {item.passedProduct}
                </div>
                <div className="w-[88px] flex items-center justify-center p-2 h-full">
                  <ResultTag result={item.result} />
                </div>
                <div className="flex-1 min-w-[160px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)] text-center">
                  {item.remarks}
                </div>
                <div className="w-[100px] flex items-center justify-center p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)]">
                  {item.inspectorName}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 items-start w-full">
          <div className="flex flex-col gap-2 items-start w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">コメント</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="コメント・補足事項を入力できます（任意）"
              className="bg-white min-h-20 p-2 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
            />
          </div>
          <button
            type="button"
            onClick={() => addComment(record.id, comment)}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
          >
            コメントを残す
          </button>
        </div>
      </div>
    </div>
  );
}
