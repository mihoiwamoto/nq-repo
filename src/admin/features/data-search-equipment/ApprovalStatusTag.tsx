import type { ApprovalStatus } from "./types";

const LABEL: Record<ApprovalStatus, string> = {
  pending: "承認待ち",
  approved: "承認済み",
  rejected: "差し戻し",
};

const COLOR: Record<ApprovalStatus, string> = {
  pending: "#808080",
  approved: "var(--semantic-brand-primary)",
  rejected: "var(--semantic-brand-danger)",
};

export function ApprovalStatusTag({ status }: { status: ApprovalStatus }) {
  return (
    <span
      className="h-6 w-20 rounded-lg flex items-center justify-center text-sm text-white shrink-0"
      style={{ backgroundColor: COLOR[status] }}
    >
      {LABEL[status]}
    </span>
  );
}
