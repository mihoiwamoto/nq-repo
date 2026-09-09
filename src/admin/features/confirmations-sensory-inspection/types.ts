export type ConfirmStatus = "unconfirmed" | "confirmed";

export type Comment = {
  id: string;
  author: string;
  timestamp: string;
  text: string;
};

export const CRITERIA = ["味", "形", "色", "食感", "香り", "とろみ"] as const;
export type Criterion = (typeof CRITERIA)[number];

export type CriterionScore = {
  score: number;
  reason?: string;
  action?: string;
};

export function isAbnormalScore(score: number) {
  return score <= 2;
}

export type ScoreEntry = {
  id: string;
  inspectorName: string;
  confirmerName: string;
  date: string;
  hasComparisonProduct: boolean;
  comparisonManufactureDate?: string;
  scores: Record<Criterion, CriterionScore>;
};

export type SensoryConfirmationRecord = {
  id: string;
  date: string;
  productName: string;
  manufactureDate: string;
  expiryDate: string;
  confirmer: string;
  confirmStatus: ConfirmStatus;
  scoreEntries: ScoreEntry[];
  comments?: Comment[];
};
