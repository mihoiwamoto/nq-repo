// 本番（WhiteDeviceStatus）と同じ 3 つ。認証待ちのあいだは一覧で選べない
export type DeviceStatus = "pending" | "authenticated" | "rejected";

export const DEVICE_STATUS_LABELS: Record<DeviceStatus, string> = {
  pending: "認証待ち",
  authenticated: "認証済み",
  rejected: "保留",
};

export type LoginDevice = {
  id: string;
  name: string;
  factoryId: string;
  status: DeviceStatus;
};
