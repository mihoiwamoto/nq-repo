import type { LoginDevice } from "./types";

export const INITIAL_DEVICES: LoginDevice[] = [
  { id: "d1", name: "山田のiPad", factoryId: "f1", status: "pending" },
  { id: "d2", name: "受付のiPad", factoryId: "f1", status: "authenticated" },
  { id: "d3", name: "検品室のiPad", factoryId: "f1", status: "pending" },
  { id: "d4", name: "佐藤のiPad", factoryId: "f2", status: "authenticated" },
  { id: "d5", name: "事務所のiPad", factoryId: "f2", status: "authenticated" },
  { id: "d6", name: "田中のiPad", factoryId: "f4", status: "authenticated" },
  { id: "d7", name: "品質管理室のiPad", factoryId: "f5", status: "authenticated" },
  { id: "d8", name: "伊藤のiPad", factoryId: "f6", status: "authenticated" },
  { id: "d9", name: "製造ラインのiPad", factoryId: "f7", status: "authenticated" },
  { id: "d10", name: "中村のiPad", factoryId: "f8", status: "authenticated" },
  { id: "d11", name: "倉庫のiPad", factoryId: "f1", status: "authenticated" },
  { id: "d12", name: "渡辺のiPad", factoryId: "f9", status: "authenticated" },
];
