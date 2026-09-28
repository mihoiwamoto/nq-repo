import iconCancel from "../../assets/figma/icons/common/cancel.svg";

/**
 * エラーを知らせるポップアップ。
 * Figma「📱 アプリ_03.FixDesign / 確定デザイン > エラー画面 > エラー表示_ダイアログ」の形。
 *
 * 赤い✕ → 赤い見出し → 説明文 → 「閉じる」だけ、が確定デザイン。
 * 枠（ベージュ地・640px・角丸・影）は完了ポップアップ（CompleteDialog）と同じ Figma の
 * Dialog コンポーネントなので、寸法もそれに合わせている。
 */
export function ErrorDialog({
  title,
  message,
  buttonLabel = "閉じる",
  onClose,
}: {
  /** 見出し（例: 送信エラーが発生しました）。デザイン上は赤字 */
  title: string;
  /** 見出しの下の説明文 */
  message: string;
  /** ボタンのラベル。デザインの既定は「閉じる」 */
  buttonLabel?: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-[var(--semantic-background-page)] drop-shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] max-w-full">
        <div className="flex flex-col gap-6 items-center w-full">
          <div className="flex flex-col gap-4 items-center w-full">
            {/* 80px の✕。色を変えられるよう、アイコンはマスクにして下地の色を出している */}
            <span
              aria-hidden
              className="size-20 shrink-0"
              style={{
                WebkitMaskImage: `url("${iconCancel}")`,
                maskImage: `url("${iconCancel}")`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                backgroundColor: "var(--semantic-brand-danger)",
              }}
            />
            <h2 className="text-2xl leading-[1.4] text-[var(--semantic-brand-danger)] text-center w-full font-semibold">
              {title}
            </h2>
          </div>
          <p className="text-base leading-[1.4] text-[var(--semantic-text-primary)] w-full">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-center w-full">
          <button
            type="button"
            onClick={onClose}
            className="bg-white border border-[var(--semantic-text-primary)] flex items-center justify-center h-16 w-60 px-4 rounded-lg text-xl text-[var(--semantic-text-primary)] font-semibold"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
