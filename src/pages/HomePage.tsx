import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[var(--semantic-background-page)]">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-semibold text-[var(--semantic-text-primary)]">
          食品工場管理システム
        </h1>
        <div className="flex gap-4">
          <Link
            to="/admin/login"
            className="px-6 py-3 rounded-lg bg-[var(--semantic-brand-primary)] text-white"
          >
            管理画面
          </Link>
          <Link
            to="/app/login"
            className="px-6 py-3 rounded-lg bg-[var(--semantic-brand-primary)] text-white"
          >
            アプリ画面
          </Link>
        </div>
      </div>
    </div>
  );
}
