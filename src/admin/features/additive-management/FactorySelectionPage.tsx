import { useState } from "react";
import { Link } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { FACTORIES } from "../../../data/factories";

export function FactorySelectionPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");

  const factories = FACTORIES.filter((f) => f.name.includes(search));

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
            className="flex gap-2 items-center text-base text-[var(--semantic-brand-primary)]"
          >
            絞り込み検索 {filterOpen ? "−" : "+"}
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
        <div className="flex flex-wrap gap-6">
          {factories.map((factory) => (
            <Link
              key={factory.id}
              to={`factories/${factory.id}`}
              className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg h-20 w-[270px] flex items-center px-4 text-xl text-[var(--semantic-text-primary)]"
            >
              {factory.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
