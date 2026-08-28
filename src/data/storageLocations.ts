export type StorageLocation = {
  id: string;
  name: string;
  factoryId: string;
};

export const STORAGE_LOCATIONS: StorageLocation[] = [
  { id: "s1", name: "小型物置", factoryId: "f1" },
  { id: "s2", name: "第2原料保管庫", factoryId: "f1" },
  { id: "s3", name: "冷蔵保管庫A", factoryId: "f1" },
  { id: "s4", name: "冷蔵保管庫B", factoryId: "f1" },
  { id: "s5", name: "添加物専用保管庫", factoryId: "f1" },
  { id: "s6", name: "包装資材倉庫", factoryId: "f2" },
  { id: "s7", name: "製品出荷倉庫", factoryId: "f2" },
  { id: "s8", name: "危険物保管庫", factoryId: "f2" },
  { id: "s9", name: "予備資材倉庫", factoryId: "f3" },
  { id: "s10", name: "検査用サンプル保管庫", factoryId: "f3" },
];
