import type { ChemicalRecord } from "./types";
import { amount, aprilDays, at, statusAt, ymd } from "../../data/demoRecordGen";

export const chemicalRecords: ChemicalRecord[] = [
  {
    id: "dch1",
    date: "2025-04-01",
    chemicalName: "次亜塩素酸ナトリウム",
    type: "入庫",
    previousStock: "5,000g",
    quantity: "1,000g",
    currentStock: "4,000g",
    storageLocation: "小型物置",
    remarks: "月次定期発注による補充入庫",
    implementer: "田中裕子",
    confirmer: "山本真理",
    // 確定デザイン 7139:163038・7139:163226 は 1 件目が承認待ち（右上が「承認待ち ▼」のプルダウン）。2026-10-08
    approvalStatus: "pending",
    comments: [
      {
        id: "c1",
        author: "鈴木修",
        timestamp: "2026.08.19 10:39",
        text: "検索条件を確認しました。問題ありません。",
      },
      {
        id: "c2",
        author: "山田花子",
        timestamp: "2026.08.23 15:45",
        text: "データ抽出の期間を再度ご確認ください。",
      },
    ],
  },
  {
    id: "dch2",
    date: "2025-04-01",
    chemicalName: "過酸化水素",
    type: "出庫",
    previousStock: "4,000g",
    quantity: "500g",
    currentStock: "3,500g",
    storageLocation: "冷蔵庫",
    remarks: "",
    implementer: "田中裕子",
    confirmer: "山本真理",
    approvalStatus: "approved",
  },
  {
    id: "dch3",
    date: "2025-04-02",
    chemicalName: "アンモニア水",
    type: "入庫",
    previousStock: "3,500g",
    quantity: "2,000g",
    currentStock: "5,500g",
    storageLocation: "倉庫棟A",
    remarks: "緊急発注分の追加入庫",
    implementer: "田中裕子",
    confirmer: "山本真理",
    approvalStatus: "approved",
  },
  {
    id: "dch4",
    date: "2025-04-03",
    chemicalName: "クエン酸",
    type: "出庫",
    previousStock: "5,500g",
    quantity: "1,000g",
    currentStock: "4,500g",
    storageLocation: "大型物置",
    remarks: "",
    implementer: "田中裕子",
    confirmer: "山本真理",
    approvalStatus: "approved",
  },
  {
    id: "dch5",
    date: "2025-04-03",
    chemicalName: "塩酸",
    type: "出庫",
    previousStock: "4,500g",
    quantity: "500g",
    currentStock: "4,000g",
    storageLocation: "化学物質保管室",
    remarks: "洗浄作業使用分として出庫",
    implementer: "田中裕子",
    confirmer: "山本真理",
    approvalStatus: "approved",
  },
];

/* ───────────────────────────────────────────────────────────────
 * 2026-10-08：データ検索の見本を増やした分（上の dch1〜dch5 は画面設計の hash と確定デザインが使うので変えない）。
 * 薬品ごとに在庫を持ち、入庫で増え・出庫で減る（前在庫数 → 現在庫数 が前の行とつながる）。単位は薬品ごと（ml・g・本・kg）。
 * 4 月の稼働日に 1〜2 件、3 月末・5 月頭にも少し。備考あり/なし・長い備考・長い薬品名 を混ぜる。
 * ─────────────────────────────────────────────────────────────── */
const CHEMICALS = [
  { name: "次亜塩素酸ナトリウム（6%）", unit: "ml", stock: 18000, inQty: 10000, outQty: [1500, 2000, 2500], place: "小型物置" },
  { name: "アルコール製剤", unit: "本", stock: 24, inQty: 24, outQty: [3, 4, 6], place: "倉庫棟A" },
  { name: "中性洗剤", unit: "ml", stock: 9000, inQty: 6000, outQty: [500, 800, 1000], place: "大型物置" },
  { name: "クエン酸", unit: "g", stock: 4500, inQty: 2000, outQty: [250, 500], place: "大型物置" },
  { name: "アルカリ洗浄剤（CIP 洗浄用 高濃度タイプ・希釈して使用）", unit: "kg", stock: 60, inQty: 20, outQty: [4, 5, 8], place: "化学物質保管室" },
];

const CHEM_REMARKS_IN = ["月次定期発注による補充入庫", "", "緊急発注分の追加入庫"];
const CHEM_REMARKS_OUT = [
  "",
  "洗浄作業使用分として出庫",
  "",
  "製造ラインの定期洗浄（CIP）用。使用後の空き容器は保管室の回収箱へ戻した。希釈倍率は作業手順書どおり 50 倍。",
];

function chemicalExtra(): ChemicalRecord[] {
  const out: ChemicalRecord[] = [];
  const stock = CHEMICALS.map((c) => c.stock);
  const days: [number, number][] = [[3, 26], [3, 31], ...aprilDays(4, 30, [12, 19, 26]).map((d) => [4, d] as [number, number]), [5, 1], [5, 7]];
  let n = 0;
  days.forEach(([m, d], di) => {
    const count = di % 3 === 0 ? 2 : 1;
    for (let k = 0; k < count; k++) {
      const ci = (di * 2 + k) % CHEMICALS.length;
      const c = CHEMICALS[ci];
      const prev = stock[ci];
      // 在庫が少なくなったら入庫、ほかは出庫
      const isIn = prev < c.inQty || (n % 6 === 5);
      const qty = isIn ? c.inQty : at(c.outQty, n);
      const next = isIn ? prev + qty : prev - qty;
      stock[ci] = next;
      out.push({
        id: `dch-x${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}-${k + 1}`,
        date: ymd(m, d),
        chemicalName: c.name,
        type: isIn ? "入庫" : "出庫",
        previousStock: amount(prev, c.unit),
        quantity: amount(qty, c.unit),
        currentStock: amount(next, c.unit),
        storageLocation: c.place,
        remarks: isIn ? at(CHEM_REMARKS_IN, n) : at(CHEM_REMARKS_OUT, n),
        implementer: at(["田中裕子", "吉田浩二", "松本奈々"], n),
        confirmer: n % 4 === 3 ? "佐藤健一" : "山本真理",
        approvalStatus: statusAt(n),
      });
      n++;
    }
  });
  return out;
}

chemicalRecords.push(...chemicalExtra());
