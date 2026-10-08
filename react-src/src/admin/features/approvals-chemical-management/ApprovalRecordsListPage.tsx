import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { ApprovalStatusBadge } from "../../components/ApprovalStatusBadge";
import { ApprovalConfirmDialog } from "../../components/ApprovalConfirmDialog";
import { useRecords } from "./RecordsContext";
import { useDemoList } from "../../../components/demo/demoStore";
import { getRowStripeClasses } from "../../utils/tableStripe";
import { useApprovalConfirm } from "../../hooks/useApprovalConfirm";
import { approvalRequests, updateApprovalRequestStatus } from "../../data/approvals";
import { useDemoFactoryName } from "../../data/factoryDemo";

function formatDateShort(date: string) {
  const [y, m, d] = date.split("-");
  return `${y.slice(2)}.${m}.${d}`;
}

const COLUMNS = [
  { label: "操作", track: "minmax(max-content,104fr)" },
  { label: "ステータス", track: "minmax(max-content,96fr)" },
  { label: "日付", track: "minmax(max-content,80fr)" },
  { label: "薬品名", track: "minmax(0,104fr)" },
  { label: "区分", track: "minmax(max-content,104fr)" },
  { label: "数量", track: "minmax(max-content,104fr)" },
  { label: "現在庫数", track: "minmax(max-content,104fr)" },
  { label: "保管場所", track: "minmax(0,104fr)" },
  { label: "備考", track: "minmax(0,152fr)" },
  { label: "実施者", track: "minmax(max-content,100fr)" },
  { label: "確認者", track: "minmax(max-content,100fr)" },
];
/** 列の幅。最小は中身の幅（薬品名・保管場所・備考は 0 で「…」）、余りは確定デザイン 7139:162904 の列幅の比で分ける */
const COLS = COLUMNS.map((c) => c.track).join(" ");

export function ApprovalRecordsListPage() {
  const demoFactoryName = useDemoFactoryName();
  const navigate = useNavigate();
  const { records: allRecords } = useRecords();
  // 動作デモの「データが無い」を試している間は、記録が 1 件も無い状態にする
  const records = useDemoList(allRecords);
  const { showConfirmDialog, requestApproval, confirmApproval, cancelApproval } = useApprovalConfirm();
  const request = approvalRequests.find((r) => r.ledgerSlug === "chemical-management");

  /* 確定デザイン 7139:162904：絞り込みの段と月送りは無く、申請の題（「25年4月1日点検分_次亜塩素酸ナトリウム」）の下に表だけを出す（2026-10-06） */
  const filtered = records;
  const rowStripeClasses = getRowStripeClasses(filtered);

  const handleApprove = () => {
    requestApproval(() => {
      if (request) updateApprovalRequestStatus(request.id, "approved");
      navigate("/admin/approvals", { state: { statusChanged: "approved" } });
    });
  };

  return (
    <div>
      {showConfirmDialog && (
        <ApprovalConfirmDialog onCancel={cancelApproval} onConfirm={confirmApproval} />
      )}
      <PageTitleBar title="データ一覧" showBack />
      <Breadcrumb
        items={[
          { label: "承認申請管理", to: "/admin/approvals" },
          { label: "データ一覧" },
        ]}
      />
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="flex flex-col gap-6 items-start w-full">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
            <p className="text-xl text-[var(--semantic-text-primary)]">{demoFactoryName}</p>
          </div>

          <div className="flex flex-col gap-2 items-start w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">
              {request?.description ?? "25年4月1日点検分_次亜塩素酸ナトリウム"}
            </p>
            <div className="w-full rounded-lg overflow-hidden">
              <div className="grid w-full" style={{ gridTemplateColumns: COLS }}>
                <div className="col-span-full grid grid-cols-subgrid bg-[#f6f6f6] h-[50px] items-center">
                  {COLUMNS.map((col) => (
                    <div
                      key={col.label}
                      className="flex items-center justify-center p-2 h-full whitespace-nowrap text-sm font-semibold text-[var(--semantic-brand-primary)]"
                    >
                      {col.label}
                    </div>
                  ))}
                </div>
                {filtered.length === 0 ? (
                  <p className="col-span-full bg-white p-6 text-base text-[var(--semantic-text-secondary)]">
                    データがありません。
                  </p>
                ) : (
                  filtered.map((record, index) => (
                    <div
                      key={record.id}
                      data-row
                      className={`col-span-full grid grid-cols-subgrid h-14 items-center ${rowStripeClasses[index]}`}
                    >
                      <div className="flex items-center justify-center p-2 h-full">
                        <Link
                          to={`/admin/approvals/chemical-management/records/${record.id}`}
                          className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center text-sm font-semibold text-[var(--semantic-brand-primary)]"
                        >
                          詳細
                        </Link>
                      </div>
                      <div className="flex items-center justify-center p-2 h-full">
                        <ApprovalStatusBadge status={record.approvalStatus} />
                      </div>
                      <div className="flex items-center justify-center p-2 h-full whitespace-nowrap text-sm font-semibold text-[var(--semantic-text-primary)]">
                        {formatDateShort(record.date)}
                      </div>
                      <div className="min-w-0 flex items-center justify-start p-2 h-full text-sm font-semibold text-[var(--semantic-text-primary)]" title={record.chemicalName}>
                        <span className="block w-full truncate">{record.chemicalName}</span>
                      </div>
                      <div className="flex items-center justify-center p-2 h-full whitespace-nowrap text-sm font-semibold text-[var(--semantic-text-primary)]">
                        {record.type}
                      </div>
                      <div className="flex items-center justify-center p-2 h-full whitespace-nowrap text-sm font-semibold text-[var(--semantic-text-primary)]">
                        {record.quantity}
                      </div>
                      <div className="flex items-center justify-center p-2 h-full whitespace-nowrap text-sm font-semibold text-[var(--semantic-text-primary)]">
                        {record.currentStock}
                      </div>
                      <div className="min-w-0 flex items-center justify-start p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)]" title={record.storageLocation}>
                        <span className="block w-full truncate">{record.storageLocation}</span>
                      </div>
                      <div className="min-w-0 flex items-center justify-start p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)]" title={record.remarks}>
                        <span className="block w-full truncate">{record.remarks}</span>
                      </div>
                      <div className="flex items-center justify-center p-2 h-full whitespace-nowrap text-sm font-bold text-[var(--semantic-text-primary)]">
                        {record.implementer}
                      </div>
                      <div className="flex items-center justify-center p-2 h-full whitespace-nowrap text-sm font-bold text-[var(--semantic-text-primary)]">
                        {record.confirmer}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleApprove}
          className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[400px] rounded-lg text-xl text-white"
        >
          承認する
        </button>
      </div>
    </div>
  );
}
