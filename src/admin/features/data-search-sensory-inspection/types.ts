import type { ApprovalStatus } from "../../data/approvals";

export interface Comment {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

export const CRITERIA = ["味", "形", "色", "食感", "香り", "とろみ"] as const;
export type Criterion = (typeof CRITERIA)[number];

export type CriterionScore = {
  score: number;
  reason?: string;
  /** アプリで点数を入れた時刻。詳細画面で実施者名と並べて出す */
  timestamp?: string;
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

export type SensoryRecord = {
  id: string;
  date: string;
  productName: string;
  manufactureDate: string;
  expiryDate: string;
  confirmer: string;
  approvalStatus: ApprovalStatus;
  scoreEntries: ScoreEntry[];
  comment?: string;
  comments?: Comment[];
};
