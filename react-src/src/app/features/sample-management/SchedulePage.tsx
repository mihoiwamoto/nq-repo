/**
 * アプリの点検予定 › 検体管理 検体製品設定（詳細・新規登録・編集・複製して登録と、その完了画面）。
 * 本番（iOS）の点検予定は 官能検査記録・検体管理 を持つので足した（2026-10-08。仕様書・コード差異 アプリ-58）。
 * 作りは官能検査記録・清掃記録の点検予定と同じ。中身は確定デザインの「点検予定_検体管理」（6198:78679）：
 * 詳細 6198:78680・︙メニュー 6198:78776・編集 6198:79025・新規登録 6198:79249・製品追加 6198:79290・
 * 新規登録完了 6198:79586・削除 6198:78727・削除完了 6198:79573・全製品削除 6198:79080・個別製品削除 6198:79137。
 */
import { Fragment, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";
import { SubmitComplete } from "../../components/SubmitComplete";
import { DateFilterInput } from "../../components/DateFilterInput";
import { isClosedDay } from "../equipment-inspection/calendarUtils";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";
import iconEdit from "../../../assets/figma/icons/common/edit.svg";
import iconPlus from "../../../assets/figma/icons/common/plus.svg";
import iconCalendar from "../../../assets/figma/icons/common/calendar.svg";
import iconKebab from "../../../assets/figma/icons/common/kebab-menu.svg";
import iconCheckbox from "@images/Icon/ckeckbox.svg";
import iconCheckboxOn from "@images/Icon/ckeckbox_on.svg";
import { scheduledSampleFrom, useSampleSchedule, type ScheduledSample } from "./ScheduleContext";

const TITLE = "検体管理 検体製品設定";

function formatDateSlash(dateKey: string) {
  const [y, m, d] = dateKey.split("-");
  return `${y}/${m}/${d}`;
}

function MaskIcon({ src, color, className = "size-5" }: { src: string; color: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 ${className}`}
      style={{
        WebkitMaskImage: `url("${src}")`,
        maskImage: `url("${src}")`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        backgroundColor: color,
      }}
    />
  );
}

/** ︙ を押すと出る小さなメニュー（確定デザイン 6198:78776）。外を押すと閉じる */
function KebabMenu({
  items,
  bordered,
}: {
  items: { label: string; danger?: boolean; onClick: () => void }[];
  bordered?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-label="メニュー"
        onClick={() => setOpen((v) => !v)}
        className={`rounded-lg flex items-center justify-center ${
          bordered ? "size-11 bg-white border border-[var(--semantic-text-primary)]" : "size-12"
        }`}
      >
        {/* 詳細の枠つき 44px はアイコン 20px、登録・編集の見出しの 48px はアイコン 32px（6198:78680・6198:79025） */}
        <MaskIcon src={iconKebab} color="var(--semantic-text-primary)" className={bordered ? "size-5" : "size-8"} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-40 bg-white rounded-lg shadow-[0px_2px_6px_rgba(51,51,51,0.24)] flex flex-col py-2 w-60">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className={`h-12 px-4 text-left text-base ${
                item.danger ? "text-[var(--semantic-brand-danger)]" : "text-[var(--semantic-text-primary)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfirmDeleteDialog({
  title,
  onCancel,
  onDelete,
}: {
  title: string;
  onCancel: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] max-w-[calc(100%-32px)]">
        <div className="flex flex-col gap-6 items-start w-full">
          <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">{title}</h2>
          <p className="text-base text-[var(--semantic-text-primary)]">
            削除した情報は元に戻せません。本当に削除しますか？
          </p>
        </div>
        <div className="flex gap-10 items-center justify-center w-full">
          <button
            type="button"
            onClick={onCancel}
            className="bg-white border border-[var(--semantic-text-primary)] h-16 w-60 max-w-full rounded-lg text-xl text-[var(--semantic-text-primary)] shrink-0"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="bg-[var(--semantic-brand-danger)] h-16 w-60 max-w-full rounded-lg text-xl text-white shrink-0"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}

type ResultKind = "registered" | "saved" | "deleted" | null;
/** "delete-entry" … 検体製品設定の削除、"delete-all" … 全製品の削除、それ以外は製品の id */
type DeleteTarget = "delete-entry" | "delete-all" | string | null;

/** 日付が変わったら中身を作り直す（同じルートのまま別の日へ移ると、前の日の製品が残っていた） */
export function SchedulePage({ copy = false }: { copy?: boolean }) {
  const { dateKey } = useParams<{ dateKey: string }>();
  return <SchedulePageBody key={`${copy ? "copy" : "detail"}-${dateKey}`} copy={copy} />;
}

function SchedulePageBody({ copy = false }: { copy?: boolean }) {
  const { dateKey } = useParams<{ dateKey: string }>();
  const navigate = useNavigate();
  const { products, entries, upsertEntry, removeEntry } = useSampleSchedule();

  const source = dateKey ? entries[dateKey] : undefined;
  // 複製して登録のときは、元の日の中身を写した新規登録（日付はカレンダーから選ぶ）
  const existing = copy ? undefined : source;
  const [viewMode, setViewMode] = useState<"view" | "edit">(existing ? "view" : "edit");
  const [targetDate, setTargetDate] = useState(copy ? "" : (dateKey ?? ""));
  const [scheduled, setScheduled] = useState<ScheduledSample[]>(source?.products ?? []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSelected, setPickerSelected] = useState<Set<string>>(new Set());
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerQuery, setPickerQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [result, setResult] = useState<ResultKind>(null);

  if (!dateKey) return null;
  const scheduleDateKey: string = dateKey;

  function productName(productId: string) {
    return products.find((p) => p.id === productId)?.name ?? productId;
  }

  function openPicker() {
    setPickerSelected(new Set(scheduled.map((s) => s.productId)));
    setPickerSearch("");
    setPickerQuery("");
    setPickerOpen(true);
  }

  function togglePickerProduct(productId: string) {
    setPickerSelected((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  function confirmPicker() {
    // 外したものは消し、足したものは見本の製造日・ロットNo. を入れて後ろに並べる
    setScheduled((prev) => {
      const keep = prev.filter((s) => pickerSelected.has(s.productId));
      const added = products
        .filter((p) => pickerSelected.has(p.id) && !prev.some((s) => s.productId === p.id))
        .map(scheduledSampleFrom);
      return [...keep, ...added];
    });
    setPickerOpen(false);
  }

  function updateItem(productId: string, patch: Partial<ScheduledSample>) {
    setScheduled((prev) => prev.map((s) => (s.productId === productId ? { ...s, ...patch } : s)));
  }

  function confirmDelete() {
    if (deleteTarget === "delete-entry") {
      removeEntry(scheduleDateKey);
      setDeleteTarget(null);
      setResult("deleted");
      return;
    }
    if (deleteTarget === "delete-all") setScheduled([]);
    else if (deleteTarget) setScheduled((prev) => prev.filter((s) => s.productId !== deleteTarget));
    setDeleteTarget(null);
  }

  // 複製先の日付：選んでいない・休業日・すでに予定がある日は登録できない
  const targetTaken = copy && !!targetDate && !!entries[targetDate];
  const targetClosed = copy && !!targetDate && isClosedDay(targetDate);
  const canSave = scheduled.length > 0 && !!targetDate && !targetTaken && !targetClosed;

  function handleSave() {
    if (!canSave) return;
    upsertEntry(copy ? targetDate : scheduleDateKey, scheduled);
    setResult(existing ? "saved" : "registered");
  }

  if (result) {
    return (
      <SubmitComplete
        ledgerTitle={TITLE}
        title={
          result === "deleted"
            ? "検体製品設定の削除が完了しました！"
            : result === "saved"
              ? "保存が完了しました！"
              : "登録が完了しました！"
        }
        message={result === "deleted" ? "" : "ご登録ありがとうございます。"}
        secondary={{ label: "点検予定に戻る", onClick: () => navigate("/app/schedule") }}
      />
    );
  }

  const pickerProducts = products.filter((p) => p.name.includes(pickerQuery));

  return (
    <>
      <AppHeader title={TITLE} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 flex flex-col gap-4 items-center">
        {viewMode === "view" ? (
          <div className="flex flex-col gap-2 items-center w-full">
            {/* 詳細（6198:78680）：右上に「編集」と ︙（この内容を複製して登録／削除） */}
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setViewMode("edit")}
                className="bg-white border border-[var(--semantic-brand-primary)] flex gap-1 h-11 w-24 items-center justify-center rounded-lg text-lg text-[var(--semantic-brand-primary)] shrink-0"
              >
                <MaskIcon src={iconEdit} color="var(--semantic-brand-primary)" />
                編集
              </button>
              <KebabMenu
                bordered
                items={[
                  {
                    label: "この内容を複製して登録",
                    onClick: () => navigate(`/app/schedule/sample-management/${scheduleDateKey}/copy`),
                  },
                  { label: "削除", danger: true, onClick: () => setDeleteTarget("delete-entry") },
                ]}
              />
            </div>
            {/* 確定デザイン 6198:78680：カードは左右 16・上下 24、行は 16px の高さで 12px おき、区切り線も左右 16 の内側 */}
            <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full">
              <div className="flex gap-4 h-4 items-center justify-between w-full">
                <p className="w-28 shrink-0 text-base leading-4 text-[var(--semantic-text-primary)]">日時</p>
                <p className="flex-1 min-w-0 text-base leading-4 text-right text-[var(--semantic-text-primary)]">
                  {formatDateSlash(dateKey)}
                </p>
              </div>
              {scheduled.map((item) => (
                <Fragment key={item.productId}>
                  <div className="h-px w-full bg-[#d0d0d0] shrink-0" />
                  <div className="flex flex-col gap-3 w-full">
                    {[
                      ["製品名", productName(item.productId)],
                      ["製造日", item.manufactureDate ? formatDateSlash(item.manufactureDate) : ""],
                      ["ロットNo.", item.lotNumber],
                    ]
                      // 製造日・ロットNo. は入れたものだけ出す
                      .filter(([, value]) => value)
                      .map(([label, value]) => (
                        <div key={label} className="flex gap-4 h-4 items-center w-full">
                          <p className="w-28 shrink-0 text-base leading-4 text-[var(--semantic-text-primary)]">{label}</p>
                          <p className="flex-1 min-w-0 text-base leading-4 text-right text-[var(--semantic-text-primary)] truncate">
                            {value}
                          </p>
                        </div>
                      ))}
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* 日付：点検予定から開いたときはその日で変えられない。複製して登録のときはカレンダーから選ぶ */}
            <div className="flex items-center justify-between w-full">
              <p className="flex gap-1 items-start text-lg text-[var(--semantic-text-primary)]">
                日付
                <span className="text-xs text-[var(--semantic-brand-danger)]">※</span>
              </p>
              {copy ? (
                <div className="flex flex-col items-end gap-1">
                  <DateFilterInput value={targetDate} onChange={setTargetDate} placeholder="日付を選択" />
                  {(targetTaken || targetClosed) && (
                    <p className="text-sm text-[var(--semantic-brand-danger)]">
                      {targetClosed ? "休業日は登録できません" : "すでに登録されている日です"}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-[#d0d0d0] flex gap-2 h-12 items-center justify-end px-4 rounded-lg w-[200px] max-w-[50%] shrink-0">
                  <p className="flex-1 min-w-0 text-base text-[var(--semantic-text-primary)]">
                    {formatDateSlash(dateKey)}
                  </p>
                  <img src={iconCalendar} alt="" aria-hidden className="size-6 shrink-0" />
                </div>
              )}
            </div>

            <div className="h-px w-full bg-[#d0d0d0]" />

            {/* 新規登録・編集（6198:79249・6198:79025）：見出しに「＋製品追加」と ︙（全製品削除）、製品ごとに 製造日・ロットNo. とゴミ箱 */}
            <div className="flex flex-col items-start rounded-lg w-full bg-white">
              <div className="flex gap-2 h-16 items-center justify-between p-2 w-full">
                <p className="flex gap-1 items-start text-lg text-[var(--semantic-text-primary)]">
                  検体対象製品
                  <span className="text-xs text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openPicker}
                    disabled={products.length === 0}
                    className={`bg-white border flex gap-1 h-12 items-center justify-center rounded-lg text-base w-[200px] shrink-0 ${
                      products.length === 0
                        ? "border-[#d0d0d0] text-[var(--semantic-text-secondary)]"
                        : "border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                    }`}
                  >
                    <MaskIcon
                      src={iconPlus}
                      color={products.length === 0 ? "var(--semantic-text-secondary)" : "var(--semantic-brand-primary)"}
                    />
                    製品追加
                  </button>
                  <KebabMenu
                    items={[
                      {
                        label: "全製品削除",
                        danger: true,
                        onClick: () => scheduled.length > 0 && setDeleteTarget("delete-all"),
                      },
                    ]}
                  />
                </div>
              </div>
              <div className="h-px w-full bg-[#d0d0d0]" />
              <div className="flex flex-col items-center px-4 py-4 w-full">
                {scheduled.length === 0 ? (
                  // 確定デザイン 6198:79249 の文言（2026-10-08。アプリのほかの「データがありません。」とは別）
                  <div className="flex items-center w-full py-4">
                    <p className="text-sm leading-6 text-[var(--semantic-text-primary)]">登録された製品がありません</p>
                  </div>
                ) : (
                  scheduled.map((item, index) => (
                    <Fragment key={item.productId}>
                      {index > 0 && <div className="h-px w-full bg-[#d0d0d0] my-4" />}
                      {/* 確定デザイン 6198:79025：見出し 136＋8、行は 12px おき、ゴミ箱は 24px 離して上下中央 */}
                      <div className="flex items-center gap-6 w-full">
                        <div className="flex-1 min-w-0 grid grid-cols-[136px_1fr] gap-x-2 gap-y-3 items-center">
                          <p className="text-base text-[var(--semantic-text-primary)]">製品名</p>
                          <p className="text-base leading-4 text-[var(--semantic-text-primary)] truncate">
                            {productName(item.productId)}
                          </p>
                          <p className="text-base text-[var(--semantic-text-primary)]">製造日</p>
                          <DateFilterInput
                            value={item.manufactureDate}
                            onChange={(value) => updateItem(item.productId, { manufactureDate: value })}
                            placeholder="日付を選択"
                            // 確定デザインの InputDate は高さ 40（ロットNo. の欄と揃える）
                            className="w-[200px] [&_input]:h-10"
                          />
                          <p className="text-base text-[var(--semantic-text-primary)]">ロットNo.</p>
                          <input
                            type="text"
                            value={item.lotNumber}
                            onChange={(e) => updateItem(item.productId, { lotNumber: e.target.value })}
                            placeholder="ロットNo.を入力"
                            className="bg-white border border-[#d0d0d0] h-10 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px] placeholder:text-[var(--semantic-text-secondary)]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item.productId)}
                          className="bg-white border border-[var(--semantic-brand-danger)] size-10 rounded-lg flex items-center justify-center shrink-0"
                        >
                          <img src={iconTrash} alt="削除" className="size-6" />
                        </button>
                      </div>
                    </Fragment>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-10 py-6 flex gap-6 items-center justify-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-white border border-[var(--semantic-text-primary)] h-16 w-60 max-w-full rounded-lg px-4 text-xl text-[var(--semantic-text-primary)] shrink-0"
        >
          戻る
        </button>
        {viewMode === "edit" && (
          <button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className={`h-16 w-60 max-w-full rounded-lg px-4 text-xl text-white shrink-0 ${
              canSave ? "bg-[var(--semantic-brand-primary)]" : "bg-[var(--semantic-text-secondary)] opacity-50"
            }`}
          >
            {existing ? "保存" : "登録"}
          </button>
        )}
      </div>

      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPickerOpen(false)} />
          {/* 製品追加（6198:79290）：検索欄と「検索」、チェックした製品は緑の文字 */}
          <div className="relative bg-[var(--semantic-background-page)] drop-shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] max-w-[calc(100%-32px)] max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">製品追加</h2>
            <div className="flex flex-col gap-4 items-start w-full">
              <div className="flex gap-4 items-start w-full">
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="製品名を入力"
                  className="flex-1 min-w-0 bg-white border border-[var(--semantic-text-secondary)] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
                />
                <button
                  type="button"
                  onClick={() => setPickerQuery(pickerSearch)}
                  className="bg-white border border-[var(--semantic-brand-primary)] h-12 w-[120px] rounded-lg text-base text-[var(--semantic-brand-primary)] shrink-0"
                >
                  検索
                </button>
              </div>
              <div className="bg-white flex flex-col items-center rounded-lg w-full h-[336px] px-4 overflow-y-auto overflow-x-hidden">
                {pickerProducts.length === 0 ? (
                  <p className="text-sm text-[var(--semantic-text-secondary)] py-4 w-full">データがありません。</p>
                ) : (
                  pickerProducts.map((p) => {
                    const checked = pickerSelected.has(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePickerProduct(p.id)}
                        className="flex gap-2 items-center min-h-12 py-2 w-full shrink-0 border-b border-[#d0d0d0] text-left"
                      >
                        <span className="flex gap-1 items-center min-w-0">
                          <img
                            src={checked ? iconCheckboxOn : iconCheckbox}
                            alt=""
                            aria-hidden
                            className="size-4 shrink-0"
                          />
                          <span
                            className={`text-sm truncate ${
                              checked ? "text-[var(--semantic-brand-primary)]" : "text-[var(--semantic-text-primary)]"
                            }`}
                          >
                            {p.name}
                          </span>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="bg-white border border-[var(--semantic-text-primary)] h-16 w-60 max-w-full rounded-lg text-xl text-[var(--semantic-text-primary)] shrink-0"
              >
                閉じる
              </button>
              <button
                type="button"
                disabled={pickerSelected.size === 0}
                onClick={confirmPicker}
                className={`h-16 w-60 max-w-full rounded-lg text-xl text-white shrink-0 ${
                  pickerSelected.size === 0
                    ? "bg-[var(--semantic-text-secondary)] opacity-50"
                    : "bg-[var(--semantic-brand-primary)]"
                }`}
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDeleteDialog
          title={
            deleteTarget === "delete-entry"
              ? "検体製品設定の削除"
              : deleteTarget === "delete-all"
                ? "全製品の削除"
                : `${productName(deleteTarget)}の削除`
          }
          onCancel={() => setDeleteTarget(null)}
          onDelete={confirmDelete}
        />
      )}
    </>
  );
}
