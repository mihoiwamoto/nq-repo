import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { STORAGE_LOCATIONS, type StorageLocation } from "../../../data/storageLocations";

type StorageManagementContextValue = {
  storageLocations: StorageLocation[];
  addStorageLocation: (input: { name: string; factoryId: string }) => StorageLocation;
  updateStorageLocation: (id: string, input: { name: string; factoryId: string }) => void;
  removeStorageLocation: (id: string) => void;
};

const StorageManagementContext = createContext<StorageManagementContextValue | null>(null);

export function StorageManagementProvider({ children }: { children: ReactNode }) {
  const [storageLocations, setStorageLocations] = useState<StorageLocation[]>(STORAGE_LOCATIONS);

  const value = useMemo<StorageManagementContextValue>(
    () => ({
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
    [storageLocations]
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
