import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { getCompanyName } from "../../../data/companies";
import { ledgerCategories } from "../../../data/ledgers";
import { buildMonthGrid, formatMonthLabel, WEEKDAY_LABELS } from "./calendarUtils";
import { useFactoryManagement } from "./FactoryManagementContext";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";
import iconCheckmark from "../../../assets/figma/icons/common/checkmark.svg";
import iconXMark from "../../../assets/figma/icons/common/x-mark.svg";
import iconArrowLeft from "../../../assets/figma/icons/common/arrow-left.svg";
import iconArrowRight from "../../../assets/figma/icons/common/arrow-right.svg";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 items-start w-full">
      <div className="w-40 shrink-0 text-xl text-[var(--semantic-brand-primary)] pt-1">{label}</div>
      <div className="flex-1 text-xl text-[var(--semantic-text-primary)]">{children}</div>
    </div>
  );
}

export function FactoryDetailPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const { factories, removeFactory } = useFactoryManagement();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const factory = factories.find((f) => f.id === factoryId);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showUpdatedToast, setShowUpdatedToast] = useState(
    Boolean((routerLocation.state as { justUpdated?: boolean } | null)?.justUpdated)
  );
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(3);

  useEffect(() => {
    if (!showUpdatedToast) return;
    const timer = setTimeout(() => setShowUpdatedToast(false), 3000);
    return () => clearTimeout(timer);
  }, [showUpdatedToast]);

  if (!factory) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">工場が見つかりません</p>
      </div>
    );
  }

  function handleDelete() {
    removeFactory(factory!.id);
    navigate("/admin/factory/deleted");
  }

  function goToMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  const grid = buildMonthGrid(year, month);
  const closedDaySet = new Set(factory.closedDays);
  const enabledCategories = ledgerCategories.filter((category) =>
    factory.ledgerSlugs.includes(category.slug)
  );

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb items={[{ label: "工場管理", to: "/admin/factory" }, { label: "詳細" }]} />
      <div className="flex flex-col gap-4 items-start p-6">
        <div className="flex items-center justify-end w-full gap-2">
          <button
            type="button"
            onClick={() => navigate(`/admin/factory/${factory.id}/edit`)}
            className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center gap-1 text-sm text-[var(--semantic-brand-primary)]"
          >
            ✎ 編集
          </button>
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            className="bg-white border border-[var(--semantic-brand-danger)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-10 rounded-lg flex items-center justify-center"
          >
            <img src={iconTrash} alt="削除" className="size-6" />
          </button>
        </div>

        <div className="bg-white flex flex-col gap-6 items-start px-4 py-6 rounded-lg w-full">
          <Row label="工場名">{factory.name}</Row>
          <div className="border-t border-[#d0d0d0] w-full" />
          <Row label="工場住所">{factory.address || "未登録"}</Row>
          <div className="border-t border-[#d0d0d0] w-full" />
          <Row label="企業名">{getCompanyName(factory.companyId)}</Row>
          <div className="border-t border-[#d0d0d0] w-full" />
          <Row label="工場ID">{factory.loginId}</Row>
          <div className="border-t border-[#d0d0d0] w-full" />
          <Row label="パスワード">{factory.hasPassword ? "登録済み" : "未登録"}</Row>
          <div className="border-t border-[#d0d0d0] w-full" />

          <Row label="休業日">
            <div className="flex flex-col gap-2 items-start">
              <div className="flex items-center justify-between w-[560px]">
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
                <p className="text-xl text-[var(--semantic-text-primary)]">
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
              <div className="bg-white rounded-lg overflow-hidden w-[560px]">
                <div className="flex items-center">
                  {WEEKDAY_LABELS.map((label, i) => (
                    <div
                      key={label}
                      className={`bg-white border border-[#d0d0d0] flex items-center justify-center p-2 h-8 w-20 text-base ${
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
                <div className="flex flex-wrap">
                  {grid.map((cell) => {
                    const isClosed = cell.monthOffset === 0 && closedDaySet.has(cell.dateKey);
                    const weekday = new Date(cell.dateKey).getDay();
                    return (
                      <div
                        key={cell.dateKey}
                        className={`flex flex-col gap-1 items-end p-1 h-16 w-20 border border-[#d0d0d0] ${
                          isClosed ? "bg-[#ddf3e7]" : "bg-white"
                        }`}
                      >
                        <span
                          className={`text-base ${
                            cell.monthOffset !== 0
                              ? "text-[#d0d0d0]"
                              : weekday === 0
                                ? "text-[var(--semantic-brand-danger)]"
                                : weekday === 6
                                  ? "text-[#1057f0]"
                                  : "text-[var(--semantic-text-primary)]"
                          }`}
                        >
                          {cell.day}
                        </span>
                        {isClosed && (
                          <span className="bg-[var(--semantic-brand-primary)] text-white text-sm rounded-lg px-2 py-1 w-full text-center">
                            休業日
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Row>
          <div className="border-t border-[#d0d0d0] w-full" />

          <Row label="点検項目">
            {enabledCategories.length === 0 ? (
              <p className="text-base text-[var(--semantic-text-secondary)]">
                点検項目は登録されていません
              </p>
            ) : (
              <div className="flex flex-wrap gap-6 items-start">
                {enabledCategories.map((category) => (
                  <div
                    key={category.slug}
                    className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg h-16 w-[270px] flex items-center gap-2 px-2"
                  >
                    <img src={category.adminIcon} alt="" className="size-6 shrink-0" />
                    <span className="text-base text-[var(--semantic-brand-primary)]">
                      {category.adminLabel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Row>
        </div>
      </div>

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px]">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                工場情報を削除
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)]">
                削除した情報は元に戻せません。削除しますか？
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
                onClick={handleDelete}
                className="bg-[var(--semantic-brand-danger)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpdatedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex items-center gap-2 px-4 py-3 w-[340px]">
          <img src={iconCheckmark} alt="" className="size-5" />
          <p className="text-sm text-[var(--semantic-text-primary)] flex-1">工場が更新されました</p>
          <button
            type="button"
            onClick={() => setShowUpdatedToast(false)}
            className="text-[var(--semantic-text-secondary)]"
          >
            <img src={iconXMark} alt="閉じる" className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
