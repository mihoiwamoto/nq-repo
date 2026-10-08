import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { getFactoryName } from "../../../data/factories";
import { Toast } from "../../components/Toast";
import { useMetalDetector } from "./MetalDetectorContext";
import { useDemoList } from "../../../components/demo/demoStore";
import iconArrowUp from "@images/Icon/Button.svg";
import iconArrowDown from "@images/Icon/Button-1.svg";
import { PlusIcon } from "../../components/PlusIcon";
import { AdminEmptyState } from "../../components/AdminEmptyState";
import { ListPagination, usePagedList } from "../metal-xray-detection/ListPagination";

function ArrowUpIcon() {
  return <img src={iconArrowUp} alt="上へ移動" className="w-6 h-6" />;
}

function ArrowDownIcon() {
  return <img src={iconArrowDown} alt="下へ移動" className="w-6 h-6" />;
}

export function MetalDetectorListPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const { units: allUnits, moveUnit } = useMetalDetector();
  const units = useDemoList(allUnits);
  // 本番どおり 10 件ずつのページ送り（AppConst::LIST_MAX_LENGTH。秤管理 inspects/scale/index.blade.php の $scales->links() と同じ）
  const { page, setPage, totalPages, pageItems, offset } = usePagedList(units);
  const location = useLocation();
  const basePath = `/admin/ledger-management/metal-xray-detection/factories/${factoryId}`;
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("更新しました。");

  // 本番（Detector*Controller::changeOrder）は並べ替えのあと「並び順を変更しました。」を出す
  function handleMove(id: string, direction: "up" | "down") {
    moveUnit(id, direction);
    setToastMessage("並び順を変更しました。");
    setShowToast(true);
  }

  useEffect(() => {
    const state = location.state as { justSaved?: boolean } | null;
    if (state?.justSaved) {
      setToastMessage("更新しました。");
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div>
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
      <PageTitleBar
        title="金属探知機管理"
        showBack
        action={
          <Link
            to={`${basePath}/metal-detectors/new`}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg flex items-center justify-center gap-1 text-white text-base"
          >
            <PlusIcon />
            新規登録
          </Link>
        }
      />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/metal-xray-detection" },
          { label: "金属/X線探知機記録", to: basePath },
          { label: "金属探知機管理" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        {/* 金属/X線探知機記録の画面から移っても工場名の札を出し続ける（stg と同じ。2026-10-07） */}
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
          <p className="text-xl text-[var(--semantic-text-primary)]">{getFactoryName(factoryId)}</p>
        </div>
        <div className="flex flex-col gap-2 items-start">
          <p className="text-sm text-[var(--semantic-text-primary)]">動作確認項目の編集はこちら</p>
          <Link
            to={`${basePath}/metal-detectors/check-items`}
            className="bg-white shadow-[0px_2px_6px_rgba(51,51,51,0.24)] h-20 w-[270px] rounded-lg flex items-center px-4 text-xl text-[var(--semantic-text-primary)]"
          >
            動作確認項目設定
          </Link>
        </div>

        <div className="flex flex-col items-start rounded-lg overflow-hidden w-full">
          <div className="bg-[#f6f6f6] flex h-[50px] items-center w-full">
            <div className="w-[120px] flex items-center justify-center p-2 h-full">
              <p className="text-sm text-[var(--semantic-brand-primary)]">表示順</p>
            </div>
            <div className="flex-1 flex items-center justify-center p-2 h-full">
              <p className="text-sm text-[var(--semantic-brand-primary)]">金属探知機名</p>
            </div>
            <div className="w-20 flex items-center justify-center p-2 h-full">
              <p className="text-sm text-[var(--semantic-brand-primary)]">操作</p>
            </div>
          </div>
          {units.length === 0 ? (
            <AdminEmptyState className="mt-2" />
          ) : (
            pageItems.map((unit, i) => {
              const index = offset + i;
              return (
              <div
                key={unit.id}
                className={`flex items-center w-full ${i % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}
              >
                <div className="w-[120px] flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => handleMove(unit.id, "up")}
                    disabled={index === 0}
                    className="flex items-center justify-center disabled:opacity-50"
                  >
                    <ArrowUpIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(unit.id, "down")}
                    disabled={index === units.length - 1}
                    className="flex items-center justify-center disabled:opacity-50"
                  >
                    <ArrowDownIcon />
                  </button>
                </div>
                <div className="flex-1 p-2">
                  <p className="text-base text-[var(--semantic-text-primary)]">{unit.name}</p>
                </div>
                <div className="w-20 flex items-center justify-center p-2">
                  <Link
                    to={`${basePath}/metal-detectors/${unit.id}`}
                    className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-10 w-16 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
                  >
                    詳細
                  </Link>
                </div>
              </div>
              );
            })
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-end">
            <ListPagination currentPage={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
