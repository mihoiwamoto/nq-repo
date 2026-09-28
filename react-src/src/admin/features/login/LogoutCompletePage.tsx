import { Link } from "react-router-dom";
import logo from "../../../assets/figma/logo-admin.png";

export function LogoutCompletePage() {
  return (
    <div className="min-h-screen bg-[var(--semantic-background-page)]">
      <header className="h-16 px-6 flex items-center bg-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.16)]">
        <div className="size-10 rounded-[6.4px] bg-white overflow-hidden">
          <img src={logo} alt="NQlipo" className="size-full object-cover" />
        </div>
      </header>
      <div className="flex flex-col gap-10 items-center justify-center p-6 pt-24">
        <div className="flex flex-col gap-6 items-center w-full">
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            className="text-[var(--semantic-brand-primary)]"
          >
            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" />
            <path
              d="M24 41L34 51L56 29"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-2xl text-[var(--semantic-text-primary)]">ログアウトしました</p>
        </div>
        <Link
          to="/admin/login"
          className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[400px] rounded-lg flex items-center justify-center text-base text-[var(--semantic-brand-primary)]"
        >
          ログイン画面へ
        </Link>
      </div>
    </div>
  );
}
