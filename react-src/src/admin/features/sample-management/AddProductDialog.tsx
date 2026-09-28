import { useEffect, useState } from "react";
import { useSampleManagement } from "./SampleManagementContext";

export function AddProductDialog({
  selectedIds,
  onClose,
  onConfirm,
}: {
  selectedIds: string[];
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
}) {
  const { products } = useSampleManagement();
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<string[]>(selectedIds);

  useEffect(() => {
    setDraft(selectedIds);
  }, [selectedIds]);

  const filteredProducts = products.filter((product) => product.name.includes(search));

  function toggleProduct(id: string) {
    setDraft((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] h-[738px]">
        <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">製品追加</h2>
        <div className="flex flex-col gap-4 items-start w-full">
          <div className="flex gap-4 items-start w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="製品名を入力"
              className="bg-white border border-[#808080] flex-1 h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
            />
            <button
              type="button"
              className="bg-white border border-[var(--semantic-brand-primary)] h-12 w-[120px] rounded-lg text-base text-[var(--semantic-brand-primary)]"
            >
              検索
            </button>
          </div>
          <div className="bg-white flex flex-col h-[308px] overflow-y-auto px-4 rounded-lg w-full">
            {filteredProducts.length === 0 ? (
              <p className="py-4 text-sm text-[var(--semantic-text-secondary)]">
                該当する製品がありません
              </p>
            ) : (
              filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggleProduct(product.id)}
                  className="border-b border-[#d0d0d0] flex gap-2 items-center min-h-12 py-2 w-full text-left"
                >
                  <input
                    type="checkbox"
                    checked={draft.includes(product.id)}
                    readOnly
                    className="size-4 accent-[var(--semantic-brand-primary)]"
                  />
                  <span
                    className={`text-sm ${
                      draft.includes(product.id)
                        ? "text-[var(--semantic-brand-primary)]"
                        : "text-[var(--semantic-text-primary)]"
                    }`}
                  >
                    {product.name}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
        <div className="flex gap-10 items-center justify-center w-full">
          <button
            type="button"
            onClick={onClose}
            className="bg-white border border-[#333] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
          >
            閉じる
          </button>
          <button
            type="button"
            onClick={() => onConfirm(draft)}
            className="bg-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-xl text-white"
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
}
