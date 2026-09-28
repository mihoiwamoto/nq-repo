import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Comments } from "../../components/Comments";
import { CommentInputBox } from "../../components/CommentInputBox";
import { APPROVAL_STATUS_COLOR } from "../../components/ApprovalStatusBadge";
import { ApprovalConfirmDialog } from "../../components/ApprovalConfirmDialog";
import { RejectReasonDialog } from "../../components/RejectReasonDialog";
import { Toast } from "../../components/Toast";
import { useRecords } from "./RecordsContext";
import { useApprovalConfirm } from "../../hooks/useApprovalConfirm";
import type { ApprovalStatus } from "../../data/approvals";
import { CRITERIA, isAbnormalScore } from "./types";
import iconArrowDown from "../../../assets/figma/icons/common/arrow-down.svg";

const STATUS_OPTIONS: { value: ApprovalStatus; label: string }[] = [
  { value: "pending", label: "承認待ち" },
  { value: "approved", label: "承認済み" },
  { value: "rejected", label: "差し戻し" },
];

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

const basePath = "/admin/approvals/sensory-inspection";

export function RecordDetailPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const { records, setApprovalStatus, addComment } = useRecords();

  const record = records.find((r) => r.id === recordId);
  const [comment, setComment] = useState("");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
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

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">データが見つかりません</p>
      </div>
    );
  }

  const isStatusLocked = record.approvalStatus !== "pending";

  const isRecordAbnormal = record.scoreEntries.some((entry) =>
    CRITERIA.some((c) => isAbnormalScore(entry.scores[c].score))
  );

  const handleStatusChange = (value: ApprovalStatus) => {
    if (value === "approved") {
      requestApproval(() => setApprovalStatus(record.id, value));
    } else if (value === "rejected") {
      requestRejection(() => setApprovalStatus(record.id, value));
    } else {
      setApprovalStatus(record.id, value);
    }
    setStatusMenuOpen(false);
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
      <PageTitleBar title="点数一覧" showBack />
      <Breadcrumb
        items={[
          { label: "承認申請管理", to: "/admin/approvals" },
          { label: "データ一覧", to: basePath },
          { label: "点数一覧" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between w-full">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg">
            <p className="text-xl text-[var(--semantic-text-primary)]">㈱西原食品 本社工場</p>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => !isStatusLocked && setStatusMenuOpen((v) => !v)}
              disabled={isStatusLocked}
              className="border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-white w-[240px] flex items-center justify-between gap-2 disabled:cursor-not-allowed"
              style={{ backgroundColor: APPROVAL_STATUS_COLOR[record.approvalStatus] }}
            >
              {STATUS_OPTIONS.find((opt) => opt.value === record.approvalStatus)?.label}
              {!isStatusLocked && (
                <span
                  aria-hidden
                  className={`inline-block size-4 shrink-0 transition-transform ${statusMenuOpen ? "rotate-180" : ""}`}
                  style={{
                    WebkitMaskImage: `url("${iconArrowDown}")`,
                    maskImage: `url("${iconArrowDown}")`,
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    backgroundColor: "currentColor",
                  }}
                />
              )}
            </button>
            {!isStatusLocked && statusMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setStatusMenuOpen(false)} />
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 bg-white shadow-[0px_0px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col p-2 w-[240px]">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleStatusChange(opt.value)}
                      className={`h-[42px] px-2 rounded-lg text-base text-left w-full ${
                        opt.value === record.approvalStatus
                          ? "bg-[var(--semantic-brand-primary)] text-white"
                          : "text-[var(--semantic-text-primary)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white flex flex-wrap gap-8 items-center p-4 rounded-lg w-full">
          <div className="flex flex-col gap-2 items-start">
            <p className="text-sm text-[var(--semantic-text-secondary)]">検査製品名</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{record.productName}</p>
          </div>
          <div className="flex flex-col gap-2 items-start">
            <p className="text-sm text-[var(--semantic-text-secondary)]">製造日</p>
            <p className="text-base text-[var(--semantic-text-primary)]">
              {formatDate(record.manufactureDate)}
            </p>
          </div>
          <div className="flex flex-col gap-2 items-start">
            <p className="text-sm text-[var(--semantic-text-secondary)]">賞味期限</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{formatDate(record.expiryDate)}</p>
          </div>
        </div>

        <div className="bg-[#ddf3e7] flex flex-col gap-1 items-start p-4 rounded-lg w-full text-[var(--semantic-text-primary)]">
          <p className="text-base font-bold">【点数の評価基準】</p>
          <p className="text-sm">　5点・・・標準品と同等の品位が保たれている</p>
          <p className="text-sm">　4点・・・標準品よりやや劣るが遜色ない品位が保たれている</p>
          <p className="text-sm">　3点・・・標準品より劣るが製品として必要な品位が保たれている</p>
          <p className="text-sm">　2点・・・標準品よりかなり劣り製品として不向き</p>
          <p className="text-sm">　1点・・・標準品より著しく劣り製品としての品位が失われている</p>
        </div>

        <div className="w-full rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f6f6f6] h-[50px]">
                <th className="w-[104px] text-sm text-[var(--semantic-brand-primary)] font-bold">操作</th>
                <th className="w-[256px] text-sm text-[var(--semantic-brand-primary)] font-bold">実施者</th>
                {CRITERIA.map((c) => (
                  <th key={c} className="flex-1 text-sm text-[var(--semantic-brand-primary)] font-bold">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {record.scoreEntries.map((entry, index) => (
                <tr
                  key={entry.id}
                  className={`h-14 ${index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}
                >
                  <td className="w-[104px] text-center">
                    <Link
                      to={`${basePath}/records/${record.id}/scores/${entry.id}`}
                      className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                    >
                      詳細
                    </Link>
                  </td>
                  <td className="w-[256px] px-2 text-sm text-[var(--semantic-text-primary)]">{entry.inspectorName}</td>
                  {CRITERIA.map((c) => (
                    <td
                      key={c}
                      className="flex-1 text-center text-sm text-[var(--semantic-text-primary)]"
                    >
                      {entry.scores[c].score}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between bg-white rounded-lg ml-auto" style={{ height: "48px", width: "240px" }}>
          <p className="text-base font-bold text-[var(--semantic-text-primary)] ml-6 mr-2">検査結果</p>
          {isRecordAbnormal ? (
            <span className="rounded flex items-center justify-center bg-[#f85c5c] text-white text-xl font-bold" style={{ height: "48px", width: "120px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_97_469484)">
                  <path d="M9.97969 12L4.92893 6.94928C4.37104 6.39139 4.37104 5.48687 4.92893 4.92898C5.48682 4.37109 6.39135 4.37109 6.94924 4.92898L12 9.97974L17.0508 4.92898C17.6087 4.37109 18.5132 4.37109 19.0711 4.92898C19.629 5.48687 19.629 6.39139 19.0711 6.94928L14.0203 12L19.0711 17.0508C19.629 17.6087 19.629 18.5132 19.0711 19.0711C18.5132 19.629 17.6087 19.629 17.0508 19.0711L12 14.0204L6.94924 19.0711C6.39134 19.629 5.48682 19.629 4.92893 19.0711C4.37104 18.5132 4.37104 17.6087 4.92893 17.0508L9.97969 12Z" fill="white"/>
                </g>
                <defs>
                  <clipPath id="clip0_97_469484">
                    <rect width="24" height="24" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </span>
          ) : (
            <span className="rounded flex items-center justify-center bg-[var(--semantic-brand-primary)]" style={{ height: "48px", width: "120px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 12.402L8.47059 16.5L19.0882 7" stroke="white" strokeWidth="2.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          )}
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
            maxLength={255}
          />
        </div>
      </div>
    </div>
  );
}
