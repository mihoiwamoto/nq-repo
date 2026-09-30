import { useParams } from "react-router-dom";
import { getFactoryName } from "../../../data/factories";
import { RecordDetailView } from "../approvals-sensory-inspection/RecordDetailPage";
import { useRecords } from "./RecordsContext";

/** データ検索の点数一覧は承認申請管理の点数一覧（承認ステータスの変更・コメント入力つき）をそのまま使う */
export function RecordDetailPage() {
  const { factoryId, recordId } = useParams<{ factoryId: string; recordId: string }>();
  const { records, setApprovalStatus, addComment } = useRecords();
  const basePath = `/admin/data-search/sensory-inspection/factories/${factoryId}`;

  return (
    <RecordDetailView
      record={records.find((r) => r.id === recordId)}
      factoryName={getFactoryName(factoryId)}
      basePath={basePath}
      breadcrumb={[
        { label: "データ検索", to: "/admin/data-search" },
        { label: "工場選択", to: "/admin/data-search/sensory-inspection" },
        { label: "データ一覧", to: basePath },
        { label: "点数一覧" },
      ]}
      setApprovalStatus={setApprovalStatus}
      addComment={addComment}
    />
  );
}
