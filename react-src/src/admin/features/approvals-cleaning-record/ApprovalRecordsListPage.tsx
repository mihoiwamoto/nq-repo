import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { ApprovalStatusBadge } from "../../components/ApprovalStatusBadge";
import { ApprovalConfirmDialog } from "../../components/ApprovalConfirmDialog";
import { useRecords } from "./RecordsContext";
import { getDateStripeClasses } from "../../utils/tableStripe";
import { useDemoList } from "../../../components/demo/demoStore";
import { useApprovalConfirm } from "../../hooks/useApprovalConfirm";
import { approvalRequests, updateApprovalRequestStatus } from "../../data/approvals";
import { useDemoFactoryName } from "../../data/factoryDemo";

function formatDateShort(date: string) {
  const [y, m, d] = date.split("-");
  return `${y.slice(2)}.${m}.${d}`;
}

function CleanedIcon({ cleaned }: { cleaned: boolean }) {
  if (!cleaned) {
    return <span className="text-sm text-[var(--semantic-text-primary)]">ー</span>;
  }
  return (
    <span className="size-6 flex items-center justify-center text-[var(--semantic-brand-primary)]">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 12.402L8.47059 16.5L19.0882 7" stroke="currentColor" strokeWidth="2.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );
}

/** 列の幅。最小は中身の幅（備考だけ 0）、余りは確定デザイン 7139:161890 の列幅の比で分ける */
const COLS =
  "minmax(max-content,104fr) minmax(max-content,104fr) minmax(max-content,104fr) minmax(max-content,280fr) minmax(max-content,80fr) minmax(0,272fr) minmax(max-content,104fr) minmax(max-content,104fr)";

export function ApprovalRecordsListPage() {
  const demoFactoryName = useDemoFactoryName();
  const navigate = useNavigate();
  // 動作デモの「データが無い」を試している間は、記録が 1 件も無い状態にする
  const { records: allRecords } = useRecords();
  const records = useDemoList(allRecords);
  const rowStripeClasses = getDateStripeClasses(records, (r) => r.date);
  const { showConfirmDialog, requestApproval, confirmApproval, cancelApproval } = useApprovalConfirm();
  const request = approvalRequests.find((r) => r.ledgerSlug === "cleaning-record");

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
            <p className="text-xl text-[var(--semantic-text-primary)]">25年4月1日点検分</p>
            {/* 確定デザイン 7139:161890 の列幅（104/104/104/280/80/272/104/104）を比にして、管理画面の幅 1280 でも
                全部の列が収まるようにする。持ち場名/ライン名は折り返さず、備考だけ 2 行まで折り返す */}
            <div className="w-full rounded-lg overflow-hidden">
              <div className="grid w-full" style={{ gridTemplateColumns: COLS }}>
                <div className="col-span-full grid grid-cols-subgrid bg-[#f6f6f6] h-[50px] items-center">
                  {["操作", "ステータス", "実施日", "持ち場名/ライン名", "清掃済み", "備考", "実施者", "確認者"].map((h) => (
                    <div
                      key={h}
                      className="flex items-center justify-center p-2 h-full whitespace-nowrap text-sm font-semibold text-[var(--semantic-brand-primary)]"
                    >
                      {h}
                    </div>
                  ))}
                </div>
                {records.length === 0 && (
                  <p className="col-span-full bg-white p-6 text-base text-[var(--semantic-text-secondary)]">
                    データがありません。
                  </p>
                )}
                {records.map((record, index) => (
                  <div
                    key={record.id}
                    data-row
                    className={`col-span-full grid grid-cols-subgrid h-14 items-center ${rowStripeClasses[index]}`}
                  >
                    <div className="flex items-center justify-center p-2 h-full">
                      <Link
                        to={`/admin/approvals/cleaning-record/records/${record.id}`}
                        className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center text-sm font-semibold text-[var(--semantic-brand-primary)]"
                      >
                        詳細
                      </Link>
                    </div>
                    <div className="flex items-center justify-center p-2 h-full">
                      <ApprovalStatusBadge status="pending" />
                    </div>
                    <div className="flex items-center justify-center p-2 h-full whitespace-nowrap text-sm font-semibold text-[var(--semantic-text-primary)]">
                      {formatDateShort(record.date)}
                    </div>
                    <div className="flex items-center justify-start p-2 h-full whitespace-nowrap text-sm font-bold text-[var(--semantic-text-primary)] text-left">
                      {record.lineLabel}
                    </div>
                    <div className="flex items-center justify-center p-2 h-full">
                      <CleanedIcon cleaned={record.cleaned} />
                    </div>
                    <div
                      className="min-w-0 flex items-center justify-start p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)] text-left"
                      title={record.remarks}
                    >
                      <span className="line-clamp-2">{record.remarks}</span>
                    </div>
                    <div className="flex items-center justify-center p-2 h-full whitespace-nowrap text-sm font-bold text-[var(--semantic-text-primary)]">
                      {record.implementer}
                    </div>
                    <div className="flex items-center justify-center p-2 h-full whitespace-nowrap text-sm font-bold text-[var(--semantic-text-primary)]">
                      {record.confirmer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleApprove}
          className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[400px] rounded-lg text-xl text-white"
        >
          承認する
        </button>
      </div>
    </div>
  );
}
