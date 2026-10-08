import type { AdditiveRecord } from "./types";
import { amount, aprilDays, at, statusAt, ymd } from "../../data/demoRecordGen";

export const additiveRecords: AdditiveRecord[] = [
  {
    id: "add1",
    date: "2025-04-01",
    additiveName: "ソルビン酸カリウム",
    type: "入庫",
    previousStock: "2,000g",
    quantity: "500g",
    currentStock: "1,500g",
    storageLocation: "棚A",
    remarks: "月次定期発注による補充入庫",
    implementer: "佐藤花子",
    confirmer: "鈴木由美",
    approvalStatus: "approved",
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
    id: "add2",
    date: "2025-04-01",
    additiveName: "ソルビン酸カリウム",
    type: "出庫",
    previousStock: "1,500g",
    quantity: "250g",
    currentStock: "1,250g",
    storageLocation: "棚A",
    remarks: "",
    implementer: "佐藤花子",
    confirmer: "鈴木由美",
    approvalStatus: "approved",
  },
  {
    id: "add3",
    date: "2025-04-02",
    additiveName: "安息香酸ナトリウム",
    type: "入庫",
    previousStock: "3,000g",
    quantity: "1,000g",
    currentStock: "2,000g",
    storageLocation: "棚B",
    remarks: "新規商品用追加注文",
    implementer: "佐藤花子",
    confirmer: "鈴木由美",
    approvalStatus: "approved",
  },
  {
    id: "add4",
    date: "2025-04-03",
    additiveName: "ソルビン酸カリウム",
    type: "出庫",
    previousStock: "1,250g",
    quantity: "500g",
    currentStock: "750g",
    storageLocation: "棚A",
    remarks: "",
    implementer: "佐藤花子",
    confirmer: "鈴木由美",
    approvalStatus: "approved",
  },
  {
    id: "add5",
    date: "2025-04-03",
    additiveName: "安息香酸ナトリウム",
    type: "出庫",
    previousStock: "2,000g",
    quantity: "300g",
    currentStock: "1,700g",
    storageLocation: "棚B",
    remarks: "製造工程用として出庫",
    implementer: "佐藤花子",
    confirmer: "鈴木由美",
    approvalStatus: "approved",
  },
];

/* ───────────────────────────────────────────────────────────────
 * 2026-10-08：データ検索の見本を増やした分（上の add1〜add5 は画面設計の hash と確定デザインが使うので変えない）。
 * 添加物ごとに在庫を持ち、入庫で増え・出庫で減る（前在庫数 → 現在庫数 が前の行とつながる）。単位は添加物ごと（g・ml・kg・袋）。
 * 4 月の稼働日に 1〜2 件、3 月末・5 月頭にも少し。備考あり/なし・長い備考・長い添加物名 を混ぜる。
 * ─────────────────────────────────────────────────────────────── */
const ADDITIVES = [
  { name: "ソルビン酸カリウム", unit: "g", stock: 3000, inQty: 2000, outQty: [250, 500], place: "棚A" },
  { name: "グリシン", unit: "kg", stock: 40, inQty: 25, outQty: [2, 3, 5], place: "棚B" },
  { name: "カラメル色素", unit: "ml", stock: 5000, inQty: 4000, outQty: [300, 600], place: "冷蔵庫" },
  { name: "ビタミンC（L-アスコルビン酸ナトリウム）", unit: "g", stock: 2400, inQty: 1000, outQty: [100, 200, 300], place: "棚A" },
  { name: "増粘多糖類（キサンタンガム・グァーガム配合 製菓用）", unit: "袋", stock: 12, inQty: 10, outQty: [1, 2], place: "原料庫 2F" },
];

const ADD_REMARKS_IN = ["月次定期発注による補充入庫", "", "新規商品用追加注文"];
const ADD_REMARKS_OUT = [
  "",
  "製造工程用として出庫",
  "",
  "新商品（プリン 低糖タイプ）の試作用。試作の配合表に合わせて計量し、残りは元の棚へ戻した。開封日を袋に記入済み。",
];

function additiveExtra(): AdditiveRecord[] {
  const out: AdditiveRecord[] = [];
  const stock = ADDITIVES.map((c) => c.stock);
  const days: [number, number][] = [[3, 27], [3, 31], ...aprilDays(4, 30, [5, 12, 26]).map((d) => [4, d] as [number, number]), [5, 2], [5, 8]];
  let n = 0;
  days.forEach(([m, d], di) => {
    const count = di % 3 === 1 ? 2 : 1;
    for (let k = 0; k < count; k++) {
      const ai = (di * 3 + k) % ADDITIVES.length;
      const a = ADDITIVES[ai];
      const prev = stock[ai];
      const isIn = prev < a.inQty || (n % 7 === 6);
      const qty = isIn ? a.inQty : at(a.outQty, n);
      const next = isIn ? prev + qty : prev - qty;
      stock[ai] = next;
      out.push({
        id: `add-x${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}-${k + 1}`,
        date: ymd(m, d),
        additiveName: a.name,
        type: isIn ? "入庫" : "出庫",
        previousStock: amount(prev, a.unit),
        quantity: amount(qty, a.unit),
        currentStock: amount(next, a.unit),
        storageLocation: a.place,
        remarks: isIn ? at(ADD_REMARKS_IN, n) : at(ADD_REMARKS_OUT, n),
        implementer: at(["佐藤花子", "高橋美咲", "山本拓海"], n),
        confirmer: n % 4 === 2 ? "佐藤健一" : "鈴木由美",
        approvalStatus: statusAt(n),
      });
      n++;
    }
  });
  return out;
}

additiveRecords.push(...additiveExtra());
