import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Breadcrumb } from "../../components/Breadcrumb";
import { PageTitleBar } from "../../components/PageTitleBar";
import { Toast } from "../../components/Toast";
import { getFactoryName } from "../../../data/factories";
import { getCompanyName } from "../../../data/companies";
import { ROLE_COLORS, ROLE_LABELS, SYSTEM_AUTHORITY_LABELS } from "./types";
import { useStaffManagement } from "./StaffManagementContext";
import iconTrash from "../../../assets/figma/icons/common/trash.svg";
import iconCheckmark from "../../../assets/figma/icons/common/checkmark.svg";
import iconXMark from "../../../assets/figma/icons/common/x-mark.svg";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 items-center w-full">
      <div className="w-40 shrink-0 text-xl text-[var(--semantic-brand-primary)]">{label}</div>
      <div className="flex-1 text-xl text-[var(--semantic-text-primary)]">{children}</div>
    </div>
  );
}

export function StaffDetailPage() {
  const { staffId } = useParams<{ staffId: string }>();
  const { staff, removeStaff } = useStaffManagement();
  const navigate = useNavigate();
  const location = useLocation();
  const member = staff.find((s) => s.id === staffId);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  const [showUpdateToast, setShowUpdateToast] = useState(false);

  useEffect(() => {
    if ((location.state as any)?.justSaved) {
      setShowUpdateToast(true);
    }
    if ((location.state as any)?.deleted) {
      setShowDeleteToast(true);
    }
  }, [location.state]);

  if (!member) {
    return (
      <div className="p-6">
        <p className="text-base text-[var(--semantic-text-secondary)]">職員が見つかりません</p>
      </div>
    );
  }

  function handleDelete() {
    removeStaff(member!.id);
    setDeleteDialogOpen(false);
    navigate("/admin/staff/deleted", { state: { deleted: true } });
  }

  return (
    <div>
      <PageTitleBar title="詳細" showBack />
      <Breadcrumb items={[{ label: "職員管理", to: "/admin/staff" }, { label: "詳細" }]} />
      <div className="flex flex-col gap-4 items-start p-6">
        <div className="flex items-center justify-end w-full gap-2">
          <button
            type="button"
            onClick={() => navigate(`/admin/staff/${member.id}/edit`)}
            className="bg-white border border-[var(--semantic-brand-primary)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-20 rounded-lg flex items-center justify-center gap-1 text-sm text-[var(--semantic-brand-primary)]"
          >
            ✎ 編集
          </button>
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            className="bg-white border border-[var(--semantic-brand-danger)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-10 w-10 rounded-lg flex items-center justify-center"
          >
            <img src={iconTrash} alt="削除" className="size-6" />
          </button>
        </div>

        <div className="bg-white flex flex-col gap-6 items-start px-4 py-6 rounded-lg w-full">
          <Row label="名前">{member.name}</Row>
          <div className="border-t border-[#d0d0d0] w-full" />
          <Row label="社員番号">{member.employeeNumber}</Row>
          <div className="border-t border-[#d0d0d0] w-full" />
          <Row label="システム権限">{SYSTEM_AUTHORITY_LABELS[member.systemAuthority]}</Row>
          <div className="border-t border-[#d0d0d0] w-full" />
          <Row label="企業">{getCompanyName(member.companyId)}</Row>
          <div className="border-t border-[#d0d0d0] w-full" />

          {member.assignments.map((assignment, index) => (
            <div key={`${assignment.factoryId}-${index}`} className="flex flex-col gap-4 w-full">
              <Row label="工場">{getFactoryName(assignment.factoryId)}</Row>
              <div className="flex gap-4 items-center w-full">
                <div className="w-40 shrink-0 text-xl text-[var(--semantic-brand-primary)]">権限</div>
                <span
                  className="h-10 w-28 rounded-lg flex items-center justify-center text-base"
                  style={{
                    backgroundColor: ROLE_COLORS[assignment.role].bg,
                    color: ROLE_COLORS[assignment.role].text,
                  }}
                >
                  {ROLE_LABELS[assignment.role]}
                </span>
              </div>
              <div className="border-t border-[#d0d0d0] w-full" />
            </div>
          ))}

          <Row label="メールアドレス">{member.email || "未登録"}</Row>
          <div className="border-t border-[#d0d0d0] w-full" />
          <Row label="パスワード">{member.hasPassword ? "登録済み" : "未登録"}</Row>
        </div>
      </div>

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteDialogOpen(false)} />
          <div className="relative bg-[var(--semantic-background-page)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-10 items-center px-6 py-10 w-[640px]">
            <div className="flex flex-col gap-6 items-start w-full">
              <h2 className="text-2xl text-[var(--semantic-text-primary)] text-center w-full">
                職員情報を削除
              </h2>
              <p className="text-base text-[var(--semantic-text-primary)]">
                削除した情報は元に戻せません。削除しますか？
              </p>
            </div>
            <div className="flex gap-6 items-center justify-center w-full">
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                className="bg-white shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-[var(--semantic-text-primary)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="bg-[var(--semantic-brand-danger)] shadow-[0px_2px_2px_rgba(51,51,51,0.24)] h-12 w-[200px] rounded-lg text-base text-white"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpdateToast && <Toast message="更新されました。" onClose={() => setShowUpdateToast(false)} />}
      {showDeleteToast && <Toast message="削除されました。" onClose={() => setShowDeleteToast(false)} />}
    </div>
  );
}
