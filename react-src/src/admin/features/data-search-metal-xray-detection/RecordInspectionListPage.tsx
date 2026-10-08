import { useParams } from "react-router-dom";
import { getFactoryName } from "../../../data/factories";
import { MachineDetailView } from "../approvals-metal-xray-detection/MachineDetailPage";
import { useRecords } from "./RecordsContext";
import { useDemoList } from "../../../components/demo/demoStore";

/** データ検索の点検内容一覧は承認申請管理の点検内容一覧の中身を使う。
 *  確定デザイン（6296:131548）どおり閲覧だけ：承認ステータスのプルダウンとコメントの入力欄は出さず（コメントの一覧は出す）、
 *  上部カードは 実施日・金属探知機・X線探知機・ウェイトチェッカー（確認者は出さない）。
 *  各行の「詳細」はデータ検索の詳細画面（点検内容ごとの画面）へ */
export function RecordInspectionListPage() {
  const { factoryId, recordId } = useParams<{ factoryId: string; recordId: string }>();
  const { records: allRecords, setApprovalStatus, addComment } = useRecords();
  // 動作デモの「データが無い」を試している間は、記録が 1 件も無い状態にする
  const records = useDemoList(allRecords);
  const record = records.find((r) => r.id === recordId);
  const basePath = `/admin/data-search/metal-xray-detection/factories/${factoryId}`;

  return (
    <MachineDetailView
      record={record}
      readOnly
      summaryRows={(r) => [
        { label: "実施日", value: r.date.replaceAll("-", "/") },
        { label: "金属探知機", value: record?.metalDetectorModel ?? "" },
        { label: "X線探知機", value: record?.xrayDetectorModel ?? "" },
        { label: "ウェイトチェッカー", value: record?.weightCheckerModel ?? "" },
      ]}
      factoryName={getFactoryName(factoryId)}
      breadcrumb={[
        { label: "データ検索", to: "/admin/data-search" },
        { label: "工場選択", to: "/admin/data-search/metal-xray-detection" },
        { label: "データ一覧", to: basePath },
        { label: "点検内容一覧" },
      ]}
      itemPath={(record, item) => {
        const recordPath = `${basePath}/records/${record.id}`;
        if (item.content === "テストピース") return `${recordPath}/test-piece`;
        if (item.content === "異常反応" && item.result === "NG") return `${recordPath}/abnormal-reaction`;
        if (item.content === "製品通過") return `${recordPath}/passed-product`;
        return `${recordPath}/details`;
      }}
      setApprovalStatus={setApprovalStatus}
      addComment={addComment}
    />
  );
}
