import { createContext, useContext } from "react";

type AnnouncementBarContextValue = {
  notifyOfflineInspection: () => void;
};

export const AnnouncementBarContext = createContext<AnnouncementBarContextValue | null>(null);

export function useAnnouncementBar() {
  const ctx = useContext(AnnouncementBarContext);
  if (!ctx) throw new Error("useAnnouncementBar must be used within AppLayout");
  return ctx;
}
