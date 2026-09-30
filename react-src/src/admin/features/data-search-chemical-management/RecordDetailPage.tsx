import { useParams } from "react-router-dom";
import { getFactoryName } from "../../../data/factories";
import { RecordDetailView } from "../approvals-chemical-management/RecordDetailPage";
import { useRecords } from "./RecordsContext";

/** データ検索の詳細は承認申請管理の詳細（承認ステータスの変更・コメント入力つき）をそのまま使う */
export function RecordDetailPage() {
  const { factoryId, recordId } = useParams<{ factoryId: string; recordId: string }>();
  const { records, setApprovalStatus, addComment } = useRecords();
  const basePath = `/admin/data-search/chemical-management/factories/${factoryId}`;

  return (
    <RecordDetailView
      record={records.find((r) => r.id === recordId)}
      factoryName={getFactoryName(factoryId)}
      breadcrumb={[
        { label: "データ検索", to: "/admin/data-search" },
        { label: "工場選択", to: "/admin/data-search/chemical-management" },
        { label: "データ一覧", to: basePath },
        { label: "詳細" },
      ]}
      setApprovalStatus={setApprovalStatus}
      addComment={addComment}
    />
  );
}
