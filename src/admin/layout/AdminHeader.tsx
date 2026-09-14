import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/figma/logo-admin.png";

const ACCOUNT_NAME = "佐々木明子";

const MENU_LINKS = [
  { label: "アカウント情報", to: "/admin/account" },
  { label: "メールアドレス変更", to: "/admin/account/email" },
  { label: "パスワード変更", to: "/admin/account/password" },
];

export function AdminHeader() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  return (
    <header className="relative flex items-center justify-between px-6 py-3 h-16 bg-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.16)] shrink-0">
      <div className="flex items-center gap-4">
        <Link to="/" className="size-10 rounded-[6.4px] bg-white overflow-hidden block">
          <img src={logo} alt="NQlipo" className="size-full object-cover" />
        </Link>
        <span className="text-base font-semibold text-white">Design Spec</span>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="h-10 px-20 rounded-lg bg-white flex items-center justify-center text-base text-[var(--semantic-text-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)]"
        >
          {ACCOUNT_NAME}
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 bg-white shadow-[0px_2px_6px_rgba(51,51,51,0.24)] rounded-lg flex flex-col items-start py-2">
              {MENU_LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className="w-full px-6 py-3 text-lg text-[var(--semantic-brand-primary)] hover:bg-[var(--semantic-background-page)]"
                >
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setLogoutDialogOpen(true);
                }}
                className="w-full px-6 py-3 text-lg text-left text-[var(--semantic-brand-primary)] hover:bg-[var(--semantic-background-page)]"
              >
                ログアウト
              </button>
            </div>
          </>
        )}
      </div>

      {logoutDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setLogoutDialogOpen(false)} />
          <div className="relative bg-[#f1efea] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px]">
            <p className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
              ログアウトしますか？
            </p>
            <div className="flex gap-10 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setLogoutDialogOpen(false)}
                className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/logout")}
                className="bg-[var(--semantic-brand-danger)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
