import { useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Comments } from "../../components/Comments";
import { getFactoryName } from "../../../data/factories";
import { useRecords } from "./RecordsContext";
import type { InspectionItemResult, ItemStatus } from "./types";

function formatDate(date: string) {
  return date.replaceAll("-", "/");
}

function StatusTag({ status }: { status: ItemStatus }) {
  const isNg = status === "ng";
  return (
    <span
      className="h-7 w-[88px] rounded-lg flex items-center justify-center text-base font-bold text-white shrink-0"
      style={{ backgroundColor: isNg ? "var(--semantic-status-error)" : "var(--semantic-status-success)" }}
    >
      {isNg ? "異常あり" : "正常"}
    </span>
  );
}

function InspectionItemRow({ item }: { item: InspectionItemResult }) {
  const [actionCategory, ...actionRest] = (item.action ?? "").split(" / ");
  const actionDetail = actionRest.join(" / ");

  return (
    <div className="flex flex-col gap-2 pb-3 border-b border-[#e0e0e0] last:border-0 last:pb-0 w-full">
      <div className="flex items-center justify-between gap-4 w-full">
        <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">{item.name}</p>
        <StatusTag status={item.status} />
      </div>
      {item.status === "ng" && (item.cause || item.action) && (
        <div className="flex flex-col gap-1 px-2 text-[16px] text-[var(--semantic-text-secondary)]">
          {item.cause && (
            <div className="flex items-start gap-1">
              <span className="font-bold shrink-0">原因：</span>
              <span>{item.cause}</span>
            </div>
          )}
          {item.action && (
            <div className="flex items-start gap-1">
              <span className="font-bold shrink-0">対応：</span>
              <div className="flex flex-col">
                <span>{actionCategory}</span>
                {actionDetail && <span>{actionDetail}</span>}
              </div>
            </div>
          )}
        </div>
      )}
      {item.timestamp && (
        <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full font-normal">
          {item.inspector} {item.timestamp}
        </p>
      )}
    </div>
  );
}

export function RecordDetailPage() {
  const { factoryId, recordId } = useParams<{ factoryId: string; recordId: string }>();
  const { records } = useRecords();
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/data-search/equipment-inspection/factories/${factoryId}`;

  useLayoutEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTop = 0;
    }
    requestAnimationFrame(() => {
      const main = document.querySelector('main');
      if (main) {
        main.scrollTop = 0;
      }
    });
  }, [recordId]);

  const record = records.find((r) => r.id === recordId);

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
          { label: "工場選択", to: "/admin/data-search/equipment-inspection" },
          { label: "データ一覧", to: basePath },
          { label: "詳細" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        {/* Factory Name */}
        <div className="flex items-center gap-3">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg">
            <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">{factoryName}</p>
          </div>
        </div>

        {/* Summary Info */}
        <div className="bg-white flex flex-col gap-3 px-4 py-6 rounded-lg w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">{formatDate(record.date)}</p>
          </div>
          <div className="border-t border-[#e0e0e0]" />
          <div className="flex items-center justify-between w-full">
            <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">実施者</p>
            <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">{record.implementer}</p>
          </div>
          <div className="border-t border-[#e0e0e0]" />
          <div className="flex items-center justify-between w-full">
            <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">確認者</p>
            <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">{record.confirmer}</p>
          </div>
          <div className="border-t border-[#e0e0e0]" />
          <div className="flex items-center justify-between w-full">
            <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">持ち場/ライン名</p>
            <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">{record.lineLabel}</p>
          </div>
        </div>

        {/* Inspection Sessions (実施区分ごと) */}
        {record.sessions.map((session, sessionIndex) => {
          const hasRemarks = Boolean(session.remarks && session.remarks.trim());
          const isSkipped = record.resultIcon === "skip";
          return (
            <div key={sessionIndex} className="bg-white flex flex-col gap-3 px-4 py-6 rounded-lg w-full">
              {!isSkipped && (
                <>
                  <div className="flex items-center justify-between w-full">
                    <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">実施区分</p>
                    <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">{session.segment}</p>
                  </div>

                  <div className="flex flex-col gap-3 w-full">
                    {session.points.map((point, pointIndex) => (
                      <div key={pointIndex} className="flex flex-col gap-3 w-full">
                        <div className="bg-[var(--semantic-brand-primary)] flex items-center justify-between gap-6 p-2 rounded-lg w-full">
                          <p className="text-[20px] font-bold text-white">点検箇所</p>
                          <p className="text-[20px] font-bold text-white">{point.location}</p>
                        </div>

                        <div className="flex flex-col gap-3 px-2 w-full">
                          <p className="text-[20px] font-bold text-[var(--semantic-brand-primary)]">点検項目</p>
                          {point.items.map((item, itemIndex) => (
                            <InspectionItemRow key={itemIndex} item={item} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#e0e0e0]" />
                </>
              )}

              <div className="flex flex-col gap-2 px-2 w-full">
                <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">備考</p>
                <p
                  className="text-[16px] leading-relaxed"
                  style={{
                    color: hasRemarks
                      ? "var(--semantic-text-primary)"
                      : "var(--semantic-text-secondary)",
                  }}
                >
                  {hasRemarks ? session.remarks : "特記事項はありません"}
                </p>
              </div>
            </div>
          );
        })}

        {/* Comments Section */}
        <div className="flex flex-col gap-4 items-start w-full">
          <p className="text-[20px] font-bold text-[var(--semantic-text-primary)]">コメント</p>
          <Comments comments={record.comments || []} />
        </div>
      </div>
    </div>
  );
}
