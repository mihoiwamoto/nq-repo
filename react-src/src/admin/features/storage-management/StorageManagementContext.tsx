import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { STORAGE_LOCATIONS, type StorageLocation } from "../../../data/storageLocations";
import { getFactoryName } from "../../../data/factories";

/**
 * 保管場所管理へどこから入ったか（2026-10-06、確定デザインに合わせた）。
 * 帳票管理 › 薬品管理／添加物管理 の「保管場所管理」から入ったときは、
 * 「←」とパンくず（帳票管理 › 工場選択 › 薬品管理 › 保管場所管理）を出し、新規登録・編集は工場を選ばず
 * その工場の保管場所として登録する。サイドメニューから入ったとき（null）は従来どおり。
 * 入口の Link は `state={{ storageFrom: { ledger, factoryId } }}` を渡す。
 */
export type StorageOrigin = {
  ledger: "chemical-management" | "additive-management";
  factoryId: string;
};

const ORIGIN_LABEL: Record<StorageOrigin["ledger"], string> = {
  "chemical-management": "薬品管理",
  "additive-management": "添加物管理",
};

/** 入口に応じたパンくずの頭（保管場所管理の手前まで） */
export function storageOriginCrumbs(origin: StorageOrigin | null) {
  if (!origin) return [];
  const ledgerPath = `/admin/ledger-management/${origin.ledger}`;
  return [
    { label: "帳票管理", to: "/admin/ledger-management" },
    { label: "工場選択", to: ledgerPath },
    { label: ORIGIN_LABEL[origin.ledger], to: `${ledgerPath}/factories/${origin.factoryId}` },
  ];
}

export function storageOriginFactoryName(origin: StorageOrigin | null) {
  return origin ? getFactoryName(origin.factoryId) : "";
}

type StorageManagementContextValue = {
  origin: StorageOrigin | null;
  storageLocations: StorageLocation[];
  addStorageLocation: (input: { name: string; factoryId: string }) => StorageLocation;
  updateStorageLocation: (id: string, input: { name: string; factoryId: string }) => void;
  removeStorageLocation: (id: string) => void;
};

const StorageManagementContext = createContext<StorageManagementContextValue | null>(null);

export function StorageManagementProvider({ children }: { children: ReactNode }) {
  const [storageLocations, setStorageLocations] = useState<StorageLocation[]>(STORAGE_LOCATIONS);
  const routeLocation = useLocation();
  const [origin] = useState<StorageOrigin | null>(
    () => ((routeLocation.state as { storageFrom?: StorageOrigin } | null)?.storageFrom ?? null)
  );

  const value = useMemo<StorageManagementContextValue>(
    () => ({
      origin,
      storageLocations,
      addStorageLocation: (input) => {
        const created: StorageLocation = { id: `s${Date.now()}`, ...input };
        setStorageLocations((prev) => [...prev, created]);
        return created;
      },
      updateStorageLocation: (id, input) => {
        setStorageLocations((prev) =>
          prev.map((location) => (location.id === id ? { ...location, ...input } : location))
        );
      },
      removeStorageLocation: (id) => {
        setStorageLocations((prev) => prev.filter((location) => location.id !== id));
      },
    }),
    [origin, storageLocations]
  );

  return (
    <StorageManagementContext.Provider value={value}>{children}</StorageManagementContext.Provider>
  );
}

export function StorageManagementProviderOutlet() {
  return (
    <StorageManagementProvider>
      <Outlet />
    </StorageManagementProvider>
  );
}

export function useStorageManagement() {
  const ctx = useContext(StorageManagementContext);
  if (!ctx) throw new Error("useStorageManagement must be used within StorageManagementProvider");
  return ctx;
}
