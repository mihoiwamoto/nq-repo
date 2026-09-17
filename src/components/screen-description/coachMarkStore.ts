/**
 * 画面上コーチマーク（ScreenCoachMarks）を開く合図。
 *
 * 右下の「動作デモ」ピルのメニュー › 資料 › 画面説明 から呼ばれる。
 * フィードバックの openFeedbackPanel() と同じく window のカスタムイベントで伝えるので、
 * どこから呼んでも App.tsx に置いた ScreenCoachMarksHost が受けて開く。
 *
 * 動作デモ（端末枠の iframe）を開いている間は、説明したい画面は iframe の中にある。
 * そのときは iframe へ postMessage で同じ合図を送り、iframe 側のホストが受けて中で開く。
 */

export const COACH_MARKS_OPEN_EVENT = "nq-coach-marks:open";
export const COACH_MARKS_CLOSE_EVENT = "nq-coach-marks:close";

/** iframe（動作デモの端末枠）へ送る postMessage の種別 */
export const COACH_MARKS_MESSAGE_TYPE = "nq-coach-marks";

export type CoachMarksMessage = { type: typeof COACH_MARKS_MESSAGE_TYPE; action: "open" | "close" };

/** 今いる文書（この window）でコーチマークを開く */
export function openScreenCoachMarks() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(COACH_MARKS_OPEN_EVENT));
}

export function closeScreenCoachMarks() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(COACH_MARKS_CLOSE_EVENT));
}

/** 動作デモの端末枠（iframe）の中でコーチマークを開く。枠が無ければ false */
export function openScreenCoachMarksInFrame(frame: HTMLIFrameElement | null | undefined): boolean {
  const win = frame?.contentWindow;
  if (!win) return false;
  const msg: CoachMarksMessage = { type: COACH_MARKS_MESSAGE_TYPE, action: "open" };
  win.postMessage(msg, window.location.origin);
  return true;
}

/** 動作デモの端末枠に付ける印（DemoOverlay の iframe）。ピルのメニューからこれを探して合図を送る */
export const DEMO_FRAME_ATTR = "data-nq-demo-frame";

export function findDemoFrame(): HTMLIFrameElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLIFrameElement>(`iframe[${DEMO_FRAME_ATTR}]`);
}
