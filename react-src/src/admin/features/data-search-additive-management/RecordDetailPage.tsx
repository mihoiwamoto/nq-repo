import { useParams } from "react-router-dom";
import { getFactoryName } from "../../../data/factories";
import { RecordDetailView } from "../approvals-additive-management/RecordDetailPage";
import { useRecords } from "./RecordsContext";

/** データ検索の詳細は承認申請管理の詳細の中身を mode="search" で使う。承認ステータスのプルダウンとコメントの入力欄は承認申請管理と同じに出す（確定デザイン 7139:259043 と同じ配置。2026-10-07） */
export function RecordDetailPage() {
  const { factoryId, recordId } = useParams<{ factoryId: string; recordId: string }>();
  const { records, setApprovalStatus, addComment } = useRecords();
  const basePath = `/admin/data-search/additive-management/factories/${factoryId}`;

  return (
    <RecordDetailView
      mode="search"
      record={records.find((r) => r.id === recordId)}
      factoryName={getFactoryName(factoryId)}
      breadcrumb={[
        { label: "データ検索", to: "/admin/data-search" },
        { label: "工場選択", to: "/admin/data-search/additive-management" },
        { label: "データ一覧", to: basePath },
        { label: "詳細" },
      ]}
      setApprovalStatus={setApprovalStatus}
      addComment={addComment}
    />
  );
}
