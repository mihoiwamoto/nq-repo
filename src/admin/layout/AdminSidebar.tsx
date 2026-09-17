import { useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import iconSidemenu from "../../assets/figma/icons/nav/sidemenu.svg";
import iconArrowDown from "@images/Icon/arrow_down.svg";
import iconArrowUp from "@images/Icon/arrow_up.svg";
import { filterNavByRole, primaryNav, secondaryNav, type AdminNavItem } from "../navigation";
import { useCurrentRole } from "../../data/useCurrentRole";
import { useCanvasEditTotal } from "../features/guide/useCanvasEdits";
import { useDemoCount } from "../../components/demo/demoStore";

/** 赤い件数バッジ（承認申請管理の「10」と同じ見た目） */
function CountBadge({ count, compact }: { count: number; compact?: boolean }) {
  return (
    <span
      data-nq-part="badge"
      className={`h-5 px-1.5 rounded-full bg-[var(--semantic-brand-danger)] text-white text-[10px] flex items-center justify-center ${
        compact ? "min-w-5 shrink-0" : "min-w-[30px]"
      }`}
    >
      {compact ? count : String(count).padStart(2, "0")}
    </span>
  );
}

/** 画面説明キャンバスの状態から決まるバッジ。画面説明 = まだコードに反映していない編集の件数 */
function useGuideBadges(): Record<string, number> {
  const edits = useCanvasEditTotal();
  return { "/admin/guide/screens": edits };
}

function NavIcon({ src, active }: { src: string; active: boolean }) {
  return (
    <span
      aria-hidden
      className="size-6 shrink-0"
      style={{
        WebkitMaskImage: `url("${src}")`,
        maskImage: `url("${src}")`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        backgroundColor: active ? "var(--semantic-brand-primary)" : "#ffffff",
      }}
    />
  );
}

function NavItem({ item }: { item: AdminNavItem }) {
  // 動作デモ「データが無い」のときは、承認待ち・確認待ちの件数も 0 件
  const badge = useDemoCount(item.badge ?? 0);

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center gap-3 h-12 px-6 py-2 rounded-lg w-full ${
          isActive ? "bg-white" : "hover:bg-white/10"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <NavIcon src={item.icon} active={isActive} />
          <span
            className={`flex-1 text-base whitespace-nowrap ${
              isActive ? "text-[var(--semantic-brand-primary)]" : "text-white"
            }`}
          >
            {item.label}
          </span>
          {item.badge !== undefined && <CountBadge count={badge} />}
        </>
      )}
    </NavLink>
  );
}

function NavAccordion({ item }: { item: AdminNavItem }) {
  const { pathname } = useLocation();
  const dynamicBadges = useGuideBadges();
  const hasActiveChild = (item.children ?? []).some(
    (child) => pathname === child.path || pathname.startsWith(`${child.path}/`)
  );
  const [isOpen, setIsOpen] = useState(hasActiveChild);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex items-center gap-3 h-12 px-6 py-2 rounded-lg w-full hover:bg-white/10"
      >
        <NavIcon src={item.icon} active={false} />
        <span className="flex-1 text-base text-white text-left whitespace-nowrap">{item.label}</span>
        <span
          aria-hidden
          className="size-4 shrink-0"
          style={{
            WebkitMaskImage: `url("${isOpen ? iconArrowUp : iconArrowDown}")`,
            maskImage: `url("${isOpen ? iconArrowUp : iconArrowDown}")`,
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            backgroundColor: "#ffffff",
          }}
        />
      </button>
      {isOpen && (
        <div className="flex flex-col gap-2 items-start w-full mt-2">
          {(item.children ?? []).map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              className={({ isActive }) =>
                `flex items-center gap-2 h-12 pl-10 pr-4 py-2 rounded-lg w-full ${
                  isActive ? "bg-white" : "hover:bg-white/10"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <NavIcon src={child.icon} active={isActive} />
                  <span
                    className={`flex-1 min-w-0 truncate text-base ${
                      isActive ? "text-[var(--semantic-brand-primary)]" : "text-white"
                    }`}
                  >
                    {child.label}
                  </span>
                  {dynamicBadges[child.path] ? <CountBadge count={dynamicBadges[child.path]} compact /> : null}
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function NavEntry({ item }: { item: AdminNavItem }) {
  return item.children?.length ? <NavAccordion item={item} /> : <NavItem item={item} />;
}

export function AdminSidebar() {
  const role = useCurrentRole();
  const primaryItems = filterNavByRole(primaryNav, role);
  const secondaryItems = filterNavByRole(secondaryNav, role);

  // スクロール中だけスクロールバーを見せるためのフラグ（CSS 側で data-scrolling を参照）
  const navRef = useRef<HTMLElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleScroll = () => {
    const el = navRef.current;
    if (!el) return;
    el.dataset.scrolling = "true";
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      delete el.dataset.scrolling;
    }, 800);
  };

  return (
    <nav
      ref={navRef}
      // data-nq-part は画面説明のコーチマーク（coachMarks.ts）が「サイドメニュー」を見つけるための印
      data-nq-part="admin-sidebar"
      onScroll={handleScroll}
      className="admin-sidebar-scroll hidden md:flex w-64 shrink-0 bg-[var(--semantic-brand-primary)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] flex-col justify-between px-2 py-0 md:h-screen sticky top-0 overflow-y-auto overscroll-contain">
      <div className="flex flex-col items-start w-full shrink-0">
        <div className="h-16 flex items-center px-6 w-full">
          <span
            aria-hidden
            className="size-6"
            style={{
              WebkitMaskImage: `url("${iconSidemenu}")`,
              maskImage: `url("${iconSidemenu}")`,
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              backgroundColor: "#ffffff",
            }}
          />
        </div>
        <div className="flex flex-col gap-2 items-start w-full">
          {primaryItems.map((item) => (
            <NavEntry key={item.path} item={item} />
          ))}
        </div>
      </div>
      {secondaryItems.length > 0 && (
        <div className="flex flex-col gap-2 items-start w-full py-6 shrink-0">
          {secondaryItems.map((item) => (
            <NavEntry key={item.path} item={item} />
          ))}
        </div>
      )}
    </nav>
  );
}
