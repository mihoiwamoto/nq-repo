import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { DateFilterInput } from "../../components/DateFilterInput";
import { todayString } from "../../utils/date";
import { fillSlice, useProgressRecordFill, type RecordFill } from "../../utils/progressRecordFill";
import { AppHeader } from "../../layout/AppHeader";
import { useFromProgress } from "../../layout/ProgressFlowContext";
import { useAdditiveManagement } from "./AdditiveManagementContext";
import { useDemoList } from "../../../components/demo/demoStore";
import { ACTORS, initialRecords } from "./mockData";

const SEED_RECORD_IDS = new Set(initialRecords.map((record) => record.id));
import iconPlus from "../../../assets/figma/icons/common/plus.svg";
import iconEdit from "../../../assets/figma/icons/common/edit.svg";

const COLUMNS = [
  { key: "action", label: "操作", width: 80 },
  { key: "storageLocation", label: "保管場所", width: 80 },
  { key: "category", label: "区分", width: 80 },
  { key: "quantity", label: "数量", width: 80 },
  { key: "currentStock", label: "現在庫数", width: 80 },
  { key: "remarks", label: "備考", width: 160 },
  { key: "actor", label: "実施者", width: 104 },
] as const;

export function RecordsListPage() {
  const { productId } = useParams<{ productId: string }>();
  const location = useLocation();
  const inspectorName =
    (location.state as { inspectorName?: string } | null)?.inspectorName ?? ACTORS[0].name;
  const { additives, records: allRecords } = useAdditiveManagement();
  // 動作デモの「データが無い」を試している間は、記録が 1 件も無い状態にする
  const records = useDemoList(allRecords);

  const additive = additives.find((a) => a.id === productId);
  // 進捗一覧から来たときはそちらのステータスを優先する（未点検=記録なし / 点検中=記録途中 / 点検済み・確認完了=記録あり）
  const progressFill = useProgressRecordFill();
  const additiveFill: RecordFill =
    additive?.status === "not_inspected" ? "none" : additive?.status === "in_progress" ? "partial" : "full";
  const fill = progressFill ?? additiveFill;
  // 見本の記録だけを進捗のステータスで間引き、この画面から足した記録は必ず出す（薬品管理の一覧と同じ）
  const ownRecords = records.filter((record) => record.additiveId === productId);
  const productRecords = [
    ...fillSlice(ownRecords.filter((record) => SEED_RECORD_IDS.has(record.id)), fill),
    ...ownRecords.filter((record) => !SEED_RECORD_IDS.has(record.id)),
  ];
  const stateDate = (location.state as { date?: string } | null)?.date;
  const [date, setDate] = useState(
    () => stateDate?.replaceAll("/", "-") ?? productRecords[0]?.date.replaceAll("/", "-") ?? todayString(),
  );
  const hasRecords = productRecords.length > 0;
  const basePath = `/app/ledger-list/additive-management/products/${productId}`;
  const navigate = useNavigate();
  // 進捗一覧で点検済み・確認完了の添加物を開いたときは見るだけの一覧（確定デザイン 7139:238039・7139:238104）。
  // 実施日は文字で出し、「＋記録を追加」と「確認画面へ」は無く、下は「戻る」だけ。点検済みは右上の「編集」で記録入力へ
  const progressState = location.state as { fromProgress?: boolean; progressStatus?: string } | null;
  const readOnlyStatus =
    progressState?.fromProgress &&
    (progressState.progressStatus === "inspected" || progressState.progressStatus === "confirmed")
      ? progressState.progressStatus
      : null;
  // 進捗一覧で点検中（・未点検）の添加物を開いた一覧（確定デザイン「進捗一覧_添加物管理表_点検中選択_一覧」7139:238456）。
  // 実施日の段の下に区切り線は無く、表は見出し 56px・行 48px・備考は 1 行で「…」。行の「詳細」は見るだけの詳細ではなく、
  // その記録の値が入った記録画面（7139:238432。「一覧へ戻る」「保存」）を開き、保存で一覧へ戻る（7139:238230。2026-10-07）
  const fromProgressFlow = useFromProgress();
  const progressEditable = fromProgressFlow && !!progressState?.fromProgress && !readOnlyStatus;
  // 記録画面から一覧へ戻ったときも進捗一覧のステータスで出し分けられるよう、記録画面へ持っていく
  const progressCarry = progressEditable
    ? { fromProgress: true, progressStatus: (progressState as { progressStatus?: string }).progressStatus }
    : {};

  return (
    <>
      <AppHeader title={`添加物管理_${additive?.name ?? ""}`} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4">
        {readOnlyStatus ? (
          <>
            {readOnlyStatus === "inspected" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate(`${basePath}/new`, { state: { date: date.replaceAll("-", "/"), inspectorName } })}
                  className="bg-white border border-[var(--semantic-brand-primary)] flex gap-2 items-center justify-center h-11 p-3 rounded-lg text-lg font-semibold leading-none text-[var(--semantic-brand-primary)] whitespace-nowrap"
                >
                  <img src={iconEdit} alt="" className="size-5" />
                  編集
                </button>
              </div>
            )}
            <div className="bg-white flex items-center justify-between px-4 py-6 rounded-lg">
              <p className="text-base text-[var(--semantic-text-primary)]">実施日</p>
              <p className="text-base text-[var(--semantic-text-primary)]">{date.replaceAll("-", "/")}</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                実施日 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <DateFilterInput value={date} onChange={setDate} variant={progressEditable ? "borderless" : "default"} />
            </div>
            {/* 確定デザイン 7139:233987・7139:234120：実施日の段と表のあいだに区切り線（進捗一覧の点検中 7139:238456 には無い） */}
            {!progressEditable && <div className="border-t border-[#d0d0d0] w-full" />}
          </>
        )}

        <div className="bg-white rounded-lg overflow-x-auto">
          <table className={`border-collapse w-full ${progressEditable ? "table-fixed" : ""}`}>
            <thead>
              <tr className={`bg-[var(--semantic-brand-primary)] ${progressEditable ? "h-14" : ""}`}>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    style={
                      progressEditable
                        ? { width: col.key === "remarks" ? "auto" : col.width }
                        : { minWidth: col.width }
                    }
                    className={`text-white text-sm font-semibold px-2 whitespace-nowrap ${progressEditable ? "" : "py-2"}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!hasRecords ? (
                <tr>
                  {COLUMNS.map((col) => (
                    <td key={col.key} className="bg-white px-2 py-4" />
                  ))}
                </tr>
              ) : (
                productRecords.map((record, index) => (
                  <tr
                    key={record.id}
                    className={`${progressEditable ? "h-12" : ""} ${index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}
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
                                  quantity: record.quantity,
                                  currentStock: record.currentStock,
                                  remarks: record.remarks,
                                },
                              }
                            : undefined
                        }
                        className={`bg-[var(--semantic-brand-primary)] h-8 rounded-lg text-white inline-flex items-center justify-center ${
                          progressEditable ? "w-14 text-xs" : "px-3 text-sm"
                        }`}
                      >
                        詳細
                      </Link>
                    </td>
                    <td className={`px-2 py-2 text-center text-sm ${progressEditable ? "font-normal" : ""} text-[var(--semantic-text-primary)]`}>
                      {record.storageLocation}
                    </td>
                    <td className={`px-2 py-2 text-center text-sm ${progressEditable ? "font-normal" : ""} text-[var(--semantic-text-primary)]`}>
                      {record.category}
                    </td>
                    <td className={`px-2 py-2 text-center text-sm ${progressEditable ? "font-normal" : ""} text-[var(--semantic-text-primary)]`}>
                      {record.quantity}
                    </td>
                    <td className={`px-2 py-2 text-center text-sm ${progressEditable ? "font-normal" : ""} text-[var(--semantic-text-primary)]`}>
                      {record.currentStock}
                    </td>
                    <td
                      className={`px-2 py-2 text-sm ${progressEditable ? "font-normal" : ""} text-[var(--semantic-text-primary)] ${progressEditable ? "truncate" : ""}`}
                    >
                      {record.remarks}
                    </td>
                    <td className={`px-2 py-2 text-center text-sm ${progressEditable ? "font-normal" : ""} text-[var(--semantic-text-primary)] whitespace-nowrap`}>
                      {record.actor}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!readOnlyStatus && (
        <Link
          to={`${basePath}/new`}
          state={{ ...progressCarry, date, inspectorName }}
          className="bg-white border border-[var(--semantic-brand-primary)] h-12 w-full rounded-lg flex items-center justify-center gap-1 text-lg text-[var(--semantic-brand-primary)]"
        >
          {/* 確定デザイン 7139:233987：高さ 48px・18px の文字・20px の＋アイコン */}
          <img src={iconPlus} alt="" className="size-5" />
          記録を追加
        </Link>
        )}
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
        <Link
          // 進捗一覧から開いた一覧（点検中も）の「戻る」は進捗一覧へ
          to={readOnlyStatus || progressState?.fromProgress ? "/app/progress" : "/app/ledger-list/additive-management"}
          state={{ inspectorName }}
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
