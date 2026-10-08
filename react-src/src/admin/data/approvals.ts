export type ApprovalStatus = "pending" | "approved" | "rejected";

export type ApprovalRequest = {
  id: string;
  status: ApprovalStatus;
  companyName: string;
  ledgerSlug: string;
  description: string;
};

export function updateApprovalRequestStatus(id: string, status: ApprovalStatus) {
  const request = approvalRequests.find((r) => r.id === id);
  if (request) {
    request.status = status;
  }
}

/** description の点検日は本番どおり「2025年04月01日点検分」（Y年m月d日。WaterApprovalFlowService などの書式。2026-10-08） */
export const approvalRequests: ApprovalRequest[] = [
  {
    id: "1",
    status: "pending",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "equipment-inspection",
    description: "2025年04月01日点検分",
  },
  {
    id: "2",
    status: "pending",
    companyName: "㈱西通りプリン 本社工場",
    ledgerSlug: "scale-inspection",
    description: "2025年04月01日点検分_プリン",
  },
  {
    id: "3",
    status: "pending",
    companyName: "㈱西通りプリン 本社工場",
    ledgerSlug: "scale-inspection",
    description: "2025年04月01日点検分_アイス",
  },
  {
    id: "4",
    status: "pending",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "water-inspection",
    description: "2025年04月01日点検分_給湯室",
  },
  {
    id: "5",
    status: "pending",
    companyName: "㈱西通りプリン 本社工場",
    ledgerSlug: "water-inspection",
    description: "2025年04月02日点検分_点検場所B",
  },
  {
    id: "6",
    status: "pending",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "cleaning-record",
    description: "2025年04月01日点検分",
  },
  {
    id: "7",
    status: "pending",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "additive-management",
    description: "2025年04月01日点検分_ソルビン酸",
  },
  {
    id: "8",
    status: "pending",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "chemical-management",
    description: "2025年04月01日点検分_次亜塩素酸ナトリウム",
  },
  {
    id: "9",
    status: "pending",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "sample-management",
    description: "2025年04月01日点検分",
  },
  {
    id: "10",
    status: "pending",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "metal-xray-detection",
    description: "2025年04月01日点検分",
  },
  {
    id: "11",
    status: "pending",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "sensory-inspection",
    description: "2025年04月01日点検分",
  },
  {
    id: "12",
    status: "pending",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "glass-plastic",
    description: "2025年04月01日点検分_フロアA",
  },
  {
    id: "13",
    status: "approved",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "cleaning-record",
    description: "2025年03月28日点検分",
  },
  {
    id: "14",
    status: "approved",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "equipment-inspection",
    description: "2025年03月28日点検分",
  },
  {
    id: "15",
    status: "approved",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "additive-management",
    description: "2025年03月28日点検分_安息香酸ナトリウム",
  },
  {
    id: "16",
    status: "rejected",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "chemical-management",
    description: "2025年03月28日点検分_次亜塩素酸ナトリウム",
  },
  {
    id: "17",
    status: "rejected",
    companyName: "㈱西通りプリン 本社工場",
    ledgerSlug: "water-inspection",
    description: "2025年03月29日点検分_点検場所A",
  },
];

/**
 * f1・西通りプリン以外の工場の申請も並べる（2026-10-07。工場ごとに違う見本）。
 * 工場ごとに 1〜4 帳票ぶん、承認待ち・承認済み・差し戻しを混ぜる。f5 は申請の無い工場
 */
const DEMO_FACTORIES = [
  "㈱西原食品 第二工場", "㈱西原食品 伊佐工場", "㈱ヒコシマリン 本社工場", "㈱ゆば将 本社工場",
  "㈱匠フーズ 本社工場", "㈱薩摩家 本社工場", "㈱西通りプリン 安曇野工場", "㈱桜寿食品 本社工場",
  "㈱亜味撰 本社工場", "㈱ゆう屋 本社工場", "㈱五島製麺 本社工場", "㈱有明農産 本社工場",
  "龍屋物産㈱ 本社工場", "松山製菓㈱ 本社工場", "松山製菓㈱ 知多かなん堂工場", "はやしハム㈱ 本社工場",
  "あったか市場㈱ キットファクトリー", "㈱鈴木商会 製造部門",
];
const DEMO_LEDGERS = [
  "equipment-inspection", "cleaning-record", "water-inspection", "scale-inspection", "sensory-inspection",
  "glass-plastic", "metal-xray-detection", "sample-management", "chemical-management", "additive-management",
];
const DEMO_SUFFIX: Record<string, string> = {
  "water-inspection": "_給湯室",
  "chemical-management": "_次亜塩素酸ナトリウム",
  "additive-management": "_ソルビン酸",
};
const DEMO_STATUS: ApprovalStatus[] = ["pending", "pending", "approved", "rejected"];
DEMO_FACTORIES.forEach((companyName, fi) => {
  const n = (fi % 4) + 1;
  for (let k = 0; k < n; k++) {
    const ledgerSlug = DEMO_LEDGERS[(fi * 3 + k * 7) % DEMO_LEDGERS.length];
    const day = ((fi * 5 + k * 3) % 27) + 1;
    approvalRequests.push({
      id: `d${fi + 1}-${k + 1}`,
      status: DEMO_STATUS[(fi + k) % DEMO_STATUS.length],
      companyName,
      ledgerSlug,
      description:
        // 本番の承認申請のカードは Y年m月d日（WaterApprovalFlowService など。2026-10-08 に全帳票を合わせた）
        `2025年04月${String(day).padStart(2, "0")}日点検分${DEMO_SUFFIX[ledgerSlug] ?? ""}`,
    });
  }
});
