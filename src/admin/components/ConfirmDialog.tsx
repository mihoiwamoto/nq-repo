export function ConfirmDialog({
  title,
  confirmLabel = "削除",
  onCancel,
  onConfirm,
}: {
  title: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-6 items-center px-8 py-8 w-[640px] h-[738px]">
        <p className="text-lg text-[var(--semantic-text-primary)] text-center">{title}</p>
        <div className="flex gap-4 items-center w-full">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-12 rounded-lg border border-[#333] text-base text-[var(--semantic-text-primary)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 h-12 rounded-lg bg-[var(--semantic-brand-danger)] text-base text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
