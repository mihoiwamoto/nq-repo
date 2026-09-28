import { useEffect } from "react";
import { AppHeader } from "../layout/AppHeader";
import { useAnnouncementBar } from "../layout/AnnouncementBarContext";
import { useDemoSendOutcome } from "../../components/demo/demoStore";
import { ErrorDialog } from "./ErrorDialog";

/**
 * 提出の結果で完了画面を出し分ける入れ物。
 *
 * ふだん（送信できた）は中身（それぞれの帳票の完了画面）をそのまま出す。
 * 動作デモの「状態を試す」で **送信エラー** を選んでいるときだけ、エラーのポップアップに
 * 差し替える。上の帯（AnnouncementBar）にも同じ結果を伝える。
 *
 * オフラインのときはポップアップを出さない。提出した内容は端末に残るだけなので、
 * 知らせるのは上の「未送信のデータがあります」の帯ひとつにする。
 *
 * 各帳票の完了画面（SubmitCompletePage など）は、返している中身をこれで包むだけでよい。
 */
export function SubmitOutcome({
  ledgerTitle,
  onBack,
  children,
}: {
  /** ヘッダーに出す帳票名（例: 機械器具点検） */
  ledgerTitle: string;
  /** 送信エラーのポップアップのボタンは確定デザインに合わせて「閉じる」固定。
   *  呼ぶ側を書き換えずに済むよう prop は残してあるが、今は使っていない */
  backLabel?: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  const outcome = useDemoSendOutcome();
  const { notifySendResult, notifySendErrorDialog } = useAnnouncementBar();

  // 完了画面に来た＝提出したところ。結果を上の帯に反映する
  useEffect(() => {
    notifySendResult(outcome);
    // 帯は一度出せばよいので、結果が変わったときだけ出し直す
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome]);

  // 送信エラーのポップアップを出している間は、後ろの帯を出さない
  useEffect(() => {
    if (outcome !== "failed") return;
    notifySendErrorDialog(true);
    return () => notifySendErrorDialog(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome]);

  // オフライン（未送信のまま端末に残る）は、ふだんの完了画面のまま。
  // 未送信であることは上の帯が知らせる
  if (outcome !== "failed") return <>{children}</>;

  // 送信エラーのときだけ Figma「エラー画面 > エラー表示_ダイアログ」の形で出す。
  // 後ろは（完了していないので）帳票名のヘッダーだけの空の画面。
  return (
    <>
      <AppHeader title={ledgerTitle} />
      <div className="flex-1 overflow-hidden" />
      <ErrorDialog
        title="送信エラーが発生しました"
        message="入力した内容は未送信のまま端末に保存されています。時間をおいて、もう一度送信してください。"
        onClose={onBack}
      />
    </>
  );
}
