
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

export type StockCategory = "入庫" | "出庫";

export type ChemicalRecord = {
  id: string;
  chemicalId: string;
  date: string;
  managementNumber: string;
  storageLocation: string;
  category: StockCategory | "";
  /** この記録を付ける前の在庫数（画面ラベルは「元在庫数」） */
  previousStock: string;
  usedQuantity: string;
  currentStock: string;
  purposeOfUse: string;
  remarks: string;
  actor: string;
};

export const initialRecords: ChemicalRecord[] = [
  {
    id: "r1",
    chemicalId: "c1",
    date: "2025/04/01",
    managementNumber: "CHM-001",
    storageLocation: "薬品庫A",
    category: "出庫",
    previousStock: "5,000ml",
    usedQuantity: "100ml",
    currentStock: "4,900ml",
    purposeOfUse: "製造ラインA用途",
    remarks: "製造ラインA用途",
    actor: "田中裕子",
  },
  {
    id: "r2",
    chemicalId: "c1",
    date: "2025/04/02",
    managementNumber: "CHM-001",
    storageLocation: "薬品庫A",
    category: "出庫",
    previousStock: "4,900ml",
    usedQuantity: "50ml",
    currentStock: "4,850ml",
    purposeOfUse: "清掃用途",
    remarks: "清掃用途",
    actor: "山田太郎",
  },
  // 点検中（c2）: 記録済みのデータあり
  {
    id: "r3",
    chemicalId: "c2",
    date: "2025/04/01",
    managementNumber: "CHM-002",
    storageLocation: "薬品庫B",
    category: "入庫",
    previousStock: "3,000ml",
    usedQuantity: "500ml",
    currentStock: "3,500ml",
    purposeOfUse: "定期補充",
    remarks: "定期補充",
    actor: "佐藤健一",
  },
  {
    id: "r4",
    chemicalId: "c2",
    date: "2025/04/02",
    managementNumber: "CHM-002",
    storageLocation: "薬品庫B",
    category: "出庫",
    previousStock: "3,500ml",
    usedQuantity: "500ml",
    currentStock: "3,000ml",
    purposeOfUse: "豆腐凝固用",
    remarks: "豆腐凝固用",
    actor: "佐藤健一",
  },
  // 点検済み（c3）: 記録済みのデータあり
  {
    id: "r5",
    chemicalId: "c3",
    date: "2025/04/01",
    managementNumber: "CHM-003",
    storageLocation: "薬品庫A",
    category: "入庫",
    previousStock: "1,500g",
    usedQuantity: "1,000g",
    currentStock: "2,500g",
    purposeOfUse: "定期補充",
    remarks: "定期補充",
    actor: "中村美咲",
  },
  {
    id: "r6",
    chemicalId: "c3",
    date: "2025/04/02",
    managementNumber: "CHM-003",
    storageLocation: "薬品庫A",
    category: "出庫",
    previousStock: "2,500g",
    usedQuantity: "500g",
    currentStock: "2,000g",
    purposeOfUse: "製造ラインB用途",
    remarks: "製造ラインB用途",
    actor: "中村美咲",
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
