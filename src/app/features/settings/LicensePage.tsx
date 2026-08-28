import { useNavigate } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";

const FACTORY_NAME = "㈱西原食品 本社工場";

export function LicensePage() {
  const navigate = useNavigate();

  return (
    <>
      <AppHeader
        title="ライセンス情報"
        action={
          <p className="text-xl text-[var(--semantic-brand-primary)]">{FACTORY_NAME}</p>
        }
      />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4" />

      <div className="shrink-0 bg-white shadow-[0px_-4px_16px_rgba(51,51,51,0.16)] px-6 py-6 flex items-center justify-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-white border border-[#333] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
        >
          戻る
        </button>
      </div>
    </>
  );
}
