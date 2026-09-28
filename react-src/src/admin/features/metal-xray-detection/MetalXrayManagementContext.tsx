import { createContext, useContext, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { MACHINES, type Machine } from "./mockData";

type MetalXrayManagementContextValue = {
  machines: Machine[];
  addMachine: (machine: Omit<Machine, "id">) => void;
  updateMachine: (id: string, machine: Omit<Machine, "id">) => void;
  removeMachine: (id: string) => void;
};

const MetalXrayManagementContext = createContext<MetalXrayManagementContextValue | null>(null);

export function MetalXrayManagementProvider({ children }: { children: ReactNode }) {
  const [machines, setMachines] = useState<Machine[]>(MACHINES);

  function addMachine(machine: Omit<Machine, "id">) {
    setMachines((prev) => [...prev, { id: `m${Date.now()}`, ...machine }]);
  }

  function updateMachine(id: string, machine: Omit<Machine, "id">) {
    setMachines((prev) => prev.map((m) => (m.id === id ? { id, ...machine } : m)));
  }

  function removeMachine(id: string) {
    setMachines((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <MetalXrayManagementContext.Provider
      value={{ machines, addMachine, updateMachine, removeMachine }}
    >
      {children}
    </MetalXrayManagementContext.Provider>
  );
}

export function MetalXrayManagementProviderOutlet() {
  return (
    <MetalXrayManagementProvider>
      <Outlet />
    </MetalXrayManagementProvider>
  );
}

export function useMetalXrayManagement() {
  const ctx = useContext(MetalXrayManagementContext);
  if (!ctx) throw new Error("useMetalXrayManagement must be used within MetalXrayManagementProvider");
  return ctx;
}
