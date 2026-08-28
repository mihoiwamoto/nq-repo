import { Outlet } from "react-router-dom";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout() {
  return (
    <div className="flex flex-col md:flex-row w-full h-full bg-[var(--semantic-background-page)]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <AdminHeader />
        <main className="flex-1 w-full overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
