import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import {
  INSPECTION_CONTENTS,
  MACHINE_INSPECTION_DATES,
  MACHINES,
  type InspectionContent,
} from "./mockData";

const COLUMNS = [
  { key: "action", label: "操作", width: 80 },
  { key: "category", label: "実施区分", width: 72 },
  { key: "time", label: "点検時間", width: 104 },
  { key: "content", label: "点検内容", width: 104 },
  { key: "passedProduct", label: "通過製品", width: 200 },
  { key: "result", label: "結果", width: 80 },
  { key: "remarks", label: "備考", width: 160 },
] as const;

export function MachineDetailPage() {
  const { machineId } = useParams<{ machineId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { inspectorName?: string; fromProgress?: boolean } | null;
  const inspectorName = state?.inspectorName ?? "";
  const fromProgress = state?.fromProgress ?? false;
  const machine = MACHINES.find((m) => m.id === machineId);
  const [inspectionDate, setInspectionDate] = useState(
    () => MACHINE_INSPECTION_DATES[machineId ?? ""] ?? "",
  );
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<InspectionContent>(INSPECTION_CONTENTS[0]);

  if (!machine) return null;

  const basePath = "/app/ledger-list/metal-xray-detection";
  const canProceed = inspectionDate.trim() !== "";

  return (
    <>
      <AppHeader title={`金属/X線探知機記録_${machine.name}`} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-5 items-center">
          <div className="flex flex-col gap-5 items-start w-full max-w-full max-w-[480px] mx-40">
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
              <input
                type="date"
                value={inspectionDate}
                onChange={(e) => {
                  setInspectionDate(e.target.value);
                  MACHINE_INSPECTION_DATES[machineId ?? ""] = e.target.value;
                }}
                className="bg-white h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px]"
              />
            </div>

            <div className="bg-white rounded-lg overflow-x-auto w-full">
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
                  <tr>
                    {COLUMNS.map((col) => (
                      <td key={col.key} className="bg-white px-2 py-2" />
                    ))}
                  </tr>
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

        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-between">
          <Link
            to={basePath}
            state={{ inspectorName }}
            className="bg-white border border-[#333] flex items-center justify-center flex items-center justify-center h-16 w-34 rounded-lg text-xl text-[var(--semantic-text-primary)] px-4"
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
                  state: { inspectionDate, inspectorName },
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

      {saveDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSaveDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-full max-w-[480px] mx-40">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                途中保存しました
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)]">
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
                    state: { inspectionDate, inspectorName, content: selectedContent, fromProgress },
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
