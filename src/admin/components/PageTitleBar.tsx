import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import iconArrowLeft from "../../assets/figma/icons/common/arrow-left.svg";

export function PageTitleBar({
  title,
  showBack,
  action,
}: {
  title: string;
  showBack?: boolean;
  action?: ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-[var(--semantic-background-page)] shadow-[0px_2px_2px_rgba(51,51,51,0.16)] flex items-center justify-between px-6 py-8">
      <div className="flex items-center gap-2">
        {showBack && (
          <button type="button" onClick={() => navigate(-1)} className="flex items-center justify-center size-6">
            <img src={iconArrowLeft} alt="" className="size-6" />
          </button>
        )}
        <h1 className="text-[28px] leading-[1.4] font-semibold text-[var(--semantic-text-primary)]">
          {title}
        </h1>
      </div>
      {action}
    </div>
  );
}
