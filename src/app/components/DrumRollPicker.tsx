import { useEffect, useRef, useState } from "react";

/** 1 行の高さ。中央の選択枠もこの高さ */
const ITEM_HEIGHT = 50;
/** 見える行数。中央が選択行なので上下に (5-1)/2 = 2 行ぶんの余白を置く */
const VISIBLE_ITEMS = 5;
const LIST_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PAD = ((VISIBLE_ITEMS - 1) / 2) * ITEM_HEIGHT;

export type DrumRollOption<T extends string> = { value: T; label: string };

interface DrumRollPickerProps<T extends string> {
  open: boolean;
  value: T;
  options: readonly DrumRollOption<T>[];
  onConfirm: (value: T) => void;
  onCancel: () => void;
}

/**
 * iOS 風のドラムロール（ホイール）式ピッカー。
 * 画面下からせり上がるシートで、「完了」を押すまで値は確定しない。
 */
export function DrumRollPicker<T extends string>({
  open,
  value,
  options,
  onConfirm,
  onCancel,
}: DrumRollPickerProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  // 開くたびに現在値の行を中央へ送る
  useEffect(() => {
    if (!open) return;
    const initial = Math.max(
      0,
      options.findIndex((option) => option.value === value)
    );
    setIndex(initial);
    listRef.current?.scrollTo({ top: initial * ITEM_HEIGHT });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const next = Math.min(
      options.length - 1,
      Math.max(0, Math.round(el.scrollTop / ITEM_HEIGHT))
    );
    setIndex(next);
  };

  const scrollToIndex = (target: number) => {
    setIndex(target);
    listRef.current?.scrollTo({ top: target * ITEM_HEIGHT, behavior: "smooth" });
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onCancel} />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-[#f7f7f7]">
        <div className="flex items-center justify-between px-6 py-4 text-xl leading-none text-[#4f8ded]">
          <button type="button" onClick={onCancel}>
            キャンセル
          </button>
          <button type="button" onClick={() => onConfirm(options[index].value)}>
            完了
          </button>
        </div>
        <div className="relative bg-[#d0d3d9]">
          <div
            className="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-lg bg-[#c7cad1]"
            style={{ height: ITEM_HEIGHT }}
          />
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="relative overflow-y-auto snap-y snap-mandatory px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ height: LIST_HEIGHT }}
          >
            <div style={{ height: PAD }} />
            {options.map((option, i) => (
              <button
                key={option.value}
                type="button"
                onClick={() => scrollToIndex(i)}
                className={`snap-center flex w-full items-center justify-center text-2xl leading-[1.4] text-black ${
                  i === index ? "" : "opacity-50"
                }`}
                style={{ height: ITEM_HEIGHT }}
              >
                {option.label}
              </button>
            ))}
            <div style={{ height: PAD }} />
          </div>
        </div>
      </div>
    </>
  );
}
