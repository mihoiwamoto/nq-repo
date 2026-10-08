import type { SampleRecord } from "./types";
import { aprilDays, at, statusAt, ymd } from "../../data/demoRecordGen";

export const sampleRecords: SampleRecord[] = [
  {
    id: "ds1",
    date: "2025-04-01",
    productName: "仕出しだし巻き玉子 冷凍",
    expirationDate: "2026-06-30",
    lotNumber: "SSDLODDLDA",
    manufactureDate: "2025-07-01",
    sampleType: "小分け",
    sampleQuantity: "100",
    unit: "g",
    storageLocation: "第一冷蔵庫",
    remarks: "月次定期保存分",
    status: "保管中",
    implementer: "田中太郎",
    confirmer: "確認者01",
    approvalStatus: "approved",
    timestamp: "田中太郎 2025/07/01 10:30",
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
    id: "ds2",
    date: "2025-04-02",
    productName: "鮭の西京焼き 惣菜",
    expirationDate: "2026-07-15",
    lotNumber: "SSDLODDLDB",
    manufactureDate: "2025-07-02",
    sampleType: "原本",
    sampleQuantity: "1",
    unit: "P",
    storageLocation: "第二冷蔵庫",
    remarks: "",
    status: "保管中",
    implementer: "実施者02",
    confirmer: "確認者01",
    approvalStatus: "pending",
    timestamp: "実施者02 2025/04/02 09:15",
  },
  {
    id: "ds3",
    date: "2025-04-03",
    productName: "野菜の煮物パック",
    expirationDate: "2025-05-01",
    manufactureDate: "2025-04-03",
    sampleType: "小分け",
    sampleQuantity: "50",
    unit: "g",
    storageLocation: "第一冷蔵庫",
    remarks: "賞味期限切れのため破棄",
    status: "破棄済み",
    discardedDate: "2025-05-02",
    discardReason: "賞味期限切れ",
    implementer: "田中太郎",
    confirmer: "確認者02",
    approvalStatus: "approved",
    timestamp: "田中太郎 2025/04/03 09:45",
  },
  {
    id: "ds4",
    date: "2025-04-04",
    productName: "唐揚げ 冷凍",
    expirationDate: "2026-08-01",
    lotNumber: "KMSSG1KG",
    manufactureDate: "2025-08-01",
    sampleType: "原本",
    sampleQuantity: "1",
    unit: "P",
    storageLocation: "冷凍庫A",
    remarks: "不具合調査のため使用。",
    status: "破棄済み",
    discardedDate: "2025-04-20",
    discardReason: "その他",
    discardReasonNote: "不具合調査のため使用。",
    implementer: "実施者03",
    confirmer: "確認者02",
    approvalStatus: "rejected",
    timestamp: "実施者03 2025/04/04 11:20",
  },
  {
    id: "ds5",
    date: "2025-04-05",
    productName: "ポテトサラダ 業務用",
    expirationDate: "2025-05-10",
    manufactureDate: "2025-04-05",
    sampleType: "小分け",
    sampleQuantity: "200",
    unit: "g",
    storageLocation: "第二冷蔵庫",
    remarks: "",
    status: "保管中",
    implementer: "実施者02",
    confirmer: "確認者01",
    approvalStatus: "approved",
    timestamp: "実施者02 2025/04/05 13:50",
  },
];

/* ───────────────────────────────────────────────────────────────
 * 2026-10-08：データ検索の見本を増やした分（上の ds1〜ds5 は画面設計の hash と確定デザインが使うので変えない）。
 * 4 月の稼働日に 1〜2 件（製造した製品の検体を保管）。3 月末・5 月頭にも少し。
 * 保管中・破棄済み（破棄日と理由。賞味期限切れ／その他＋理由）、ロットNo. の無い製品（管理画面で「記載しない」）、
 * 長い製品名・長い備考 を混ぜる。
 * ─────────────────────────────────────────────────────────────── */
const SAMPLE_PRODUCTS = [
  { productName: "仕出しだし巻き玉子 冷凍", lot: "SSDL", life: 365, sampleType: "小分け", sampleQuantity: "100", unit: "g", storageLocation: "第一冷蔵庫" },
  { productName: "茶碗蒸しの素（濃縮）", lot: "CWMS", life: 180, sampleType: "原本", sampleQuantity: "1", unit: "本", storageLocation: "第二冷蔵庫" },
  { productName: "ふわとろスクランブルエッグ", lot: "", life: 30, sampleType: "小分け", sampleQuantity: "50", unit: "g", storageLocation: "第一冷蔵庫" },
  { productName: "だし巻き玉子 厚焼き 300g", lot: "DSAT", life: 14, sampleType: "原本", sampleQuantity: "1", unit: "P", storageLocation: "第二冷蔵庫" },
  { productName: "唐揚げ 冷凍", lot: "KMSS", life: 365, sampleType: "原本", sampleQuantity: "1", unit: "P", storageLocation: "冷凍庫A" },
  {
    productName: "業務用 国産鶏の照り焼き（スライス・タレ別添）冷凍 1kg×10袋入り",
    lot: "",
    life: 270,
    sampleType: "小分け",
    sampleQuantity: "200",
    unit: "g",
    storageLocation: "冷凍庫B",
  },
];

const SAMPLE_REMARKS = [
  "",
  "月次定期保存分",
  "",
  "新しい原料（卵）に切り替えた初回ロット",
  "",
  "お客様からの問い合わせ（異味）に備えて同じロットを追加で保存。問い合わせの調査が終わるまで破棄しないこと。品質管理課長の確認済み。",
];

function addDaysTo(date: string, days: number) {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function sampleExtra(): SampleRecord[] {
  const out: SampleRecord[] = [];
  const staff = ["田中太郎", "高橋美咲", "渡辺真由", "吉田浩二"];
  const days: [number, number][] = [[3, 27], [3, 31], ...aprilDays(7, 30, [9, 16, 23, 30]).map((d) => [4, d] as [number, number]), [5, 1], [5, 2]];
  let n = 0;
  days.forEach(([m, d], di) => {
    const count = di % 6 === 1 ? 2 : 1;
    for (let k = 0; k < count; k++) {
      const p = at(SAMPLE_PRODUCTS, di + k * 3);
      const date = ymd(m, d);
      const manufactureDate = date;
      const implementer = at(staff, n);
      const time = at(["09:15", "10:30", "13:40", "15:05"], n);
      const rec: SampleRecord = {
        id: `ds-x${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}-${k + 1}`,
        date,
        productName: p.productName,
        expirationDate: addDaysTo(manufactureDate, p.life),
        ...(p.lot ? { lotNumber: `${p.lot}${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}${String.fromCharCode(65 + k)}` } : {}),
        manufactureDate,
        sampleType: p.sampleType,
        sampleQuantity: p.sampleQuantity,
        unit: p.unit,
        storageLocation: p.storageLocation,
        remarks: at(SAMPLE_REMARKS, n),
        status: "保管中",
        implementer,
        confirmer: n % 2 ? "確認者02" : "確認者01",
        approvalStatus: statusAt(n),
        timestamp: `${implementer} ${date.replaceAll("-", "/")} ${time}`,
      };
      // 賞味期限の短い製品は期限が来たら破棄、ときどき「その他」で破棄（調査に使用など）。破棄した記録には「破棄しないこと」の備考は付けない
      if (p.life <= 30 && addDaysTo(manufactureDate, p.life + 1) <= "2025-05-08") {
        rec.status = "破棄済み";
        rec.discardedDate = addDaysTo(manufactureDate, p.life + 1);
        rec.discardReason = "賞味期限切れ";
      } else if (n % 7 === 4) {
        rec.status = "破棄済み";
        rec.discardedDate = addDaysTo(manufactureDate, 5 + (n % 4));
        rec.discardReason = "その他";
        rec.discardReasonNote = at(["お客様からの問い合わせの調査に使用", "保管庫の温度異常（冷凍庫A の扉の閉め忘れ）のため"], n);
      }
      if (rec.status === "破棄済み" && rec.remarks.includes("破棄しないこと")) rec.remarks = "";
      out.push(rec);
      n++;
    }
  });
  return out;
}

sampleRecords.push(...sampleExtra());
