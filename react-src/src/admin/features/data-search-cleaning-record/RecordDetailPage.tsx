import { useParams } from "react-router-dom";
import { RecordDetailView } from "../approvals-cleaning-record/RecordDetailPage";
import type { CleaningApprovalRecord } from "../approvals-cleaning-record/mockData";
import { useRecords } from "./RecordsContext";
import { getFactoryName } from "../../../data/factories";
import type { CleaningSearchRecord } from "./types";

/** データ検索の記録を承認申請管理の詳細の形に直す */
function toApprovalRecord(r: CleaningSearchRecord): CleaningApprovalRecord {
  return {
    id: r.id,
    date: r.date,
    lineLabel: r.lineLabel,
    cleaned: r.cleaned,
    remarks: r.detailRemarks || r.remarks,
    implementer: r.implementer,
    confirmer: r.confirmer,
    locations: r.cleaningPoints.map((p) => ({
      name: p.location,
      items: p.items.map((i) => ({
        name: i.name,
        category: "清掃項目",
        cleaned: i.cleaned,
        implementer: i.inspector,
        timestamp: i.timestamp,
      })),
    })),
    comments: r.comments,
  };
}

/** データ検索の詳細は承認申請管理の詳細をそのまま使う（承認ステータスのプルダウン・コメントの入力欄つき。確定デザイン 7139:259043。2026-10-07） */
export function RecordDetailPage() {
  const { factoryId, recordId } = useParams<{ factoryId: string; recordId: string }>();
  const { records, setApprovalStatus, addComment } = useRecords();
  const basePath = `/admin/data-search/cleaning-record/factories/${factoryId}`;
  const record = records.find((r) => r.id === recordId);

  return (
    <RecordDetailView
      record={record ? toApprovalRecord(record) : undefined}
      factoryName={getFactoryName(factoryId)}
      breadcrumb={[
        { label: "データ検索", to: "/admin/data-search" },
        { label: "工場選択", to: "/admin/data-search/cleaning-record" },
        { label: "データ一覧", to: basePath },
        { label: "詳細" },
      ]}
      approvalStatus={record?.approvalStatus ?? "pending"}
      setApprovalStatus={setApprovalStatus}
      addComment={addComment}
    />
  );
}
