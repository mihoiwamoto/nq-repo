import { useState, type ReactNode } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import iconXMark from "../../../assets/figma/icons/common/cancel-custom.svg";
import iconCheck from "../../../assets/figma/icons/common/checkmark-custom.svg";
import { RecordTimestamp } from "../../components/RecordTimestamp";
import { stampTimestamps } from "../../utils/recordTimestamps";
import { AppHeader } from "../../layout/AppHeader";
import { ACTORS } from "../cleaning-record/mockData";
import { useScaleInspection } from "./ScaleInspectionContext";
import {
  ACTION_OPTIONS,
  CRITERIA_TOLERANCE,
  WEIGHT_ISSUE_OPTIONS,
  type ActionCheck,
  type ActionOption,
  type WeightIssueOption,
} from "./mockData";

function HelpTooltip({ text, open, onToggle }: { text: string; open: boolean; onToggle: () => void }) {
  return (
    <span className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-label="ヘルプ"
        className="bg-white size-5 rounded-full border border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)] text-xs flex items-center justify-center"
      >
        ?
      </button>
      {open && (
        <div className="absolute bottom-full left-[-13px] mb-2 z-10 w-max whitespace-nowrap rounded-lg bg-[var(--semantic-brand-primary)] px-2 py-1 text-sm leading-[1.6] text-white shadow-[0px_2px_6px_rgba(51,51,51,0.24)]">
          {text}
          <span
            aria-hidden
            className="absolute top-full left-[23px] -translate-x-1/2 size-0 border-x-[8px] border-x-transparent border-t-[8px] border-t-[var(--semantic-brand-primary)]"
          />
        </div>
      )}
    </span>
  );
}

function PillButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-12 w-34 rounded-lg text-base ${
        selected
          ? "bg-white border border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
          : "bg-white text-[var(--semantic-text-primary)]"
      }`}
    >
      {children}
    </button>
  );
}

export function ScaleRecordPage() {
  const { postId, scaleId } = useParams<{ postId: string; scaleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { posts, scalesByPost, saveScaleRecord, skipScale } = useScaleInspection();
  // 一覧・進捗一覧で選んだ実施者名。タイムスタンプに出す
  const inspectorName =
    (location.state as { inspectorName?: string } | null)?.inspectorName ?? ACTORS[0].name;

  const post = posts.find((p) => p.id === postId);
  const scale = (postId ? scalesByPost[postId] : undefined)?.find((s) => s.id === scaleId);

  const [actionCheck, setActionCheck] = useState<ActionCheck>(scale?.record?.actionCheck ?? null);
  const [cause, setCause] = useState(scale?.record?.cause ?? "");
  const [actionType, setActionType] = useState<ActionOption | null>(scale?.record?.actionType ?? null);
  const [actionDetail, setActionDetail] = useState(scale?.record?.actionDetail ?? "");
  const [levelCheck, setLevelCheck] = useState(scale?.record?.levelCheck ?? false);
  const [dirtCheck, setDirtCheck] = useState(scale?.record?.dirtCheck ?? false);
  const [displayValue, setDisplayValue] = useState(scale?.record?.displayValue ?? "");
  const [remarks, setRemarks] = useState(scale?.record?.remarks ?? "");
  const [skipDialogOpen, setSkipDialogOpen] = useState(false);
  const [skipReason, setSkipReason] = useState("");

  const [ngDialogOpen, setNgDialogOpen] = useState(false);
  const [ngCause, setNgCause] = useState("");
  const [ngActionType, setNgActionType] = useState<ActionOption | null>(null);
  const [ngActionDetail, setNgActionDetail] = useState("");
  const [openTooltip, setOpenTooltip] = useState<"level" | "dirt" | null>(null);

  const [weightCause, setWeightCause] = useState<WeightIssueOption | null>(scale?.record?.weightCause ?? null);
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [pendingWeightCause, setPendingWeightCause] = useState<WeightIssueOption | null>(null);
  /** 項目ごとに「いつ入力したか」を持たせ、入力欄の下に実施者名と並べて出す。
   *  すでに記録がある秤を開いたときは、その記録に付いている時刻から始める */
  const [timestamps, setTimestamps] = useState<Record<string, string>>(
    () => scale?.record?.timestamps ?? {}
  );

  /** 値が入っていれば入力時刻を打ち、消して未記録に戻したら時刻表示も消す */
  function stamp(field: string, value: unknown) {
    setTimestamps((prev) => stampTimestamps(prev, field, value));
  }

  if (!scale) return null;

  const criteriaMin = scale.referenceWeight - CRITERIA_TOLERANCE;
  const criteriaMax = scale.referenceWeight + CRITERIA_TOLERANCE;
  const isNg = actionCheck === "ng";
  // 「その他」は選択肢だけでは何をしたか分からないので、自由記述を必須にする
  const isOtherNgAction = ngActionType === "その他";
  const canConfirmNg =
    ngCause.trim() !== "" && ngActionType !== null && (!isOtherNgAction || ngActionDetail.trim() !== "");
  const isOutOfRange =
    displayValue.trim() !== "" &&
    !Number.isNaN(Number(displayValue)) &&
    (Number(displayValue) < criteriaMin || Number(displayValue) > criteriaMax);
  // 異常ありでも水平点検・汚れ・表示値は続けて入力するので、必須条件は共通
  const canSave =
    (isNg
      ? cause.trim() !== "" &&
        actionType !== null &&
        (actionType !== "その他" || actionDetail.trim() !== "")
      : actionCheck === "ok") &&
    levelCheck &&
    dirtCheck &&
    displayValue.trim() !== "" &&
    (!isOutOfRange || weightCause !== null);

  function handleSave() {
    if (!postId || !scaleId || !canSave) return;
    saveScaleRecord(postId, scaleId, {
      actionCheck,
      cause: isNg ? cause : "",
      actionType: isNg ? actionType : null,
      actionDetail: isNg && actionType === "その他" ? actionDetail : "",
      levelCheck,
      dirtCheck,
      displayValue,
      weightCause,
      remarks,
      // 確認画面・詳細画面でも「誰がいつ入れたか」を出せるように記録と一緒に保存する
      inspector: inspectorName,
      timestamps,
    });
    navigate(`/app/ledger-list/scale-inspection/posts/${postId}`);
  }

  function handleDisplayValueChange(value: string) {
    setDisplayValue(value);
    stamp("displayValue", value);
    const numeric = Number(value);
    if (value.trim() === "" || Number.isNaN(numeric) || (numeric >= criteriaMin && numeric <= criteriaMax)) {
      setWeightCause(null);
    }
  }

  function handleDisplayValueBlur() {
    if (isOutOfRange && weightCause === null) {
      setPendingWeightCause(null);
      setWeightDialogOpen(true);
    }
  }

  function closeWeightDialog() {
    setWeightDialogOpen(false);
  }

  function confirmWeightDialog() {
    if (!pendingWeightCause) return;
    setWeightCause(pendingWeightCause);
    stamp("displayValue", displayValue);
    setWeightDialogOpen(false);
  }

  function openNgDialog() {
    setNgCause(cause);
    setNgActionType(actionType);
    setNgActionDetail(actionDetail);
    setNgDialogOpen(true);
  }

  function closeNgDialog() {
    setNgDialogOpen(false);
  }

  function confirmNgDialog() {
    if (!canConfirmNg) return;
    setActionCheck("ng");
    setCause(ngCause);
    setActionType(ngActionType);
    setActionDetail(isOtherNgAction ? ngActionDetail : "");
    stamp("actionCheck", "ng");
    setNgDialogOpen(false);
  }

  function setOk() {
    setActionCheck("ok");
    setCause("");
    setActionType(null);
    setActionDetail("");
    stamp("actionCheck", "ok");
  }

  function closeSkipDialog() {
    setSkipDialogOpen(false);
    setSkipReason("");
  }

  function handleSkip() {
    if (!skipReason.trim() || !postId || !scaleId) return;
    skipScale(postId, scaleId, skipReason);
    navigate(`/app/ledger-list/scale-inspection/posts/${postId}`);
  }

  return (
    <>
      <AppHeader
        title={`秤点検記録_${post?.name ?? ""}`}
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col items-center">
        <div className="flex flex-col gap-5 items-start w-full max-w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
              秤No.(ラベル名) <span className="text-[var(--semantic-brand-danger)]">※</span>
            </p>
            <p className="text-base text-[var(--semantic-text-primary)]">{scale.label}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="flex items-center justify-between w-full">
            <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
              シリアルナンバー <span className="text-[var(--semantic-brand-danger)]">※</span>
            </p>
            <p className="text-base text-[var(--semantic-text-primary)]">{scale.serialNumber}</p>
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

          <div className="flex flex-col gap-2 items-start w-full">
            <div className="flex items-center justify-between w-full">
              <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                動作確認 <span className="text-[var(--semantic-brand-danger)]">※</span>
              </p>
              <div className="flex items-center rounded-lg overflow-hidden shrink-0">
                <button
                  type="button"
                  onClick={openNgDialog}
                  className={`h-12 w-20 flex items-center justify-center text-white ${
                    isNg ? "bg-[#f85c5c]" : "bg-[#d0d0d0]"
                  }`}
                >
                  <img src={iconXMark} alt="異常あり" className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={setOk}
                  className={`h-12 w-20 flex items-center justify-center text-white ${
                    actionCheck === "ok" ? "bg-[#19c95f]" : "bg-[#d0d0d0]"
                  }`}
                >
                  <img src={iconCheck} alt="正常" className="size-5" />
                </button>
              </div>
            </div>
            {isNg && (
              <div className="flex flex-col gap-2 items-start px-2 w-full">
                <p className="text-base text-[var(--semantic-text-secondary)]">原因：{cause}</p>
                <p className="text-base text-[var(--semantic-text-secondary)]">対応：{actionType}</p>
                {actionType === "その他" && actionDetail && (
                  <p className="text-base text-[var(--semantic-text-secondary)] whitespace-pre-wrap break-all">
                    {actionDetail}
                  </p>
                )}
              </div>
            )}
            <RecordTimestamp inspector={inspectorName} timestamp={timestamps.actionCheck} />
          </div>
          <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex gap-2 items-center">
                  <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                    水平点検 <span className="text-[var(--semantic-brand-danger)]">※</span>
                  </p>
                  <HelpTooltip
                    text="水平なところに置かれているか確認してください。"
                    open={openTooltip === "level"}
                    onToggle={() => setOpenTooltip((v) => (v === "level" ? null : "level"))}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLevelCheck((v) => !v);
                    stamp("levelCheck", !levelCheck);
                  }}
                  className={`h-12 w-20 rounded-lg flex items-center justify-center text-white shrink-0 ${
                    levelCheck ? "bg-[#19c95f]" : "bg-[#d0d0d0]"
                  }`}
                >
                  <img src={iconCheck} alt="確認" className="size-5" />
                </button>
              </div>
              <RecordTimestamp inspector={inspectorName} timestamp={timestamps.levelCheck} />
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex gap-2 items-center">
                  <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                    汚れ <span className="text-[var(--semantic-brand-danger)]">※</span>
                  </p>
                  <HelpTooltip
                    text="機械に汚れがついてないか確認してください。"
                    open={openTooltip === "dirt"}
                    onToggle={() => setOpenTooltip((v) => (v === "dirt" ? null : "dirt"))}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDirtCheck((v) => !v);
                    stamp("dirtCheck", !dirtCheck);
                  }}
                  className={`h-12 w-20 rounded-lg flex items-center justify-center text-white shrink-0 ${
                    dirtCheck ? "bg-[#19c95f]" : "bg-[#d0d0d0]"
                  }`}
                >
                  <img src={iconCheck} alt="確認" className="size-5" />
                </button>
              </div>
              <RecordTimestamp inspector={inspectorName} timestamp={timestamps.dirtCheck} />
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />

            <div className="flex flex-col gap-1 items-end w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-2 items-start shrink-0">
                  <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1 whitespace-nowrap">
                    秤の表示値(g) <span className="text-[var(--semantic-brand-danger)]">※</span>
                  </p>
                  <p className="text-sm text-[#808080]">使用分銅(g)：{scale.referenceWeight}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => handleDisplayValueChange(String(scale.referenceWeight))}
                    className="h-12 w-24 rounded-lg text-lg border border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)] bg-white"
                  >
                    誤差なし
                  </button>
                  <input
                    type="number"
                    value={displayValue}
                    onChange={(e) => handleDisplayValueChange(e.target.value)}
                    onBlur={handleDisplayValueBlur}
                    className="bg-white h-12 px-2 rounded-lg text-base text-[var(--semantic-text-primary)] text-right w-[280px]"
                  />
                </div>
              </div>
              <p className="text-sm text-[var(--semantic-text-primary)] text-right w-full">
                ※点検基準：{criteriaMin}g~{criteriaMax}g
              </p>
              {isOutOfRange && weightCause && (
                <p className="text-sm text-[var(--semantic-text-secondary)] text-right w-full">
                  原因：{weightCause}
                </p>
              )}
              <RecordTimestamp inspector={inspectorName} timestamp={timestamps.displayValue} />
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />

          <div className="flex flex-col gap-2 items-start w-full">
            <p className="text-lg text-[var(--semantic-text-primary)]">備考</p>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="テキストを入力"
              className="bg-white min-h-20 p-2 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
            />
          </div>
        </div>
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-white border border-[#333] flex items-center justify-center flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          戻る
        </button>
        <button
          type="button"
          disabled={!canSave}
          onClick={handleSave}
          className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white ${
            canSave ? "bg-[var(--semantic-brand-primary)]" : "bg-[#d0d0d0]"
          }`}
        >
          保存
        </button>
      </div>

      {ngDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeNgDialog} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-full max-w-[600px] mx-6 max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                点検箇所
              </h2>
              <div className="flex items-center justify-between w-full gap-4">
                <p className="text-xl text-[var(--semantic-text-primary)] flex items-center gap-1">
                  動作確認 <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <div className="flex items-center rounded-lg overflow-hidden shrink-0">
                  <div className="h-12 w-20 flex items-center justify-center text-white bg-[#f85c5c]"><img src={iconXMark} alt="異常あり" className="size-5" /></div>
                  <div className="h-12 w-20 flex items-center justify-center text-white bg-[#d0d0d0]"><img src={iconCheck} alt="正常" className="size-5" /></div>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-start w-full">
                <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                  原因 <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <textarea
                  value={ngCause}
                  onChange={(e) => setNgCause(e.target.value)}
                  placeholder="原因を記入してください。"
                  className="bg-white min-h-20 p-2 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
                />
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
                      onClick={() => {
                        setNgActionType(option);
                        if (option !== "その他") setNgActionDetail("");
                      }}
                    >
                      {option}
                    </PillButton>
                  ))}
                </div>
                {isOtherNgAction && (
                  <textarea
                    value={ngActionDetail}
                    onChange={(e) => setNgActionDetail(e.target.value)}
                    placeholder="対応を記入してください。"
                    className="bg-white min-h-20 p-2 rounded-lg text-base text-[var(--semantic-text-primary)] w-full placeholder:text-[var(--semantic-text-secondary)]"
                  />
                )}
              </div>
            </div>
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={closeNgDialog}
                className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={!canConfirmNg}
                onClick={confirmNgDialog}
                className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white ${
                  canConfirmNg ? "bg-[var(--semantic-brand-primary)]" : "bg-[#d0d0d0]"
                }`}
              >
                完了
              </button>
            </div>
          </div>
        </div>
      )}

      {weightDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeWeightDialog} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-full max-w-[600px] mx-6 max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                点検箇所
              </h2>
              <div className="flex flex-col gap-1 items-end w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col gap-2 items-start shrink-0">
                    <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1 whitespace-nowrap">
                      秤の表示値(g) <span className="text-[var(--semantic-brand-danger)]">※</span>
                    </p>
                    <p className="text-sm text-[#808080]">使用分銅(g)：{scale.referenceWeight}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={() => handleDisplayValueChange(String(scale.referenceWeight))}
                      className="h-12 w-24 rounded-lg text-lg border border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)] bg-white"
                    >
                      誤差なし
                    </button>
                    <input
                      type="number"
                      value={displayValue}
                      onChange={(e) => handleDisplayValueChange(e.target.value)}
                      className="bg-white h-12 px-2 rounded-lg text-base text-[var(--semantic-text-primary)] text-right w-[280px]"
                    />
                  </div>
                </div>
                <p className="text-sm text-[var(--semantic-text-primary)] text-right w-full">
                  ※点検基準：{criteriaMin}g~{criteriaMax}g
                </p>
              </div>
              <div className="flex flex-col gap-2 items-start w-full">
                <p className="text-lg text-[var(--semantic-text-primary)] flex items-center gap-1">
                  原因 <span className="text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <div className="flex flex-wrap gap-4 w-full">
                  {WEIGHT_ISSUE_OPTIONS.map((option) => (
                    <PillButton
                      key={option}
                      selected={pendingWeightCause === option}
                      onClick={() => setPendingWeightCause(option)}
                    >
                      {option}
                    </PillButton>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={closeWeightDialog}
                className="bg-white border border-[#333] flex items-center justify-center h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={!pendingWeightCause}
                onClick={confirmWeightDialog}
                className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white ${
                  pendingWeightCause ? "bg-[var(--semantic-brand-primary)]" : "bg-[#d0d0d0]"
                }`}
              >
                完了
              </button>
            </div>
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
                disabled={!skipReason.trim()}
                onClick={handleSkip}
                className={`flex items-center justify-center h-16 w-60 rounded-lg text-xl text-white ${
                  skipReason.trim() ? "bg-[var(--semantic-brand-primary)]" : "bg-[#d0d0d0]"
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
