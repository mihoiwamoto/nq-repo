export type LogScreenType = "app" | "admin";

export const SCREEN_TYPE_LABELS: Record<LogScreenType, string> = {
  app: "アプリ画面",
  admin: "管理画面",
};

export const SCREEN_TYPE_OPTIONS: LogScreenType[] = ["app", "admin"];

export type LogEntry = {
  id: string;
  timestamp: string;
  screenType: LogScreenType;
  factoryId: string;
  staffName: string;
  role: string;
  ledgerSlug?: string;
  action: string;
};
