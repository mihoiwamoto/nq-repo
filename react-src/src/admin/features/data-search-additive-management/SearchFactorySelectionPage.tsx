import { useState } from "react";
import { Link } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { FACTORIES } from "../../../data/factories";
import iconPlus from "../../../assets/figma/icons/common/plus.svg";
import iconMinus from "../../../assets/figma/icons/common/minus.svg";

export function SearchFactorySelectionPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");

  const factories = FACTORIES.filter((f) => f.name.includes(search));

  return (
    <div>
      <PageTitleBar title="工場選択" showBack />
      <Breadcrumb
        items={[
          { label: "データ検索", to: "/admin/data-search" },
          { label: "工場選択" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="bg-white flex flex-col gap-2 items-start p-4 rounded-lg w-full">
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className="flex gap-2 items-center text-base text-[var(--semantic-brand-primary)]"
          >
            {/* 確定デザイン 7139:163939：文字と 20px のアイコンを 8px あけて並べる */}
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
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="工場名で検索"
              className="bg-white border border-[#d0d0d0] h-10 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full max-w-md placeholder:text-[var(--semantic-text-secondary)]"
            />
          )}
        </div>
        <div className="border-t border-[#d0d0d0] w-full" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
          {factories.map((factory) => (
            <Link
              key={factory.id}
              to={`factories/${factory.id}`}
              className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg h-20 w-full min-w-0 flex items-center px-4 text-xl text-[var(--semantic-text-primary)]"
            >
              {factory.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
