import { useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { approvalRequests } from "../../data/approvals";
import { useRecords } from "./RecordsContext";
import { RepairStatusSection } from "./RepairStatusSection";
import type { ApprovalStatus } from "../../data/approvals";

const STATUS_OPTIONS: { value: ApprovalStatus; label: string }[] = [
  { value: "pending", label: "承認待ち" },
  { value: "approved", label: "承認済み" },
  { value: "rejected", label: "差し戻し" },
];

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

function CheckStatusTag({ status }: { status: "ok" | "ng" }) {
  return (
    <span
      className={`h-7 w-[88px] rounded-lg flex items-center justify-center text-base text-white ${
        status === "ok" ? "bg-[#19c95f]" : "bg-[#f85c5c]"
      }`}
    >
      {status === "ok" ? "正常" : "異常あり"}
    </span>
  );
}

function Dash() {
  return <span className="inline-block w-3 h-px bg-[#333]" />;
}

const HLine = () => <div className="border-t border-[#d0d0d0] w-full" />;

export function RecordDetailPage() {
  const { requestId, recordId } = useParams<{ requestId: string; recordId: string }>();
  const { records, setApprovalStatus, addComment } = useRecords();

  const request = approvalRequests.find((r) => r.id === requestId);
  const record = records.find((r) => r.id === recordId);
  const [comment, setComment] = useState(record?.comment ?? "");

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">データが見つかりません</p>
      </div>
    );
  }

  const isNg = !record.skipped && record.operationCheck === "ng";

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "承認申請管理", to: "/admin/approvals" },
          { label: "点検内容一覧", to: `/admin/approvals/scale-inspection/${requestId}` },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between w-full">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg">
            <p className="text-xl text-[var(--semantic-text-primary)]">{request?.companyName ?? "工場"}</p>
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
          <HLine />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施者</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.implementer}</p>
          </div>
          <HLine />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">確認者</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.confirmer}</p>
          </div>
          <HLine />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">持ち場</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.post}</p>
          </div>
          <HLine />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">秤No.(ラベル名)</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.scaleLabel}</p>
          </div>
          <HLine />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">シリアルナンバー</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.serialNumber}</p>
          </div>
          <HLine />

          {record.skipped ? (
            <>
              <div className="flex items-center justify-between w-full">
                <p className="text-xl text-[var(--semantic-text-primary)]">動作確認</p>
                <Dash />
              </div>
              <HLine />
              <div className="flex items-center justify-between w-full">
                <p className="text-xl text-[var(--semantic-text-primary)]">水平点検</p>
                <Dash />
              </div>
              <HLine />
              <div className="flex items-center justify-between w-full">
                <p className="text-xl text-[var(--semantic-text-primary)]">汚れ</p>
                <Dash />
              </div>
              <HLine />
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-2 items-start">
                  <p className="text-xl text-[var(--semantic-text-primary)]">秤の表示値(g)</p>
                  <p className="text-base text-[var(--semantic-text-secondary)]">
                    使用分銅(g)：{record.referenceWeight}
                  </p>
                </div>
                <Dash />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2 items-start w-full">
                <div className="flex items-center justify-between w-full">
                  <p className="text-xl text-[var(--semantic-text-primary)]">動作確認</p>
                  <CheckStatusTag status={record.operationCheck} />
                </div>
                {isNg && (
                  <div className="flex flex-col gap-1 items-start px-2 text-base text-[var(--semantic-text-secondary)] w-full">
                    <p>原因：{record.operationCause}</p>
                    <p>対応：{record.operationAction}</p>
                  </div>
                )}
              </div>
              <HLine />
              {isNg ? (
                <>
                  <div className="flex items-center justify-between w-full">
                    <p className="text-xl text-[var(--semantic-text-primary)]">水平点検</p>
                    <Dash />
                  </div>
                  <HLine />
                  <div className="flex items-center justify-between w-full">
                    <p className="text-xl text-[var(--semantic-text-primary)]">汚れ</p>
                    <Dash />
                  </div>
                  <HLine />
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col gap-2 items-start">
                      <p className="text-xl text-[var(--semantic-text-primary)]">秤の表示値(g)</p>
                      <p className="text-base text-[var(--semantic-text-secondary)]">
                        使用分銅(g)：{record.referenceWeight}
                      </p>
                    </div>
                    <Dash />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between w-full">
                    <p className="text-xl text-[var(--semantic-text-primary)]">水平点検</p>
                    <CheckStatusTag status={record.levelCheck ?? "ok"} />
                  </div>
                  <HLine />
                  <div className="flex items-center justify-between w-full">
                    <p className="text-xl text-[var(--semantic-text-primary)]">汚れ</p>
                    <CheckStatusTag status={record.dirtCheck ?? "ok"} />
                  </div>
                  <HLine />
                  <div className="flex flex-col gap-2 items-start w-full">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col gap-2 items-start">
                        <p className="text-xl text-[var(--semantic-text-primary)]">秤の表示値(g)</p>
                        <p className="text-base text-[var(--semantic-text-secondary)]">
                          使用分銅(g)：{record.referenceWeight}
                        </p>
                      </div>
                      <p
                        className={`text-xl ${
                          record.weightCause ? "text-[#f85c5c]" : "text-[var(--semantic-text-primary)]"
                        }`}
                      >
                        {record.displayValue}
                      </p>
                    </div>
                    {record.weightCause && (
                      <p className="text-base text-[var(--semantic-text-secondary)] px-2">
                        原因：{record.weightCause}
                      </p>
                    )}
                  </div>
                </>
              )}
            </>
          )}
          <HLine />
          <div className="flex flex-col gap-2 items-start w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">備考</p>
            {record.remarks && (
              <p className="text-base text-[var(--semantic-text-primary)] font-normal text-left">
                {record.remarks}
              </p>
            )}
          </div>
        </div>

        <RepairStatusSection records={[record]} />

        <div className="flex flex-col gap-4 items-start w-full">
          <p className="text-xl text-[var(--semantic-text-primary)]">コメント</p>
          <div className="flex flex-col gap-2 items-start w-full">
            <div className="flex gap-2 items-start w-full">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 255))}
                placeholder="コメントを入力"
                rows={3}
                className="flex-1 bg-white border border-[#d0d0d0] px-2 py-2 rounded-lg text-base font-light text-[var(--semantic-text-primary)] placeholder:text-[#808080] resize-none"
              />
              <button
                type="button"
                onClick={() => addComment(record.id, comment)}
                disabled={!comment.trim()}
                className={`size-12 rounded-lg flex items-center justify-center text-white text-lg shrink-0 ${
                  comment.trim() ? "bg-[#094]" : "bg-[#d0d0d0]"
                }`}
              >
                ➤
              </button>
            </div>
            <span className="text-sm text-[#333] text-right w-full">
              {comment.length}/255
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
