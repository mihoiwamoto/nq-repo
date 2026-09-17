import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { DateFilterInput } from "../../components/DateFilterInput";
import { todayString } from "../../utils/date";
import { fillSlice, useProgressRecordFill, type RecordFill } from "../../utils/progressRecordFill";
import { AppHeader } from "../../layout/AppHeader";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";
import {
  INSPECTION_CONTENTS,
  MACHINE_INSPECTION_DATES,
  inspectionDateForMachine,
  recordsForMachine,
  MACHINES,
  RESULT_COLORS,
  RESULT_LABELS,
  type InspectionContent,
  type MachineRecord,
} from "./mockData";
import { useDemoList } from "../../../components/demo/demoStore";

const COLUMNS = [
  { key: "action", label: "操作", width: 80 },
  { key: "category", label: "実施区分", width: 72 },
  { key: "time", label: "点検時間", width: 104 },
  { key: "content", label: "点検内容", width: 104 },
  { key: "passedProduct", label: "通過製品", width: 200 },
  { key: "result", label: "結果", width: 80 },
  { key: "remarks", label: "備考", width: 160 },
] as const;

/** 差し戻しの編集モード（Figma: 確認待ち_差し戻し_実施者選択_点検内容編集）は
    実施者列と、行ごとの削除ボタン列が増える */
const EDIT_COLUMNS = [
  ...COLUMNS,
  { key: "inspectorName", label: "実施者", width: 112 },
  { key: "delete", label: "", width: 48 },
] as const;

/** 「点検内容を修正する」から来たときの戻り先（確認待ち詳細のパスと復元用の state） */
export type EditReturn = { to: string; state?: unknown };

export function MachineDetailPage() {
  const { machineId } = useParams<{ machineId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as
    | { inspectorName?: string; fromProgress?: boolean; editReturn?: EditReturn }
    | null;
  const inspectorName = state?.inspectorName ?? "";
  const fromProgress = state?.fromProgress ?? false;
  // 確認待ち（差し戻し）の「点検内容を修正する」から来た編集モード。保存で元の画面へ戻る
  const editReturn = state?.editReturn;
  const machine = MACHINES.find((m) => m.id === machineId);
  // 進捗一覧から来たときはそちらのステータスを優先する（未点検=記録なし / 点検中=記録途中 / 点検済み・確認完了=記録あり）
  const progressFill = useProgressRecordFill();
  const machineFill: RecordFill = machine?.status === "inspected" ? "full" : "none";
  // 編集モードは既存の点検記録を直すので、記録と実施日をそのまま出す
  const fill = progressFill ?? (editReturn ? "full" : machineFill);
  const [inspectionDate, setInspectionDate] = useState(
    () =>
      fill !== "none" ? inspectionDateForMachine(machineId) ?? todayString() : todayString(),
  );
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<InspectionContent>(INSPECTION_CONTENTS[0]);
  // 編集モードで削除した記録（モックなので画面内だけで消す）と、削除確認中の記録
  const [deletedRecordIds, setDeletedRecordIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<MachineRecord | null>(null);
  // 動作デモの「データが無い」を試している間は、この機械の記録が 1 件も無い状態にする
  const machineRecords = useDemoList(recordsForMachine(machineId));

  if (!machine) return null;

  const basePath = "/app/ledger-list/metal-xray-detection";
  const records = fillSlice(machineRecords, fill).filter(
    (record) => !deletedRecordIds.includes(record.id),
  );
  // 記録が 1 件も無いうちは確認画面へ進めない（実施日は今日の日付が自動で入るため、
  // 実施日だけを見ていると「表が空なのにボタンが押せる」状態になる）
  const canProceed = inspectionDate.trim() !== "" && records.length > 0;
  const columns = editReturn ? EDIT_COLUMNS : COLUMNS;

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
                        <td className={`px-2 py-2 text-center ${editReturn ? "border-r border-[#d0d0d0]" : ""}`}>
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
                        {editReturn && (
                          <>
                            <td className="px-2 py-2 text-sm text-[var(--semantic-text-primary)] whitespace-nowrap">
                              {record.inspectorName}
                            </td>
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
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      {columns.map((col) => (
                        <td key={col.key} className="bg-white px-2 py-2" />
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedContent(INSPECTION_CONTENTS[0]);
                setRecordDialogOpen(true);
              }}
              className="bg-white border border-[var(--semantic-brand-primary)] h-12 w-full rounded-lg flex items-center justify-center gap-2 text-lg text-[var(--semantic-brand-primary)]"
            >
              <span className="text-xl leading-none">＋</span>
              記録を追加
            </button>
          </div>
        </div>

        {editReturn ? (
          /* 差し戻しの編集モード（Figma: 確認待ち_差し戻し_実施者選択_点検内容編集）。
             「戻る / 編集を保存」の 2 つを中央に並べ、保存で確認待ち詳細の元のステップへ戻る */
          <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-10 py-6 flex items-center justify-center gap-6">
            <Link
              to={editReturn.to}
              state={editReturn.state}
              className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)] px-4"
            >
              戻る
            </Link>
            <button
              type="button"
              disabled={!canProceed}
              onClick={() => navigate(editReturn.to, { state: editReturn.state })}
              className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl px-4 ${
                canProceed ? "bg-[var(--semantic-brand-primary)] text-white" : "bg-[#d0d0d0] text-white"
              }`}
            >
              編集を保存
            </button>
          </div>
        ) : (
        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-between">
          <Link
            to={basePath}
            state={{ inspectorName }}
            className="bg-white border border-[#333] flex items-center justify-center h-16 w-34 rounded-lg text-xl text-[var(--semantic-text-primary)] px-4"
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
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-full max-w-[480px] mx-40">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                記録の削除
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)]">
                {deleteTarget.time} {deleteTarget.content}の記録を削除します。削除した情報は元に戻せません。本当に削除しますか？
              </p>
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
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-full max-w-[560px] mx-6">
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
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-full max-w-[900px] mx-40">
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
                    state: { inspectionDate, inspectorName, content: selectedContent, fromProgress, editReturn },
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
