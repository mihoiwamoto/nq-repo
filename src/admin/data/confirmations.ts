export type ConfirmationTarget = {
  ledgerSlug: string;
  pendingCount: number;
};

export const confirmationTargets: ConfirmationTarget[] = [
  { ledgerSlug: "water-inspection", pendingCount: 4 },
  { ledgerSlug: "glass-plastic", pendingCount: 3 },
  { ledgerSlug: "equipment-inspection", pendingCount: 3 },
];

export const pendingConfirmationCount = confirmationTargets.reduce(
  (sum, target) => sum + target.pendingCount,
  0,
);

export const confirmationPendingSlugs = confirmationTargets.map((target) => target.ledgerSlug);
