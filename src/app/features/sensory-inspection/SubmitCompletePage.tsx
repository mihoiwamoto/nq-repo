import { useNavigate, useLocation } from "react-router-dom";
import iconCheck from "../../../assets/figma/icons/common/checkmark-custom.svg";
import { AppHeader } from "../../layout/AppHeader";

export function SubmitCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { fromProgress?: boolean } | null;
  const fromProgress = state?.fromProgress ?? false;

  const handleNavigate = (path: string) => {
    navigate(path, { state: fromProgress ? { fromProgress: true } : undefined });
  };

  return (
    <>
      <AppHeader title="官能検査記録" />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="flex flex-col gap-10 items-center w-full max-w-[440px]">
          <div className="flex flex-col gap-6 items-center w-full">
            <div className="flex flex-col gap-4 items-center w-full">
              <span className="size-20 rounded-full border-4 border-[var(--semantic-brand-primary)] flex items-center justify-center text-[var(--semantic-brand-primary)] text-4xl">
                <img src={iconCheck} alt="完了" className="size-12" />
              </span>
              <p className="text-2xl text-[var(--semantic-brand-primary)] text-center">提出が完了しました！</p>
            </div>
            <p className="text-base text-[var(--semantic-text-primary)] text-center">
              ご記入ありがとうございます。
            </p>
          </div>
          <div className="flex flex-col gap-10 items-center w-full">
            <button
              onClick={() => handleNavigate("/app/ledger-list/sensory-inspection")}
              className="bg-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-full rounded-lg text-xl text-white"
            >
              官能検査記録を続ける
            </button>
            <button
              onClick={() => handleNavigate("/app/ledger-list")}
              className="bg-white border border-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-full rounded-lg text-xl text-[var(--semantic-brand-primary)]"
            >
              帳票一覧に戻る
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
