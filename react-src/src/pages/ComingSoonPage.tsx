export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 h-full min-h-[400px] text-[var(--semantic-text-secondary)]">
      <p className="text-xl font-semibold text-[var(--semantic-text-primary)]">{title}</p>
      <p>この画面は準備中です</p>
    </div>
  );
}
