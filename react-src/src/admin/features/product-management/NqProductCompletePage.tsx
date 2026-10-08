import { Link } from "react-router-dom";
import { PageTitleBar } from "../../components/PageTitleBar";

export function NqProductCompletePage({ message }: { message: string }) {
  // 本番の完了の文言は「製品管理の新規登録が完了しました」「製品管理の削除が完了しました」（製品名は添えない）
  const text = message.includes("新規登録")
    ? "製品管理の新規登録が完了しました"
    : message.includes("削除")
      ? "製品管理の削除が完了しました"
      : message;

  return (
    <div>
      <PageTitleBar title="完了画面" />
      <div className="flex flex-col gap-10 items-center justify-center p-6 pt-16">
        <div className="flex flex-col gap-6 items-center w-full">
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            className="text-[var(--semantic-brand-primary)]"
          >
            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6.67" />
            <path
              d="M24 41L34 51L56 29"
              stroke="currentColor"
              strokeWidth="6.67"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-2xl text-[var(--semantic-text-primary)]">{text}</p>
        </div>
        <Link
          to="/admin/products?tab=nq"
          className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[400px] rounded-lg flex items-center justify-center text-xl text-[var(--semantic-brand-primary)]"
        >
          製品管理一覧に戻る
        </Link>
      </div>
    </div>
  );
}
