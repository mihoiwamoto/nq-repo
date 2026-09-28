import type { LoginDevice } from "../admin/features/device-management/types";
import { INITIAL_DEVICES } from "../admin/features/device-management/mockData";

const DEVICES_KEY = "nq_login_devices";
const NEW_DEVICE_QUEUE_KEY = "nq_login_devices_new_queue";
export const NEW_DEVICE_EVENT = "nq-device-added";

export function loadDevices(): LoginDevice[] {
  try {
    const raw = localStorage.getItem(DEVICES_KEY);
    if (raw) return JSON.parse(raw) as LoginDevice[];
  } catch {
    // 破損したデータは初期値で上書きする
  }
  localStorage.setItem(DEVICES_KEY, JSON.stringify(INITIAL_DEVICES));
  return INITIAL_DEVICES;
}

export function saveDevices(devices: LoginDevice[]) {
  localStorage.setItem(DEVICES_KEY, JSON.stringify(devices));
}

function loadQueue(): string[] {
  try {
    const raw = localStorage.getItem(NEW_DEVICE_QUEUE_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch {
    // 破損したデータは空扱いにする
  }
  return [];
}

export function popNewDeviceQueue(): string[] {
  const queue = loadQueue();
  if (queue.length > 0) localStorage.setItem(NEW_DEVICE_QUEUE_KEY, JSON.stringify([]));
  return queue;
}

export function registerFirstLoginDevice(factoryId: string, name: string): LoginDevice {
  const device: LoginDevice = {
    id: `d-${Date.now()}`,
    name,
    factoryId,
    status: "pending",
  };
  saveDevices([...loadDevices(), device]);
  localStorage.setItem(NEW_DEVICE_QUEUE_KEY, JSON.stringify([...loadQueue(), device.id]));
  window.dispatchEvent(new CustomEvent(NEW_DEVICE_EVENT, { detail: device }));
  return device;
}
