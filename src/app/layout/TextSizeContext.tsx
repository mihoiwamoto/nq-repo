import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type TextSize = "small" | "medium" | "large";

const FONT_SCALE: Record<TextSize, string> = {
  small: "87.5%",
  medium: "100%",
  large: "112.5%",
};

type TextSizeContextValue = {
  size: TextSize;
  setSize: (size: TextSize) => void;
};

const TextSizeContext = createContext<TextSizeContextValue | null>(null);

export function TextSizeProvider({ children }: { children: ReactNode }) {
  const [size, setSize] = useState<TextSize>("medium");

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SCALE[size];
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, [size]);

  return <TextSizeContext.Provider value={{ size, setSize }}>{children}</TextSizeContext.Provider>;
}

export function useTextSize() {
  const ctx = useContext(TextSizeContext);
  if (!ctx) throw new Error("useTextSize must be used within TextSizeProvider");
  return ctx;
}
