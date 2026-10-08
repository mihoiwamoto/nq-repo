import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useDemoEmpty } from "../../../components/demo/demoStore";
import { MACHINES, type Machine } from "./mockData";
import { useFactoryList } from "../../data/factoryDemo";

/** 動作確認項目設定の 1 行（金属探知機・X線探知機・ウェイトチェッカー共通） */
export type ChecklistItem = {
  id: string;
  name: string;
  description: string;
};

/** 動作確認項目設定の置き場のキー（機器の種類の URL 末尾＋工場。例 metal-detectors:f1） */
export function checklistKey(unitPath: string, factoryId: string | undefined) {
  return `${unitPath}:${factoryId ?? ""}`;
}

type MetalXrayManagementContextValue = {
  machines: Machine[];
  addMachine: (machine: Omit<Machine, "id">) => void;
  updateMachine: (id: string, machine: Omit<Machine, "id">) => void;
  removeMachine: (id: string) => void;
  /** 保存した動作確認項目（本番どおり「保存」で持ち、次に開いたときの初期行にする。2026-10-08）。未保存なら undefined */
  checklists: Record<string, ChecklistItem[]>;
  saveChecklist: (key: string, items: ChecklistItem[]) => void;
};

const MetalXrayManagementContext = createContext<MetalXrayManagementContextValue | null>(null);

export function MetalXrayManagementProvider({ children }: { children: ReactNode }) {
  const [machines, setMachines] = useFactoryList<Machine>("metal-xray-detection", MACHINES, "registry");

  const [checklists, setChecklists] = useState<Record<string, ChecklistItem[]>>({});

  function saveChecklist(key: string, items: ChecklistItem[]) {
    setChecklists((prev) => ({ ...prev, [key]: items }));
  }

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
      value={{ machines, addMachine, updateMachine, removeMachine, checklists, saveChecklist }}
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
  // 右下の「状態を試す › データが無い」のときは、登録物も予定も無いものとして見せる
  const empty = useDemoEmpty();
  return useMemo(() => (empty ? { ...ctx, machines: [] } : ctx), [ctx, empty]);
}
