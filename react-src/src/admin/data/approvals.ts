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

export const approvalRequests: ApprovalRequest[] = [
  {
    id: "1",
    status: "pending",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "equipment-inspection",
    description: "25年4月1日点検分",
  },
  {
    id: "2",
    status: "pending",
    companyName: "㈱西通りプリン 本社工場",
    ledgerSlug: "scale-inspection",
    description: "25年4月1日点検分_プリン",
  },
  {
    id: "3",
    status: "pending",
    companyName: "㈱西通りプリン 本社工場",
    ledgerSlug: "scale-inspection",
    description: "25年4月1日点検分_アイス",
  },
  {
    id: "4",
    status: "pending",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "water-inspection",
    description: "25年4月1日点検分_給湯室",
  },
  {
    id: "5",
    status: "pending",
    companyName: "㈱西通りプリン 本社工場",
    ledgerSlug: "water-inspection",
    description: "25年4月2日点検分_点検場所B",
  },
  {
    id: "6",
    status: "pending",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "cleaning-record",
    description: "25年4月1日点検分",
  },
  {
    id: "7",
    status: "pending",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "additive-management",
    description: "25年4月1日点検分_ソルビン酸",
  },
  {
    id: "8",
    status: "pending",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "chemical-management",
    description: "25年4月1日点検分_次亜塩素酸ナトリウム",
  },
  {
    id: "9",
    status: "pending",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "sample-management",
    description: "25年4月1日保存分_仕出しだし巻き玉子 冷凍",
  },
  {
    id: "10",
    status: "pending",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "metal-xray-detection",
    description: "25年4月1日点検分",
  },
  {
    id: "11",
    status: "pending",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "sensory-inspection",
    description: "25年4月1日点検分",
  },
  {
    id: "12",
    status: "pending",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "glass-plastic",
    description: "25年4月1日点検分_フロアA",
  },
  {
    id: "13",
    status: "approved",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "cleaning-record",
    description: "25年3月28日点検分",
  },
  {
    id: "14",
    status: "approved",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "equipment-inspection",
    description: "25年3月28日点検分",
  },
  {
    id: "15",
    status: "approved",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "additive-management",
    description: "25年3月28日点検分_安息香酸ナトリウム",
  },
  {
    id: "16",
    status: "rejected",
    companyName: "㈱西原食品 本社工場",
    ledgerSlug: "chemical-management",
    description: "25年3月28日点検分_次亜塩素酸ナトリウム",
  },
  {
    id: "17",
    status: "rejected",
    companyName: "㈱西通りプリン 本社工場",
    ledgerSlug: "water-inspection",
    description: "25年3月29日点検分_点検場所A",
  },
];
