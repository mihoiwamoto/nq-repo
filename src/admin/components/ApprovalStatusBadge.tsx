import type { ApprovalStatus } from "../data/approvals";

const STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending: "承認待ち",
  approved: "承認済み",
  rejected: "差し戻し",
};

export const APPROVAL_STATUS_COLOR: Record<ApprovalStatus, string> = {
  pending: "#808080",
  approved: "var(--semantic-brand-primary)",
  rejected: "var(--semantic-brand-danger)",
};

export function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  return (
    <span
      className="h-6 w-20 rounded-lg flex items-center justify-center text-sm text-white shrink-0"
      style={{ backgroundColor: APPROVAL_STATUS_COLOR[status] }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
