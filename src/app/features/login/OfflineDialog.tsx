export function OfflineDialog({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-[var(--semantic-background-page)] drop-shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px] h-[738px]">
        <div className="flex flex-col gap-6 items-center w-full">
          <div className="flex flex-col gap-4 items-center w-full">
            <svg viewBox="0 0 80 80" className="size-20">
              <line
                x1="20"
                y1="20"
                x2="60"
                y2="60"
                stroke="var(--semantic-brand-danger)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <line
                x1="60"
                y1="20"
                x2="20"
                y2="60"
                stroke="var(--semantic-brand-danger)"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </svg>
            <h2 className="text-2xl text-[var(--semantic-brand-danger)] text-center w-full">
              オフライン状態です
            </h2>
          </div>
          <p className="text-base text-[var(--semantic-text-primary)] text-center w-full">
            通信環境をご確認ください。
          </p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="bg-white border border-[var(--semantic-brand-primary)] h-16 w-60 rounded-lg text-xl text-[var(--semantic-brand-primary)]"
        >
          再度読み込み
        </button>
      </div>
    </div>
  );
}
