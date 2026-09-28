import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import iconAttention from "../../../assets/figma/icons/common/attention.svg";
import { useAdditiveManagement } from "./AdditiveManagementContext";
import { ACTORS, type AdditiveRecord, type StockCategory } from "./mockData";

type SingleRecordConfirmState = {
  productId?: string;
  recordId?: string;
  date: string;
  storageLocation: string;
  spec: string;
  initialStock: string;
  category: StockCategory;
  quantity: string;
  currentStock: string;
  remarks: string;
  actor?: string;
};

type RecordsListConfirmState = {
  date?: string;
  inspectorName?: string;
};

const COLUMNS = [
  { key: "op", label: "操作", width: 80 },
  { key: "storageLocation", label: "保管場所", width: 80 },
  { key: "category", label: "区分", width: 80 },
  { key: "quantity", label: "数量", width: 80 },
  { key: "currentStock", label: "現在庫数", width: 80 },
  { key: "remarks", label: "備考", width: 160 },
  { key: "actor", label: "実施者", width: 104 },
] as const;

function isSingleRecordState(
  state: SingleRecordConfirmState | RecordsListConfirmState | null
): state is SingleRecordConfirmState {
  return !!state && "category" in state;
}

export function ConfirmPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { additives, records, addRecord, updateRecord, updateAdditiveStatus } = useAdditiveManagement();
  const location = useLocation();
  const state = location.state as SingleRecordConfirmState | RecordsListConfirmState | null;
  const basePath = `/app/ledger-list/additive-management/products/${productId}`;

  const additive = additives.find((a) => a.id === productId);
  const productRecords = records.filter((record) => record.additiveId === productId);

  if (!isSingleRecordState(state) && productRecords.length === 0) {
    return (
      <>
        <AppHeader title={`添加物管理_${additive?.name ?? ""}`} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-base text-[var(--semantic-text-secondary)]">
            記録内容が見つかりません。記録画面から操作してください。
          </p>
          <button
            type="button"
            onClick={() => navigate(`${basePath}/new`)}
            className="bg-[var(--semantic-brand-primary)] h-12 px-6 rounded-lg text-base text-white"
          >
            記録画面に戻る
          </button>
        </div>
      </>
    );
  }

  function handleSubmit() {
    if (isSingleRecordState(state)) {
      const input = {
        additiveId: productId ?? state.productId ?? "",
        date: state.date,
        storageLocation: state.storageLocation,
        category: state.category,
        quantity: state.quantity,
        currentStock: state.currentStock,
        remarks: state.remarks,
        actor: state.actor ?? ACTORS[0].name,
      };
      if (state.recordId) {
        updateRecord(state.recordId, input);
      } else {
        addRecord(input);
      }
    } else if (productId) {
      updateAdditiveStatus(productId, "inspected");
    }
    navigate(`${basePath}/complete`);
  }

  const date = isSingleRecordState(state) ? state.date : state?.date ?? productRecords[0]?.date ?? "";
  const displayRows: AdditiveRecord[] = isSingleRecordState(state)
    ? [
        {
          id: state.recordId ?? "pending",
          additiveId: productId ?? state.productId ?? "",
          date: state.date,
          storageLocation: state.storageLocation,
          category: state.category,
          quantity: state.quantity,
          currentStock: state.currentStock,
          remarks: state.remarks,
          actor: state.actor ?? ACTORS[0].name,
        },
      ]
    : productRecords;

  return (
    <>
      <AppHeader title={`添加物管理_${additive?.name ?? ""}`} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
        <div className="bg-[#f7f292] flex gap-2 items-center p-4 rounded-lg w-full max-w-full">
          <img src={iconAttention} alt="注意" className="size-5 shrink-0" />
          <p className="text-sm text-[var(--semantic-text-primary)]">
            実施者、入力内容に誤りがないか提出前にご確認ください。
          </p>
        </div>

        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{date}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg overflow-x-auto w-full max-w-full">
          <table className="border-collapse w-full">
            <thead>
              <tr className="bg-[var(--semantic-brand-primary)]">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    style={{ minWidth: col.width }}
                    className="text-white text-sm font-semibold px-2 py-2 whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, index) => (
                <tr key={row.id} className={index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}>
                  <td className="px-2 py-2 text-center">
                    <Link
                      to={`${basePath}/records/${row.id}`}
                      state={row.id === "pending" ? { record: row } : undefined}
                      className="bg-[var(--semantic-brand-primary)] h-8 w-14 rounded-lg text-xs text-white inline-flex items-center justify-center"
                    >
                      詳細
                    </Link>
                  </td>
                  <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                    {row.storageLocation}
                  </td>
                  <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                    {row.category}
                  </td>
                  <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                    {row.quantity}
                  </td>
                  <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                    {row.currentStock}
                  </td>
                  <td className="px-2 py-2 text-sm text-[var(--semantic-text-primary)]">{row.remarks}</td>
                  <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)] whitespace-nowrap">
                    {row.actor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-white border border-[#333] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-xl text-white"
        >
          提出
        </button>
      </div>
    </>
  );
}
