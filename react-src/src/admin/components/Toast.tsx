import { useEffect, useState } from "react";
import iconCheck from "../../../images/Icon/check.svg";
import { FRAME } from "../../frameBridge";

type ToastProps = {
  message: string;
  onClose: () => void;
  autoCloseDuration?: number;
};

export function Toast({ message, onClose, autoCloseDuration = 3000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 画面設計の枠の中では自動で閉じない（ユースケースの再生でトーストを囲んで見せるため。2026-10-05）
    if (FRAME) return;
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [autoCloseDuration, onClose]);

  if (!isVisible) return null;

  // 確定デザイン（7139:258062 の toast）：340×64・#19c95f・角丸 8・内側 12/16・間 8、チェック 40px、文字 20px 太字、× 24px、右端・下から 88px
  return (
    <div className="fixed bottom-[88px] right-0 z-50">
      <div className="text-white rounded-lg px-4 py-3 flex items-center gap-2 w-[340px] h-16" style={{ backgroundColor: "#19c95f" }}>
        <img src={iconCheck} alt="" className="size-10 shrink-0 brightness-0 invert" />
        <span className="flex-1 min-w-0 text-xl font-semibold">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="text-white hover:opacity-80 flex-shrink-0"
        >
          <svg className="size-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
