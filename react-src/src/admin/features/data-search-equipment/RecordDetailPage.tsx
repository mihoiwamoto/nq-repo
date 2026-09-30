import { useParams } from "react-router-dom";
import { getFactoryName } from "../../../data/factories";
import { RecordDetailView } from "../approvals-equipment-inspection/RecordDetailPage";
import type { EquipmentApprovalRecord } from "../approvals-equipment-inspection/types";
import { useRecords } from "./RecordsContext";
import type { InspectionRecord } from "./types";

/** 承認申請管理の記録の形に合わせる。点検見送りは承認申請管理と同じく備考だけを出す */
function toApprovalRecord(record: InspectionRecord): EquipmentApprovalRecord {
  return {
    ...record,
    sessions:
      record.resultIcon === "skip"
        ? []
        : record.sessions.map((s) => ({ ...s, remarks: s.remarks ?? "" })),
  };
}

/** データ検索の詳細は承認申請管理の詳細（承認ステータスの変更・コメント入力つき）をそのまま使う */
export function RecordDetailPage() {
  const { factoryId, recordId } = useParams<{ factoryId: string; recordId: string }>();
  const { records, setApprovalStatus, addComment } = useRecords();
  const record = records.find((r) => r.id === recordId);
  const basePath = `/admin/data-search/equipment-inspection/factories/${factoryId}`;

  return (
    <RecordDetailView
      record={record && toApprovalRecord(record)}
      factoryName={getFactoryName(factoryId)}
      breadcrumb={[
        { label: "データ検索", to: "/admin/data-search" },
        { label: "工場選択", to: "/admin/data-search/equipment-inspection" },
        { label: "データ一覧", to: basePath },
        { label: "詳細" },
      ]}
      setApprovalStatus={setApprovalStatus}
      addComment={addComment}
    />
  );
}
