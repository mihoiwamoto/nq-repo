import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { DateFilterInput } from "../../components/DateFilterInput";
import { todayString } from "../../utils/date";
import { fillSlice, useProgressRecordFill, type RecordFill } from "../../utils/progressRecordFill";
import { AppHeader } from "../../layout/AppHeader";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";
import type { ProgressStatus } from "../progress/mockData";
import {
  INSPECTION_CONTENTS,
  MACHINE_ADDED_RECORD_IDS,
  MACHINE_INSPECTION_DATES,
  inspectionDateForMachine,
  recordsForMachine,
  MACHINES,
  RESULT_COLORS,
  RESULT_LABELS,
  type ExecutionPhase,
  type InspectionContent,
  type MachineRecord,
} from "./mockData";
import { useDemoList } from "../../../components/demo/demoStore";
import { AppEmptyState } from "../../components/AppEmptyState";
import { findFactoryItem } from "../../data/factoryAppData";

const COLUMNS = [
  { key: "action", label: "操作", width: 80 },
  { key: "category", label: "実施区分", width: 72 },
  { key: "time", label: "点検時間", width: 104 },
  { key: "content", label: "点検内容", width: 104 },
  { key: "passedProduct", label: "通過製品", width: 200 },
  { key: "result", label: "結果", width: 80 },
  { key: "remarks", label: "備考", width: 160 },
] as const;

/** 行ごとの削除ボタン列。確定デザイン（機器詳細_点検内容記録後 6198:80157・差し戻しの編集 8448:71074）は
    通常の点検でも差し戻しの編集でも各行にごみ箱がある（実施者の列は無い）。確認完了など読むだけのときは出さない（2026-10-08） */
const EDIT_COLUMNS = [...COLUMNS, { key: "delete", label: "", width: 48 }] as const;

/** 削除ダイアログ（6198:80173）の表の列。操作とごみ箱を除いた記録の中身 */
const DELETE_DIALOG_COLUMNS = COLUMNS.filter((col) => col.key !== "action");

/** 実施区分を前の画面（このポップアップ）で選ぶ点検内容（確定デザイン 6198:80521 など） */
const CONTENTS_WITH_PHASE: InspectionContent[] = ["テストピース", "製品通過"];
const EXECUTION_PHASES: ExecutionPhase[] = ["開始", "終了"];

/** 「点検内容を修正する」から来たときの戻り先（確認待ち詳細のパスと復元用の state） */
export type EditReturn = { to: string; state?: unknown };

export function MachineDetailPage() {
  const { machineId } = useParams<{ machineId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as
    | {
        inspectorName?: string;
        fromProgress?: boolean;
        editReturn?: EditReturn;
        progressStatus?: ProgressStatus;
        /** 記録入力の「保存」「一覧へ戻る」で戻ってきたときの実施日 */
        inspectionDate?: string;
      }
    | null;
  const inspectorName = state?.inspectorName ?? "";
  const fromProgress = state?.fromProgress ?? false;
  // 確認待ち（差し戻し）の「点検内容を修正する」から来た編集モード。保存で元の画面へ戻る
  const editReturn = state?.editReturn;
  const machine = findFactoryItem(MACHINES, machineId);
  // 進捗一覧から来たときはそちらのステータスを優先する（未点検=記録なし / 点検中=記録途中 / 点検済み・確認完了=記録あり）
  const progressFill = useProgressRecordFill();
  const machineFill: RecordFill = machine?.status === "inspected" ? "full" : "none";
  // 編集モードは既存の点検記録を直すので、記録と実施日をそのまま出す
  const fill = progressFill ?? (editReturn ? "full" : machineFill);
  // 確認完了（進捗一覧から）は読むだけなので、記録の削除（ごみ箱）は出さない
  const readOnly = state?.progressStatus === "confirmed";
  const [inspectionDate, setInspectionDate] = useState(
    () =>
      state?.inspectionDate ??
      (fill !== "none" ? inspectionDateForMachine(machineId) ?? todayString() : todayString()),
  );
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<InspectionContent>(INSPECTION_CONTENTS[0]);
  const [selectedPhase, setSelectedPhase] = useState<ExecutionPhase>("開始");
  // 削除した記録（モックなので画面内だけで消す）と、削除確認中の記録
  const [deletedRecordIds, setDeletedRecordIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<MachineRecord | null>(null);
  // 動作デモの「データが無い」を試している間は、この機械の記録が 1 件も無い状態にする
  const machineRecords = useDemoList(recordsForMachine(machineId));

  if (!machine) return null;

  const basePath = "/app/ledger-list/metal-xray-detection";
  // 見本の記録は一覧のステータスで出し分け、記録入力の「保存」で足した記録は後ろに必ず並べる（2026-10-08）
  const records = [
    ...fillSlice(
      machineRecords.filter((record) => !MACHINE_ADDED_RECORD_IDS.has(record.id)),
      fill,
    ),
    ...machineRecords.filter((record) => MACHINE_ADDED_RECORD_IDS.has(record.id)),
  ].filter((record) => !deletedRecordIds.includes(record.id));
  // 記録が 1 件も無いうちは確認画面へ進めない（実施日は今日の日付が自動で入るため、
  // 実施日だけを見ていると「表が空なのにボタンが押せる」状態になる）
  const canProceed = inspectionDate.trim() !== "" && records.length > 0;
  const showDelete = !readOnly;
  const columns = showDelete ? EDIT_COLUMNS : COLUMNS;

  return (
    <>
      <AppHeader title={`金属/X線探知機記録_${machine.name}`} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-5 items-center">
          <div className="flex flex-col gap-5 items-start w-full max-w-full">
            <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full">
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">金属探知機</p>
                <p className="text-base text-[var(--semantic-text-primary)]">
                  {machine.metalDetectorModel}
                </p>
              </div>
              <div className="border-t border-[#d0d0d0]" style={{ width: "calc(100% - 1px)" }} />
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">X線探知機</p>
                <p className="text-base text-[var(--semantic-text-primary)]">
                  {machine.xrayDetectorModel}
                </p>
              </div>
              <div className="border-t border-[#d0d0d0]" style={{ width: "calc(100% - 1px)" }} />
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-[var(--semantic-text-primary)]">ウェイトチェッカー</p>
                <p className="text-base text-[var(--semantic-text-primary)]">
                  {machine.weightCheckerModel}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                実施日 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <DateFilterInput
                value={inspectionDate}
                onChange={(value) => {
                  setInspectionDate(value);
                  MACHINE_INSPECTION_DATES[machineId ?? ""] = value;
                }}
              />
            </div>

            <div className="flex flex-col gap-2 w-full">
            <div className="bg-white rounded-lg overflow-x-auto w-full">
              <table className="border-collapse w-full">
                <thead>
                  <tr className="bg-[var(--semantic-brand-primary)]">
                    {columns.map((col) => (
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
                  {records.length > 0 ? (
                    records.map((record, index) => (
                      <tr key={record.id} className={index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}>
                        <td className={`px-2 py-2 text-center ${showDelete ? "border-r border-[#d0d0d0]" : ""}`}>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`${basePath}/machines/${machineId}/records/${record.id}`, {
                                state: { inspectionDate, inspectorName, editReturn },
                              })
                            }
                            className="bg-[var(--semantic-brand-primary)] h-8 px-3 rounded-lg text-sm text-white inline-flex items-center justify-center"
                          >
                            詳細
                          </button>
                        </td>
                        <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                          {record.category}
                        </td>
                        <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                          {record.time}
                        </td>
                        <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                          {record.content}
                        </td>
                        <td
                          className="px-2 py-2 text-sm text-[var(--semantic-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis"
                          style={{ maxWidth: 200 }}
                        >
                          {record.passedProduct}
                        </td>
                        <td className="px-2 py-2 text-center text-sm">
                          <span
                            className="h-6 w-16 rounded-lg text-xs text-white inline-flex items-center justify-center"
                            style={{ backgroundColor: RESULT_COLORS[record.result] }}
                          >
                            {RESULT_LABELS[record.result]}
                          </span>
                        </td>
                        <td
                          className="px-2 py-2 text-sm text-[var(--semantic-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis"
                          style={{ maxWidth: 160 }}
                        >
                          {record.remarks}
                        </td>
                        {showDelete && (
                          <td className="px-2 py-2 text-center border-l border-[#d0d0d0]">
                            <button
                              type="button"
                              aria-label="記録を削除"
                              onClick={() => setDeleteTarget(record)}
                              className="bg-white border border-[var(--semantic-brand-danger)] size-8 rounded-lg inline-flex items-center justify-center"
                            >
                              <img src={iconTrash} alt="" className="size-5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : null}
                </tbody>
              </table>
            </div>
            {/* 空のときは表の見出しの下に 8px 離して「データがありません。」（管理画面と同じ形。2026-10-08） */}
            {records.length === 0 && <AppEmptyState />}
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedContent(INSPECTION_CONTENTS[0]);
                setSelectedPhase("開始");
                setRecordDialogOpen(true);
              }}
              className="bg-white border border-[var(--semantic-brand-primary)] h-12 w-full rounded-lg flex items-center justify-center gap-2 text-lg text-[var(--semantic-brand-primary)]"
            >
              <span className="text-xl leading-none">＋</span>
              記録を追加
            </button>
          </div>
        </div>

        {/* 差し戻しの編集（確認待ち › 点検内容を修正する）も本番（Excel No.7）どおり「戻る」「途中保存」「確認画面へ」のまま。
            「戻る」だけ元の確認待ち詳細へ戻す（2026-10-08 に「戻る / 編集を保存」から変更） */}
        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-between">
          <Link
            to={editReturn ? editReturn.to : basePath}
            state={editReturn ? editReturn.state : { inspectorName }}
            className="bg-white border border-[#333] flex items-center justify-center h-16 w-43 rounded-lg text-xl text-[var(--semantic-text-primary)] px-4"
          >
            戻る
          </Link>
          <div className="flex gap-4 items-center">
            <button
              type="button"
              onClick={() => setSaveDialogOpen(true)}
              className="bg-white border border-[var(--semantic-brand-primary)] h-16 w-43 rounded-lg text-xl text-[var(--semantic-brand-primary)] px-4"
            >
              途中保存
            </button>
            <button
              type="button"
              disabled={!canProceed}
              onClick={() =>
                navigate(`${basePath}/machines/${machineId}/confirm`, {
                  // 確認画面が自前でモックを読み直すと絞り込みが外れるので、表示中の記録を渡す
                  state: { inspectionDate, inspectorName, records, fromProgress, editReturn },
                })
              }
              className={`h-16 w-43 rounded-lg text-xl px-4 ${
                canProceed ? "bg-[var(--semantic-brand-primary)] text-white" : "bg-[#d0d0d0] text-white"
              }`}
            >
              確認画面へ
            </button>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          {/* 確定デザイン（機器詳細_点検記録の削除 6198:80173）：見出し・固定文と、消す行だけの表（2026-10-08） */}
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-full max-w-[640px] mx-16">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                点検記録の削除
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)]">
                削除した情報は元に戻せません。本当に削除しますか？
              </p>
              <div className="bg-white rounded-lg overflow-x-auto w-full">
                <table className="border-collapse w-full">
                  <thead>
                    <tr className="bg-[var(--semantic-brand-primary)]">
                      {DELETE_DIALOG_COLUMNS.map((col) => (
                        <th
                          key={col.key}
                          className="text-white text-sm font-semibold px-2 py-2 whitespace-nowrap"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                        {deleteTarget.category}
                      </td>
                      <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                        {deleteTarget.time}
                      </td>
                      <td className="px-2 py-2 text-center text-sm text-[var(--semantic-text-primary)]">
                        {deleteTarget.content}
                      </td>
                      <td
                        className="px-2 py-2 text-sm text-[var(--semantic-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis"
                        style={{ maxWidth: 200 }}
                      >
                        {deleteTarget.passedProduct}
                      </td>
                      <td className="px-2 py-2 text-center text-sm">
                        <span
                          className="h-6 w-16 rounded-lg text-xs text-white inline-flex items-center justify-center"
                          style={{ backgroundColor: RESULT_COLORS[deleteTarget.result] }}
                        >
                          {RESULT_LABELS[deleteTarget.result]}
                        </span>
                      </td>
                      <td
                        className="px-2 py-2 text-sm text-[var(--semantic-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis"
                        style={{ maxWidth: 160 }}
                      >
                        {deleteTarget.remarks}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex gap-6 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeletedRecordIds((prev) => [...prev, deleteTarget.id]);
                  setDeleteTarget(null);
                }}
                className="bg-[var(--semantic-brand-danger)] h-12 w-[200px] rounded-lg text-base text-white"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}

      {saveDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSaveDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-full max-w-[560px] mx-6">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                途中保存しました
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)] whitespace-nowrap">
                入力内容を途中保存しました。続きは後から入力できます。
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSaveDialogOpen(false)}
              className="bg-white border border-[#333] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {recordDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setRecordDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-full max-w-[900px] mx-40">
            <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
              点検内容を選択してください
            </h2>
            <div className="flex flex-col gap-4 items-start w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                点検内容 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <div className="flex gap-4 w-full justify-between">
                {INSPECTION_CONTENTS.map((content) => (
                  <button
                    key={content}
                    type="button"
                    onClick={() => setSelectedContent(content)}
                    className={`flex-1 h-12 rounded-lg text-base border ${
                      selectedContent === content
                        ? "bg-white border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                        : "bg-white border-[#d0d0d0] text-[var(--semantic-text-secondary)]"
                    }`}
                  >
                    {content}
                  </button>
                ))}
              </div>
            </div>
            {/* テストピース・製品通過は実施区分（開始／終了）もここで選ぶ（確定デザイン 6198:80521・6198:80557・6198:80593・6198:80629。2026-10-08） */}
            {CONTENTS_WITH_PHASE.includes(selectedContent) && (
              <div className="flex flex-col gap-4 items-start w-full -mt-6">
                <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                  実施区分 <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <div className="flex gap-4 w-full">
                  {EXECUTION_PHASES.map((phase) => (
                    <button
                      key={phase}
                      type="button"
                      onClick={() => setSelectedPhase(phase)}
                      className={`w-[calc((100%-48px)/4)] h-12 rounded-lg text-base border ${
                        selectedPhase === phase
                          ? "bg-white border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                          : "bg-white border-[#d0d0d0] text-[var(--semantic-text-secondary)]"
                      }`}
                    >
                      {phase}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setRecordDialogOpen(false)}
                className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecordDialogOpen(false);
                  navigate(`${basePath}/machines/${machineId}/new`, {
                    state: {
                      inspectionDate,
                      inspectorName,
                      content: selectedContent,
                      phase: CONTENTS_WITH_PHASE.includes(selectedContent) ? selectedPhase : undefined,
                      fromProgress,
                      editReturn,
                      // 「保存」「一覧へ戻る」でこの画面へ戻るときに、来たときの state（進捗のステータスなど）を戻す
                      back: location.state,
                    },
                  });
                }}
                className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white"
              >
                点検画面へ
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
