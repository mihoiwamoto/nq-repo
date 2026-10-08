export type PendingReview = {
  id: string;
  date: string;
  name: string;
  ledgerSlug: string;
  /** 見送り = 実施者が点検を見送った記録（確定デザイン 7139:346491）。確認者が見て提出する流れは点検済みと同じ */
  status: "点検済み" | "見送り" | "差し戻し";
  /** 差し戻しのうち、見送った記録が差し戻されたもの（機械器具点検 7139:345916・清掃記録 7139:229031）。点検項目は出さず（機械器具点検は「ー」）見送り理由を出す */
  skipped?: boolean;
  lineId?: string;
  pointId?: string;
  recordId?: string;
  floorId?: string;
  additiveId?: string;
  postId?: string;
  sampleId?: string;
  machineId?: string;
  chemicalId?: string;
};

export const PENDING_REVIEWS: PendingReview[] = [
  {
    id: "p1",
    date: "04/01",
    name: "ソルビン酸",
    ledgerSlug: "additive-management",
    status: "点検済み",
    additiveId: "a1",
  },
  {
    id: "p2",
    date: "04/01",
    // 確定デザイン（7139:293969）どおり頻度を頭に付ける
    name: "【毎日】豆乳ライン",
    ledgerSlug: "equipment-inspection",
    status: "点検済み",
    lineId: "l8",
  },
  // 見送りの記録（確定デザイン 7139:346491 の「【毎週】自動計量機・風力選別機ライン」）
  {
    id: "p20",
    date: "04/01",
    name: "【毎週】自動計量機・風力選別機ライン",
    ledgerSlug: "equipment-inspection",
    status: "見送り",
    lineId: "l20",
  },
  { id: "p4", date: "04/01", name: "添加物", ledgerSlug: "scale-inspection", status: "点検済み", postId: "additive" },
  {
    id: "p5",
    date: "04/01",
    name: "点検場所A",
    ledgerSlug: "water-inspection",
    status: "点検済み",
    pointId: "wp1",
    recordId: "wp1-r1",
  },
  {
    id: "p6",
    date: "03/31",
    name: "点検場所B",
    ledgerSlug: "water-inspection",
    status: "点検済み",
    pointId: "wp2",
    recordId: "wp2-r1",
  },
  {
    id: "p7",
    date: "03/31",
    name: "点検場所B",
    ledgerSlug: "water-inspection",
    status: "点検済み",
    pointId: "wp2",
    recordId: "wp2-r2",
  },
  {
    id: "p8",
    date: "04/01",
    // 確定デザイン（7139:221204 / 7139:229123）どおり頻度を頭に付ける
    name: "【毎日】ゆばライン",
    ledgerSlug: "cleaning-record",
    status: "点検済み",
    lineId: "c1",
  },
  // 清掃記録の見送りの記録（機械器具点検の p20 と同じ。ラインの一覧で「見送り」の【毎週】充填・包装ライン）
  {
    id: "p22",
    date: "04/01",
    name: "【毎週】充填・包装ライン",
    ledgerSlug: "cleaning-record",
    status: "見送り",
    lineId: "c18",
  },
  {
    id: "p9",
    date: "04/01",
    name: "フロアB",
    ledgerSlug: "glass-plastic",
    status: "点検済み",
    floorId: "f2",
  },
  {
    id: "p10",
    date: "04/01",
    // 確定デザイン（7139:293969）どおり頻度を頭に付ける
    name: "【毎日】ゆばライン（つまみ関係）",
    ledgerSlug: "equipment-inspection",
    status: "点検済み",
    lineId: "l9",
  },
  {
    id: "p11",
    date: "04/01",
    name: "マンゴープリン　ストレート　1kg",
    ledgerSlug: "sensory-inspection",
    status: "点検済み",
  },
  {
    id: "p12",
    date: "04/01",
    name: "金探1号機（1kg以下の場合）",
    ledgerSlug: "metal-xray-detection",
    status: "点検済み",
    machineId: "m2",
  },
  {
    id: "p13",
    date: "04/01",
    name: "金探1号機（500g以下の場合）",
    ledgerSlug: "metal-xray-detection",
    status: "差し戻し",
    machineId: "m1",
  },
  {
    id: "p14",
    date: "04/01",
    // 確定デザイン（7139:293969）どおり頻度を頭に付ける
    name: "【毎日】豆乳ライン",
    ledgerSlug: "equipment-inspection",
    status: "差し戻し",
    lineId: "l8",
  },
  // 見送った記録が差し戻された場合（確定デザイン「確認待ち_機械器具点検_点検見送り後_差し戻し_再度点検見送りする場合」）
  {
    id: "p19",
    date: "04/01",
    name: "【毎日】自動計量機・風力選別機ライン",
    ledgerSlug: "equipment-inspection",
    status: "差し戻し",
    skipped: true,
    lineId: "l11",
  },
  // 清掃記録の差し戻し（機械器具点検の p14 と同じ流れ）
  {
    id: "p15",
    date: "04/01",
    // 確定デザイン（7139:221204 / 7139:229123）どおり頻度を頭に付ける
    name: "【毎日】ゆばライン",
    ledgerSlug: "cleaning-record",
    status: "差し戻し",
    lineId: "c1",
  },
  // 清掃記録の見送った記録が差し戻された場合（機械器具点検の p19 と同じ流れ。
  // 確定デザイン 7139:229031「確認待ち_清掃記録_点検見送り後_差し戻し_再度点検見送りする場合」）
  {
    id: "p21",
    date: "04/01",
    name: "【毎日】ゆばライン",
    ledgerSlug: "cleaning-record",
    status: "差し戻し",
    skipped: true,
    lineId: "c1",
  },
  // 薬品管理の点検済み（確認者が見て提出する。添加物管理の p1 と同じ流れ。2026-10-05）
  {
    id: "p18",
    date: "04/01",
    name: "ソルビン酸",
    ledgerSlug: "chemical-management",
    status: "点検済み",
    chemicalId: "c1",
  },
  // 薬品管理・添加物管理の差し戻し（機械器具点検の p14 と同じ流れ。2026-10-02）
  {
    id: "p16",
    date: "04/02",
    name: "ソルビン酸",
    ledgerSlug: "chemical-management",
    status: "差し戻し",
    chemicalId: "c1",
  },
  {
    id: "p17",
    date: "04/01",
    name: "ソルビン酸",
    ledgerSlug: "additive-management",
    status: "差し戻し",
    additiveId: "a1",
  },
];
