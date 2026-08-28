import { useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { cleaningApprovalRecords } from "./mockData";
import type { ApprovalStatus } from "../../data/approvals";

const STATUS_OPTIONS: { value: ApprovalStatus; label: string }[] = [
  { value: "pending", label: "承認待ち" },
  { value: "approved", label: "承認済み" },
  { value: "rejected", label: "差し戻し" },
];

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

export function RecordDetailPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const record = cleaningApprovalRecords.find((r) => r.id === recordId);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<ApprovalStatus>("pending");

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">データが見つかりません</p>
      </div>
    );
  }

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "承認申請管理", to: "/admin/approvals" },
          { label: "データ一覧", to: "/admin/approvals/cleaning-record" },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between w-full">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg">
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.lineLabel}</p>
          </div>
          <Pulldown
            value={status}
            onChange={(value) => setStatus(value as ApprovalStatus)}
            options={STATUS_OPTIONS}
            className="bg-[#808080] border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-white w-[240px]"
          />
        </div>

        <div className="bg-white flex flex-col gap-4 items-start px-4 py-6 rounded-lg w-full">
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
        </div>

        {record.locations && record.locations.length > 0 && (
          <div className="flex flex-col gap-4 items-start w-full">
            {record.locations.map((location) => (
              <div key={location.name} className="w-full">
                <div className="bg-[var(--semantic-brand-primary)] flex items-center justify-between px-4 py-2 rounded-t-lg w-full">
                  <p className="text-base text-white font-bold">清掃箇所</p>
                  <p className="text-base text-white font-bold">{location.name}</p>
                </div>
                <div className="bg-white flex flex-col px-4 py-3 rounded-b-lg w-full">
                  <p className="text-base text-[var(--semantic-brand-primary)] font-bold mb-2">{location.items[0]?.category}</p>
                  {location.items.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-start justify-between py-2 gap-4">
                        <p className="text-base text-[var(--semantic-text-primary)]">{item.name}</p>
                        <div className="flex flex-col items-end gap-1">
                          <button
                            type="button"
                            className="bg-[var(--semantic-brand-primary)] h-8 px-4 rounded-lg text-sm text-white whitespace-nowrap"
                          >
                            清掃済
                          </button>
                          <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">
                            {item.implementer} {item.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {record.remarks && (
          <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">備考</p>
            <p className="text-base text-[var(--semantic-text-primary)] font-normal text-left">
              {record.remarks}
            </p>
          </div>
        )}

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
