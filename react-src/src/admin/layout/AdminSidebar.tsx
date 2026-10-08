import { createContext, useContext, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import iconSidemenu from "../../assets/figma/icons/nav/sidemenu.svg";
import iconArrowDown from "@images/Icon/arrow_down.svg";
import iconArrowUp from "@images/Icon/arrow_up.svg";
import { filterNavByRole, primaryNav, secondaryNav, type AdminNavItem } from "../navigation";
import { useCurrentRole } from "../../data/useCurrentRole";
import { useDemoCount } from "../../components/demo/demoStore";

/** サイドメニューを閉じている（アイコンだけのレール）か。デザインガイドのサイドナビゲーション：閉じている 72px／開いている 240px、左上のアイコンで開閉 */
const CollapsedContext = createContext(false);
const COLLAPSED_KEY = "nq_admin_sidebar_collapsed";
function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

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
  const collapsed = useContext(CollapsedContext);

  if (collapsed) {
    return (
      <NavLink
        to={item.path}
        title={item.label}
        aria-label={item.label}
        className={({ isActive }) =>
          `relative flex items-center justify-center h-12 w-14 rounded-lg ${isActive ? "bg-white" : "hover:bg-white/10"}`
        }
      >
        {({ isActive }) => (
          <>
            <NavIcon src={item.icon} active={isActive} />
            {item.badge !== undefined && badge > 0 && (
              <span className="absolute top-0.5 right-0.5">
                <CountBadge count={badge} compact />
              </span>
            )}
          </>
        )}
      </NavLink>
    );
  }

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

function NavAccordion({ item, onExpand }: { item: AdminNavItem; onExpand: () => void }) {
  const collapsed = useContext(CollapsedContext);
  const { pathname } = useLocation();
  const hasActiveChild = (item.children ?? []).some(
    (child) => pathname === child.path || pathname.startsWith(`${child.path}/`)
  );
  const [isOpen, setIsOpen] = useState(hasActiveChild);

  // 閉じているときは親のアイコンだけ。押すとサイドメニューを開いて、子の一覧も開く
  if (collapsed) {
    return (
      <button
        type="button"
        title={item.label}
        aria-label={item.label}
        onClick={() => {
          setIsOpen(true);
          onExpand();
        }}
        className={`flex items-center justify-center h-12 w-14 rounded-lg ${
          hasActiveChild ? "bg-white" : "hover:bg-white/10"
        }`}
      >
        <NavIcon src={item.icon} active={hasActiveChild} />
      </button>
    );
  }

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
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function NavEntry({ item, onExpand }: { item: AdminNavItem; onExpand: () => void }) {
  return item.children?.length ? <NavAccordion item={item} onExpand={onExpand} /> : <NavItem item={item} />;
}

export function AdminSidebar() {
  const role = useCurrentRole();
  const primaryItems = filterNavByRole(primaryNav, role);
  const secondaryItems = filterNavByRole(secondaryNav, role);

  const [collapsed, setCollapsed] = useState(readCollapsed);
  const setAndSave = (next: boolean) => {
    setCollapsed(next);
    try {
      localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
    } catch {
      /* 保存できなくても開閉はできる */
    }
  };
  const expand = () => setAndSave(false);

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
    <CollapsedContext.Provider value={collapsed}>
    <nav
      ref={navRef}
      // data-nq-part は画面説明のコーチマーク（coachMarks.ts）が「サイドメニュー」を見つけるための印
      data-nq-part="admin-sidebar"
      onScroll={handleScroll}
      className={`admin-sidebar-scroll hidden md:flex ${collapsed ? "w-[72px]" : "w-60"} shrink-0 bg-[var(--semantic-brand-primary)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] flex-col justify-between px-2 py-0 md:h-screen sticky top-0 overflow-y-auto overscroll-contain`}>
      <div className="flex flex-col items-start w-full shrink-0">
        <div className={`h-16 flex items-center w-full ${collapsed ? "justify-center" : "px-4"}`}>
          <button
            type="button"
            onClick={() => setAndSave(!collapsed)}
            aria-label={collapsed ? "サイドメニューを開く" : "サイドメニューを閉じる"}
            aria-expanded={!collapsed}
            title={collapsed ? "サイドメニューを開く" : "サイドメニューを閉じる"}
            className="flex items-center justify-center size-10 rounded-lg hover:bg-white/10"
          >
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
          </button>
        </div>
        <div className={`flex flex-col gap-2 w-full ${collapsed ? "items-center" : "items-start"}`}>
          {primaryItems.map((item) => (
            <NavEntry key={item.path} item={item} onExpand={expand} />
          ))}
        </div>
      </div>
      {secondaryItems.length > 0 && (
        <div className={`flex flex-col gap-2 w-full py-6 shrink-0 ${collapsed ? "items-center" : "items-start"}`}>
          {secondaryItems.map((item) => (
            <NavEntry key={item.path} item={item} onExpand={expand} />
          ))}
        </div>
      )}
    </nav>
    </CollapsedContext.Provider>
  );
}
