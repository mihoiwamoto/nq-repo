import { useState } from "react";
import { Link } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useRoleFactories } from "../../data/useRoleFactories";
import { FilterToggleLabel } from "../../components/FilterToggleLabel";

export function FactorySelectionPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");

  // 承認者は権限のある工場だけ、管理者は全工場（useRoleFactories）

  const roleFactories = useRoleFactories();

  const factories = roleFactories.filter((f) => f.name.includes(search));

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
            <FilterToggleLabel open={filterOpen} />
          </button>
          {filterOpen && (
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="工場名で探す"
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
