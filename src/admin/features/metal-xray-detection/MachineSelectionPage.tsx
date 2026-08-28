import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { getFactoryName } from "../../../data/factories";
import { useMetalXrayManagement } from "./MetalXrayManagementContext";

const TABS = [
  { key: "visible", label: "アプリ表示中" },
  { key: "hidden", label: "アプリ非表示" },
] as const;

function isCurrentlyDisplayed(displayFrom?: string, displayTo?: string) {
  if (!displayFrom && !displayTo) return true;
  const today = new Date().toISOString().slice(0, 10);
  if (displayFrom && today < displayFrom) return false;
  if (displayTo && today > displayTo) return false;
  return true;
}

export function MachineSelectionPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const { machines } = useMetalXrayManagement();
  const factoryName = getFactoryName(factoryId);
  const basePath = `/admin/ledger-management/metal-xray-detection/factories/${factoryId}`;

  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("visible");
  const filteredMachines = machines.filter((machine) => {
    const displayed = isCurrentlyDisplayed(machine.displayFrom, machine.displayTo);
    return activeTab === "visible" ? displayed : !displayed;
  });

  return (
    <div>
      <PageTitleBar
        title="金属/X線探知機記録"
        showBack
        action={
          <Link
            to={`${basePath}/machines/new`}
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
          { label: "金属/X線探知機記録" },
        ]}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="bg-white flex items-center px-4 py-2 rounded-lg w-fit">
          <p className="text-xl text-[var(--semantic-text-primary)]">{factoryName}</p>
        </div>

        <div className="flex flex-col gap-2 items-start">
          <p className="text-sm text-[var(--semantic-text-primary)]">
            金属探知機、X線探知機、ウェイトチェッカーの新規登録/編集はこちらから
          </p>
          <div className="flex gap-6 items-center">
            <Link
              to={`${basePath}/metal-detectors`}
              className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] h-20 w-[270px] rounded-lg flex items-center px-4 text-xl text-[var(--semantic-text-primary)]"
            >
              金属探知機管理
            </Link>
            <Link
              to={`${basePath}/xray-detectors`}
              className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] h-20 w-[270px] rounded-lg flex items-center px-4 text-xl text-[var(--semantic-text-primary)]"
            >
              X線探知機管理
            </Link>
            <Link
              to={`${basePath}/weight-checkers`}
              className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] h-20 w-[270px] rounded-lg flex items-center px-4 text-xl text-[var(--semantic-text-primary)]"
            >
              ウェイトチェッカー管理
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-6 w-full">
          <div className="flex items-center border-b-2 border-[#d0d0d0] w-full">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`h-12 w-[156px] flex items-center justify-center border-b-2 text-xl ${
                  activeTab === tab.key
                    ? "border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                    : "border-transparent text-[var(--semantic-text-secondary)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-6 w-full">
            {filteredMachines.length === 0 ? (
              <p className="text-base text-[var(--semantic-text-secondary)]">
                該当する機器がありません
              </p>
            ) : (
              filteredMachines.map((machine) => (
                <Link
                  key={machine.id}
                  to={`${basePath}/machines/${machine.id}`}
                  className="bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg h-20 flex flex-col gap-1 items-start justify-center px-4 w-full text-left"
                >
                  <p className="text-xl text-[var(--semantic-text-primary)]">{machine.name}</p>
                  <div className="flex gap-6 items-start text-base text-[var(--semantic-text-secondary)]">
                    <p>金属探知機：{machine.recordMetalDetector ? machine.metalDetectorUnit : "記録しない"}</p>
                    <p>X線探知機：{machine.recordXrayDetector ? machine.xrayDetectorUnit : "記録しない"}</p>
                    <p>ウェイトチェッカー：{machine.recordWeightChecker ? machine.weightCheckerUnit : "記録しない"}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
