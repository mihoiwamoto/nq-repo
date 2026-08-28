import { useState } from "react";
import { Link } from "react-router-dom";
import { PageTitleBar } from "../../components/PageTitleBar";
import { getFactoryName } from "../../../data/factories";
import { useStorageManagement } from "./StorageManagementContext";

export function StorageListPage() {
  const { storageLocations } = useStorageManagement();
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = storageLocations.filter((location) => location.name.includes(search));

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
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="保管場所名で検索"
                className="bg-white border border-[#d0d0d0] h-10 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-full max-w-md placeholder:text-[var(--semantic-text-secondary)]"
              />
            )}
          </div>

          <div className="flex flex-col items-start w-full rounded-lg overflow-hidden">
            <div className="bg-[#f6f6f6] flex h-10 items-center w-full">
              <div className="flex-1 h-full flex items-center px-2">
                <p className="text-sm text-[var(--semantic-brand-primary)] text-center w-full">
                  保管場所
                </p>
              </div>
              <div className="flex-1 h-full flex items-center px-2">
                <p className="text-sm text-[var(--semantic-brand-primary)] text-center w-full">
                  工場
                </p>
              </div>
              <div className="w-[120px] h-full flex items-center px-2">
                <p className="text-sm text-[var(--semantic-brand-primary)] text-center w-full">
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
