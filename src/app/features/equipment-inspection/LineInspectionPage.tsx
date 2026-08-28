import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import iconXMark from "../../../assets/figma/icons/common/cancel-custom.svg";
import iconCheck from "../../../assets/figma/icons/common/checkmark-custom.svg";
import { AppHeader } from "../../layout/AppHeader";
import { useInspection } from "./InspectionContext";
import {
  ACTION_OPTIONS,
  CAUSE_OPTIONS,
  confirmationItems,
  inspectionPoints,
  initialRecords,
  initialRemarks,
  type ActionOption,
  type CauseOption,
  type InspectionItemRecord,
  type ItemStatus,
} from "./mockData";

const INSPECTOR_NAME = "佐藤健一";

type Tab = "start" | "end";

function formatTimestamp(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function keyFor(location: string, item: string) {
  return `${location}|${item}`;
}

function isTabComplete(records: Record<string, InspectionItemRecord>) {
  return inspectionPoints.every((point) =>
    point.items.every((item) => records[keyFor(point.location, item)]?.status != null)
  );
}

function PillButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-12 px-4 rounded-lg text-base ${
        selected
          ? "bg-white border border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
          : "bg-white text-[var(--semantic-text-primary)]"
      }`}
    >
      {children}
    </button>
  );
}

export function LineInspectionPage() {
  const { lineId } = useParams<{ lineId: string }>();
  const { lines } = useInspection();
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state as { inspectorName?: string; fromProgress?: boolean } | null;
  const inspectorName = stateData?.inspectorName ?? INSPECTOR_NAME;
  const fromProgress = stateData?.fromProgress ?? false;
  const [tab, setTab] = useState<Tab>("start");
  const [date, setDate] = useState("2025-04-01");
  const [records, setRecords] = useState<Record<Tab, Record<string, InspectionItemRecord>>>({
    start: initialRecords,
    end: {},
  });
  const [remarks, setRemarks] = useState<Record<Tab, string>>({ start: initialRemarks, end: "" });
  const [skipDialogOpen, setSkipDialogOpen] = useState(false);
  const [skipReason, setSkipReason] = useState("");
  const [deferToTomorrow, setDeferToTomorrow] = useState<boolean | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const [ngTarget, setNgTarget] = useState<{ location: string; item: string } | null>(null);
  const [ngStatus, setNgStatus] = useState<ItemStatus>("ng");
  const [ngCause, setNgCause] = useState<CauseOption | null>(null);
  const [ngActionType, setNgActionType] = useState<ActionOption | null>(null);
  const [ngActionDetail, setNgActionDetail] = useState("");

  const line = lines.find((l) => l.id === lineId);
  const lineName = line?.name ?? "豆乳ライン";
  const isDaily = (line?.frequency ?? "daily") === "daily";
  const tabRecords = records[tab];
  const bothTabsComplete = isTabComplete(records.start) && isTabComplete(records.end);

  function setStatus(
    location: string,
    item: string,
    status: ItemStatus,
    detail?: { cause: CauseOption; actionType: ActionOption; actionDetail: string }
  ) {
    const key = keyFor(location, item);
    setRecords((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [key]: {
          cause: detail?.cause ?? null,
          actionType: detail?.actionType ?? null,
          actionDetail: detail?.actionDetail ?? "",
          status,
          timestamp: formatTimestamp(new Date()),
          inspector: inspectorName,
        },
      },
    }));
  }

  function toggleAllOk(location: string, items: string[]) {
    const allOk = items.every((item) => tabRecords[keyFor(location, item)]?.status === "ok");
    setRecords((prev) => {
      const nextTabRecords = { ...prev[tab] };
      for (const item of items) {
        const key = keyFor(location, item);
        nextTabRecords[key] = allOk
          ? {
              status: null,
              cause: null,
              actionType: null,
              actionDetail: "",
              timestamp: "",
              inspector: "",
            }
          : {
              status: "ok",
              cause: null,
              actionType: null,
              actionDetail: "",
              timestamp: formatTimestamp(new Date()),
              inspector: inspectorName,
            };
      }
      return { ...prev, [tab]: nextTabRecords };
    });
  }

  function openNgDialog(location: string, item: string) {
    const existing = tabRecords[keyFor(location, item)];
    setNgTarget({ location, item });
    setNgStatus("ng");
    setNgCause(existing?.cause ?? null);
    setNgActionType(existing?.actionType ?? null);
    setNgActionDetail(existing?.actionDetail ?? "");
  }

  function closeNgDialog() {
    setNgTarget(null);
  }

  function confirmNgDialog() {
    if (!ngTarget) return;
    if (ngStatus === "ng") {
      if (!ngCause || !ngActionType) return;
      setStatus(ngTarget.location, ngTarget.item, "ng", {
        cause: ngCause,
        actionType: ngActionType,
        actionDetail: ngActionDetail,
      });
    } else {
      setStatus(ngTarget.location, ngTarget.item, "ok");
    }
    closeNgDialog();
  }

  function closeSkipDialog() {
    setSkipDialogOpen(false);
    setSkipReason("");
    setDeferToTomorrow(null);
  }

  function handleSkip() {
    if (!skipReason.trim()) return;
    if (!isDaily && deferToTomorrow === null) return;
    navigate(`/app/ledger-list/equipment-inspection/lines/${lineId}/skip-confirm`, {
      state: { lineName, date, skipReason, fromProgress },
    });
  }

  function goToConfirm() {
    navigate(`/app/ledger-list/equipment-inspection/lines/${lineId}/confirm`, {
      state: {
        lineName,
        date,
        records,
        remarks,
        inspectorName,
        fromProgress,
      },
    });
  }

  return (
    <>
      <AppHeader
        title={`機械器具点検_${lineName}`}
        action={
          <button
            type="button"
            onClick={() => setSkipDialogOpen(true)}
            className="bg-white border border-[var(--semantic-brand-primary)] h-12 px-4 rounded-lg text-lg text-[var(--semantic-brand-primary)] shrink-0"
          >
            点検見送り
          </button>
        }
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 flex flex-col gap-5">
          <div className="bg-white flex h-[40px] items-center rounded-lg w-full">
            {(["start", "end"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex-1 h-[40px] rounded-lg text-[18px] font-[600] ${
                  tab === key
                    ? "bg-[var(--semantic-brand-primary)] text-white"
                    : "text-[var(--semantic-text-secondary)]"
                }`}
              >
                {key === "start" ? "始業" : "終業"}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between h-[48px]">
            <p className="text-[18px] text-[var(--semantic-text-primary)] flex items-center gap-[4px] font-[600]">
              実施日 <span className="text-[var(--semantic-brand-danger)]">※</span>
            </p>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-[var(--semantic-background-surface,white)] h-[48px] px-[16px] rounded-lg text-[16px] text-[var(--semantic-text-primary)] font-[600] w-[200px] appearance-none cursor-pointer"
            />
          </div>

          <div className="bg-white flex flex-col gap-[4px] items-start px-[16px] py-[8px] rounded-lg w-full">
            <p className="text-[16px] text-[var(--semantic-text-primary)] font-[600]">【確認項目】</p>
            {confirmationItems.map((text) => (
              <div key={text} className="flex gap-[4px] items-center w-full">
                <img src={iconCheck} alt="確認項目" className="size-[16px] shrink-0" />
                <p className="text-[14px] text-[var(--semantic-text-primary)] font-[300]">{text}</p>
              </div>
            ))}
          </div>

          <div className="h-0 border-t border-[#d0d0d0] w-full" />

          {inspectionPoints.map((point, pointIndex) => {
            const allOk = point.items.every(
              (item) => tabRecords[keyFor(point.location, item)]?.status === "ok"
            );
            return (
              <div key={point.id}>
                <div className="flex flex-col items-start rounded-lg overflow-hidden w-full">
                  <div className="bg-[var(--semantic-brand-primary)] flex gap-[8px] items-center px-[16px] py-[8px] w-full">
                    <p className="flex-1 text-[18px] text-white font-[600]">{point.location}</p>
                    <button
                      type="button"
                      onClick={() => toggleAllOk(point.location, point.items)}
                      className="bg-white border border-[#d0d0d0] h-[48px] w-[160px] rounded-lg flex items-center justify-center gap-[4px] text-[16px] text-[var(--semantic-text-primary)] font-[600]"
                    >
                      <span
                        className={
                          allOk
                            ? "text-[var(--semantic-brand-primary)]"
                            : "text-[var(--semantic-text-secondary)]"
                        }
                      >
                        {allOk ? "☑" : "☐"}
                      </span>
                      全て異常なし
                    </button>
                  </div>
                  <div className="bg-white flex flex-col gap-[20px] items-start p-[16px] w-full">
                    {point.items.map((item) => {
                      const record = tabRecords[keyFor(point.location, item)];
                      const status = record?.status ?? null;
                      return (
                        <div key={item} className="flex flex-col gap-[8px] items-start w-full">
                          <div className="flex items-center w-full gap-[4px]">
                            <p className="flex-1 text-[20px] text-[var(--semantic-text-primary)] font-[600]">{item}</p>
                            <div className="flex items-center rounded-lg overflow-hidden shrink-0">
                              <button
                                type="button"
                                onClick={() => openNgDialog(point.location, item)}
                                className={`h-[48px] w-[80px] flex items-center justify-center text-white text-[24px] ${
                                  status === "ng" ? "bg-[#f85c5c]" : "bg-[#d0d0d0]"
                                }`}
                              >
                                ✕
                              </button>
                              <button
                                type="button"
                                onClick={() => setStatus(point.location, item, "ok")}
                                className={`h-[48px] w-[80px] flex items-center justify-center text-white text-[24px] ${
                                  status === "ok" ? "bg-[#19c95f]" : "bg-[#d0d0d0]"
                                }`}
                              >
                                ✓
                              </button>
                            </div>
                          </div>
                          {status === "ng" && (record?.cause || record?.actionType) && (
                            <div className="flex flex-col gap-[8px] items-start px-[8px] w-full">
                              <div className="flex items-start gap-[4px] w-full">
                                <p className="text-[16px] text-[var(--semantic-text-secondary)] font-[600] whitespace-nowrap">原因：</p>
                                <p className="text-[16px] text-[var(--semantic-text-secondary)] font-[600]">{record?.cause}</p>
                              </div>
                              <div className="flex flex-col items-start gap-[4px] w-full">
                                <p className="text-[16px] text-[var(--semantic-text-secondary)] font-[600]">対応：{record?.actionType}</p>
                                {record?.actionDetail && (
                                  <p className="text-[16px] text-[var(--semantic-text-secondary)] font-[500]">
                                    {record.actionDetail}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                          {record?.timestamp && (
                            <p className="text-[14px] text-[var(--semantic-text-secondary)] text-right w-full">
                              {record.inspector} {record.timestamp}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {pointIndex < inspectionPoints.length - 1 && (
                  <div className="h-0 border-t border-[#d0d0d0] w-full mt-5" />
                )}
              </div>
            );
          })}

          <div className="h-0 border-t border-[#d0d0d0] w-full" />

          <div className="flex flex-col gap-[8px] items-start w-full">
            <p className="text-[18px] text-[var(--semantic-text-primary)] font-[600]">備考</p>
            <div className="bg-[var(--semantic-background-surface,white)] flex h-[82px] items-start p-[8px] rounded-lg w-full">
              <textarea
                value={remarks[tab]}
                onChange={(e) => setRemarks((prev) => ({ ...prev, [tab]: e.target.value }))}
                className="bg-transparent text-[14px] text-[var(--semantic-text-secondary)] font-[300] w-full resize-none outline-none"
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-[24px] py-[16px] flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-white border border-[#333] h-[64px] w-[136px] rounded-lg text-[20px] text-[var(--semantic-text-primary)] px-[16px] font-[600]"
          >
            戻る
          </button>
          <div className="flex gap-[16px] items-center">
            <button
              type="button"
              onClick={() => setSaveDialogOpen(true)}
              className="bg-white border border-[var(--semantic-brand-primary)] h-[64px] w-[172px] rounded-lg text-[20px] text-[var(--semantic-brand-primary)] px-[16px] font-[600]"
            >
              途中保存
            </button>
            <button
              type="button"
              disabled={!bothTabsComplete}
              onClick={goToConfirm}
              className={`h-[64px] w-[172px] rounded-lg text-[20px] px-[16px] font-[600] ${
                bothTabsComplete
                  ? "bg-[var(--semantic-brand-primary)] text-white"
                  : "bg-[#d0d0d0] text-white"
              }`}
            >
              確認画面へ
            </button>
          </div>
        </div>
      </div>

      {ngTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeNgDialog} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-4 py-10 w-full max-w-full max-w-[1000px] mx-40 max-h-[90vh] overflow-y-auto overflow-x-hidden mx-16">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                点検箇所
              </h2>
              <div className="flex items-center justify-between w-full gap-4">
                <p className="text-xl text-[var(--semantic-text-primary)] flex items-center gap-1">
                  {ngTarget.item} <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <div className="flex items-center rounded-lg overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => setNgStatus("ng")}
                    className={`h-12 w-20 flex items-center justify-center text-white ${
                      ngStatus === "ng" ? "bg-[#f85c5c]" : "bg-[#d0d0d0]"
                    }`}
                  >
                    <img src={iconXMark} alt="異常あり" className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setNgStatus("ok")}
                    className={`h-12 w-20 flex items-center justify-center text-white ${
                      ngStatus === "ok" ? "bg-[#19c95f]" : "bg-[#d0d0d0]"
                    }`}
                  >
                    <img src={iconCheck} alt="正常" className="size-5" />
                  </button>
                </div>
              </div>
              {ngStatus === "ng" && (
                <>
                  <div className="flex flex-col gap-2 items-start w-full">
                    <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                      原因 <span className="text-[var(--semantic-brand-danger)]">※</span>
                    </p>
                    <div className="flex flex-wrap gap-4 w-full">
                      {CAUSE_OPTIONS.map((option) => (
                        <PillButton
                          key={option}
                          selected={ngCause === option}
                          onClick={() => setNgCause(option)}
                        >
                          {option}
                        </PillButton>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-start w-full">
                    <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                      対応 <span className="text-[var(--semantic-brand-danger)]">※</span>
                    </p>
                    <div className="flex flex-wrap gap-4 w-full">
                      {ACTION_OPTIONS.map((option) => (
                        <PillButton
                          key={option}
                          selected={ngActionType === option}
                          onClick={() => setNgActionType(option)}
                        >
                          {option}
                        </PillButton>
                      ))}
                    </div>
                    <textarea
                      value={ngActionDetail}
                      onChange={(e) => setNgActionDetail(e.target.value)}
                      placeholder="対応を記入してください。"
                      className="bg-white min-h-20 p-2 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-6 items-center justify-center w-full">
              <button
                type="button"
                onClick={closeNgDialog}
                className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={ngStatus === "ng" && (!ngCause || !ngActionType)}
                onClick={confirmNgDialog}
                className={`h-16 w-60 rounded-lg text-xl text-white ${
                  ngStatus === "ok" || (ngCause && ngActionType)
                    ? "bg-[var(--semantic-brand-primary)]"
                    : "bg-[#d0d0d0]"
                }`}
              >
                完了
              </button>
            </div>
          </div>
        </div>
      )}

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
              className="bg-white border border-[#333] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {skipDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeSkipDialog} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-full max-w-[480px] mx-40">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                点検を見送りますか？
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)]">
                点検を今回は実施せず、点検見送りとして記録します。
              </p>
              {!isDaily && (
                <div className="flex flex-col gap-2 items-start w-full">
                  <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                    明日に見送る <span className="text-[var(--semantic-brand-danger)]">※</span>
                  </p>
                  <div className="flex gap-4 items-center">
                    <button
                      type="button"
                      onClick={() => setDeferToTomorrow(true)}
                      className={`h-12 w-34 rounded-lg text-base ${
                        deferToTomorrow === true
                          ? "bg-white border border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                          : "bg-white text-[var(--semantic-text-primary)]"
                      }`}
                    >
                      はい
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeferToTomorrow(false)}
                      className={`h-12 w-34 rounded-lg text-base ${
                        deferToTomorrow === false
                          ? "bg-white border border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                          : "bg-white text-[var(--semantic-text-primary)]"
                      }`}
                    >
                      いいえ
                    </button>
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-2 items-start w-full">
                <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                  備考 <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <textarea
                  value={skipReason}
                  onChange={(e) => setSkipReason(e.target.value)}
                  placeholder="理由を記入してください。"
                  className="bg-white min-h-20 p-2 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
                />
              </div>
            </div>
            <div className="flex gap-6 items-center justify-center w-full">
              <button
                type="button"
                onClick={closeSkipDialog}
                className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={!skipReason.trim() || (!isDaily && deferToTomorrow === null)}
                onClick={handleSkip}
                className={`h-16 w-60 rounded-lg text-xl text-white ${
                  skipReason.trim() && (isDaily || deferToTomorrow !== null)
                    ? "bg-[var(--semantic-brand-primary)]"
                    : "bg-[#d0d0d0]"
                }`}
              >
                点検を見送る
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
