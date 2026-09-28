import { useState } from "react";
import { Link } from "react-router-dom";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Pulldown } from "../../components/Pulldown";
import { getFactoryName } from "../../../data/factories";
import { useStorageManagement } from "./StorageManagementContext";

export function StorageListPage() {
  const { storageLocations } = useStorageManagement();
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [factoryFilter, setFactoryFilter] = useState("");
  const [tempFactoryFilter, setTempFactoryFilter] = useState("");

  const filtered = storageLocations.filter((location) => {
    const nameMatch = location.name.includes(search);
    const factoryMatch = !factoryFilter || location.factoryId === factoryFilter;
    return nameMatch && factoryMatch;
  });

  const handleReset = () => {
    setSearch("");
    setFactoryFilter("");
    setTempFactoryFilter("");
  };

  const handleSearch = () => {
    setFactoryFilter(tempFactoryFilter);
  };

  return (
    <div>
      <PageTitleBar
        title="保管場所管理"
        action={
          <Link
            to="new"
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg flex items-center justify-center gap-1 text-white text-base"
          >
            + 新規登録
          </Link>
        }
      />
      <div className="flex flex-col gap-6 items-end p-6">
        <div className="flex flex-col gap-6 items-start w-full">
          <div className="bg-white flex flex-col gap-2 items-start p-4 rounded-lg w-full">
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className="flex gap-2 items-center text-base text-[var(--semantic-brand-primary)]"
            >
              絞り込み検索 {filterOpen ? "−" : "+"}
            </button>
            {filterOpen && (
              <div className="flex gap-4 items-center w-full">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="保管場所で検索"
                  className="bg-white border border-[#d0d0d0] h-10 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] placeholder:text-[var(--semantic-text-secondary)]"
                />
                <Pulldown
                  value={tempFactoryFilter}
                  onChange={(value) => setTempFactoryFilter(value)}
                  options={[
                    { value: "", label: "工場選択" },
                    ...Array.from(new Set(storageLocations.map(l => l.factoryId)))
                      .sort()
                      .map((factoryId) => ({
                        value: factoryId,
                        label: getFactoryName(factoryId),
                      })),
                  ]}
                  className="bg-white border border-[#d0d0d0] h-10 px-4 rounded-lg text-base w-[240px] text-[var(--semantic-text-secondary)]"
                  style={{
                    color: tempFactoryFilter ? 'var(--semantic-text-primary)' : undefined,
                    fontWeight: tempFactoryFilter ? 700 : 400,
                  }}
                />
                <div className="flex gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="bg-white border border-[var(--semantic-brand-primary)] h-10 px-6 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                  >
                    リセット
                  </button>
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="bg-[var(--semantic-brand-primary)] h-10 px-6 rounded-lg flex items-center justify-center gap-2 text-sm text-white"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    検索
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-start w-full rounded-lg overflow-hidden">
            <div className="bg-[#f6f6f6] flex h-10 items-center w-full">
              <div className="flex-1 h-full flex items-center px-2">
                <p className="text-sm text-[var(--semantic-brand-primary)] w-full">
                  保管場所
                </p>
              </div>
              <div className="flex-1 h-full flex items-center px-2">
                <p className="text-sm text-[var(--semantic-brand-primary)] w-full">
                  工場
                </p>
              </div>
              <div className="w-[120px] h-full flex items-center px-2">
                <p className="text-sm text-[var(--semantic-brand-primary)] w-full">
                  操作
                </p>
              </div>
            </div>
            {filtered.map((location, index) => (
              <div
                key={location.id}
                className={`flex h-14 items-center w-full ${
                  index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"
                }`}
              >
                <div className="flex-1 h-full flex items-center px-2">
                  <p className="text-sm font-bold text-[var(--semantic-text-primary)] truncate">
                    {location.name}
                  </p>
                </div>
                <div className="flex-1 h-full flex items-center px-2">
                  <p className="text-sm font-bold text-[var(--semantic-text-primary)] truncate">
                    {getFactoryName(location.factoryId)}
                  </p>
                </div>
                <div className="w-[120px] h-full flex items-center px-2">
                  <Link
                    to={location.id}
                    className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                  >
                    詳細
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
