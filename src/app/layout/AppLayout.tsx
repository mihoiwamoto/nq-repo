import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { AppRail } from "./AppRail";
import { AnnouncementBar, type AnnouncementStatus } from "./AnnouncementBar";
import { AnnouncementBarContext } from "./AnnouncementBarContext";
import { SessionExpiredDialog } from "./SessionExpiredDialog";
import { TextSizeProvider } from "./TextSizeContext";

const SESSION_TIMEOUT_MS = 15 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "touchstart"] as const;

export function AppLayout() {
  const [status, setStatus] = useState<AnnouncementStatus | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (sessionExpired) return;

    function resetTimer() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setSessionExpired(true), SESSION_TIMEOUT_MS);
    }
    resetTimer();
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer));
    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [sessionExpired]);

  function handleSend() {
    if (navigator.onLine) {
      setStatus("success");
      setTimeout(() => setStatus(null), 3000);
    } else {
      setStatus("failed");
    }
  }

  function notifyOfflineInspection() {
    setStatus("unsent");
  }

  return (
    <TextSizeProvider>
      <AnnouncementBarContext.Provider value={{ notifyOfflineInspection }}>
        <div className="w-full h-full flex bg-[var(--semantic-brand-primary)]">
          <AppRail />
          <div className="flex-1 flex flex-col p-2 h-full w-full min-w-0">
            <div className="flex-1 rounded-lg bg-[var(--semantic-background-page)] overflow-hidden flex flex-col min-w-0 w-full">
              {status && <AnnouncementBar status={status} onSend={handleSend} />}
              <Outlet />
            </div>
          </div>
        </div>
        {sessionExpired && <SessionExpiredDialog />}
      </AnnouncementBarContext.Provider>
    </TextSizeProvider>
  );
}
