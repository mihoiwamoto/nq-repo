import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { Comments } from "../../components/Comments";
import { CommentInputBox } from "../../components/CommentInputBox";
import { CONFIRM_STATUS_COLOR } from "../../components/ConfirmStatusBadge";
import { getFactoryName } from "../../../data/factories";
import { useRecords } from "./RecordsContext";
import { CRITERIA, isAbnormalScore, type ConfirmStatus } from "./types";

const STATUS_OPTIONS: { value: ConfirmStatus; label: string }[] = [
  { value: "unconfirmed", label: "点検済み" },
  { value: "confirmed", label: "承認待ち" },
];

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

export function RecordDetailPage() {
  const { factoryId, recordId } = useParams<{ factoryId: string; recordId: string }>();
  const { records, setConfirmStatus, addComment } = useRecords();
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/confirmations/sensory-inspection/factories/${factoryId}`;

  const record = records.find((r) => r.id === recordId);
  const [newComment, setNewComment] = useState("");

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">データが見つかりません</p>
      </div>
    );
  }

  const isRecordAbnormal = record.scoreEntries.some((entry) =>
    CRITERIA.some((c) => isAbnormalScore(entry.scores[c].score))
  );

  function handleAddComment() {
    if (!record || !newComment.trim()) return;
    addComment(record.id, newComment.trim());
    setNewComment("");
  }

  return (
    <div>
      <PageTitleBar title="点数一覧" showBack />
      <Breadcrumb
        items={[
          { label: "確認管理", to: "/admin/confirmations" },
          { label: "工場選択", to: "/admin/confirmations/sensory-inspection" },
          { label: "データ一覧", to: basePath },
          { label: "点数一覧" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between w-full">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
            <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
          </div>
          <Pulldown
            value={record.confirmStatus}
            onChange={(value) => setConfirmStatus(record.id, value as ConfirmStatus)}
            options={STATUS_OPTIONS}
            className="border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-white w-[240px]"
            style={{ backgroundColor: CONFIRM_STATUS_COLOR[record.confirmStatus] }}
          />
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
                  <td className="w-[104px] p-2 flex items-center justify-center">
                    <Link
                      to={`${basePath}/records/${record.id}/scores/${entry.id}`}
                      className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                    >
                      詳細
                    </Link>
                  </td>
                  <td className="w-[256px] p-2 text-sm text-[var(--semantic-text-primary)]">
                    {entry.inspectorName}
                  </td>
                  {CRITERIA.map((c) => {
                    const score = entry.scores[c].score;
                    const isAbnormal = isAbnormalScore(score);
                    return (
                      <td
                        key={c}
                        className={`flex-1 p-2 text-sm text-center ${
                          isAbnormal ? "bg-[#f85c5c] text-white font-bold" : "text-[var(--semantic-text-primary)]"
                        }`}
                      >
                        {score}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="h-14 bg-[#ddf3e7] border-t border-[#d0d0d0]">
                <td className="w-[104px]" />
                <td className="w-[256px] p-2 text-sm font-bold text-[var(--semantic-text-primary)]">
                  平均
                </td>
                {CRITERIA.map((c) => {
                  const average = (
                    record.scoreEntries.reduce((sum, entry) => sum + entry.scores[c].score, 0) /
                    record.scoreEntries.length
                  ).toFixed(1);
                  return (
                    <td key={c} className="flex-1 p-2 text-sm text-center font-bold text-[var(--semantic-brand-primary)]">
                      {average}
                    </td>
                  );
                })}
              </tr>
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

        <div className="flex flex-col gap-2 items-start w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">コメント</p>
          <Comments comments={record.comments || []} />
          <CommentInputBox value={newComment} onChange={setNewComment} onSubmit={handleAddComment} />
        </div>
      </div>
    </div>
  );
}
