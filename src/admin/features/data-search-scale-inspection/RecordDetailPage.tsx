import { useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { getFactoryName } from "../../../data/factories";
import { useRecords } from "./RecordsContext";
import type { ApprovalStatus } from "../../data/approvals";
import { REPAIR_STATUS_LABELS, type RepairStatus } from "./types";

const STATUS_OPTIONS: { value: ApprovalStatus; label: string }[] = [
  { value: "pending", label: "承認待ち" },
  { value: "approved", label: "承認済み" },
  { value: "rejected", label: "差し戻し" },
];

const REPAIR_STATUS_OPTIONS: RepairStatus[] = ["action_needed", "no_repair", "repairing", "done"];

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
  const { factoryId, recordId } = useParams<{ factoryId: string; recordId: string }>();
  const { records, setApprovalStatus, setRepairStatus, addComment } = useRecords();
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/data-search/scale-inspection/factories/${factoryId}`;

  const record = records.find((r) => r.id === recordId);
  const [comment, setComment] = useState(record?.comment ?? "");

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)] font-normal">データが見つかりません</p>
      </div>
    );
  }

  const isNg = !record.skipped && record.operationCheck === "ng";

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb
        items={[
          { label: "データ検索", to: "/admin/data-search" },
          { label: "工場選択", to: "/admin/data-search/scale-inspection" },
          { label: "データ一覧", to: basePath },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between w-full">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg">
            <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
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
                  <p className="text-base text-[var(--semantic-text-secondary)] font-normal">
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
                    <p className="font-normal">原因：{record.operationCause}</p>
                    <p className="font-normal">対応：{record.operationAction}</p>
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
                      <p className="text-base text-[var(--semantic-text-secondary)] font-normal">
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
                        <p className="text-base text-[var(--semantic-text-secondary)] font-normal">
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
                      <p className="text-base text-[var(--semantic-text-secondary)] px-2 font-normal">
                        原因：{record.weightCause}
                      </p>
                    )}
                  </div>
                </>
              )}
            </>
          )}
          <HLine />
          {record.remarks && (
            <div className="flex flex-col gap-2 items-start w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">備考</p>
              <p className="text-base text-[var(--semantic-text-primary)] font-normal text-left">
                {record.remarks}
              </p>
            </div>
          )}
        </div>

        {isNg && (
          <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-xl text-[var(--semantic-text-primary)]">修理状況</p>
              <Pulldown
                value={record.repairStatus ?? "action_needed"}
                onChange={(value) => setRepairStatus(record.id, value as RepairStatus)}
                options={REPAIR_STATUS_OPTIONS.map((opt) => ({ value: opt, label: REPAIR_STATUS_LABELS[opt] }))}
                className="h-8 px-3 rounded-lg text-sm text-white"
                style={{ backgroundColor: "#f85c5c", "--arrow-color": "white" } as any}
              />
            </div>
            <p className="text-sm text-[var(--semantic-text-secondary)] font-normal">
              異常があった箇所は、その後の対応状況に応じてステータスを更新してください。修理が完了した場合は「対応完了」ステータスに変更してください。
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4 items-start w-full">
          <div className="flex flex-col gap-2 items-start w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">コメント</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="点検内容に関する補足を入力できます（任意）"
              className="bg-white min-h-20 p-2 rounded-lg text-base font-normal text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
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
