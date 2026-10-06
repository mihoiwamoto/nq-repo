/**
 * 部品のすぐ下に文字だけで出す注釈（例：「①持ち場/ラインの登録はここから」）。
 * 右下の「i」を押しているあいだだけ出る（sectionNotesStore.ts）。
 * 置き場所はページ側で決める（場所を取らないよう、部品を relative で包んで absolute で下に置く）。
 * 画面説明（コーチマーク）・フィードバックの場所選びに拾われないよう、それぞれの印を付ける。
 */
import type { ReactNode } from "react";
import { COACH_OWN_ATTR } from "../screen-description/coachMarks";
import { useSectionNotesOpen } from "./sectionNotesStore";

export function SectionNote({ className = "", children }: { className?: string; children: ReactNode }) {
  const open = useSectionNotesOpen();
  if (!open) return null;
  return (
    <p
      {...{ [COACH_OWN_ATTR]: "" }}
      data-nq-feedback=""
      role="note"
      className={`text-sm font-normal whitespace-nowrap text-[var(--semantic-text-secondary)] ${className}`}
    >
      {children}
    </p>
  );
}
