type CompleteDialogProps = {
  /** 見出し（例: 提出が完了しました） */
  title: string;
  /** 見出しの下の説明文 */
  message: string;
  /** ボタンのラベル（例: 確認待ちに戻る） */
  buttonLabel: string;
  onButtonClick: () => void;
};

/**
 * 提出・確認などの完了を知らせるポップアップ。
 * 画面遷移ではなく、元の画面の上にオーバーレイで重ねて表示する。
 */
export function CompleteDialog({
  title,
  message,
  buttonLabel,
  onButtonClick,
}: CompleteDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-[var(--semantic-background-page)] drop-shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] max-w-full">
        <div className="flex flex-col gap-6 items-center w-full">
          <div className="flex flex-col gap-4 items-center w-full">
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
            <h2 className="text-2xl text-[var(--semantic-brand-primary)] text-center w-full font-semibold">
              {title}
            </h2>
          </div>
          <p className="text-base text-[var(--semantic-text-primary)] text-center w-full">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-center w-full">
          <button
            type="button"
            onClick={onButtonClick}
            className="bg-white border border-[var(--semantic-brand-primary)] flex items-center justify-center h-16 w-60 px-4 rounded-lg text-xl text-[var(--semantic-brand-primary)] font-semibold"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
