import iconLedger from "../assets/figma/icons/rail/ledger.svg";
import iconProgress from "../assets/figma/icons/rail/progress.svg";
import iconPendingReview from "../assets/figma/icons/rail/pending-review.svg";
import iconSchedule from "../assets/figma/icons/rail/schedule.svg";
import iconHelp from "../assets/figma/icons/rail/help.svg";
import iconSettings from "../assets/figma/icons/rail/settings.svg";

export type AppRailItem = {
  label: string;
  icon: string;
  path: string;
  badge?: number;
};

export const railNav: AppRailItem[] = [
  { label: "帳票", icon: iconLedger, path: "/app/ledger-list" },
  { label: "進捗", icon: iconProgress, path: "/app/progress", badge: 0 },
  { label: "確認待ち", icon: iconPendingReview, path: "/app/pending-review", badge: 0 },
  { label: "点検予定", icon: iconSchedule, path: "/app/schedule" },
  { label: "ヘルプ", icon: iconHelp, path: "/app/help" },
  { label: "設定", icon: iconSettings, path: "/app/settings" },
];
