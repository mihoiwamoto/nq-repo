import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { getFactoryName } from "../../../data/factories";
import { useScaleInspection } from "./ScaleInspectionContext";

export function PostManagementListPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const { posts, movePost } = useScaleInspection();
  const basePath = `/admin/ledger-management/scale-inspection/factories/${factoryId}`;
  const factoryName = getFactoryName(factoryId);

  const [filterOpen, setFilterOpen] = useState(false);
  const [nameFilter, setNameFilter] = useState("");

  const factoryPosts = posts.filter((post) => post.factoryId === factoryId);
  const filtered = factoryPosts.filter((post) =>
    nameFilter ? post.name.toLowerCase().includes(nameFilter.toLowerCase()) : true
  );

  return (
    <div>
      <PageTitleBar
        title="持ち場管理"
        showBack
        action={
          <Link
            to={`${basePath}/post-management/new`}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg flex items-center justify-center gap-1 text-white text-base"
          >
            + 新規登録
          </Link>
        }
      />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/scale-inspection" },
          { label: "秤点検記録設定", to: basePath },
          { label: "持ち場管理" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        <div className="bg-white flex flex-col gap-4 items-start p-4 rounded-lg w-full">
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className="text-base text-[var(--semantic-brand-primary)]"
          >
            絞り込み検索 {filterOpen ? "−" : "+"}
          </button>
          {filterOpen && (
            <div className="flex gap-4 items-center w-full">
              <input
                type="text"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="持ち場名で探す"
                className="bg-white border border-[#d0d0d0] h-12 px-4 rounded-lg text-base text-[var(--semantic-text-primary)] w-[260px] placeholder:text-[var(--semantic-text-secondary)]"
              />
              <button
                type="button"
                onClick={() => setNameFilter("")}
                className="bg-white border border-[#808080] h-12 w-20 rounded-lg text-sm text-[var(--semantic-text-secondary)]"
              >
                リセット
              </button>
              <button
                type="button"
                className="bg-[var(--semantic-brand-primary)] h-12 w-[120px] rounded-lg text-sm text-white"
              >
                検索
              </button>
            </div>
          )}
        </div>

        <div className="w-full rounded-lg overflow-x-auto">
          <div className="flex flex-col min-w-[600px]">
            <div className="bg-[#f6f6f6] flex h-[50px] items-center">
              {[
                { label: "表示順", width: "w-[80px]" },
                { label: "持ち場", width: "flex-1" },
                { label: "操作", width: "w-[104px]" },
              ].map((col) => (
                <div
                  key={col.label}
                  className={`flex items-center justify-center p-2 h-full text-sm text-[var(--semantic-brand-primary)] ${col.width}`}
                >
                  {col.label}
                </div>
              ))}
            </div>
            {filtered.length === 0 ? (
              <p className="bg-white p-6 text-base text-[var(--semantic-text-secondary)]">
                該当する持ち場がありません
              </p>
            ) : (
              filtered.map((post, index) => (
                <div
                  key={post.id}
                  className={`flex h-14 items-center ${index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}
                >
                  <div className="w-[80px] flex items-center justify-center gap-1 p-2 h-full">
                    <button
                      type="button"
                      onClick={() => movePost(post.id, "up")}
                      disabled={index === 0}
                      className="text-[var(--semantic-brand-primary)] disabled:text-[#d0d0d0]"
                      aria-label="上へ"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => movePost(post.id, "down")}
                      disabled={index === filtered.length - 1}
                      className="text-[var(--semantic-brand-primary)] disabled:text-[#d0d0d0]"
                      aria-label="下へ"
                    >
                      ▼
                    </button>
                  </div>
                  <div className="flex-1 flex items-center p-2 h-full text-sm text-[var(--semantic-text-primary)]">
                    {post.name}
                  </div>
                  <div className="w-[104px] flex items-center justify-center p-2 h-full">
                    <Link
                      to={`${basePath}/posts/${post.id}`}
                      className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                    >
                      詳細
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
