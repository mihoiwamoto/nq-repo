import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { INITIAL_STAFF } from "./mockData";
import type { Staff, StaffInput } from "./types";

type StaffManagementContextValue = {
  staff: Staff[];
  addStaff: (input: StaffInput) => Staff;
  updateStaff: (id: string, input: StaffInput) => void;
  removeStaff: (id: string) => void;
};

const StaffManagementContext = createContext<StaffManagementContextValue | null>(null);

export function StaffManagementProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF);

  const value = useMemo<StaffManagementContextValue>(
    () => ({
      staff,
      addStaff: (input) => {
        const { password, ...rest } = input;
        const created: Staff = { id: `st${Date.now()}`, hasPassword: Boolean(password), ...rest };
        setStaff((prev) => [...prev, created]);
        return created;
      },
      updateStaff: (id, input) => {
        const { password, ...rest } = input;
        setStaff((prev) =>
          prev.map((member) =>
            member.id === id
              ? { ...member, ...rest, hasPassword: member.hasPassword || Boolean(password) }
              : member
          )
        );
      },
      removeStaff: (id) => {
        setStaff((prev) => prev.filter((member) => member.id !== id));
      },
    }),
    [staff]
  );

  return (
    <StaffManagementContext.Provider value={value}>{children}</StaffManagementContext.Provider>
  );
}

export function StaffManagementProviderOutlet() {
  return (
    <StaffManagementProvider>
      <Outlet />
    </StaffManagementProvider>
  );
}

export function useStaffManagement() {
  const ctx = useContext(StaffManagementContext);
  if (!ctx) throw new Error("useStaffManagement must be used within StaffManagementProvider");
  return ctx;
}
