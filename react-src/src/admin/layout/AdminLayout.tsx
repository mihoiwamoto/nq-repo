import { Outlet } from "react-router-dom";
import { KitScreenDescription } from "../../components/demo/KitScreenDescription";
import { FRAME, isKit } from "../../frameBridge";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout() {
  return (
    <div className="flex flex-col md:flex-row w-full h-full bg-[var(--semantic-background-page)]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <AdminHeader />
        {/* 画面説明パネル（プロトタイプだけ）はヘッダーの下でメインの右に並び、メインを狭める */}
        <div className="flex-1 flex min-h-0 w-full">
          <main className="flex-1 min-w-0 w-full overflow-auto">
            <Outlet />
          </main>
          {!FRAME && isKit() && <KitScreenDescription />}
        </div>
      </div>
    </div>
  );
}
