import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useSampleManagement } from "./SampleManagementContext";
import { CORE_SYSTEM_PRODUCT_NAMES } from "./mockData";
import iconPulldown from "../../../assets/figma/icons/common/pulldown.svg";

export function NewRegistrationPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const { products, addProduct } = useSampleManagement();
  const navigate = useNavigate();
  const basePath = `/admin/ledger-management/sample-management/factories/${factoryId}`;

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pulldownOpen, setPulldownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const nqRepoNames = products.map((product) => product.name);
  // すでに検体対象に登録した製品は重ねて登録できない（候補では「登録済み」と灰色にして選べない。2026-10-08）
  const registered = new Set(nqRepoNames);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setPulldownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function selectName(value: string) {
    setName(value);
    setPulldownOpen(false);
  }

  function handleSubmit() {
    if (!name) {
      // 本番（Specimen/Product/StoreRequest の messages）の文言
      setError("検体製品名を選択してください。");
      return;
    }
    if (registered.has(name)) {
      // 本番に重複の専用の文言は無いので、unique の既定の文言（lang/ja/validation.php の unique）に合わせる
      setError("検体製品名は既に使用されています。");
      return;
    }
    addProduct(name);
    navigate(`${basePath}/products/new/complete`);
  }

  return (
    <div>
      <PageTitleBar title="新規登録" showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/sample-management" },
          { label: "検体管理", to: basePath },
          { label: "新規登録" },
        ]}
      />
      <div className="flex flex-col gap-10 items-start p-6">
        <div ref={containerRef} className="relative flex flex-col gap-1 items-start w-[480px]">
          <div className="flex gap-2 items-center">
            <p className="text-xl text-[var(--semantic-text-primary)]">検体製品名</p>
            <span className="text-sm text-[var(--semantic-brand-danger)]">※必須</span>
          </div>
          {/* 本番は TomSelect（create:false）で候補から選ぶだけ。手入力はしない（2026-10-08。確定デザイン 6296:132485）。
              見た目は周りの Pulldown（薬品管理の単位など）と同じ。data-nq-part は画面説明・再生が入力欄として数える印 */}
          <div data-nq-part="pulldown" className="w-full">
            <button
              type="button"
              onClick={() => setPulldownOpen((v) => !v)}
              className="flex items-center gap-2 bg-white h-12 px-4 rounded-lg w-full text-base text-[var(--semantic-text-primary)]"
            >
              <span
                className={`flex-1 min-w-0 text-left truncate ${
                  name ? "" : "text-[var(--semantic-text-secondary)] font-bold"
                }`}
              >
                {name || "例）仕出しだし巻き玉子 冷凍"}
              </span>
              <img
                src={iconPulldown}
                alt=""
                aria-hidden
                className={`inline-block size-4 shrink-0 transition-transform ${pulldownOpen ? "rotate-180" : ""}`}
                style={{ filter: "brightness(0) invert(0.5)" }}
              />
            </button>
          </div>

          {pulldownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white shadow-[0px_0px_3px_rgba(51,51,51,0.24)] rounded-lg p-2 w-full max-h-[290px] overflow-y-auto z-50">
              {nqRepoNames.length > 0 && (
                <div className="flex flex-col items-start w-full">
                  <div className="flex items-center justify-center py-2 w-full">
                    <p className="flex-1 text-base text-[var(--semantic-brand-primary)]">NQリポ</p>
                  </div>
                  {nqRepoNames.map((productName) => (
                    <button
                      key={productName}
                      type="button"
                      onClick={() => selectName(productName)}
                      disabled={registered.has(productName)}
                      aria-disabled={registered.has(productName)}
                      className={`flex h-[42px] items-center gap-2 px-4 rounded-lg w-full text-left text-base ${
                        registered.has(productName)
                          ? "text-[#b3b3b3] cursor-not-allowed"
                          : name === productName
                          ? "bg-[var(--semantic-brand-primary)] text-white"
                          : "text-[var(--semantic-text-primary)] hover:bg-[var(--semantic-background-page)]"
                      }`}
                    >
                      <span className="flex-1 min-w-0 truncate">{productName}</span>
                      {registered.has(productName) && <span className="shrink-0 text-sm">登録済み</span>}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex flex-col items-start w-full">
                <div className="flex items-center justify-center py-2 w-full">
                  <p className="flex-1 text-base text-[var(--semantic-brand-primary)]">基幹システム</p>
                </div>
                {CORE_SYSTEM_PRODUCT_NAMES.map((productName) => (
                  <button
                    key={productName}
                    type="button"
                    onClick={() => selectName(productName)}
                    disabled={registered.has(productName)}
                    aria-disabled={registered.has(productName)}
                    className={`flex h-[42px] items-center gap-2 px-4 rounded-lg w-full text-left text-base ${
                        registered.has(productName)
                          ? "text-[#b3b3b3] cursor-not-allowed"
                          : name === productName
                          ? "bg-[var(--semantic-brand-primary)] text-white"
                          : "text-[var(--semantic-text-primary)] hover:bg-[var(--semantic-background-page)]"
                      }`}
                  >
                    <span className="flex-1 min-w-0 truncate">{productName}</span>
                    {registered.has(productName) && <span className="shrink-0 text-sm">登録済み</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-[var(--semantic-brand-danger)]">{error}</p>}

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() => navigate(basePath)}
            className="bg-white shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
          >
            登録
          </button>
        </div>
      </div>
    </div>
  );
}
