import { useState } from "react";
import { useLocation } from "react-router-dom";
import { getPageDescription } from "../utils/pageDescriptions";

export function PageDescriptionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const description = getPageDescription(location.pathname);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="page-description-fab fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
        title="画面説明"
        aria-label="画面説明を表示"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setIsOpen(false)} />
      )}

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 animation-slide-up">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                このページについて
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {description}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="閉じる"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animation-slide-up {
          animation: slide-up 0.2s ease-out;
        }
        @media (max-height: 700px) {
          .page-description-fab {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
