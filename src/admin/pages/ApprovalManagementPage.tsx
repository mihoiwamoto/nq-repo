import { useState } from "react";
import { Link } from "react-router-dom";
import { approvalRequests, type ApprovalStatus } from "../data/approvals";
import { ledgerCategories } from "../../data/ledgers";
import { ApprovalStatusBadge } from "../components/ApprovalStatusBadge";

const TABS: { status: ApprovalStatus; label: string }[] = [
  { status: "pending", label: "承認待ち" },
  { status: "approved", label: "承認済み" },
  { status: "rejected", label: "差し戻し" },
];

export function ApprovalManagementPage() {
  const [activeTab, setActiveTab] = useState<ApprovalStatus>("pending");
  const items = approvalRequests.filter((item) => item.status === activeTab);
  const pendingCount = approvalRequests.filter((item) => item.status === "pending").length;

  return (
    <div>
      <div className="bg-[var(--semantic-background-page)] shadow-[0px_2px_2px_rgba(51,51,51,0.16)] flex items-center p-6">
        <h1 className="text-[28px] leading-[1.4] font-semibold text-[var(--semantic-text-primary)]">
          承認申請管理
        </h1>
      </div>
      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-center border-b-2 border-[#d0d0d0] w-full">
          {TABS.map((tab) => {
            const isActive = tab.status === activeTab;
            return (
              <button
                key={tab.status}
                type="button"
                onClick={() => setActiveTab(tab.status)}
                className={`relative h-12 w-[156px] flex items-center justify-center gap-2 border-b-2 ${
                  isActive
                    ? "border-[var(--semantic-brand-primary)] text-[var(--semantic-brand-primary)]"
                    : "border-transparent text-[var(--semantic-text-secondary)]"
                } text-xl`}
              >
                {tab.label}
                {tab.status === "pending" && pendingCount > 0 && (
                  <span className="absolute -top-2 left-[122px] h-5 min-w-[30px] px-1.5 rounded-full bg-[var(--semantic-brand-danger)] text-white text-[10px] flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {items.length === 0 ? (
          <p className="text-[var(--semantic-text-secondary)]">対象の申請はありません</p>
        ) : (
          <div className="flex flex-col gap-6 w-full">
            {items.map((item) => {
              const category = ledgerCategories.find((c) => c.slug === item.ledgerSlug);
              const cardClassName =
                "bg-white shadow-[0px_2px_3px_rgba(51,51,51,0.24)] rounded-lg flex flex-col gap-2 items-start px-4 py-3 w-full text-left";
              const cardContent = (
                <>
                  <ApprovalStatusBadge status={item.status} />
                  <p className="text-base text-[var(--semantic-text-primary)]">{item.companyName}</p>
                  <div className="flex items-center gap-2 w-full">
                    {category && (
                      <img src={category.adminIcon} alt="" className="size-6 shrink-0" />
                    )}
                    <span className="text-xl text-[var(--semantic-brand-primary)]">
                      {category?.adminLabel}
                    </span>
                  </div>
                  <div className="border-t border-[#d0d0d0] w-full" />
                  <p className="text-base text-[var(--semantic-text-primary)]">{item.description}</p>
                </>
              );

              if (
                item.ledgerSlug === "cleaning-record" ||
                item.ledgerSlug === "equipment-inspection" ||
                item.ledgerSlug === "additive-management" ||
                item.ledgerSlug === "chemical-management" ||
                item.ledgerSlug === "sample-management" ||
                item.ledgerSlug === "metal-xray-detection" ||
                item.ledgerSlug === "sensory-inspection" ||
                item.ledgerSlug === "water-inspection"
              ) {
                return (
                  <Link key={item.id} to={`/admin/approvals/${item.ledgerSlug}`} className={cardClassName}>
                    {cardContent}
                  </Link>
                );
              }

              if (item.ledgerSlug === "scale-inspection") {
                return (
                  <Link
                    key={item.id}
                    to={`/admin/approvals/scale-inspection/${item.id}`}
                    className={cardClassName}
                  >
                    {cardContent}
                  </Link>
                );
              }

              return (
                <button key={item.id} type="button" className={cardClassName}>
                  {cardContent}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
