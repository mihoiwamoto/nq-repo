import { useLocation, useNavigate } from "react-router-dom";
import { SubmitComplete } from "../../components/SubmitComplete";

/**
 * 保管検体を破棄したあとの完了画面（確定デザイン「保管検体一覧_破棄完了」6198:77801）。
 * 一括破棄（検体の一覧）と単品の破棄（保管検体の詳細）のどちらからも来る。
 * 「保管検体に戻る」で検体の一覧の保管検体のタブへ戻り、破棄した検体は一覧から外す。
 * 2026-10-08 にポップアップから全画面へ変えた。
 */
export function SampleDiscardCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const discardedIds = (location.state as { discardedIds?: string[] } | null)?.discardedIds ?? [];

  return (
    <SubmitComplete
      ledgerTitle="検体管理"
      title="破棄が完了しました！"
      secondary={{
        label: "保管検体に戻る",
        onClick: () =>
          navigate("/app/ledger-list/sample-management", {
            replace: true,
            state: { tab: "storage", discardedIds },
          }),
      }}
    />
  );
}
