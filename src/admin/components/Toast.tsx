import { useEffect, useState } from "react";
import iconCheck from "../../../images/Icon/check.svg";

type ToastProps = {
  message: string;
  onClose: () => void;
  autoCloseDuration?: number;
};

export function Toast({ message, onClose, autoCloseDuration = 3000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [autoCloseDuration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-0 z-50">
      <div className="text-white rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3 max-w-sm" style={{ backgroundColor: '#22c55e' }}>
        <img src={iconCheck} alt="" className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="ml-2 text-white hover:opacity-80 flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
