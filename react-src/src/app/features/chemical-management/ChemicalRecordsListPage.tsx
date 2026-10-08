import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { DateFilterInput } from "../../components/DateFilterInput";
import { todayString } from "../../utils/date";
import { fillSlice, useProgressRecordFill, type RecordFill } from "../../utils/progressRecordFill";
import { AppHeader } from "../../layout/AppHeader";
import { useFromProgress } from "../../layout/ProgressFlowContext";
import iconPlus from "../../../assets/figma/icons/common/plus.svg";
import iconEdit from "../../../assets/figma/icons/common/edit.svg";
import { useChemicalManagement } from "./ChemicalManagementContext";
import { useDemoList } from "../../../components/demo/demoStore";
import { AppEmptyState } from "../../components/AppEmptyState";
import { ACTORS, initialRecords } from "./mockData";

const SEED_RECORD_IDS = new Set(initialRecords.map((record) => record.id));

const COLUMNS = [
  { key: "action", label: "操作", width: 80 },
  { key: "storageLocation", label: "保管場所", width: 80 },
  { key: "category", label: "区分", width: 80 },
  { key: "quantity", label: "数量", width: 80 },
  { key: "currentStock", label: "現在庫数", width: 80 },
  { key: "remarks", label: "備考", width: 168 },
  { key: "actor", label: "実施者", width: 104 },
] as const;

export function ChemicalRecordsListPage() {
  const { chemicalId } = useParams<{ chemicalId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as
    | { date?: string; inspectorName?: string; fromProgress?: boolean; progressStatus?: string; editing?: boolean }
    | null;
  const inspectorName = state?.inspectorName ?? ACTORS[0].name;
  const { chemicals, records: allRecords } = useChemicalManagement();
  // 動作デモの「データが無い」を試している間は、記録が 1 件も無い状態にする
  const records = useDemoList(allRecords);

  const chemical = chemicals.find((c) => c.id === chemicalId);
  // 進捗一覧から来たときはそちらのステータスを優先する（未点検=記録なし / 点検中=記録途中 / 点検済み・確認完了=記録あり）
  const progressFill = useProgressRecordFill();
  const chemicalFill: RecordFill =
    chemical?.status === "not_inspected" ? "none" : chemical?.status === "in_progress" ? "partial" : "full";
  const fill = progressFill ?? chemicalFill;
  // 見本の記録だけを進捗のステータスで間引き、この画面で足した記録は必ず出す
  // （点検中で足した記録が前半だけ残す間引きで消えたり、点検済みから「編集」で足した記録が消えたりしないように）
  const ownRecords = records.filter((record) => record.chemicalId === chemicalId);
  const chemicalRecords = [
    ...fillSlice(ownRecords.filter((record) => SEED_RECORD_IDS.has(record.id)), fill),
    ...ownRecords.filter((record) => !SEED_RECORD_IDS.has(record.id)),
  ];
  const [date, setDate] = useState(
    () => state?.date ?? chemicalRecords[0]?.date.replaceAll("/", "-") ?? todayString(),
  );
  const hasRecords = chemicalRecords.length > 0;
  const basePath = `/app/ledger-list/chemical-management/${chemicalId}`;
  // 進捗一覧で点検済み・確認完了の薬品を開いたときは見るだけの一覧（確定デザイン「進捗一覧_薬品管理表_点検済み選択_一覧」
  // 「…_確認済み選択_一覧」。添加物管理の RecordsListPage と同じ形）。実施日は文字で出し、「＋記録を追加」と
  // 「確認画面へ」は無く、下は「戻る」だけ。点検済みは右上の「編集」で、同じ日の記録の一覧を入力できる形で開き直す
  const readOnlyStatus =
    state?.fromProgress &&
    !state.editing &&
    (state.progressStatus === "inspected" || state.progressStatus === "confirmed")
      ? state.progressStatus
      : null;
  // 「編集」から開いた一覧の「戻る」は、見るだけの一覧へ戻す
  const editingFromProgress = !!(state?.fromProgress && state.editing);
  // 記録入力から一覧へ戻ったときも進捗一覧のステータスで出し分けられるよう、記録入力へ持っていく
  const progressCarry = state?.fromProgress
    ? { fromProgress: true, progressStatus: state.progressStatus, editing: state.editing }
    : {};
  // 進捗一覧で点検中（・未点検）の薬品を開いた一覧（確定デザイン「進捗一覧_薬品管理表_点検中選択_一覧」7139:250098）。
  // 実施日の段の下に区切り線は無く、備考は 1 行で「…」に切る。行の「詳細」は見るだけの詳細ではなく、
  // その記録の値が入った記録画面（7139:250074。「一覧へ戻る」「保存」）を開き、保存で一覧へ戻る（2026-10-07）
  const fromProgressFlow = useFromProgress();
  const progressEditable = fromProgressFlow && !!state?.fromProgress && !readOnlyStatus && !state?.editing;

  return (
    <>
      <AppHeader title={`薬品管理_${chemical?.name ?? ""}`} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 flex flex-col gap-4">
        {readOnlyStatus ? (
          <>
            {/* 確定デザイン 7139:249686：「編集」と実施日のカードのあいだは 8px、カードは高さ 70px（2026-10-08） */}
            {readOnlyStatus === "inspected" && (
              <div className="flex justify-end -mb-2">
                <button
                  type="button"
                  onClick={() => navigate(basePath, { state: { ...state, date, editing: true } })}
                  className="bg-white border border-[var(--semantic-brand-primary)] flex gap-2 items-center justify-center h-11 w-24 rounded-lg text-lg font-semibold leading-none text-[var(--semantic-brand-primary)] whitespace-nowrap"
                >
                  <img src={iconEdit} alt="" className="size-5" />
                  編集
                </button>
              </div>
            )}
            <div className="bg-white flex items-center justify-between px-4 py-6 rounded-lg">
              <p className="text-base leading-[22px] text-[var(--semantic-text-primary)]">実施日</p>
              <p className="text-base leading-[22px] text-[var(--semantic-text-primary)]">{date.replaceAll("-", "/")}</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-12 items-center justify-between">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                実施日 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <DateFilterInput value={date} onChange={setDate} variant="borderless" />
            </div>

            {!progressEditable && <div className="border-t border-[#d0d0d0] w-full mt-1 mb-[3px]" />}
          </>
        )}

        <div className="flex flex-col gap-2 w-full">
          <div className="bg-white rounded-lg overflow-x-auto">
            <table className="border-collapse table-fixed w-full">
              <thead>
                <tr className="bg-[var(--semantic-brand-primary)] h-14">
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      style={{ width: col.key === "remarks" ? "auto" : col.width }}
                      className="text-white text-sm font-semibold px-2 whitespace-nowrap"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!hasRecords ? null : (
                  chemicalRecords.map((record, index) => (
                    <tr
                      key={record.id}
                      className={`h-12 ${index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}
                    >
                      <td className="px-2 py-2 text-center">
                        <Link
                          to={progressEditable ? `${basePath}/new` : `${basePath}/records/${record.id}`}
                          state={
                            progressEditable
                              ? {
                                  ...progressCarry,
                                  date,
                                  inspectorName,
                                  editRecordId: record.id,
                                  editRecord: {
                                    category: record.category,
                                    quantity: record.usedQuantity,
                                    currentStock: record.currentStock,
                                    remarks: record.remarks,
                                  },
                                }
                              : undefined
                          }
                          className="bg-[var(--semantic-brand-primary)] h-8 w-14 rounded-lg text-xs text-white inline-flex items-center justify-center"
                        >
                          詳細
                        </Link>
                      </td>
                      <td className={`px-2 py-2 text-center text-sm font-normal text-[var(--semantic-text-primary)]`}>
                        {record.storageLocation}
                      </td>
                      <td className={`px-2 py-2 text-center text-sm font-normal text-[var(--semantic-text-primary)]`}>
                        {record.category}
                      </td>
                      <td className={`px-2 py-2 text-center text-sm font-normal text-[var(--semantic-text-primary)]`}>
                        {record.usedQuantity}
                      </td>
                      <td className={`px-2 py-2 text-center text-sm font-normal text-[var(--semantic-text-primary)]`}>
                        {record.currentStock}
                      </td>
                      <td
                        className={`px-2 py-2 text-sm font-normal text-[var(--semantic-text-primary)] truncate`}
                      >
                        {record.remarks}
                      </td>
                      <td className={`px-2 py-2 text-center text-sm font-normal text-[var(--semantic-text-primary)] whitespace-nowrap`}>
                        {record.actor}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* 空のときは表の見出しの下に 8px 離して「データがありません。」（管理画面と同じ形。2026-10-08） */}
          {!hasRecords && <AppEmptyState />}
        </div>

        {!readOnlyStatus && (
        <Link
          to={`${basePath}/new`}
          state={{ ...progressCarry, date, inspectorName }}
          className="bg-white border border-[var(--semantic-brand-primary)] h-12 w-full rounded-lg flex items-center justify-center gap-1 text-lg text-[var(--semantic-brand-primary)]"
        >
          <img src={iconPlus} alt="" className="size-5 shrink-0" />
          記録を追加
        </Link>
        )}
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-10 py-6 flex items-center justify-center gap-6">
        <Link
          to={
            editingFromProgress
              ? basePath
              : state?.fromProgress
                ? "/app/progress"
                : "/app/ledger-list/chemical-management"
          }
          state={editingFromProgress ? { ...state, editing: false } : { inspectorName }}
          className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          戻る
        </Link>
        {readOnlyStatus ? null : hasRecords ? (
          <Link
            to={`${basePath}/confirm`}
            state={{ date, inspectorName }}
            className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
          >
            確認画面へ
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="bg-[#d0d0d0] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
          >
            確認画面へ
          </button>
        )}
      </div>
    </>
  );
}
