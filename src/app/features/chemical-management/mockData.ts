export type ChemicalStatus = "not_inspected" | "in_progress" | "inspected";

export type Chemical = {
  id: string;
  name: string;
  managementNumber: string;
  storageLocation: string;
  spec: string;
  currentQuantity: string;
  status: ChemicalStatus;
};

export const CHEMICAL_STATUS_LABELS: Record<ChemicalStatus, string> = {
  not_inspected: "未点検",
  in_progress: "点検中",
  inspected: "点検済み",
};

export const CHEMICAL_STATUS_COLORS: Record<ChemicalStatus, string> = {
  not_inspected: "var(--semantic-text-secondary)",
  in_progress: "var(--semantic-status-done)",
  inspected: "var(--semantic-status-caution)",
};

export const chemicals: Chemical[] = [
  {
    id: "c1",
    name: "ソルビン酸",
    managementNumber: "CHM-001",
    storageLocation: "薬品庫A",
    spec: "1,000ml",
    currentQuantity: "5,000ml",
    status: "not_inspected",
  },
  {
    id: "c2",
    name: "にがり（塩化マグネシウム）",
    managementNumber: "CHM-002",
    storageLocation: "薬品庫B",
    spec: "500ml",
    currentQuantity: "3,000ml",
    status: "in_progress",
  },
  {
    id: "c3",
    name: "グルコノデルタラクトン",
    managementNumber: "CHM-003",
    storageLocation: "薬品庫A",
    spec: "1,000g",
    currentQuantity: "2,000g",
    status: "inspected",
  },
  {
    id: "c4",
    name: "消泡剤（シリコーン樹脂）",
    managementNumber: "CHM-004",
    storageLocation: "薬品庫C",
    spec: "500ml",
    currentQuantity: "1,500ml",
    status: "not_inspected",
  },
  {
    id: "c5",
    name: "次亜塩素酸",
    managementNumber: "CHM-005",
    storageLocation: "薬品庫B",
    spec: "10,000ml",
    currentQuantity: "8,000ml",
    status: "not_inspected",
  },
];

export type ChemicalRecord = {
  id: string;
  chemicalId: string;
  date: string;
  managementNumber: string;
  storageLocation: string;
  usedQuantity: string;
  purposeOfUse: string;
  actor: string;
};

export const initialRecords: ChemicalRecord[] = [
  {
    id: "r1",
    chemicalId: "c1",
    date: "2025/04/01",
    managementNumber: "CHM-001",
    storageLocation: "薬品庫A",
    usedQuantity: "100ml",
    purposeOfUse: "製造ラインA用途",
    actor: "田中裕子",
  },
  {
    id: "r2",
    chemicalId: "c1",
    date: "2025/04/02",
    managementNumber: "CHM-001",
    storageLocation: "薬品庫A",
    usedQuantity: "50ml",
    purposeOfUse: "清掃用途",
    actor: "山田太郎",
  },
];

export const ACTORS = [
  { id: "1042587", name: "田中裕子" },
  { id: "1038294", name: "佐藤健一" },
  { id: "1051763", name: "山崎賢人" },
  { id: "1029841", name: "山田太郎" },
  { id: "1064352", name: "鈴木一郎" },
  { id: "1073618", name: "中村美咲" },
  { id: "1085427", name: "小林幸恵" },
  { id: "1091243", name: "渡辺修一" },
  { id: "1046789", name: "伊藤誠" },
];
