import { useLocation, useNavigate, useParams } from "react-router-dom";
import iconAttention from "../../../assets/figma/icons/common/attention.svg";
import { AppHeader } from "../../layout/AppHeader";
import { useInspection } from "./InspectionContext";

const INSPECTOR_NAME = "佐藤健一";

type SkipConfirmState = {
  lineName: string;
  date: string;
  skipReason: string;
  fromProgress?: boolean;
};

export function SkipConfirmPage() {
  const { lineId } = useParams<{ lineId: string }>();
  const navigate = useNavigate();
  const { updateLineStatus } = useInspection();
  const location = useLocation();
  const state = location.state as SkipConfirmState | null;
  const basePath = `/app/ledger-list/equipment-inspection/lines/${lineId}`;
  const fromProgress = state?.fromProgress ?? false;

  if (!state) {
    return (
      <>
        <AppHeader title="点検見送り確認" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-base text-[var(--semantic-text-secondary)]">
            点検見送りの内容が見つかりません。点検画面から操作してください。
          </p>
          <button
            type="button"
            onClick={() => navigate(basePath)}
            className="bg-[var(--semantic-brand-primary)] h-12 px-6 rounded-lg text-base text-white"
          >
            点検画面に戻る
          </button>
        </div>
      </>
    );
  }

  const { lineName, date, skipReason } = state;

  function handleSubmit() {
    if (lineId) updateLineStatus(lineId, "skipped");
    navigate(`${basePath}/complete`, { state: fromProgress ? { fromProgress: true } : undefined });
  }

  return (
    <>
      <AppHeader title={`機械器具点検_${lineName}`} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 items-center">
        <div className="bg-[#f7f292] flex gap-2 items-center p-4 rounded-lg w-full max-w-full max-w-[480px] mx-40">
          <img src={iconAttention} alt="注意" className="size-5 shrink-0" />
          <p className="text-sm text-[var(--semantic-text-primary)]">
            実施者、入力内容に誤りがないか提出前にご確認ください。
          </p>
        </div>

        <div className="bg-white flex flex-col gap-3 items-start px-4 py-6 rounded-lg w-full max-w-full max-w-[480px] mx-40">
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">実施日</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{date.replaceAll("-", "/")}</p>
          </div>
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[var(--semantic-text-primary)]">実施者</p>
            <p className="text-base text-[var(--semantic-text-primary)]">{INSPECTOR_NAME}</p>
          </div>
        </div>

        <div className="bg-white flex flex-col gap-2 items-start px-4 py-6 rounded-lg w-full max-w-full max-w-[480px] mx-40">
          <p className="text-base text-[var(--semantic-text-primary)]">備考</p>
          <p className="text-base text-[var(--semantic-text-primary)]">{skipReason}</p>
        </div>
      </div>

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-white border border-[#333] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-xl text-white"
        >
          提出
        </button>
      </div>
    </>
  );
}
