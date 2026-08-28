import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { getFactoryName } from "../../../data/factories";
import { useScaleInspection } from "./ScaleInspectionContext";

function isCurrentlyDisplayed(displayFrom?: string, displayTo?: string) {
  if (!displayFrom && !displayTo) return true;
  const today = new Date().toISOString().slice(0, 10);
  if (displayFrom && today < displayFrom) return false;
  if (displayTo && today > displayTo) return false;
  return true;
}

export function SettingsPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const { posts, scales } = useScaleInspection();
  const [visibility, setVisibility] = useState<"visible" | "hidden">("visible");

  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/ledger-management/scale-inspection/factories/${factoryId}`;

  const factoryScales = scales.filter((scale) => scale.factoryId === factoryId);

  const filteredScales = factoryScales.filter((scale) => {
    const displayed = isCurrentlyDisplayed(scale.displayFrom, scale.displayTo);
    return visibility === "visible" ? displayed : !displayed;
  });

  function getPostName(postId: string) {
    return posts.find((post) => post.id === postId)?.name ?? "未設定";
  }

  return (
    <div>
      <PageTitleBar
        title="秤点検記録設定"
        showBack
        action={
          <Link
            to={`${basePath}/scales/new`}
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
          { label: "秤点検記録設定" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        <div className="flex flex-col gap-2 items-start w-full">
          <p className="text-sm text-[var(--semantic-text-primary)]">秤、持ち場の新規登録/編集はこちらから</p>
          <div className="flex gap-6 items-center">
            <Link
              to={`${basePath}/scale-management`}
              className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg h-20 w-[270px] flex items-center px-4 text-xl text-[var(--semantic-text-primary)]"
            >
              秤管理
            </Link>
            <Link
              to={`${basePath}/post-management`}
              className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg h-20 w-[270px] flex items-center px-4 text-xl text-[var(--semantic-text-primary)]"
            >
              持ち場管理
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-6 w-full">
          <div className="flex items-center border-b-2 border-[#d0d0d0] w-full">
            {(["visible", "hidden"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setVisibility(key)}
                className={`h-12 w-[156px] flex items-center justify-center border-b-2 text-xl ${
                  visibility === key
                    ? "border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                    : "border-transparent text-[var(--semantic-text-secondary)]"
                }`}
              >
                {key === "visible" ? "アプリ表示中" : "アプリ非表示"}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-6 w-full">
            {filteredScales.length === 0 ? (
              <p className="text-base text-[var(--semantic-text-secondary)]">該当する秤がありません</p>
            ) : (
              filteredScales.map((scale) => (
                <Link
                  key={scale.id}
                  to={`${basePath}/scales/${scale.id}`}
                  className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg h-20 w-full flex flex-col gap-1 justify-center px-4"
                >
                  <p className="text-xl text-[var(--semantic-text-primary)]">{scale.label}</p>
                  <p className="text-base text-[var(--semantic-text-secondary)]">
                    持ち場：{getPostName(scale.postId)}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
