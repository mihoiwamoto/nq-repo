/**
 * アプリの点検予定 › 官能検査記録 検査製品設定（詳細・新規登録・編集と、その完了画面）。
 * 詳細 Ver.2.0 Figma 8481:165385・編集 8481:165790。検体管理の検体製品設定（sample-management/SchedulePage.tsx）と同じ作り。
 * Figma の文言は「商品」だが、アプリ・管理画面に合わせて「製品」のまま。
 */
import { Fragment, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DateFilterInput } from "../../components/DateFilterInput";
import { AppHeader } from "../../layout/AppHeader";
import { SubmitComplete } from "../../components/SubmitComplete";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";
import iconEdit from "../../../assets/figma/icons/common/edit.svg";
import iconPlus from "../../../assets/figma/icons/common/plus.svg";
import iconCalendar from "../../../assets/figma/icons/common/calendar.svg";
import iconKebab from "../../../assets/figma/icons/common/kebab-menu.svg";
import { useSensorySchedule } from "./ScheduleContext";
import {
  products,
  CRITERIA,
  CRITERION_TAG_COLORS,
  type ComparisonDateType,
  type ScheduleComparisonOption,
  type ScheduledProduct,
} from "./mockData";
import iconCheckbox from "@images/Icon/ckeckbox.svg";
import iconCheckboxOn from "@images/Icon/ckeckbox_on.svg";
import { findFactoryItem } from "../../data/factoryAppData";
import { isClosedDay } from "../equipment-inspection/calendarUtils";
import { Pulldown } from "../../../admin/components/Pulldown";

type ResultKind = "registered" | "saved" | "deleted" | null;
/** 製品の id・全製品削除・この日の予定の削除 */
type DeleteTarget = string | "delete-all" | "delete-entry" | null;

const TITLE = "官能検査記録 検査製品設定";

const COMPARISON_OPTIONS: { value: ScheduleComparisonOption; label: string }[] = [
  { value: "none", label: "なし" },
  { value: "present", label: "あり" },
  { value: "unset", label: "未設定" },
];

/** 比較製品「あり」のときに選ぶ日付の種類（管理画面の点検予定の新規登録と同じ。選ぶと右にカレンダーが出る） */
const COMPARISON_DATE_OPTIONS: { value: ComparisonDateType; label: string }[] = [
  { value: "manufactured", label: "製造日" },
  { value: "bestBefore", label: "賞味期限" },
];

/** 見本のように種類を持たない記録は、入っている日付から種類を決める */
function dateTypeOf(item: ScheduledProduct): ComparisonDateType | undefined {
  if (item.comparisonDateType) return item.comparisonDateType;
  if (item.comparisonManufactureDate) return "manufactured";
  if (item.comparisonBestBeforeDate) return "bestBefore";
  return undefined;
}

const COMPARISON_LABELS: Record<ScheduleComparisonOption, string> = { none: "なし", present: "あり", unset: "未設定" };

function formatDateSlash(dateKey: string) {
  return dateKey.replaceAll("-", "/");
}

/** 検査項目のラベル（Figma LabelItemList：幅 40・角丸 10・間 2） */
function CriteriaTags() {
  return (
    <span className="flex gap-[2px] items-start shrink-0">
      {CRITERIA.map((c) => (
        <span
          key={c}
          className="flex items-center justify-center px-1.5 py-0.5 rounded-[10px] w-10 shrink-0 text-xs leading-none whitespace-nowrap"
          style={{ backgroundColor: CRITERION_TAG_COLORS[c].bg, color: CRITERION_TAG_COLORS[c].text }}
        >
          {c}
        </span>
      ))}
    </span>
  );
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

/** ︙ を押すと出る小さなメニュー。外を押すと閉じる */
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

export function ScheduleRegisterPage({ copy = false }: { copy?: boolean }) {
  const { dateKey } = useParams<{ dateKey: string }>();
  // 詳細 → 複製して登録 で同じ部品が使い回されないよう、key で作り直す
  return <ScheduleRegisterBody key={`${copy ? "copy" : "detail"}-${dateKey}`} copy={copy} />;
}

function ScheduleRegisterBody({ copy = false }: { copy?: boolean }) {
  const { dateKey } = useParams<{ dateKey: string }>();
  const navigate = useNavigate();
  const { entries, upsertEntry, removeEntry } = useSensorySchedule();

  const source = dateKey ? entries[dateKey] : undefined;
  // 複製して登録のときは、元の日の中身を写した新規登録（日付はカレンダーから選ぶ）
  const existing = copy ? undefined : source;
  const [viewMode, setViewMode] = useState<"view" | "edit">(existing ? "view" : "edit");
  const [targetDate, setTargetDate] = useState(copy ? "" : (dateKey ?? ""));
  const [scheduled, setScheduled] = useState<ScheduledProduct[]>(source?.products ?? []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSelected, setPickerSelected] = useState<Set<string>>(new Set());
  const [pickerSearch, setPickerSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [result, setResult] = useState<ResultKind>(null);

  if (!dateKey) return null;
  const scheduleDateKey: string = dateKey;

  function productName(productId: string) {
    return findFactoryItem(products, productId)?.name ?? productId;
  }

  function openPicker() {
    setPickerSelected(new Set(scheduled.map((s) => s.productId)));
    setPickerSearch("");
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
    setScheduled((prev) => {
      const keep = prev.filter((s) => pickerSelected.has(s.productId));
      const added = Array.from(pickerSelected)
        .filter((id) => !prev.some((s) => s.productId === id))
        .map((productId) => ({
          productId,
          manufactureDate: "",
          comparison: "unset" as ScheduleComparisonOption,
          comparisonManufactureDate: "",
          comparisonBestBeforeDate: "",
        }));
      return [...keep, ...added];
    });
    setPickerOpen(false);
  }

  function updateItem(productId: string, patch: Partial<ScheduledProduct>) {
    setScheduled((prev) => prev.map((s) => (s.productId === productId ? { ...s, ...patch } : s)));
  }

  function setComparison(productId: string, comparison: ScheduleComparisonOption) {
    // 「あり」以外にしたら比較製品の日付は消す
    updateItem(
      productId,
      comparison === "present"
        ? { comparison }
        : { comparison, comparisonDateType: undefined, comparisonManufactureDate: "", comparisonBestBeforeDate: "" }
    );
  }

  /** 種類を切り替えても選んだ日付は引き継ぐ。持つのは選んだ種類の日付だけ（管理画面と同じ） */
  function setComparisonDateType(item: ScheduledProduct, dateType: ComparisonDateType) {
    const carried = dateTypeOf(item) === "bestBefore" ? item.comparisonBestBeforeDate : item.comparisonManufactureDate;
    updateItem(item.productId, {
      comparisonDateType: dateType,
      comparisonManufactureDate: dateType === "manufactured" ? carried : "",
      comparisonBestBeforeDate: dateType === "bestBefore" ? carried : "",
    });
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
    if (copy) {
      if (!canSave) return;
      upsertEntry(targetDate, scheduled);
      setResult("registered");
      return;
    }
    if (scheduled.length === 0) {
      if (existing) {
        removeEntry(scheduleDateKey);
        setResult("deleted");
      }
      return;
    }
    upsertEntry(scheduleDateKey, scheduled);
    setResult(existing ? "saved" : "registered");
  }

  if (result) {
    return (
      <SubmitComplete
        ledgerTitle={TITLE}
        title={
          result === "deleted"
            ? "検査製品設定の削除が完了しました！"
            : result === "saved"
              ? "保存が完了しました！"
              : "登録が完了しました！"
        }
        message={result === "deleted" ? "" : "ご登録ありがとうございます。"}
        secondary={{ label: "点検予定に戻る", onClick: () => navigate("/app/schedule") }}
      />
    );
  }

  const pickerProducts = products.filter((p) => p.name.includes(pickerSearch));
  const deleteTitle =
    deleteTarget === "delete-entry"
      ? "検査製品設定の削除"
      : deleteTarget === "delete-all"
        ? "全製品の削除"
        : deleteTarget
          ? `${productName(deleteTarget)}の削除`
          : "";

  return (
    <>
      <AppHeader title={TITLE} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 flex flex-col gap-4 items-center">
        {viewMode === "view" ? (
          <div className="flex flex-col gap-2 items-center w-full">
            {/* 詳細（8481:165385）：右上に「編集」と ︙（削除） */}
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setViewMode("edit")}
                className="bg-white border border-[var(--semantic-brand-primary)] flex gap-2 h-11 w-24 items-center justify-center rounded-lg text-lg text-[var(--semantic-brand-primary)] shrink-0"
              >
                <MaskIcon src={iconEdit} color="var(--semantic-brand-primary)" />
                編集
              </button>
              {/* ︙ のメニュー（8481:171109） */}
              <KebabMenu
                bordered
                items={[
                  {
                    label: "この内容を複製して登録",
                    onClick: () => navigate(`/app/schedule/sensory-inspection/${scheduleDateKey}/copy`),
                  },
                  { label: "削除", danger: true, onClick: () => setDeleteTarget("delete-entry") },
                ]}
              />
            </div>
            {/* カードは左右 16・上下 24、行は 12px おき、製品の間は線をはさんで 16px */}
            <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full">
              <div className="flex gap-4 h-4 items-center justify-between w-full">
                <p className="w-28 shrink-0 text-base leading-4 text-[var(--semantic-text-primary)]">日時</p>
                <p className="flex-1 min-w-0 text-base leading-4 text-right text-[var(--semantic-text-primary)]">
                  {formatDateSlash(dateKey)}
                </p>
              </div>
              <div className="flex flex-col gap-4 w-full">
                {scheduled.map((item) => {
                  const rows: [string, string][] = [
                    ["製造日", item.manufactureDate ? formatDateSlash(item.manufactureDate) : ""],
                    ["比較製品", COMPARISON_LABELS[item.comparison]],
                  ];
                  if (item.comparison === "present") {
                    if (item.comparisonManufactureDate)
                      rows.push(["比較製品製造日", formatDateSlash(item.comparisonManufactureDate)]);
                    if (item.comparisonBestBeforeDate)
                      rows.push(["比較製品賞味期限", formatDateSlash(item.comparisonBestBeforeDate)]);
                  }
                  return (
                    <Fragment key={item.productId}>
                      <div className="h-px w-full bg-[#d0d0d0] shrink-0" />
                      <div className="flex flex-col gap-3 w-full">
                        <div className="flex flex-col gap-2 items-end w-full">
                          <div className="flex gap-4 items-center w-full">
                            <p className="w-28 shrink-0 text-base leading-4 text-[var(--semantic-text-primary)]">製品名</p>
                            <p className="flex-1 min-w-0 text-base leading-4 text-right text-[var(--semantic-text-primary)] truncate">
                              {productName(item.productId)}
                            </p>
                          </div>
                          <CriteriaTags />
                        </div>
                        {rows
                          .filter(([, value]) => value)
                          .map(([label, value]) => (
                            <div key={label} className="flex gap-4 h-4 items-center w-full">
                              <p className="w-28 shrink-0 text-base leading-4 text-[var(--semantic-text-primary)] whitespace-nowrap">
                                {label}
                              </p>
                              <p className="flex-1 min-w-0 text-base leading-4 text-right text-[var(--semantic-text-primary)]">
                                {value}
                              </p>
                            </div>
                          ))}
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* 編集（8481:165790）：日付は点検予定から開いたその日で変えられない */}
            <div className="flex items-center justify-between w-full">
              <p className="flex gap-1 items-start text-lg text-[var(--semantic-text-primary)]">
                日付
                <span className="text-xs text-[var(--semantic-brand-danger)]">※</span>
              </p>
              {copy ? (
                <div className="flex flex-col items-end gap-1">
                  <DateFilterInput value={targetDate} onChange={setTargetDate} />
                  {(targetTaken || targetClosed) && (
                    <p className="text-sm text-[var(--semantic-brand-danger)]">
                      {targetClosed ? "休業日は登録できません" : "すでに登録されている日です"}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-[#d0d0d0] flex gap-2 h-12 items-center justify-end px-4 rounded-lg w-[200px] max-w-[50%] shrink-0">
                  <p className="flex-1 min-w-0 text-base text-[var(--semantic-text-primary)]">{formatDateSlash(dateKey)}</p>
                  <img src={iconCalendar} alt="" aria-hidden className="size-6 shrink-0" />
                </div>
              )}
            </div>

            <div className="h-px w-full bg-[#d0d0d0]" />

            <div className="flex flex-col items-start rounded-lg w-full bg-white">
              <div className="flex gap-2 h-16 items-center justify-between p-2 w-full">
                <p className="flex gap-1 items-start text-lg text-[var(--semantic-text-primary)]">
                  検査対象製品
                  <span className="text-xs text-[var(--semantic-brand-danger)]">※</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openPicker}
                    className="bg-white border border-[var(--semantic-brand-primary)] flex gap-1 h-12 items-center justify-center rounded-lg text-base text-[var(--semantic-brand-primary)] w-[200px] shrink-0"
                  >
                    <MaskIcon src={iconPlus} color="var(--semantic-brand-primary)" />
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
              <div className="flex flex-col items-center p-4 w-full">
                {scheduled.length === 0 ? (
                  <div className="flex items-center w-full py-4">
                    <p className="text-sm leading-6 text-[var(--semantic-text-primary)]">登録された製品がありません</p>
                  </div>
                ) : (
                  scheduled.map((item, index) => (
                    <Fragment key={item.productId}>
                      {index > 0 && <div className="h-px w-full bg-[#d0d0d0] my-4" />}
                      {/* 見出し 136＋8、行は 12px おき、ゴミ箱は 24px 離して上下中央 */}
                      <div className="flex items-center gap-6 w-full">
                        <div className="flex-1 min-w-0 grid grid-cols-[176px_1fr] gap-x-2 gap-y-3 items-center">
                          <p className="text-base text-[var(--semantic-text-primary)]">製品名</p>
                          <div className="flex flex-col gap-2 min-w-0">
                            <p className="text-base leading-4 text-[var(--semantic-text-primary)] truncate">
                              {productName(item.productId)}
                            </p>
                            <CriteriaTags />
                          </div>
                          <p className="text-base text-[var(--semantic-text-primary)]">製造日</p>
                          <DateFilterInput
                            value={item.manufactureDate}
                            onChange={(value) => updateItem(item.productId, { manufactureDate: value })}
                            className="w-[200px] [&_input]:h-10"
                          />
                          <p className="text-base text-[var(--semantic-text-primary)]">比較製品</p>
                          <div className="flex gap-2 items-center">
                            {COMPARISON_OPTIONS.map((opt) => {
                              const active = item.comparison === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => setComparison(item.productId, opt.value)}
                                  className={`bg-white border h-10 w-[120px] rounded-lg text-base shrink-0 ${
                                    active
                                      ? "border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                                      : "border-[#d0d0d0] text-[var(--semantic-text-secondary)]"
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                          {item.comparison === "present" && (() => {
                            // 管理画面の点検予定の新規登録と同じ：比較製品の日付 → プルダウンで種類を選ぶと右にカレンダー
                            const dateType = dateTypeOf(item);
                            return (
                              <>
                                <p className="text-base text-[var(--semantic-text-primary)] whitespace-nowrap">比較製品の日付</p>
                                <div className="flex gap-2 items-center">
                                  <Pulldown
                                    value={dateType ?? ""}
                                    onChange={(value) => setComparisonDateType(item, value as ComparisonDateType)}
                                    options={COMPARISON_DATE_OPTIONS}
                                    placeholder="選択してください"
                                    className="bg-white border border-[#d0d0d0] h-10 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px]"
                                  />
                                  {dateType && (
                                    <DateFilterInput
                                      value={
                                        (dateType === "bestBefore"
                                          ? item.comparisonBestBeforeDate
                                          : item.comparisonManufactureDate) ?? ""
                                      }
                                      onChange={(value) =>
                                        updateItem(
                                          item.productId,
                                          dateType === "bestBefore"
                                            ? { comparisonDateType: dateType, comparisonBestBeforeDate: value }
                                            : { comparisonDateType: dateType, comparisonManufactureDate: value }
                                        )
                                      }
                                      className="w-[200px] [&_input]:h-10"
                                    />
                                  )}
                                </div>
                              </>
                            );
                          })()}
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
          onClick={() => {
            // 登録済みの日の編集から「戻る」は、変更を捨てて詳細へ戻す
            if (existing && viewMode === "edit") {
              setScheduled(existing.products);
              setViewMode("view");
              return;
            }
            // 複製して登録は元の日の詳細へ。詳細・新規登録は点検予定の TOP へ（履歴に頼ると枠の中や直接開いたときに管理画面へ飛ぶため）
            navigate(copy ? `/app/schedule/sensory-inspection/${scheduleDateKey}` : "/app/schedule");
          }}
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
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-6 items-center px-6 py-8 w-full max-w-[480px] mx-40 max-h-[85vh]">
            <h2 className="text-2xl text-[var(--semantic-text-primary)]">製品追加</h2>
            <div className="flex gap-2 items-center w-full">
              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="製品名を入力"
                className="flex-1 bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
              />
              <button
                type="button"
                className="bg-white border border-[var(--semantic-brand-primary)] h-12 px-4 rounded-lg text-base text-[var(--semantic-brand-primary)] shrink-0"
              >
                検索
              </button>
            </div>
            <div className="bg-white flex flex-col items-start rounded-lg w-full overflow-y-auto overflow-x-hidden flex-1">
              {pickerProducts.length === 0 ? (
                <p className="text-base text-[var(--semantic-text-secondary)] px-4 py-4">該当する製品がありません</p>
              ) : (
                pickerProducts.map((p) => {
                  const checked = pickerSelected.has(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePickerProduct(p.id)}
                      className="flex items-center gap-2 px-4 py-3 w-full border-b border-[#d0d0d0] last:border-b-0 text-left"
                    >
                      <img
                        src={checked ? iconCheckboxOn : iconCheckbox}
                        alt=""
                        aria-hidden="true"
                        className="size-6 shrink-0"
                      />
                      <span className="text-base text-[var(--semantic-text-primary)] flex-1">{p.name}</span>
                      <CriteriaTags />
                    </button>
                  );
                })
              )}
            </div>
            <div className="flex gap-4 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-40 rounded-lg text-base text-[var(--semantic-text-primary)]"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={confirmPicker}
                className="bg-[var(--semantic-brand-primary)] h-12 w-40 rounded-lg text-base text-white"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-full max-w-[480px] mx-40">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                {deleteTitle}
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)]">
                削除した情報は元に戻せません。本当に削除しますか？
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
                onClick={confirmDelete}
                className="bg-[var(--semantic-brand-danger)] h-12 w-[200px] rounded-lg text-base text-white"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
