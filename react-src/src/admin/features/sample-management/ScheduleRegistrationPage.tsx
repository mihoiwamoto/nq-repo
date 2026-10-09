import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useSampleManagement } from "./SampleManagementContext";
import { AddProductDialog } from "./AddProductDialog";
import { DateFilterInput } from "../../components/DateFilterInput";
import type { ScheduleProductDetail } from "./types";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";

export function ScheduleRegistrationPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const basePath = `/admin/ledger-management/sample-management/factories/${factoryId}`;
  const { products, scheduleEntries, upsertScheduleEntry } = useSampleManagement();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialDate = searchParams.get("date") ?? "";
  const duplicateFrom = searchParams.get("duplicateFrom") ?? "";
  const existingEntry = initialDate ? scheduleEntries[initialDate] : undefined;
  const isEditing = Boolean(existingEntry);

  const [date, setDate] = useState(initialDate);
  const [productIds, setProductIds] = useState<string[]>(
    existingEntry?.productIds ?? scheduleEntries[duplicateFrom]?.productIds ?? []
  );
  // 製品ごとの製造日・ロットNo.（任意）。初期値は予定に保存した値、無ければ製品マスタの値
  const [details, setDetails] = useState<Record<string, ScheduleProductDetail>>(
    existingEntry?.details ?? scheduleEntries[duplicateFrom]?.details ?? {}
  );
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [error, setError] = useState("");

  const selectedProducts = productIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  function detailOf(id: string): ScheduleProductDetail {
    const product = products.find((p) => p.id === id);
    return details[id] ?? { manufactureDate: product?.manufactureDate ?? "", lotNumber: product?.lotNumber ?? "" };
  }

  function setDetail(id: string, patch: ScheduleProductDetail) {
    setDetails((prev) => ({ ...prev, [id]: { ...detailOf(id), ...patch } }));
  }

  function handleSubmit() {
    // 本番（Calendar/StoreRequest の messages）は項目ごとのエラー
    const messages: string[] = [];
    if (!date) messages.push("製造予定日は必須です。");
    if (productIds.length === 0) messages.push("製品は必須です。");
    if (messages.length > 0) {
      setError(messages.join("\n"));
      return;
    }
    upsertScheduleEntry(
      date,
      productIds,
      Object.fromEntries(productIds.map((id) => [id, detailOf(id)]))
    );
    if (isEditing) {
      navigate(`${basePath}/schedule`, { state: { justSaved: true, date } });
    } else {
      navigate(`${basePath}/schedule/register/complete?date=${date}`);
    }
  }

  function confirmDeleteAll() {
    setProductIds([]);
    setDeleteAllDialogOpen(false);
    setMenuOpen(false);
    // 本番（calendar/create.js の deleteCalendarEvents）は外すだけでトーストを出さない
  }

  function confirmDeleteProduct() {
    if (!productToDelete) return;
    setProductIds((prev) => prev.filter((id) => id !== productToDelete));
    setProductToDelete(null);
  }

  const productToDeleteName = products.find((p) => p.id === productToDelete)?.name;

  return (
    <div>
      <PageTitleBar title={isEditing ? "編集" : "新規登録"} showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/sample-management" },
          { label: "検体管理", to: basePath },
          { label: "点検予定", to: `${basePath}/schedule` },
          { label: isEditing ? "編集" : "新規登録" },
        ]}
      />
      <div className="flex flex-col gap-10 items-start p-6">
        <div className="flex flex-col gap-6 items-start w-full">
          <div className="flex flex-col gap-1 items-start w-[300px]">
            <div className="flex gap-2 items-center">
              <p className="text-xl text-[var(--semantic-text-primary)]">日付</p>
              <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
            </div>
            <DateFilterInput className="w-full" value={date} onChange={setDate} />
          </div>

          <div className="flex flex-col items-start rounded-lg w-full overflow-hidden">
            <div className="bg-white flex gap-6 items-center p-4 w-full">
              <div className="flex-1 flex gap-2 items-center">
                <p className="text-xl text-[var(--semantic-text-primary)]">検体対象製品</p>
                <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
              </div>
              <button
                type="button"
                onClick={() => setAddDialogOpen(true)}
                className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg flex items-center justify-center gap-1 text-base text-[var(--semantic-brand-primary)]"
              >
                + 製品追加
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="size-12 rounded-full flex items-center justify-center text-2xl text-[var(--semantic-text-primary)]"
                >
                  ⋮
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg py-2 w-[220px] z-10">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setDeleteAllDialogOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-base text-[var(--semantic-text-primary)] hover:bg-[var(--semantic-background-page)]"
                    >
                      製品全削除
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-[#d0d0d0] w-full" />
            <div className="bg-white flex flex-col items-center px-4 w-full">
              {selectedProducts.length === 0 ? (
                <p className="py-4 text-sm text-[var(--semantic-text-primary)] w-full">
                  データがありません。
                </p>
              ) : (
                selectedProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className={`flex items-center w-full gap-6 py-4 ${
                      index > 0 ? "border-t border-[#d0d0d0]" : ""
                    }`}
                  >
                    <div className="flex-1 flex flex-col gap-3 items-start">
                      <div className="flex gap-2 items-start w-full">
                        <span className="w-[162px] shrink-0 text-base leading-4 text-[var(--semantic-text-primary)]">
                          製品名
                        </span>
                        <span className="flex-1 text-base leading-4 text-[var(--semantic-text-primary)]">
                          {product.name}
                        </span>
                      </div>
                      {/* 製造日・ロットNo. は製品ごとの入力欄（任意。確定デザイン 6296:132592） */}
                      <div className="flex gap-2 items-center w-full">
                        <span className="w-[162px] shrink-0 flex gap-2 items-center text-base leading-4 text-[var(--semantic-text-primary)]">
                          製造日
                          <span className="text-sm text-[var(--semantic-text-secondary)]">※任意</span>
                        </span>
                        {/* 白いカードの上なので枠線のある filter の見た目（確定デザインも枠線つき） */}
                        <DateFilterInput
                          className="w-[200px]"
                          placeholder="日付を選択"
                          value={detailOf(product.id).manufactureDate ?? ""}
                          onChange={(v) => setDetail(product.id, { manufactureDate: v })}
                        />
                      </div>
                      <div className="flex gap-2 items-center w-full">
                        <span className="w-[162px] shrink-0 flex gap-2 items-center text-base leading-4 text-[var(--semantic-text-primary)]">
                          ロットNo.
                          <span className="text-sm text-[var(--semantic-text-secondary)]">※任意</span>
                        </span>
                        <input
                          type="text"
                          value={detailOf(product.id).lotNumber ?? ""}
                          onChange={(e) => setDetail(product.id, { lotNumber: e.target.value })}
                          placeholder="例）XXXXXX"
                          className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[200px] placeholder:text-[var(--semantic-text-secondary)]"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProductToDelete(product.id)}
                      className="bg-white border border-[var(--semantic-brand-danger)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] size-10 rounded-lg flex items-center justify-center shrink-0"
                    >
                      <img src={iconTrash} alt="削除" className="size-6" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {error && <p className="whitespace-pre-line text-sm text-[var(--semantic-brand-danger)]">{error}</p>}

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() => navigate(`${basePath}/schedule`)}
            className="bg-white shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
          >
            {isEditing ? "保存" : "登録"}
          </button>
        </div>
      </div>

      {addDialogOpen && (
        <AddProductDialog
          selectedIds={productIds}
          onClose={() => setAddDialogOpen(false)}
          onConfirm={(ids) => {
            setProductIds(ids);
            setAddDialogOpen(false);
          }}
        />
      )}

      {deleteAllDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 本番どおり背景を押しても閉じない（data-bs-backdrop="static"。2026-10-08） */}
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px]">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                全製品の削除
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)]">
                削除した情報は元に戻せません。削除しますか？
              </p>
            </div>
            <div className="flex gap-6 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setDeleteAllDialogOpen(false)}
                className="bg-white shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={confirmDeleteAll}
                className="bg-[var(--semantic-brand-danger)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}

      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 本番どおり背景を押しても閉じない（data-bs-backdrop="static"。2026-10-08） */}
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px]">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                {productToDeleteName}の削除
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)]">
                削除した情報は元に戻せません。削除しますか？
              </p>
            </div>
            <div className="flex gap-6 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="bg-white shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                className="bg-[var(--semantic-brand-danger)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
