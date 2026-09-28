
export type AdditiveStatus = "not_inspected" | "in_progress" | "inspected";

export type Additive = {
  id: string;
  name: string;
  storageLocation: string;
  spec: string;
  initialStock: string;
  status: AdditiveStatus;
};

export const ADDITIVE_STATUS_LABELS: Record<AdditiveStatus, string> = {
  not_inspected: "未点検",
  in_progress: "点検中",
  inspected: "点検済み",
};

export const ADDITIVE_STATUS_COLORS: Record<AdditiveStatus, string> = {
  not_inspected: "var(--semantic-text-secondary)",
  in_progress: "var(--semantic-status-done)",
  inspected: "var(--semantic-status-caution)",
};

export const additives: Additive[] = [
  {
    id: "a1",
    name: "ソルビン酸",
    storageLocation: "小型物置",
    spec: "1,000ml",
    initialStock: "5,000ml",
    status: "not_inspected",
  },
  {
    id: "a2",
    name: "にがり（塩化マグネシウム）",
    storageLocation: "小型物置",
    spec: "500ml",
    initialStock: "3,000ml",
    status: "in_progress",
  },
  {
    id: "a3",
    name: "グルコノデルタラクトン",
    storageLocation: "小型物置",
    spec: "1,000g",
    initialStock: "2,000g",
    status: "inspected",
  },
  {
    id: "a4",
    name: "消泡剤（シリコーン樹脂）",
    storageLocation: "小型物置",
    spec: "500ml",
    initialStock: "1,500ml",
    status: "not_inspected",
  },
];

export type StockCategory = "入庫" | "出庫";

export type AdditiveRecord = {
  id: string;
  additiveId: string;
  date: string;
  storageLocation: string;
  category: StockCategory;
  quantity: string;
  currentStock: string;
  remarks: string;
  actor: string;
};

export const initialRecords: AdditiveRecord[] = [
  {
    id: "r1",
    additiveId: "a1",
    date: "2025/04/01",
    storageLocation: "小型物置",
    category: "入庫",
    quantity: "1,000ml",
    currentStock: "4,000ml",
    remarks: "月次定期発注による補充入庫",
    actor: "田中裕子",
  },
  {
    id: "r2",
    additiveId: "a1",
    date: "2025/04/01",
    storageLocation: "小型物置",
    category: "出庫",
    quantity: "500ml",
    currentStock: "3,500ml",
    remarks: "製造ライン補充",
    actor: "山田太郎",
  },
  {
    id: "r3",
    additiveId: "a2",
    date: "2025/04/01",
    storageLocation: "小型物置",
    category: "入庫",
    quantity: "500ml",
    currentStock: "3,500ml",
    remarks: "定期発注による補充入庫",
    actor: "佐藤健一",
  },
  {
    id: "r4",
    additiveId: "a3",
    date: "2025/04/01",
    storageLocation: "小型物置",
    category: "入庫",
    quantity: "1,000g",
    currentStock: "3,000g",
    remarks: "月次定期発注による補充入庫",
    actor: "田中裕子",
  },
  {
    id: "r5",
    additiveId: "a3",
    date: "2025/04/01",
    storageLocation: "小型物置",
    category: "出庫",
    quantity: "500g",
    currentStock: "2,500g",
    remarks: "豆腐ライン充填工程で使用",
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
