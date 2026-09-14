import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/figma/logo-app.png";
import iconFontSize from "../../assets/figma/icons/rail/font-size.svg";
import { railNav } from "../navigation";
import { useFromProgress } from "./ProgressFlowContext";

export function AppRail() {
  // 進捗一覧から入った記録・確認・提出完了の各画面では、
  // URL が /app/ledger-list 配下でもタブは「進捗」のままにする
  const forceProgressActive = useFromProgress();

  return (
    <nav className="w-16 shrink-0 bg-[var(--semantic-brand-primary)] flex flex-col items-center gap-4 py-4">
      <Link to="/" className="size-10 rounded-[6.4px] bg-white overflow-hidden shrink-0 block">
        <img src={logo} alt="NQlipo" className="size-full object-cover" />
      </Link>
      <div className="flex flex-col gap-5 items-center w-full">
        {railNav.slice(0, 4).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="relative flex flex-col items-center gap-1 w-full"
          >
            {({ isActive }) => {
              const shouldBeActive = forceProgressActive ? item.path === "/app/progress" : isActive;
              return (
                <>
                  <span
                    className={`size-10 rounded-lg flex items-center justify-center ${
                      shouldBeActive ? "bg-white/24" : ""
                    }`}
                  >
                    <img src={item.icon} alt="" className="size-6" />
                  </span>
                  <span className="text-xs text-white leading-none">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="absolute -top-1.5 left-[42px] size-4 rounded-full bg-[var(--semantic-brand-danger)] text-white text-[8px] flex items-center justify-center">
                      {String(item.badge).padStart(2, "0")}
                    </span>
                  )}
                </>
              );
            }}
          </NavLink>
        ))}
        <NavLink to="/app/text-size" className="flex flex-col items-center gap-1 w-full">
          {({ isActive }) => (
            <>
              <span
                className={`size-10 rounded-lg flex items-center justify-center ${
                  isActive ? "bg-white/24" : ""
                }`}
              >
                <img src={iconFontSize} alt="" className="size-6" />
              </span>
              <span className="text-xs text-white leading-none">サイズ</span>
            </>
          )}
        </NavLink>
        {railNav.slice(4).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="relative flex flex-col items-center gap-1 w-full"
          >
            {({ isActive }) => {
              const shouldBeActive = forceProgressActive ? item.path === "/app/progress" : isActive;
              return (
                <>
                  <span
                    className={`size-10 rounded-lg flex items-center justify-center ${
                      shouldBeActive ? "bg-white/24" : ""
                    }`}
                  >
                    <img src={item.icon} alt="" className="size-6" />
                  </span>
                  <span className="text-xs text-white leading-none">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="absolute -top-1.5 left-[42px] size-4 rounded-full bg-[var(--semantic-brand-danger)] text-white text-[8px] flex items-center justify-center">
                      {String(item.badge).padStart(2, "0")}
                    </span>
                  )}
                </>
              );
            }}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
