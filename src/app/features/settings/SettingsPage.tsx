import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppHeader } from "../../layout/AppHeader";

const FACTORY_NAME = "㈱西原食品 本社工場";
const APP_VERSION = "NQリポ 0.0.00";

export function SettingsPage() {
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  function handleLogout() {
    setShowLogoutDialog(false);
    navigate("/app/login");
  }

  return (
    <>
      <AppHeader
        title="設定"
        action={
          <p className="text-xl text-[var(--semantic-brand-primary)]">{FACTORY_NAME}</p>
        }
      />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col items-center">
        <div className="flex flex-col gap-10 items-center w-full max-w-full max-w-[480px] mx-40">
          <div className="flex flex-col gap-4 items-start w-full">
            <button
              type="button"
              onClick={() => setShowLogoutDialog(true)}
              className="bg-white drop-shadow-[0px_2px_3px_rgba(51,51,51,0.24)] flex h-16 items-center px-4 py-3 rounded-lg w-full text-left"
            >
              <p className="text-lg text-[var(--semantic-text-primary)]">ログアウト</p>
            </button>
            <Link
              to="/app/settings/license"
              className="bg-white drop-shadow-[0px_2px_3px_rgba(51,51,51,0.24)] flex h-16 items-center px-4 py-3 rounded-lg w-full"
            >
              <p className="text-lg text-[var(--semantic-text-primary)]">ライセンス情報</p>
            </Link>
          </div>
          <p className="text-sm text-[var(--semantic-text-secondary)]">{APP_VERSION}</p>
        </div>
      </div>

      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLogoutDialog(false)} />
          <div className="relative bg-[var(--semantic-background-page)] drop-shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-full max-w-[480px] mx-40">
            <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
              ログアウトしますか
            </h2>
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setShowLogoutDialog(false)}
                className="bg-white border border-[#333] h-16 w-60 rounded-lg text-xl text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-[var(--semantic-brand-danger)] h-16 w-60 rounded-lg text-xl text-white"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
