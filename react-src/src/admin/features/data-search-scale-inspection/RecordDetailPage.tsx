import { useParams } from "react-router-dom";
import { getFactoryName } from "../../../data/factories";
import { RecordDetailView } from "../approvals-scale-inspection/RecordDetailPage";
import type { ScaleApprovalRecord } from "../approvals-scale-inspection/types";
import { useRecords } from "./RecordsContext";
import type { ScaleRecord } from "./types";

/** データ検索の記録には入力時刻が無いので、前の詳細画面と同じ時刻（実施日の 9:30〜10:00）を補う */
function toApprovalRecord(record: ScaleRecord): ScaleApprovalRecord {
  const day = record.date.replaceAll("-", "/");
  const done = !record.skipped;
  return {
    ...record,
    requestId: "",
    operationCheckTime: done ? `${day} 09:30` : "",
    levelCheckTime: done && record.levelCheck ? `${day} 09:45` : null,
    dirtCheckTime: done && record.dirtCheck ? `${day} 09:50` : null,
    displayValueTime: done && record.displayValue !== null ? `${day} 10:00` : null,
  };
}

/** データ検索の詳細は承認申請管理の詳細（承認ステータスの変更・コメント入力つき）をそのまま使う */
export function RecordDetailPage() {
  const { factoryId, recordId } = useParams<{ factoryId: string; recordId: string }>();
  const { records, setApprovalStatus, setRepairStatus, addComment } = useRecords();
  const basePath = `/admin/data-search/scale-inspection/factories/${factoryId}`;
  const record = records.find((r) => r.id === recordId);

  return (
    <RecordDetailView
      record={record && toApprovalRecord(record)}
      factoryName={getFactoryName(factoryId)}
      breadcrumb={[
        { label: "データ検索", to: "/admin/data-search" },
        { label: "工場選択", to: "/admin/data-search/scale-inspection" },
        { label: "データ一覧", to: basePath },
        { label: "詳細" },
      ]}
      setApprovalStatus={setApprovalStatus}
      setRepairStatus={setRepairStatus}
      addComment={addComment}
    />
  );
}
