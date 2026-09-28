import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { Comments } from "../../components/Comments";
import { CommentInputBox } from "../../components/CommentInputBox";
import { APPROVAL_STATUS_COLOR } from "../../components/ApprovalStatusBadge";
import { ApprovalConfirmDialog } from "../../components/ApprovalConfirmDialog";
import { RejectReasonDialog } from "../../components/RejectReasonDialog";
import { Toast } from "../../components/Toast";
import { useRecords } from "./RecordsContext";
import { useApprovalConfirm } from "../../hooks/useApprovalConfirm";
import type { ApprovalStatus } from "../../data/approvals";

const STATUS_OPTIONS: { value: ApprovalStatus; label: string }[] = [
  { value: "pending", label: "承認待ち" },
  { value: "approved", label: "承認済み" },
  { value: "rejected", label: "差し戻し" },
];

const CheckmarkIconOk = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 12.402L8.47059 16.5L19.0882 7" stroke="#19C95F" strokeWidth="2.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckmarkIconNg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0)">
      <path d="M9.97969 12L4.92893 6.94928C4.37104 6.39139 4.37104 5.48687 4.92893 4.92898C5.48682 4.37109 6.39135 4.37109 6.94924 4.92898L12 9.97974L17.0508 4.92898C17.6087 4.37109 18.5132 4.37109 19.0711 4.92898C19.629 5.48687 19.629 6.39139 19.0711 6.94928L14.0203 12L19.0711 17.0508C19.629 17.6087 19.629 18.5132 19.0711 19.0711C18.5132 19.629 17.6087 19.629 17.0508 19.0711L12 14.0204L6.94924 19.0711C6.39134 19.629 5.48682 19.629 4.92893 19.0711C4.37104 18.5132 4.37104 17.6087 4.92893 17.0508L9.97969 12Z" fill="white"/>
    </g>
  </svg>
);

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

const COLUMNS = [
  { label: "操作", width: "w-[104px]" },
  { label: "実施区分", width: "w-[80px]" },
  { label: "点検時間", width: "w-[104px]" },
  { label: "点検内容", width: "w-[160px]" },
  { label: "通過製品", width: "flex-1" },
  { label: "結果", width: "w-[80px]" },
  { label: "備考", width: "w-[200px]" },
  { label: "実施者", width: "w-[100px]" },
];

export function MachineDetailPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const { records, setApprovalStatus, addComment } = useRecords();
  const {
    showConfirmDialog,
    showRejectDialog,
    showToast,
    closeToast,
    requestApproval,
    confirmApproval,
    cancelApproval,
    requestRejection,
    confirmRejection,
    cancelRejection,
  } = useApprovalConfirm();

  const record = records.find((r) => r.id === recordId);
  const [comment, setComment] = useState("");

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">データが見つかりません</p>
      </div>
    );
  }

  const handleStatusChange = (value: string) => {
    if (value === "approved") {
      requestApproval(() => setApprovalStatus(record.id, value as ApprovalStatus));
    } else if (value === "rejected") {
      requestRejection(() => setApprovalStatus(record.id, value as ApprovalStatus));
    } else {
      setApprovalStatus(record.id, value as ApprovalStatus);
    }
  };

  return (
    <div>
      {showConfirmDialog && (
        <ApprovalConfirmDialog onCancel={cancelApproval} onConfirm={confirmApproval} />
      )}
      {showRejectDialog && (
        <RejectReasonDialog onCancel={cancelRejection} onConfirm={confirmRejection} />
      )}
      {showToast && <Toast message="承認ステータスを更新しました。" onClose={closeToast} />}
      <PageTitleBar title="点検内容一覧" showBack />
      <Breadcrumb
        items={[
          { label: "承認申請管理", to: "/admin/approvals" },
          { label: "データ一覧", to: "/admin/approvals/metal-xray-detection" },
          { label: "点検内容一覧" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between w-full">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg">
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)]">㈱西原食品 本社工場</p>
          </div>
          <Pulldown
            value={record.approvalStatus}
            onChange={handleStatusChange}
            options={STATUS_OPTIONS}
            disabled={record.approvalStatus !== "pending"}
            className="border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-white w-[240px]"
            style={{ backgroundColor: APPROVAL_STATUS_COLOR[record.approvalStatus] }}
          />
        </div>

        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)]">{formatDate(record.date)}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)]">確認者</p>
            <p className="text-2xl font-bold text-[var(--semantic-text-primary)]">{record.confirmer}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg overflow-x-auto">
          <div className="flex flex-col min-w-[900px]">
            <div className="bg-[#f6f6f6] flex h-[50px] items-center">
              {COLUMNS.map((col) => (
                <div
                  key={col.label}
                  className={`flex items-center justify-center px-2 py-2 h-full text-base text-[var(--semantic-brand-primary)] font-bold ${col.width}`}
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
                <div className="w-[104px] flex items-center justify-center px-2 h-full">
                  <Link
                    to={`/admin/approvals/metal-xray-detection/records/${record.id}/items/${item.id}`}
                    className="border border-[var(--semantic-brand-primary)] bg-white text-[var(--semantic-brand-primary)] text-base font-bold px-3 py-2 rounded-lg hover:bg-[var(--semantic-brand-primary)] hover:text-white transition-colors"
                  >
                    詳細
                  </Link>
                </div>
                <div className="w-[80px] flex items-center justify-center px-2 h-full text-base text-[var(--semantic-text-primary)]">
                  {item.category}
                </div>
                <div className="w-[104px] flex items-center justify-center px-2 h-full text-base text-[var(--semantic-text-primary)]">
                  {item.time}
                </div>
                <div className="w-[160px] flex items-center px-2 h-full text-base text-[var(--semantic-text-primary)]">
                  {item.content}
                </div>
                <div className="flex-1 flex items-center px-2 h-full text-base text-[var(--semantic-text-primary)]">
                  {item.passedProduct}
                </div>
                <div className={`w-[80px] flex items-center justify-center px-2 h-full gap-2 ${item.result === "NG" ? "bg-[#f85c5c]" : ""}`}>
                  {item.result === "OK" ? <CheckmarkIconOk /> : <CheckmarkIconNg />}
                </div>
                <div className="w-[200px] flex items-center px-2 h-full text-base text-[var(--semantic-text-primary)] truncate">
                  {item.remarks}
                </div>
                <div className="w-[100px] flex items-center justify-center px-2 h-full text-base text-[var(--semantic-text-primary)]">
                  {item.inspectorName}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 items-start w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">コメント</p>
          <Comments comments={record.comments || []} />
          <CommentInputBox
            value={comment}
            onChange={setComment}
            onSubmit={() => {
              addComment(record.id, comment);
              setComment("");
            }}
          />
        </div>
      </div>
    </div>
  );
}
