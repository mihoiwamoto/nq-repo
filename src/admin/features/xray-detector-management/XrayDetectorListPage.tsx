import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Toast } from "../../components/Toast";
import { useXrayDetector } from "./XrayDetectorContext";
import iconArrowUp from "@images/Icon/Button.svg";
import iconArrowDown from "@images/Icon/Button-1.svg";

function ArrowUpIcon() {
  return <img src={iconArrowUp} alt="上へ移動" className="w-6 h-6" />;
}

function ArrowDownIcon() {
  return <img src={iconArrowDown} alt="下へ移動" className="w-6 h-6" />;
}

export function XrayDetectorListPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const location = useLocation();
  const { units, moveUnit } = useXrayDetector();
  const basePath = `/admin/ledger-management/metal-xray-detection/factories/${factoryId}`;
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (location.state?.justSaved) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [location.state?.justSaved]);

  return (
    <div>
      {showToast && <Toast message="更新されました。" onClose={() => setShowToast(false)} />}
      <PageTitleBar
        title="X線探知機管理"
        showBack
        action={
          <Link
            to={`${basePath}/xray-detectors/new`}
            className="bg-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-[120px] rounded-lg flex items-center justify-center gap-1 text-white text-base"
          >
            + 新規登録
          </Link>
        }
      />
      <Breadcrumb
        items={[
          { label: "帳票管理", to: "/admin/ledger-management" },
          { label: "工場選択", to: "/admin/ledger-management/metal-xray-detection" },
          { label: "金属/X線探知機記録", to: basePath },
          { label: "X線探知機管理" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2 items-start">
          <p className="text-sm text-[var(--semantic-text-primary)]">動作確認項目の編集はこちら</p>
          <Link
            to={`${basePath}/xray-detectors/check-items`}
            className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] h-20 w-[270px] rounded-lg flex items-center px-4 text-xl text-[var(--semantic-text-primary)]"
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
              <p className="text-sm text-[var(--semantic-brand-primary)]">X線探知機名</p>
            </div>
            <div className="w-20 flex items-center justify-center p-2 h-full">
              <p className="text-sm text-[var(--semantic-brand-primary)]">操作</p>
            </div>
          </div>
          {units.length === 0 ? (
            <div className="bg-white flex items-center justify-center w-full py-6">
              <p className="text-base text-[var(--semantic-text-secondary)]">
                登録されたX線探知機がありません
              </p>
            </div>
          ) : (
            units.map((unit, index) => (
              <div
                key={unit.id}
                className={`flex items-center w-full ${index % 2 === 1 ? "bg-[#ddf3e7]" : "bg-white"}`}
              >
                <div className="w-[120px] flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => moveUnit(unit.id, "up")}
                    disabled={index === 0}
                    className="flex items-center justify-center disabled:opacity-50"
                  >
                    <ArrowUpIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveUnit(unit.id, "down")}
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
                    to={`${basePath}/xray-detectors/${unit.id}`}
                    className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-16 rounded-lg flex items-center justify-center text-sm text-[var(--semantic-brand-primary)]"
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
  );
}
