import { useEffect, useState } from "react";
import { CANDIDATE_PRODUCTS } from "./mockData";

export function AddProductDialog({
  selectedNames,
  onClose,
  onConfirm,
}: {
  selectedNames: string[];
  onClose: () => void;
  onConfirm: (names: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<string[]>(selectedNames);

  useEffect(() => {
    setDraft(selectedNames);
  }, [selectedNames]);

  const filteredProducts = CANDIDATE_PRODUCTS.filter((name) => name.includes(search));

  function toggleProduct(name: string) {
    setDraft((prev) => (prev.includes(name) ? prev.filter((v) => v !== name) : [...prev, name]));
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
              filteredProducts.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleProduct(name)}
                  className="border-b border-[#d0d0d0] flex gap-2 items-center min-h-12 py-2 w-full text-left"
                >
                  <input
                    type="checkbox"
                    checked={draft.includes(name)}
                    readOnly
                    className="size-4 accent-[var(--semantic-brand-primary)]"
                  />
                  <span
                    className={`text-sm ${
                      draft.includes(name)
                        ? "text-[var(--semantic-brand-primary)]"
                        : "text-[var(--semantic-text-primary)]"
                    }`}
                  >
                    {name}
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
            className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={() => onConfirm(draft)}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
}
