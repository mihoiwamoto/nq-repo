import { Link, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { ApprovalStatusBadge } from "../../components/ApprovalStatusBadge";
import { approvalRequests } from "../../data/approvals";
import { useRecords } from "./RecordsContext";
import { RepairStatusSection } from "./RepairStatusSection";
import type { ScaleApprovalRecord } from "./types";

function CheckCell({ record, field }: { record: ScaleApprovalRecord; field: "operation" | "level" | "dirt" }) {
  if (record.skipped) {
    return (
      <span className="size-6 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="7" y1="11.5" x2="17" y2="11.5" stroke="#333333" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </span>
    );
  }
  if (field === "operation") {
    return record.operationCheck === "ok" ? (
      <span className="size-6 flex items-center justify-center text-[var(--semantic-brand-primary)]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 12.402L8.47059 16.5L19.0882 7" stroke="currentColor" strokeWidth="2.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    ) : (
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
  if (record.operationCheck === "ng") {
    return (
      <span className="size-6 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="7" y1="11.5" x2="17" y2="11.5" stroke="#333333" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </span>
    );
  }
  const status = field === "level" ? record.levelCheck : record.dirtCheck;
  return status === "ok" ? (
    <span className="size-6 flex items-center justify-center text-[var(--semantic-brand-primary)]">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 12.402L8.47059 16.5L19.0882 7" stroke="currentColor" strokeWidth="2.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  ) : (
    <span className="size-6 flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="7" y1="11.5" x2="17" y2="11.5" stroke="#333333" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </span>
  );
}

function isOperationAbnormal(record: ScaleApprovalRecord) {
  return !record.skipped && record.operationCheck === "ng";
}

function DisplayValueCell({ record }: { record: ScaleApprovalRecord }) {
  if (record.skipped || record.operationCheck === "ng" || record.displayValue === null) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="7" y1="11.5" x2="17" y2="11.5" stroke="#333333" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  }
  return <span className={record.weightCause ? "text-[#f85c5c]" : ""}>{record.displayValue}</span>;
}

function formatDateShort(date: string) {
  const [y, m, d] = date.split("-");
  return `${y.slice(2)}.${m}.${d}`;
}

const COLUMNS = [
  { label: "操作", width: "w-[104px]" },
  { label: "ステータス", width: "w-[96px]" },
  { label: "日付", width: "w-[80px]" },
  { label: "秤No.(ラベル名)", width: "w-[148px]" },
  { label: "シリアルナンバー", width: "w-[148px]" },
  { label: "持ち場", width: "w-[148px]" },
  { label: "動作確認", width: "w-[100px]" },
  { label: "水平点検", width: "w-[100px]" },
  { label: "汚れ", width: "w-[100px]" },
  { label: "秤の表示値(g)", width: "w-[100px]" },
  { label: "備考", width: "flex-1 min-w-[200px]" },
  { label: "実施者", width: "w-[100px]" },
  { label: "確認者", width: "w-[100px]" },
];

export function ApprovalRecordsListPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { records } = useRecords();

  const request = approvalRequests.find((r) => r.id === requestId);
  const batchRecords = records.filter((r) => r.requestId === requestId);
  const basePath = `/admin/approvals/scale-inspection/${requestId}`;

  return (
    <div>
      <PageTitleBar title="点検内容一覧" showBack />
      <Breadcrumb
        items={[
          { label: "承認申請管理", to: "/admin/approvals" },
          { label: "点検内容一覧" },
        ]}
      />
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="flex flex-col gap-6 items-start w-full">
          <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
            <p className="text-xl text-[var(--semantic-text-primary)]">{request?.companyName ?? "工場"}</p>
          </div>
          <div className="flex flex-col gap-2 items-start w-full">
            <p className="text-xl text-[var(--semantic-text-primary)]">{request?.description ?? ""}</p>
            <div className="w-full rounded-lg overflow-x-auto">
              <div className="flex flex-col min-w-[1524px]">
                <div className="bg-[#f6f6f6] flex h-[50px] items-center">
                  {COLUMNS.map((col) => (
                    <div
                      key={col.label}
                      className={`flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-brand-primary)] ${col.width}`}
                    >
                      {col.label}
                    </div>
                  ))}
                </div>
                {batchRecords.map((record, index) => (
                  <div
                    key={record.id}
                    className={`flex h-14 items-center ${index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}
                  >
                    <div className="w-[104px] flex items-center justify-center p-2 h-full">
                      <Link
                        to={`${basePath}/records/${record.id}`}
                        className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                      >
                        詳細
                      </Link>
                    </div>
                    <div className="w-[96px] flex items-center justify-center p-2 h-full">
                      <ApprovalStatusBadge status={record.approvalStatus} />
                    </div>
                    <div className="w-[80px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                      {formatDateShort(record.date)}
                    </div>
                    <div className="w-[148px] flex items-center justify-start p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)] text-left">
                      {record.scaleLabel}
                    </div>
                    <div className="w-[148px] flex items-center justify-start p-2 h-full text-sm text-[var(--semantic-text-primary)] text-left">
                      {record.serialNumber}
                    </div>
                    <div className="w-[148px] flex items-center justify-start p-2 h-full text-sm text-[var(--semantic-text-primary)] text-left">
                      {record.post}
                    </div>
                    <div
                      className={`w-[100px] flex items-center justify-center p-2 h-full ${isOperationAbnormal(record) ? "bg-[#f85c5c]" : ""}`}
                    >
                      <CheckCell record={record} field="operation" />
                    </div>
                    <div className="w-[100px] flex items-center justify-center p-2 h-full">
                      <CheckCell record={record} field="level" />
                    </div>
                    <div className="w-[100px] flex items-center justify-center p-2 h-full">
                      <CheckCell record={record} field="dirt" />
                    </div>
                    <div className="w-[100px] flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                      <DisplayValueCell record={record} />
                    </div>
                    <div className="flex-1 min-w-[200px] flex items-center justify-start p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)] text-left">
                      {record.remarks}
                    </div>
                    <div className="w-[100px] flex items-center justify-center p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)]">
                      {record.implementer}
                    </div>
                    <div className="w-[100px] flex items-center justify-center p-2 h-full text-sm font-bold text-[var(--semantic-text-primary)]">
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
          onClick={() => navigate("/admin/approvals")}
          className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[400px] rounded-lg text-xl text-white"
        >
          承認する
        </button>

        <RepairStatusSection records={batchRecords} />
      </div>
    </div>
  );
}
