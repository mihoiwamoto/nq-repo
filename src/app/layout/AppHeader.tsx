import type { ReactNode } from "react";

export function AppHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <header className="h-16 px-4 flex items-center justify-between gap-4 shadow-[0px_2px_2px_rgba(51,51,51,0.16)] shrink-0">
      <h1 className="text-2xl font-semibold text-[var(--semantic-text-primary)]">{title}</h1>
      {action}
    </header>
  );
}
