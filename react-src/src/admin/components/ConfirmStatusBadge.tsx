export type ConfirmStatus = "unconfirmed" | "confirmed";

const CONFIRM_STATUS_LABEL: Record<ConfirmStatus, string> = {
  unconfirmed: "点検済み",
  confirmed: "承認待ち",
};

export const CONFIRM_STATUS_COLOR: Record<ConfirmStatus, string> = {
  unconfirmed: "#808080",
  confirmed: "var(--semantic-status-success)",
};

export function ConfirmStatusBadge({ status }: { status: ConfirmStatus }) {
  return (
    <span
      className="h-6 w-20 rounded-lg flex items-center justify-center text-sm text-white shrink-0"
      style={{ backgroundColor: CONFIRM_STATUS_COLOR[status] }}
    >
      {CONFIRM_STATUS_LABEL[status]}
    </span>
  );
}
