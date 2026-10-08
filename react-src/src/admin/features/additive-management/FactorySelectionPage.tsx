import { useState } from "react";
import { Link } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import iconSearch from "../../../assets/figma/icons/common/search.svg";
import { useRoleFactories } from "../../data/useRoleFactories";
import iconPlus from "../../../assets/figma/icons/common/plus.svg";
import iconMinus from "../../../assets/figma/icons/common/minus.svg";

export function FactorySelectionPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  // 承認者は権限のある工場だけ、管理者は全工場（useRoleFactories）

  const roleFactories = useRoleFactories();

  const factories = roleFactories.filter((f) => f.name.includes(query));

  return (
    <div>
      <PageTitleBar title="工場選択" showBack />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="bg-white flex flex-col gap-2 items-start p-4 rounded-lg w-full">
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className="flex gap-2 items-center h-5 text-base text-[var(--semantic-brand-primary)]"
          >
            {/* 確定デザイン 7139:163661：文字と 20px のアイコンを 8px あけて並べる */}
            <span>絞り込み検索</span>
            <span
              aria-hidden
              className="inline-block size-5 shrink-0"
              style={{
                WebkitMaskImage: `url("${filterOpen ? iconMinus : iconPlus}")`,
                maskImage: `url("${filterOpen ? iconMinus : iconPlus}")`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                backgroundColor: "var(--semantic-brand-primary)",
              }}
            />
          </button>
          {filterOpen && (
            // 本番（inspects/factories.blade.php）：「工場名で探す」の欄と リセット・検索 のボタン。検索を押して（Enter でも）絞り込む
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setQuery(search);
              }}
              className="flex flex-wrap gap-4 items-center justify-between w-full"
            >
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="工場名で探す"
                className="bg-white border border-[#d0d0d0] h-10 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full max-w-md placeholder:text-[var(--semantic-text-secondary)]"
              />
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setQuery("");
                  }}
                  className="bg-white border border-[#808080] h-10 w-20 rounded-lg text-sm text-[var(--semantic-text-secondary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)]"
                >
                  リセット
                </button>
                <button
                  type="submit"
                  className="bg-[var(--semantic-brand-primary)] h-10 w-[120px] rounded-lg text-base text-white flex items-center justify-center gap-1 shadow-[0px_2px_4px_rgba(51,51,51,0.24)]"
                >
                  <img src={iconSearch} alt="" className="size-5" />
                  検索
                </button>
              </div>
            </form>
          )}
        </div>
        <div className="border-t border-[#d0d0d0] w-full" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
          {factories.map((factory) => (
            <Link
              key={factory.id}
              to={`factories/${factory.id}`}
              className="bg-white shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg h-20 w-full min-w-0 flex items-center px-4 text-xl text-[var(--semantic-text-primary)]"
            >
              {factory.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
