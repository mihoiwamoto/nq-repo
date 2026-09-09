import { useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Comments } from "../../components/Comments";
import { CommentInputBox } from "../../components/CommentInputBox";
import { getFactoryName } from "../../../data/factories";
import { useRecords } from "./RecordsContext";
import type { CheckItem } from "./types";

function StatusTag({ status }: { status: "ok" | "ng" }) {
  const isError = status === "ng";
  return (
    <div
      className={`flex h-7 items-center justify-center px-2 rounded-lg text-sm text-white w-[88px] ${
        isError ? "bg-[var(--semantic-status-error)]" : "bg-[var(--semantic-status-success)]"
      }`}
    >
      <p>{isError ? "異常あり" : "正常"}</p>
    </div>
  );
}

function CheckRow({ item, isLast }: { item: CheckItem; isLast: boolean }) {
  const isNg = item.status === "ng";
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xl font-semibold text-[#094]">{item.label}</p>
      <div className="flex items-center justify-between w-full">
        <p className="text-xl text-[#333]">{item.detail}</p>
        <StatusTag status={item.status} />
      </div>
      {isNg && (
        <div className="flex flex-col gap-1 items-start px-2 text-base text-[#808080]">
          <p>原因：{item.cause}</p>
          <p>対応：{item.response}</p>
        </div>
      )}
      <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">{item.timestamp}</p>
      {!isLast && <div className="h-px bg-[#d0d0d0] w-full" />}
    </div>
  );
}

export function RecordDetailPage() {
  const { factoryId, recordId } = useParams<{ factoryId: string; recordId: string }>();
  const { records, addComment } = useRecords();
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/confirmations/metal-xray-detection/factories/${factoryId}`;
  const [newComment, setNewComment] = useState("");

  const record = records.find((r) => r.id === recordId);

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">データが見つかりません</p>
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
          { label: "工場選択", to: "/admin/confirmations/metal-xray-detection" },
          { label: "データ一覧", to: basePath },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-4 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
          <p className="text-xl text-[#333]">{factoryName}</p>
        </div>

        <div className="bg-white rounded-lg w-full overflow-hidden">
          <div className="flex flex-col gap-3 px-4 py-6">
            <div className="flex gap-6 items-center justify-between w-full">
              <p className="text-xl font-semibold text-[#333]">実施者</p>
              <p className="text-xl text-[#333]">{record.metalInspector}</p>
            </div>
            <div className="h-px bg-[#d0d0d0] w-full" />
            <div className="flex gap-6 items-center justify-between w-full">
              <p className="text-xl font-semibold text-[#333]">点検内容</p>
              <p className="text-xl text-[#333]">動作確認</p>
            </div>
          </div>

          <div className="border-t border-[#d0d0d0]" />

          <div className="flex flex-col gap-3 px-4 py-6">
            <div className="bg-[#094] flex flex-col gap-2 items-start justify-center p-2 rounded-lg w-full">
              <div className="flex gap-6 items-center justify-between w-full">
                <p className="text-xl font-semibold text-white">金属探知機</p>
                <p className="text-xl font-semibold text-white">{record.machineName}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1 items-center justify-center w-full">
              <div className="flex gap-6 items-center justify-between w-full">
                <p className="text-xl text-[#333]">点検時間</p>
                <p className="text-xl text-[#333]">{record.metalCheckTime}</p>
              </div>
            </div>

            <div className="h-px bg-[#d0d0d0] w-full" />

            {record.metalChecks.map((item, index) => (
              <CheckRow key={item.label} item={item} isLast={index === record.metalChecks.length - 1} />
            ))}
          </div>

          <div className="border-t border-[#d0d0d0]" />

          <div className="flex flex-col gap-3 px-4 py-6">
            <div className="bg-[#094] flex flex-col gap-2 items-start justify-center p-2 rounded-lg w-full">
              <div className="flex gap-6 items-center justify-between w-full">
                <p className="text-xl font-semibold text-white">X線探知機</p>
                <p className="text-xl font-semibold text-white">{record.machineName}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1 items-center justify-center w-full">
              <div className="flex gap-6 items-center justify-between w-full">
                <p className="text-xl text-[#333]">点検時間</p>
                <p className="text-xl text-[#333]">{record.xrayCheckTime}</p>
              </div>
            </div>

            <div className="h-px bg-[#d0d0d0] w-full" />

            {record.xrayChecks.map((item, index) => (
              <CheckRow key={item.label} item={item} isLast={index === record.xrayChecks.length - 1} />
            ))}
          </div>

          <div className="border-t border-[#d0d0d0]" />

          <div className="flex flex-col gap-2 px-4 py-6">
            <p className="text-xl font-semibold text-[#333]">備考</p>
            <p className="text-base text-[#333]">{record.remarks || "特記事項なし"}</p>
          </div>
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
