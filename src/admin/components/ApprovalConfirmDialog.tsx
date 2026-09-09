export function ApprovalConfirmDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-6 items-center px-8 py-8 w-fit max-w-[calc(100vw-32px)]">
        <p className="text-xl font-bold text-[var(--semantic-text-primary)] text-center whitespace-nowrap">
          承認しますか？
        </p>
        <p className="text-base text-[var(--semantic-text-secondary)] text-center whitespace-nowrap">
          一度承認すると取り消せません。内容をご確認のうえ進めてください。
        </p>
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
            className="flex-1 h-12 rounded-lg bg-[var(--semantic-brand-primary)] text-base text-white"
          >
            承認
          </button>
        </div>
      </div>
    </div>
  );
}
