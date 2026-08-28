import { useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { useRecords } from "./RecordsContext";
import type { ApprovalStatus } from "../../data/approvals";
import type { WaterCheckResult } from "./types";
import iconCheckmark from "../../../assets/figma/icons/common/checkmark.svg";

const STATUS_OPTIONS: { value: ApprovalStatus; label: string }[] = [
  { value: "pending", label: "承認待ち" },
  { value: "approved", label: "承認済み" },
  { value: "rejected", label: "差し戻し" },
];

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

function StatusTag({ result }: { result: WaterCheckResult }) {
  const isAbnormal = result.status === "abnormal";
  return (
    <span
      className={`h-7 w-[88px] rounded-lg flex items-center justify-center text-base text-white ${
        isAbnormal ? "bg-[#f85c5c]" : "bg-[#19c95f]"
      }`}
    >
      {isAbnormal ? "異常あり" : "正常"}
    </span>
  );
}

function CheckRow({ label, result }: { label: string; result: WaterCheckResult }) {
  return (
    <div className="flex flex-col gap-2 items-start w-full">
      <div className="flex items-center justify-between w-full">
        <p className="text-xl text-[var(--semantic-text-primary)]">{label}</p>
        <StatusTag result={result} />
      </div>
      {result.status === "abnormal" && (
        <div className="flex flex-col gap-1 items-start px-2 text-base text-[var(--semantic-text-secondary)] w-full">
          <p>原因：{result.cause || "不明"}</p>
          <p>対応：{result.action || "記録なし"}</p>
        </div>
      )}
    </div>
  );
}

export function RecordDetailPage() {
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
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "承認申請管理", to: "/admin/approvals" },
          { label: "データ一覧", to: "/admin/approvals/water-inspection" },
          { label: "詳細" },
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
            <p className="text-xl text-[var(--semantic-text-primary)]">点検場所</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.location}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">
              {formatDate(record.date)} {record.time}
            </p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

          <CheckRow label="味" result={record.taste} />
          <div className="border-t border-[#d0d0d0] w-full" />
          <CheckRow label="臭い" result={record.smell} />
          <div className="border-t border-[#d0d0d0] w-full" />
          <CheckRow label="色" result={record.color} />
          <div className="border-t border-[#d0d0d0] w-full" />
          <CheckRow label="濁り" result={record.turbidity} />
          <div className="border-t border-[#d0d0d0] w-full" />
          <CheckRow label="異物" result={record.foreignMatter} />
          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">ph値</p>
            <p className="text-xl text-[var(--semantic-text-primary)]">{record.ph}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="flex flex-col gap-2 items-end w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">残留塩素濃度（mg/ℓ）</p>
              <p className="text-xl text-[var(--semantic-text-primary)]">{record.chlorine}</p>
            </div>
            {record.chlorineReplenished && (
              <span className="flex items-center gap-1 text-[#19c95f] text-base">
                <img src={iconCheckmark} alt="" className="size-4" />
                塩素補充
              </span>
            )}
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="flex flex-col gap-2 items-end w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">UV殺菌灯稼働時間（h）</p>
              <p className="text-xl text-[var(--semantic-text-primary)]">{record.uvOperatingHours}</p>
            </div>
            {record.uvLampReplaced && (
              <span className="flex items-center gap-1 text-[#19c95f] text-base">
                <img src={iconCheckmark} alt="" className="size-4" />
                UV殺菌灯交換
              </span>
            )}
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">UV表示灯</p>
            <p
              className={`text-xl ${
                record.uvIndicatorLight === "off"
                  ? "text-[var(--semantic-brand-danger)]"
                  : "text-[var(--semantic-text-primary)]"
              }`}
            >
              {record.uvIndicatorLight === "on" ? "点灯" : "消灯"}
            </p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="flex items-center justify-between w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">異常検出灯</p>
            <p
              className={`text-xl ${
                record.abnormalDetectionLight === "on"
                  ? "text-[var(--semantic-brand-danger)]"
                  : "text-[var(--semantic-text-primary)]"
              }`}
            >
              {record.abnormalDetectionLight === "on" ? "点灯" : "消灯"}
            </p>
          </div>
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
