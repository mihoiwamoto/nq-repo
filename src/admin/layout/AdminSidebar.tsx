import { NavLink } from "react-router-dom";
import iconSidemenu from "../../assets/figma/icons/nav/sidemenu.svg";
import { primaryNav, secondaryNav, type AdminNavItem } from "../navigation";

function NavItem({ item }: { item: AdminNavItem }) {
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
          <span
            aria-hidden
            className="size-6 shrink-0"
            style={{
              WebkitMaskImage: `url("${item.icon}")`,
              maskImage: `url("${item.icon}")`,
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              backgroundColor: isActive
                ? "var(--semantic-brand-primary)"
                : "#ffffff",
            }}
          />
          <span
            className={`flex-1 text-base ${
              isActive ? "text-[var(--semantic-brand-primary)]" : "text-white"
            }`}
          >
            {item.label}
          </span>
          {item.badge !== undefined && (
            <span className="h-5 min-w-[30px] px-1.5 rounded-full bg-[var(--semantic-brand-danger)] text-white text-[10px] flex items-center justify-center">
              {String(item.badge).padStart(2, "0")}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export function AdminSidebar() {
  return (
    <nav className="hidden md:flex w-60 shrink-0 bg-[var(--semantic-brand-primary)] shadow-[0px_2px_3px_rgba(51,51,51,0.24)] flex-col justify-between px-2 py-0 md:h-screen sticky top-0">
      <div className="flex flex-col items-start w-full">
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
          {primaryNav.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start w-full py-6">
        {secondaryNav.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </div>
    </nav>
  );
}
