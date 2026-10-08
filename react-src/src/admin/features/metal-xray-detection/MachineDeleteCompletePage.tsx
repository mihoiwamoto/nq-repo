import { Link, useParams } from "react-router-dom";
import { PageTitleBar } from "../../components/PageTitleBar";

export function MachineDeleteCompletePage() {
  const { factoryId } = useParams<{ factoryId: string }>();

  return (
    <div>
      {/* 本番の共通の完了画面は見出しが「完了画面」で固定（2026-10-08 本番に合わせた） */}
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
          <p className="text-2xl text-[var(--semantic-text-primary)]">
            金属/X線探知機記録の削除が完了しました
          </p>
        </div>
        <Link
          to={`/admin/ledger-management/metal-xray-detection/factories/${factoryId}`}
          className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_4px_rgba(51,51,51,0.24)] h-12 w-[400px] rounded-lg flex items-center justify-center text-xl text-[var(--semantic-brand-primary)]"
        >
          金属/X線探知機記録に戻る
        </Link>
      </div>
    </div>
  );
}
