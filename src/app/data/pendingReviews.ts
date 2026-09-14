export type PendingReview = {
  id: string;
  date: string;
  name: string;
  ledgerSlug: string;
  status: "点検済み" | "差し戻し";
  lineId?: string;
  pointId?: string;
  recordId?: string;
  floorId?: string;
  additiveId?: string;
  postId?: string;
  sampleId?: string;
  machineId?: string;
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
    name: "豆乳ライン",
    ledgerSlug: "equipment-inspection",
    status: "点検済み",
    lineId: "l8",
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
    name: "ゆばライン",
    ledgerSlug: "cleaning-record",
    status: "点検済み",
    lineId: "c1",
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
    name: "ゆばライン（つまみ関係）",
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
    name: "豆乳ライン",
    ledgerSlug: "equipment-inspection",
    status: "差し戻し",
    lineId: "l8",
  },
];
