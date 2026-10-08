import { useRef, useState } from "react";

export function useApprovalConfirm() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showToast, setShowToast] = useState(false);
  /** 差し戻しの action は差し戻し理由を受け取る（本番 ApprovalFlowService::updateApprovalStatus は理由をコメントとして残す） */
  const pendingActionRef = useRef<((reason?: string) => void) | null>(null);

  function requestApproval(action: () => void) {
    pendingActionRef.current = action;
    setShowConfirmDialog(true);
  }

  function confirmApproval() {
    pendingActionRef.current?.();
    pendingActionRef.current = null;
    setShowConfirmDialog(false);
    setShowToast(true);
  }

  function cancelApproval() {
    pendingActionRef.current = null;
    setShowConfirmDialog(false);
  }

  function requestRejection(action: (reason?: string) => void) {
    pendingActionRef.current = action;
    setShowRejectDialog(true);
  }

  function confirmRejection(reason?: string) {
    pendingActionRef.current?.(reason);
    pendingActionRef.current = null;
    setShowRejectDialog(false);
    setShowToast(true);
  }

  function cancelRejection() {
    pendingActionRef.current = null;
    setShowRejectDialog(false);
  }

  return {
    showConfirmDialog,
    showRejectDialog,
    showToast,
    closeToast: () => setShowToast(false),
    requestApproval,
    confirmApproval,
    cancelApproval,
    requestRejection,
    confirmRejection,
    cancelRejection,
  };
}
