import { useRef, useState } from "react";

export function useApprovalConfirm() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

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

  function requestRejection(action: () => void) {
    pendingActionRef.current = action;
    setShowRejectDialog(true);
  }

  function confirmRejection() {
    pendingActionRef.current?.();
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
