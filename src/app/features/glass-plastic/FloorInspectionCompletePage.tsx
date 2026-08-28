import { useNavigate, useLocation, useParams } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";

export function FloorInspectionCompletePage() {
  const navigate = useNavigate();
  const { floorId } = useParams<{ floorId: string }>();
  const location = useLocation();
  const state = location.state as {
    floorName?: string;
    date?: string;
    inspectorName?: string;
    fromProgress?: boolean;
  } | null;

  const floorName = state?.floorName ?? "フロアA";
  const fromProgress = state?.fromProgress ?? false;

  const handleNavigate = (path: string) => {
    navigate(path, { state: fromProgress ? { fromProgress: true } : undefined });
  };

  return (
    <>
      <AppHeader title={`ガラス・プラスチック管理_${floorName}`} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-12 flex flex-col gap-8 items-center justify-center">
          <div className="bg-white rounded-lg p-12 flex flex-col gap-8 items-center max-w-md">
            <div className="flex flex-col gap-4 items-center">
              <div className="w-20 h-20 bg-[#3ba55c] rounded-full flex items-center justify-center">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 12.402L8.47059 16.5L19.0882 7"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-[var(--semantic-text-primary)]">保存完了</h1>
            </div>

            <p className="text-center text-lg text-[var(--semantic-text-secondary)]">
              検査データが正常に保存されました
            </p>

            <button
              onClick={() => handleNavigate("/app/ledger-list/glass-plastic")}
              className="bg-[var(--semantic-brand-primary)] h-14 w-full rounded-lg text-lg text-white flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              ガラス・プラスチック管理に戻る
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
