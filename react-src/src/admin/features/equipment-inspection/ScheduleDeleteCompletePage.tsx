import { Link, useParams, useSearchParams } from "react-router-dom";
import { PageTitleBar } from "../../components/PageTitleBar";
import { useSchedule } from "./ScheduleContext";

/**
 * 点検予定の削除完了（確定デザイン「帳票管理_機械器具点検_点検予定_編集_削除完了画面」）。
 * 編集で持ち場/ラインのごみ箱 →「持ち場/ライン設定の削除」で「削除」を押すとここへ来る。
 * 「点検予定編集一覧に戻る」はその日の編集へ。持ち場/ラインが残っていなければ点検予定（カレンダー）へ。
 */
export function ScheduleDeleteCompletePage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const [searchParams] = useSearchParams();
  const date = searchParams.get("date") ?? "";
  const { entries } = useSchedule();
  const basePath = `/admin/ledger-management/equipment-inspection/factories/${factoryId}`;
  const hasLines = Boolean(date && entries[date]?.lineIds.length);
  const backTo = hasLines ? `${basePath}/schedule/register?date=${date}` : `${basePath}/schedule`;

  return (
    <div>
      <PageTitleBar title="機械器具点検" />
      <div className="flex flex-col gap-10 items-center justify-center p-6">
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
          <p className="text-2xl text-[var(--semantic-text-primary)]">点検予定の削除が完了しました</p>
        </div>
        <Link
          to={backTo}
          className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[400px] rounded-lg flex items-center justify-center text-xl text-[var(--semantic-brand-primary)]"
        >
          点検予定編集一覧に戻る
        </Link>
      </div>
    </div>
  );
}
