import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { ApprovalStatusBadge } from "../../components/ApprovalStatusBadge";
import { ApprovalConfirmDialog } from "../../components/ApprovalConfirmDialog";
import { useRecords } from "./RecordsContext";
import { useDemoList } from "../../../components/demo/demoStore";
import { getDateStripeClasses } from "../../utils/tableStripe";
import { useApprovalConfirm } from "../../hooks/useApprovalConfirm";
import { approvalRequests, updateApprovalRequestStatus } from "../../data/approvals";
import type { ResultIcon } from "./types";
import { useDemoFactoryName } from "../../data/factoryDemo";

function formatDateShort(date: string) {
  const [y, m, d] = date.split("-");
  return `${y.slice(2)}.${m}.${d}`;
}

function ResultBadge({ icon }: { icon: ResultIcon }) {
  if (icon === "ok") {
    return (
      <span className="size-6 flex items-center justify-center text-[var(--semantic-brand-primary)]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 12.402L8.47059 16.5L19.0882 7" stroke="currentColor" strokeWidth="2.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    );
  }
  if (icon === "ng") {
    return (
      <span className="size-6 flex items-center justify-center text-white">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_97_469484)">
            <path d="M9.97969 12L4.92893 6.94928C4.37104 6.39139 4.37104 5.48687 4.92893 4.92898C5.48682 4.37109 6.39135 4.37109 6.94924 4.92898L12 9.97974L17.0508 4.92898C17.6087 4.37109 18.5132 4.37109 19.0711 4.92898C19.629 5.48687 19.629 6.39139 19.0711 6.94928L14.0203 12L19.0711 17.0508C19.629 17.6087 19.629 18.5132 19.0711 19.0711C18.5132 19.629 17.6087 19.629 17.0508 19.0711L12 14.0204L6.94924 19.0711C6.39134 19.629 5.48682 19.629 4.92893 19.0711C4.37104 18.5132 4.37104 17.6087 4.92893 17.0508L9.97969 12Z" fill="white"/>
          </g>
          <defs>
            <clipPath id="clip0_97_469484">
              <rect width="24" height="24" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      </span>
    );
  }
  return (
    <span className="size-6 flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="7" y1="11.5" x2="17" y2="11.5" stroke="#333333" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </span>
  );
}

/** 列の幅。最小は中身の幅（備考だけ 0）、余りは確定デザインの列幅の比で分ける */
const COLS =
  "minmax(max-content,104fr) minmax(max-content,104fr) minmax(max-content,104fr) minmax(max-content,280fr) minmax(max-content,80fr) minmax(0,272fr) minmax(max-content,104fr) minmax(max-content,104fr)";

export function ApprovalRecordsListPage() {
  const demoFactoryName = useDemoFactoryName();
  const navigate = useNavigate();
  const { records: allRecords, setApprovalStatus } = useRecords();
  // 動作デモの「データが無い」を試している間は、記録が 1 件も無い状態にする
  const records = useDemoList(allRecords);
  const rowStripeClasses = getDateStripeClasses(records, (r) => r.date);
  const { showConfirmDialog, requestApproval, confirmApproval, cancelApproval } = useApprovalConfirm();
  const request = approvalRequests.find((r) => r.ledgerSlug === "equipment-inspection");

  const handleApprove = () => {
    requestApproval(() => {
      // 「承認する」は一覧の承認待ちの記録をまとめて承認する
      allRecords.forEach((r) => r.approvalStatus === "pending" && setApprovalStatus(r.id, "approved"));
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
            {/* 確定デザイン 7139:258984 の列幅（104/104/104/280/80/272/104/104、幅 1440 で表 1152px）を比にして、
                管理画面の幅 1280 でも全部の列が収まるようにする。持ち場名/ライン名は折り返さず、備考だけ 2 行まで折り返す */}
            <div className="w-full rounded-lg overflow-hidden">
              <div className="grid w-full" style={{ gridTemplateColumns: COLS }}>
                <div className="col-span-full grid grid-cols-subgrid bg-[#f6f6f6] h-[50px] items-center">
                  {["操作", "ステータス", "実施日", "持ち場名/ライン名", "点検結果", "備考", "実施者", "確認者"].map((h) => (
                    <div
                      key={h}
                      className="flex items-center justify-center p-2 h-full whitespace-nowrap text-sm font-semibold text-[var(--semantic-brand-primary)]"
                    >
                      {h}
                    </div>
                  ))}
                </div>
                {records.length === 0 && (
                  <p className="col-span-full text-sm text-[var(--semantic-text-secondary)] text-center py-6">
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
                        to={`/admin/approvals/equipment-inspection/records/${record.id}`}
                        className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-16 rounded-lg flex items-center justify-center text-sm font-semibold text-[var(--semantic-brand-primary)]"
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
                    <div className="flex items-center justify-start p-2 h-full whitespace-nowrap text-sm font-semibold text-[var(--semantic-text-primary)] text-left">
                      {record.lineLabel}
                    </div>
                    <div
                      className={`flex items-center justify-center p-2 h-full ${record.resultIcon === "ng" ? "bg-[#f85c5c]" : ""}`}
                    >
                      <ResultBadge icon={record.resultIcon} />
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
