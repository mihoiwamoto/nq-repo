import { useState } from "react";
import iconPlus from "../../../assets/figma/icons/common/plus.svg";

export interface Product {
  id: string;
  name: string;
}

interface ProductSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedProducts: Product[]) => void;
  availableProducts: Product[];
}

const SAMPLE_PRODUCTS: Product[] = [
  { id: "p1", name: "仕出しだし巻き玉子 冷凍" },
  { id: "p2", name: "茶碗蒸しの素（濃縮）" },
  { id: "p3", name: "唐揚げ粉ミックス" },
  { id: "p4", name: "冷凍えび" },
];

export function ProductSelectionDialog({
  isOpen,
  onClose,
  onConfirm,
  availableProducts = SAMPLE_PRODUCTS,
}: ProductSelectionDialogProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"main" | "all">("main");

  if (!isOpen) return null;

  const filteredProducts = availableProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  const handleConfirm = () => {
    const selected = availableProducts.filter((p) =>
      selectedProducts.includes(p.id)
    );
    onConfirm(selected);
    setSelectedProducts([]);
    setSearchQuery("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-[#f1efea] rounded-lg shadow-lg p-10 w-[640px] max-h-[80vh] flex flex-col gap-10">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-black">
            通過製品を選択してください
          </h2>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4">
          {/* Tab */}
          <div className="flex bg-white rounded-lg h-10">
            <button
              onClick={() => setActiveTab("main")}
              className={`flex-1 font-semibold rounded-lg text-sm ${
                activeTab === "main"
                  ? "bg-[#094] text-white"
                  : "text-[#808080]"
              }`}
            >
              主な通過製品
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 font-semibold rounded-lg text-sm ${
                activeTab === "all"
                  ? "bg-[#094] text-white"
                  : "text-[#808080]"
              }`}
            >
              全製品
            </button>
          </div>

          {/* Search */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="製品名を入力"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 border border-[#808080] rounded-lg text-sm text-[#333]"
            />
            <button className="px-6 py-3 border border-[#094] rounded-lg text-sm text-[#094] font-semibold hover:bg-[#f0f0f0]">
              検索
            </button>
          </div>

          {/* Select All */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="selectAll"
              checked={
                selectedProducts.length === filteredProducts.length &&
                filteredProducts.length > 0
              }
              onChange={selectAll}
              className="w-5 h-5 cursor-pointer"
            />
            <label htmlFor="selectAll" className="text-sm font-semibold">
              すべて選択
            </label>
          </div>

          {/* Product List */}
          <div className="bg-white rounded-lg h-80 overflow-y-auto border border-[#d0d0d0]">
            {filteredProducts.length > 0 ? (
              <div className="divide-y divide-[#d0d0d0]">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => toggleProductSelection(product.id)}
                    className="w-full px-4 py-3 text-left hover:bg-[#f9f9f9] flex items-center gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => {}}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm text-[#333] truncate">
                      {product.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-[#808080]">
                製品がありません
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-10 justify-center">
          <button
            onClick={onClose}
            className="px-12 py-4 border border-[#333] rounded-lg text-lg font-semibold text-[#333] hover:bg-[#f9f9f9]"
          >
            閉じる
          </button>
          <button
            onClick={handleConfirm}
            className="px-12 py-4 bg-[#094] rounded-lg text-lg font-semibold text-white hover:bg-[#077] disabled:opacity-50"
            disabled={selectedProducts.length === 0}
          >
            完了
          </button>
        </div>
      </div>
    </div>
  );
}
