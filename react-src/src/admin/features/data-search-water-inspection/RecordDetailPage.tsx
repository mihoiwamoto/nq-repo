import { useParams } from "react-router-dom";
import { getFactoryName } from "../../../data/factories";
import { RecordDetailView } from "../approvals-water-inspection/RecordDetailPage";
import { useRecords } from "./RecordsContext";

/** データ検索の詳細は承認申請管理の詳細（承認ステータスの変更・コメント入力つき）をそのまま使う */
export function RecordDetailPage() {
  const { factoryId, pointId, recordId } = useParams<{
    factoryId: string;
    pointId: string;
    recordId: string;
  }>();
  const { records, setApprovalStatus, addComment } = useRecords();
  const basePath = `/admin/data-search/water-inspection/factories/${factoryId}/points/${pointId}`;

  return (
    <RecordDetailView
      record={records.find((r) => r.id === recordId)}
      factoryName={getFactoryName(factoryId)}
      breadcrumb={[
        { label: "データ検索", to: "/admin/data-search" },
        { label: "工場選択", to: "/admin/data-search/water-inspection" },
        { label: "点検場所選択", to: `/admin/data-search/water-inspection/factories/${factoryId}` },
        { label: "データ一覧", to: basePath },
        { label: "詳細" },
      ]}
      setApprovalStatus={setApprovalStatus}
      addComment={addComment}
    />
  );
}
