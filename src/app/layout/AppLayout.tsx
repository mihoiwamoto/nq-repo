import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { AppRail } from "./AppRail";
import { AppViewport } from "./AppViewport";
import { AnnouncementBar, type AnnouncementStatus } from "./AnnouncementBar";
import { AnnouncementBarContext } from "./AnnouncementBarContext";
import { SessionExpiredDialog } from "./SessionExpiredDialog";
import { TextSizeProvider } from "./TextSizeContext";
import { ProgressFlowProvider } from "./ProgressFlowContext";
import { isDemoOnline, useDemoTrial, type DemoSendOutcome } from "../../components/demo/demoStore";

const SESSION_TIMEOUT_MS = 15 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "touchstart"] as const;

export function AppLayout() {
  const [status, setStatus] = useState<AnnouncementStatus | null>(null);
  /** 未送信の記録が端末に残っているか。進捗一覧の未送信マークもこれを見る */
  const [unsent, setUnsent] = useState(false);
  /** 送信エラーのポップアップが出ているか。出ている間は後ろの帯を出さない
   *（同じことを二重に言わないため。ポップアップを閉じれば帯は戻る） */
  const [sendErrorDialog, setSendErrorDialog] = useState(false);
  // 動作デモの「状態を試す」。セッション終了と、送信できるかどうかの判定に使う
  const trial = useDemoTrial();
  const [sessionExpired, setSessionExpired] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (sessionExpired) return;

    function resetTimer() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setSessionExpired(true), SESSION_TIMEOUT_MS);
    }
    resetTimer();
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer));
    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [sessionExpired]);

  function handleSend() {
    // オフラインを試している間は繋がっていない扱い。送信エラーを試している間は必ず失敗する
    if (isDemoOnline() && trial !== "error") {
      setUnsent(false);
      setStatus("success");
      setTimeout(() => setStatus(null), 3000);
    } else {
      setStatus("failed");
    }
  }

  function notifyOfflineInspection() {
    setUnsent(true);
  }

  /** 提出の結果を帯に出す。完了画面（SubmitOutcome）から呼ばれる */
  function notifySendResult(outcome: DemoSendOutcome) {
    if (outcome === "unsent") {
      // オフラインで提出した＝端末に残っただけ。
      // 知らせるのは「未送信のデータがあります」の帯ひとつだけにする
      setUnsent(true);
    } else if (outcome === "failed") {
      // 送信エラーはポップアップで知らせるので、帯には出さない
      setUnsent(true);
      setStatus(null);
    }
  }

  /** 送信エラーのポップアップの開け閉め。出している間は後ろの帯を消す */
  function notifySendErrorDialog(open: boolean) {
    setSendErrorDialog(open);
  }

  /**
   * 上に出す帯。
   * オフラインであること自体の帯は出さない。未送信の記録が残っている限り
   * 「未送信のデータがあります」＋送信ボタンを出し、送信を押した結果（失敗／成功）が
   * あるときだけそちらに差し替える。
   * 送信エラーのポップアップが出ている間は、後ろに帯を出さない。
   */
  const shownStatus: AnnouncementStatus | null = sendErrorDialog
    ? null
    : (status ?? (unsent ? "unsent" : null));
  // 動作デモの「セッション終了」を選んでいる間は、15 分放置したのと同じ状態にする
  const showSessionExpired = sessionExpired || trial === "session";

  return (
    <TextSizeProvider>
      <AnnouncementBarContext.Provider
        value={{
          notifyOfflineInspection,
          notifySendResult,
          notifySendErrorDialog,
          hasUnsent: unsent,
        }}
      >
        <ProgressFlowProvider>
          {/* 現場で使う端末に近い見え方にするため、アプリはタブレット幅の枠に収める */}
          <AppViewport>
            <div className="w-full h-full flex bg-[var(--semantic-brand-primary)]">
              <AppRail />
              <div className="flex-1 flex flex-col py-2 pr-2 h-full w-full min-w-0">
                <div className="flex-1 rounded-lg bg-[var(--semantic-background-page)] overflow-hidden flex flex-col min-w-0 w-full">
                  {shownStatus && <AnnouncementBar status={shownStatus} onSend={handleSend} />}
                  <Outlet />
                </div>
              </div>
            </div>
            {/* 枠の中に出す（枠の外に出ると窓いっぱいに広がってしまう） */}
            {showSessionExpired && <SessionExpiredDialog />}
          </AppViewport>
        </ProgressFlowProvider>
      </AnnouncementBarContext.Provider>
    </TextSizeProvider>
  );
}
