import { createContext, useContext } from "react";
import type { DemoSendOutcome } from "../../components/demo/demoStore";

type AnnouncementBarContextValue = {
  /** オフラインのまま点検を終えた（未送信の記録が残った） */
  notifyOfflineInspection: () => void;
  /**
   * 提出の結果を上の帯に反映する。
   * 動作デモの「オフライン」「送信エラー」でも同じ道を通るので、
   * 完了画面（SubmitOutcome）から呼べばどの帳票でも同じ見た目になる。
   */
  notifySendResult: (outcome: DemoSendOutcome) => void;
  /**
   * 送信エラーのポップアップを出している／閉じたことを知らせる。
   * 出している間は、後ろのアナウンスバーを出さない（同じことを二重に言わないため）。
   */
  notifySendErrorDialog: (open: boolean) => void;
  /**
   * 未送信の記録が端末に残っている。
   * 進捗一覧はこれを見て、どの行が未送信かの ↖ マークと注意書きを出す。
   * オフラインの間は上の帯には出さない（帯は「オフラインです」だけ）が、この印は付く。
   */
  hasUnsent: boolean;
};

export const AnnouncementBarContext = createContext<AnnouncementBarContextValue | null>(null);

export function useAnnouncementBar() {
  const ctx = useContext(AnnouncementBarContext);
  if (!ctx) throw new Error("useAnnouncementBar must be used within AppLayout");
  return ctx;
}
