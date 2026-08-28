import { useState } from "react";

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

const MAIN_PRODUCTS: Product[] = [
  { id: "p1", name: "仕出しだし巻き玉子 冷凍" },
  { id: "p2", name: "茶碗蒸しの素（濃縮）" },
  { id: "p3", name: "唐揚げ粉ミックス" },
  { id: "p4", name: "冷凍えび" },
  { id: "p5", name: "揚げ玉" },
];

const ALL_PRODUCTS: Product[] = [
  { id: "p1", name: "仕出しだし巻き玉子 冷凍" },
  { id: "p2", name: "茶碗蒸しの素（濃縮）" },
  { id: "p3", name: "唐揚げ粉ミックス" },
  { id: "p4", name: "冷凍えび" },
  { id: "p5", name: "揚げ玉" },
  { id: "p6", name: "パン粉（生）" },
  { id: "p7", name: "小麦粉" },
  { id: "p8", name: "鶏卵（液卵）" },
  { id: "p9", name: "塩" },
  { id: "p10", name: "砂糖" },
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

  const baseProducts = activeTab === "main" ? MAIN_PRODUCTS : ALL_PRODUCTS;
  const productsToDisplay = availableProducts.length > 0 ? availableProducts : baseProducts;
  const filteredProducts = productsToDisplay.filter((product) =>
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
    if (selectedProducts.length === baseProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(baseProducts.map((p) => p.id));
    }
  };

  const handleConfirm = () => {
    const selected = productsToDisplay.filter((p) =>
      selectedProducts.includes(p.id)
    );
    onConfirm(selected);
    setSelectedProducts([]);
    setSearchQuery("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <style>{`
        input[type="checkbox"]:checked {
          accent-color: #009944;
          background-color: #009944;
        }
      `}</style>
      {/* Dialog */}
      <div
        className="bg-[#F1EFEA] rounded-lg shadow-lg p-10 w-[640px] max-h-[80vh] flex flex-col gap-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div className="text-center">
          <h2 className="text-[24px] font-bold text-[#333]">
            通過製品を選択してください
          </h2>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4">
          {/* Tab */}
          <div className="flex bg-white rounded-lg h-12 gap-0 overflow-hidden border border-[#d0d0d0]">
            <button
              onClick={() => setActiveTab("main")}
              className={`flex-1 font-bold text-[16px] transition-colors ${
                activeTab === "main"
                  ? "bg-[#009944] text-white"
                  : "bg-white text-[#333]"
              }`}
            >
              主な通過製品
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 font-bold text-[16px] transition-colors ${
                activeTab === "all"
                  ? "bg-[#009944] text-white"
                  : "bg-white text-[#333]"
              }`}
            >
              全製品
            </button>
          </div>

          {/* Search */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="製品名を入力"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 bg-white border border-[#d0d0d0] rounded-lg text-[14px] text-[#333] placeholder:text-[#999]"
            />
            <button className="px-6 py-3 bg-white border-2 border-[#009944] rounded-lg text-[14px] text-[#009944] font-bold hover:bg-[#f9f9f9]">
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
              className="w-5 h-5 cursor-pointer accent-[#009944]"
            />
            <label htmlFor="selectAll" className="text-[14px] font-bold text-[#333]">
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
                    <span className="text-[14px] text-[#333] truncate">
                      {product.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-[#999]">
                製品がありません
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-10 justify-center">
          <button
            onClick={onClose}
            className="px-16 py-4 bg-white border-2 border-[#333] rounded-lg text-[16px] font-bold text-[#333] hover:bg-[#f9f9f9]"
          >
            閉じる
          </button>
          <button
            onClick={handleConfirm}
            className="px-16 py-4 bg-[#009944] rounded-lg text-[16px] font-bold text-white hover:opacity-90 disabled:opacity-50"
            disabled={selectedProducts.length === 0}
          >
            完了
          </button>
        </div>
      </div>
    </div>
  );
}
