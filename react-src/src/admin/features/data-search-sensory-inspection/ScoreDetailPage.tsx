import { useParams } from "react-router-dom";
import { ScoreDetailView } from "../approvals-sensory-inspection/ScoreDetailPage";
import { useRecords } from "./RecordsContext";

/** データ検索の点数の詳細は承認申請管理の点数の詳細をそのまま使う */
export function ScoreDetailPage() {
  const { factoryId, recordId, scoreId } = useParams<{
    factoryId: string;
    recordId: string;
    scoreId: string;
  }>();
  const { records } = useRecords();
  const basePath = `/admin/data-search/sensory-inspection/factories/${factoryId}`;
  const record = records.find((r) => r.id === recordId);

  return (
    <ScoreDetailView
      record={record}
      entry={record?.scoreEntries.find((e) => e.id === scoreId)}
      breadcrumb={[
        { label: "データ検索", to: "/admin/data-search" },
        { label: "工場選択", to: "/admin/data-search/sensory-inspection" },
        { label: "データ一覧", to: basePath },
        { label: "点数一覧", to: `${basePath}/records/${recordId}` },
        { label: "詳細" },
      ]}
    />
  );
}
