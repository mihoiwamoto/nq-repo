import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Toast } from "../../components/Toast";
import { useSensoryInspection } from "./SensoryInspectionContext";
import { getFactoryName } from "../../../data/factories";
import { buildMonthGrid, formatDateLabel, formatMonthLabel, WEEKDAY_LABELS } from "./calendarUtils";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";
import iconArrowRight from "../../../assets/figma/icons/common/arrow-right.svg";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";
import iconEdit from "../../../assets/figma/icons/common/edit.svg";

export function CalendarPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const { products, scheduleEntries, removeScheduleEntry } = useSensoryInspection();
  const navigate = useNavigate();
  const location = useLocation();
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/ledger-management/sensory-inspection/factories/${factoryId}`;

  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(3);
  const [selectedDateKey, setSelectedDateKey] = useState("2025-04-01");
  const [showDeletedToast, setShowDeletedToast] = useState(false);
  const [showUpdateToast, setShowUpdateToast] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const state = location.state as { justSaved?: boolean; date?: string } | null;
    if (state?.justSaved) {
      if (state.date) {
        setSelectedDateKey(state.date);
        const [y, m] = state.date.split("-").map(Number);
        setYear(y);
        setMonth(m - 1);
      }
      setShowUpdateToast(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const grid = buildMonthGrid(year, month);
  const selectedEntry = scheduleEntries[selectedDateKey];
  const selectedProducts = selectedEntry?.productIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  function goToMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  function confirmDeleteEntry() {
    removeScheduleEntry(selectedDateKey);
    setDeleteDialogOpen(false);
    setShowDeletedToast(true);
  }

  return (
    <div>
      <PageTitleBar
        title="点検予定"
        showBack
        action={
          <Link
            to={`${basePath}/schedule/register?date=${selectedDateKey}`}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg flex items-center justify-center gap-1 text-white text-base"
          >
            + 新規登録
          </Link>
        }
      />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/sensory-inspection" },
          { label: "検査製品選択", to: basePath },
          { label: "点検予定" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-[270px]">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>
        <div className="flex gap-6 items-start">
          <div className="flex flex-col gap-2 items-start">
            <div className="flex items-center justify-between w-56">
              <button
                type="button"
                onClick={() => goToMonth(-1)}
                className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] size-10 rounded-lg flex items-center justify-center"
              >
                <span
                  aria-hidden
                  className="inline-block size-5 shrink-0"
                  style={{
                    WebkitMaskImage: `url("${iconArrowLeft}")`,
                    maskImage: `url("${iconArrowLeft}")`,
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    backgroundColor: "var(--semantic-brand-primary)",
                  }}
                />
              </button>
              <p className="text-lg text-[var(--semantic-text-primary)]">
                {formatMonthLabel(year, month)}
              </p>
              <button
                type="button"
                onClick={() => goToMonth(1)}
                className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] size-10 rounded-lg flex items-center justify-center"
              >
                <span
                  aria-hidden
                  className="inline-block size-5 shrink-0"
                  style={{
                    WebkitMaskImage: `url("${iconArrowRight}")`,
                    maskImage: `url("${iconArrowRight}")`,
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    backgroundColor: "var(--semantic-brand-primary)",
                  }}
                />
              </button>
            </div>
            <div className="bg-white border border-[#d0d0d0] rounded-lg overflow-hidden">
              <div className="flex items-center">
                {WEEKDAY_LABELS.map((label, i) => (
                  <div
                    key={label}
                    className={`bg-white border border-[#d0d0d0] flex items-center justify-center p-2 size-8 text-sm ${
                      i === 0
                        ? "text-[var(--semantic-brand-danger)]"
                        : i === 6
                          ? "text-[#1057f0]"
                          : "text-[var(--semantic-text-primary)]"
                    }`}
                  >
                    {label}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap w-56">
                {grid.map((cell) => {
                  const isSelected = cell.dateKey === selectedDateKey;
                  return (
                    <button
                      key={cell.dateKey}
                      type="button"
                      onClick={() => setSelectedDateKey(cell.dateKey)}
                      className="bg-white border border-[#d0d0d0] flex flex-col items-center justify-center p-1 size-8"
                    >
                      <span
                        className={`flex flex-col items-center justify-center rounded-full size-7 text-sm ${
                          isSelected
                            ? "bg-[#fdb045] text-white"
                            : cell.monthOffset !== 0
                              ? "text-[#d0d0d0]"
                              : "text-[var(--semantic-text-primary)]"
                        }`}
                      >
                        {cell.day}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="bg-white flex flex-col rounded-lg w-[912px]">
            <div className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.16)] flex gap-6 items-center px-4 py-3 rounded-t-lg">
              <p className="flex-1 text-base text-[var(--semantic-text-primary)]">
                {formatDateLabel(selectedDateKey)}
              </p>
              {selectedProducts && selectedProducts.length > 0 && (
                <>
                  <Link
                    to={`${basePath}/schedule/register?date=${selectedDateKey}`}
                    className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center gap-1 text-sm text-[var(--semantic-brand-primary)]"
                  >
                    <img src={iconEdit} alt="編集" className="size-5" />
                    編集
                  </Link>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMenuOpen((v) => !v)}
                      className="size-10 rounded-full flex items-center justify-center text-xl text-[var(--semantic-text-primary)]"
                    >
                      ⋮
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 top-full mt-1 bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg py-2 w-[220px] z-10">
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            navigate(`${basePath}/schedule/register?duplicateFrom=${selectedDateKey}`);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-[var(--semantic-text-primary)] hover:bg-[var(--semantic-background-page)]"
                        >
                          この内容を複製して登録
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            setDeleteDialogOpen(true);
                          }}
                          className="w-full px-4 py-2 hover:bg-[var(--semantic-background-page)]"
                        >
                          <span className="bg-white border border-[var(--semantic-brand-danger)] rounded-lg flex items-center justify-center size-8 shrink-0">
                            <img src={iconTrash} alt="削除" className="size-5" />
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-col px-4 py-2">
              {!selectedProducts || selectedProducts.length === 0 ? (
                <p className="py-4 text-base text-[var(--semantic-text-secondary)]">
                  登録された製品がありません
                </p>
              ) : (
                selectedProducts.map((product, i) => (
                  <div key={`${product.id}-${i}`}>
                    <div className="flex gap-4 h-12 items-center">
                      <span className="text-base text-[var(--semantic-text-primary)] w-28">
                        製品名
                      </span>
                      <span className="flex-1 text-base text-[var(--semantic-text-primary)] text-right">
                        {product.name}
                      </span>
                    </div>
                    {i < selectedProducts.length - 1 && <div className="border-t border-[#d0d0d0]" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px]">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                検査製品設定の削除
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)]">
                削除した情報は元に戻せません。本当に削除しますか？
              </p>
            </div>
            <div className="flex gap-6 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={confirmDeleteEntry}
                className="bg-[var(--semantic-brand-danger)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeletedToast && <Toast message="削除されました。" onClose={() => setShowDeletedToast(false)} />}
      {showUpdateToast && <Toast message="更新されました。" onClose={() => setShowUpdateToast(false)} />}
    </div>
  );
}
