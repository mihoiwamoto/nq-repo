import { useParams } from "react-router-dom";
import { getFactoryName } from "../../../data/factories";
import { RecordDetailView } from "../approvals-glass-plastic/RecordDetailPage";
import { useRecords } from "./RecordsContext";

/** データ検索の詳細は承認申請管理の詳細（承認ステータスの変更・コメント入力つき）をそのまま使う */
export function RecordDetailPage() {
  const { factoryId, floorId, recordId } = useParams<{
    factoryId: string;
    floorId: string;
    recordId: string;
  }>();
  const { records, setApprovalStatus, addComment } = useRecords();
  const basePath = `/admin/data-search/glass-plastic/factories/${factoryId}`;
  const record = records.find((r) => r.id === recordId);

  return (
    <RecordDetailView
      // データ検索の記録には入力時刻が無いので、前の詳細画面と同じ 10:15 を補う
      record={record && { ...record, time: "10:15" }}
      factoryName={getFactoryName(factoryId)}
      breadcrumb={[
        { label: "データ検索", to: "/admin/data-search" },
        { label: "工場選択", to: "/admin/data-search/glass-plastic" },
        { label: "点検場所選択", to: basePath },
        { label: "データ一覧", to: `${basePath}/floors/${floorId}` },
        { label: "詳細" },
      ]}
      setApprovalStatus={setApprovalStatus}
      addComment={addComment}
    />
  );
}
