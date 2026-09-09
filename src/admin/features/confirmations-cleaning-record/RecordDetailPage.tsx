import { useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { Comments } from "../../components/Comments";
import { CommentInputBox } from "../../components/CommentInputBox";
import { CONFIRM_STATUS_COLOR } from "../../components/ConfirmStatusBadge";
import { getFactoryName } from "../../../data/factories";
import { useRecords } from "./RecordsContext";
import type { ConfirmStatus } from "./types";

const STATUS_OPTIONS: { value: ConfirmStatus; label: string }[] = [
  { value: "unconfirmed", label: "確認待ち" },
  { value: "confirmed", label: "確認済み" },
];

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

function CleanedTag({ cleaned }: { cleaned: boolean }) {
  return (
    <span
      className={`h-7 w-[88px] rounded-lg flex items-center justify-center text-base text-white ${
        cleaned ? "bg-[#19c95f]" : "bg-[#f85c5c]"
      }`}
    >
      {cleaned ? "清掃済" : "未清掃"}
    </span>
  );
}

export function RecordDetailPage() {
  const { factoryId, recordId } = useParams<{ factoryId: string; recordId: string }>();
  const { records, setConfirmStatus, addComment } = useRecords();
  const factoryName = getFactoryName(factoryId);
  const [newComment, setNewComment] = useState("");

  const record = records.find((r) => r.id === recordId);

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)] font-normal">データが見つかりません</p>
      </div>
    );
  }

  function handleAddComment() {
    if (!record || !newComment.trim()) return;
    addComment(record.id, newComment.trim());
    setNewComment("");
  }

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "確認管理", to: "/admin/confirmations" },
          { label: "工場選択", to: "/admin/confirmations/cleaning-record" },
          { label: "データ一覧", to: `/admin/confirmations/cleaning-record/factories/${factoryId}` },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 p-6">
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

        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{formatDate(record.date)}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施者</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.implementer}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">確認者</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.confirmer}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">持ち場/ライン名</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.lineLabel}</p>
          </div>

          {record.cleaningPoints.length === 0 ? (
            <>
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex flex-col gap-2 items-start w-full">
                <p className="text-xl text-[var(--semantic-text-primary)]">備考</p>
                <p className="text-base text-[var(--semantic-text-secondary)] font-normal">
                  {record.remarks || "特記事項はありません"}
                </p>
              </div>
            </>
          ) : (
            <>
              {record.cleaningPoints.map((point, pIndex) => (
                <div key={point.location} className="flex flex-col gap-3 items-start w-full">
                  <div className="bg-[var(--semantic-brand-primary)] flex items-center justify-between p-2 rounded-lg w-full">
                    <p className="text-xl text-white">清掃箇所</p>
                    <p className="text-xl text-white">{point.location}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-start px-2 w-full">
                    <p className="text-xl text-[var(--semantic-brand-primary)]">清掃項目</p>
                    {point.items.map((item, iIndex) => (
                      <div key={iIndex} className="flex flex-col gap-1 items-start w-full">
                        <div className="flex items-center justify-between w-full">
                          <p className="text-xl text-[var(--semantic-text-primary)]">{item.name}</p>
                          <CleanedTag cleaned={item.cleaned} />
                        </div>
                        <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">
                          {item.inspector} {item.timestamp}
                        </p>
                      </div>
                    ))}
                  </div>
                  {pIndex < record.cleaningPoints.length - 1 && (
                    <div className="border-t border-[#d0d0d0] w-full" />
                  )}
                </div>
              ))}
              <div className="border-t border-[#d0d0d0] w-full" />
              <div className="flex flex-col gap-2 items-start w-full">
                <p className="text-xl text-[var(--semantic-text-primary)]">備考</p>
                <p className="text-base text-[var(--semantic-text-primary)] font-normal text-left">
                  {record.detailRemarks || record.remarks || "特記事項はありません"}
                </p>
              </div>
            </>
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
