import { Link, useLocation } from "react-router-dom";
import { PageTitleBar } from "../../components/PageTitleBar";

export function NqProductCompletePage({ message }: { message: string }) {
  const location = useLocation();
  const productName = (location.state as { productName?: string } | null)?.productName;
  // 新規登録の直後だけ製品名を添える。URL を直接開いたときは state が無いのでルートの文言のまま
  const text = productName ? `${productName}の新規登録が完了しました` : message;

  return (
    <div>
      <PageTitleBar title="製品管理" />
      <div className="flex flex-col gap-10 items-center justify-center p-6 pt-16">
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
          <p className="text-2xl text-[var(--semantic-text-primary)]">{text}</p>
        </div>
        <Link
          to="/admin/products?tab=nq"
          className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[400px] rounded-lg flex items-center justify-center text-xl text-[var(--semantic-brand-primary)]"
        >
          製品管理一覧に戻る
        </Link>
      </div>
    </div>
  );
}
