import type { HelpFaq } from "./types";

export function HelpAccordion({
  faq,
  isOpen,
  onToggle,
}: {
  faq: HelpFaq;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white shadow-[0px_2px_4px_rgba(51,51,51,0.24)] rounded-lg overflow-hidden w-full">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between gap-4 p-4 w-full text-left"
      >
        <div className="flex flex-1 items-center gap-4 min-w-0">
          <span className="text-[var(--semantic-text-primary)] text-base font-bold shrink-0">Q.</span>
          <span className="text-base text-[var(--semantic-text-primary)] truncate">{faq.question}</span>
        </div>
        <span className="text-[var(--semantic-brand-primary)] text-xl shrink-0">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <div className="bg-[#f8f8f8] flex gap-4 items-start px-4 pt-4 pb-6">
          <span className="text-[var(--semantic-brand-primary)] text-base font-bold shrink-0">A.</span>
          <p className="flex-1 text-base text-[var(--semantic-text-primary)] leading-relaxed whitespace-pre-line">
            {faq.answer}
          </p>
        </div>
      )}
    </div>
  );
}
