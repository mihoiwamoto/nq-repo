export type DeviceStatus = "pending" | "authenticated";

export const DEVICE_STATUS_LABELS: Record<DeviceStatus, string> = {
  pending: "保留",
  authenticated: "認証済み",
};

export type LoginDevice = {
  id: string;
  name: string;
  factoryId: string;
  status: DeviceStatus;
};
