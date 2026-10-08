import type { ReactNode } from "react";
import { AppHeader } from "../layout/AppHeader";
import { SubmitOutcome } from "./SubmitOutcome";

/** 完了画面のボタン 1 つぶん */
export type CompleteAction = {
  label: string;
  onClick: () => void;
};

type SubmitCompleteProps = {
  /** ヘッダーに出す帳票名（例: 使用水の点検_点検場所A） */
  ledgerTitle: string;
  /** 見出し */
  title?: string;
  /** 見出しの下の説明文 */
  message?: string;
  /** 帳票を続ける導線（緑のボタン）。要らない画面は省く */
  primary?: CompleteAction;
  /** 下の白いボタン。オフライン・送信エラーのときの戻り先にもなる */
  secondary: CompleteAction;
  /**
   * 進捗一覧から入ったときの完了画面。確定デザイン（進捗一覧_〇〇_提出完了 7139:229246・7139:293858・7139:237958・7139:249605）は
   * 帳票一覧の提出完了（7139:221581 など）より中身が 52px 下にある（ヘッダーの下 76px からチェック印。2026-10-07）
   */
  fromProgress?: boolean;
};

/**
 * 確定デザイン（Figma 帳票一覧_〇〇_提出完了 7139:282111 など・進捗一覧_〇〇_提出完了 7139:293858 など）の見出し。
 * 確定デザインのある 4 帳票（機械器具点検・清掃記録・薬品管理・添加物管理）の提出完了で使う。
 * ほかの帳票は確定デザインがまだ無いので、既定の「保存が完了しました！」のまま（2026-10-07）。
 */
export const SUBMIT_DONE_TITLE = "提出が完了しました！";

/** 丸を塗ったチェック印（Figma「使用水の点検_保存完了」） */
function CircleCheck() {
  return (
    <svg
      className="size-20 shrink-0"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M66.6667 40.0003C66.6667 25.2727 54.7276 13.3337 40 13.3337C25.2724 13.3337 13.3334 25.2727 13.3334 40.0003C13.3334 54.7279 25.2724 66.667 40 66.667C54.7276 66.667 66.6667 54.7279 66.6667 40.0003ZM73.3334 40.0003C73.3334 58.4098 58.4095 73.3337 40 73.3337C21.5905 73.3337 6.66669 58.4098 6.66669 40.0003C6.66669 21.5908 21.5905 6.66699 40 6.66699C58.4095 6.66699 73.3334 21.5908 73.3334 40.0003Z"
        fill="var(--semantic-brand-primary)"
      />
      <path
        d="M52.4935 30.527C53.7952 29.2255 55.9053 29.2253 57.207 30.527C58.5084 31.8286 58.5084 33.9388 57.207 35.2405L38.3886 54.0589L38.1445 54.2802C37.5516 54.7655 36.8049 55.0322 36.0319 55.0322C35.2587 55.0319 34.5121 54.766 33.9192 54.2802L33.6751 54.0589L24.4596 44.8401C23.1581 43.5383 23.1579 41.4283 24.4596 40.1266C25.7613 38.8251 27.8715 38.8251 29.1732 40.1266L36.0319 46.9853L52.4935 30.527Z"
        fill="var(--semantic-brand-primary)"
      />
    </svg>
  );
}

function CompleteButton({ action, kind }: { action: CompleteAction; kind: "primary" | "secondary" }) {
  const look =
    kind === "primary"
      ? "bg-[var(--semantic-brand-primary)] text-white"
      : "bg-white border border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]";
  return (
    <button
      type="button"
      onClick={action.onClick}
      className={`flex items-center justify-center h-16 w-[360px] max-w-full px-4 rounded-lg text-xl font-semibold ${look}`}
    >
      {action.label}
    </button>
  );
}

/**
 * 帳票を提出したあとの完了画面。10 帳票で同じ形にするための共通部分。
 *
 * 形は Figma「Ver.1.0_初期開発 › 使用水の点検_保存完了」に合わせてある。
 * 中央寄せではなく上詰め、丸を塗ったチェック印、見出しは「保存が完了しました！」、
 * ボタンは 360×64 を縦に並べる（続ける → 帳票一覧に戻る）。
 *
 * 動作デモで「オフライン」「送信エラー」を試しているときは、SubmitOutcome が
 * 送信できなかった画面に差し替える（どの帳票でも同じ）。
 */
export function SubmitComplete({
  ledgerTitle,
  title = "保存が完了しました！",
  message = "ご記入ありがとうございます。",
  primary,
  secondary,
  fromProgress = false,
}: SubmitCompleteProps): ReactNode {
  return (
    <SubmitOutcome ledgerTitle={ledgerTitle} backLabel={secondary.label} onBack={secondary.onClick}>
      <AppHeader title={ledgerTitle} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className={`flex flex-col gap-10 items-center px-8 pb-6 w-full ${fromProgress ? "pt-[76px]" : "pt-6"}`}>
          <div className="flex flex-col gap-6 items-center w-full">
            <div className="flex flex-col gap-4 items-center w-full">
              <CircleCheck />
              {/* 確定デザインの行の高さは 140%（見出し 33.6px・説明 22.4px）。2026-10-07 */}
              <h2 className="text-2xl leading-[1.4] text-[var(--semantic-brand-primary)] text-center w-full font-semibold">
                {title}
              </h2>
            </div>
            <p className="text-base leading-[1.4] text-[var(--semantic-text-primary)] text-center w-full font-semibold">
              {message}
            </p>
          </div>

          <div className="flex flex-col gap-10 items-center w-full">
            {primary && <CompleteButton action={primary} kind="primary" />}
            <CompleteButton action={secondary} kind="secondary" />
          </div>
        </div>
      </div>
    </SubmitOutcome>
  );
}
