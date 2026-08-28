import { ReactNode } from "react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  fullWidth?: boolean;
}

export function Drawer({ isOpen, onClose, children, title, fullWidth = false }: DrawerProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed right-0 top-0 bottom-0 z-50 bg-white shadow-lg transition-transform duration-300 overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ${fullWidth ? "w-1/2" : "w-full max-w-md"}`}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-[#d0d0d0]">
            <h2 className="text-lg font-semibold text-[var(--semantic-text-primary)]">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="ml-auto text-xl text-[var(--semantic-text-secondary)] hover:text-[var(--semantic-text-primary)] w-8 h-8 flex items-center justify-center"
              aria-label="Close drawer"
            >
              ×
            </button>
          </div>
        )}
        <div className="p-4">
          {children}
        </div>
      </div>
    </>
  );
}
