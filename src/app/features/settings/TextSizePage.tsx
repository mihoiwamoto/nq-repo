import { AppHeader } from "../../layout/AppHeader";
import { useTextSize, type TextSize } from "../../layout/TextSizeContext";

const FACTORY_NAME = "㈱西原食品 本社工場";

const SIZE_OPTIONS: { key: TextSize; label: string }[] = [
  { key: "small", label: "小" },
  { key: "medium", label: "中" },
  { key: "large", label: "大" },
];

export function TextSizePage() {
  const { size, setSize } = useTextSize();

  return (
    <>
      <AppHeader
        title="テキストサイズ変更"
        action={
          <p className="text-xl text-[var(--semantic-brand-primary)]">{FACTORY_NAME}</p>
        }
      />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col items-center gap-20">
        <div className="bg-white flex items-center justify-center px-20 py-2 rounded-lg w-full max-w-full min-h-[285px]">
          <p className="text-xl text-[var(--semantic-text-primary)] text-center">
            テキストのサイズは、「大」「中」「小」の3つから選ぶことができます。文字が小さくて読みづらいと感じたら、サイズを調整してみてください。
          </p>
        </div>
        <div className="flex gap-20 items-center">
          {SIZE_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setSize(option.key)}
              className={`size-[100px] rounded-lg shadow-[0px_2px_6px_rgba(51,51,51,0.24)] flex items-center justify-center text-[39px] shrink-0 ${
                size === option.key
                  ? "bg-[var(--semantic-brand-primary)] text-white"
                  : "bg-white text-[var(--semantic-text-primary)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
