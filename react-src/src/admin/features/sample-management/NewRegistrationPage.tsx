import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useSampleManagement } from "./SampleManagementContext";
import { CORE_SYSTEM_PRODUCT_NAMES } from "./mockData";

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
      setError("検体製品名は必須です");
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
          <div className="flex items-center bg-white h-12 px-4 rounded-lg w-full">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setPulldownOpen(true)}
              placeholder="例）仕出しだし巻き玉子 冷凍"
              className="bg-transparent h-full flex-1 text-base text-[var(--semantic-text-primary)] placeholder:text-[#808080] border-none focus:outline-none"
            />
            <svg className="w-6 h-6 ml-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.9422 18.4924C12.507 19.1887 11.493 19.1887 11.0578 18.4924L3.0625 5.7C2.59997 4.95994 3.13201 4 4.00472 4L19.9953 4C20.868 4 21.4 4.95995 20.9375 5.7L12.9422 18.4924Z" fill="#999999"/>
            </svg>
          </div>

          {pulldownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white shadow-[0px_0px_3px_rgba(51,51,51,0.24)] rounded-lg p-2 w-full z-10">
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
                      className="flex h-[42px] items-center px-4 rounded-lg w-full text-left text-base text-[var(--semantic-text-primary)] hover:bg-[var(--semantic-brand-primary)] hover:text-white"
                    >
                      {productName}
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
                    className="flex h-[42px] items-center px-4 rounded-lg w-full text-left text-base text-[var(--semantic-text-primary)] hover:bg-[var(--semantic-brand-primary)] hover:text-white"
                  >
                    {productName}
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
            className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
          >
            登録
          </button>
        </div>
      </div>
    </div>
  );
}
