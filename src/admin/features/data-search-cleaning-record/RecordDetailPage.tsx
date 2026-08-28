import { useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { getFactoryName } from "../../../data/factories";
import { useRecords } from "./RecordsContext";
import type { ApprovalStatus } from "./types";
import iconArrowDown from "../../../assets/figma/icons/common/arrow-down.svg";

const STATUS_OPTIONS: { value: ApprovalStatus; label: string }[] = [
  { value: "pending", label: "承認待ち" },
  { value: "approved", label: "承認済み" },
  { value: "rejected", label: "差し戻し" },
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
  const { records, setApprovalStatus, addComment } = useRecords();
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/data-search/cleaning-record/factories/${factoryId}`;

  const record = records.find((r) => r.id === recordId);
  const [comment, setComment] = useState(record?.comment ?? "");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)] font-normal">データが見つかりません</p>
      </div>
    );
  }

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "データ検索", to: "/admin/data-search" },
          { label: "工場選択", to: "/admin/data-search/cleaning-record" },
          { label: "データ一覧", to: basePath },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between w-full">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg">
            <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setStatusMenuOpen((v) => !v)}
              className="bg-[#808080] border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-white w-[240px] flex items-center justify-between gap-2"
            >
              {STATUS_OPTIONS.find((opt) => opt.value === record.approvalStatus)?.label}
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
            </button>
            {statusMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setStatusMenuOpen(false)} />
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 bg-white shadow-[0px_0px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col p-2 w-[240px]">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setApprovalStatus(record.id, opt.value);
                        setStatusMenuOpen(false);
                      }}
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
