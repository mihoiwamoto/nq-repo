import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { INITIAL_COMPANIES, type Company } from "../../../data/companies";

type CompanyInput = { name: string; address: string };

type CompanyManagementContextValue = {
  companies: Company[];
  addCompany: (input: CompanyInput) => Company;
  updateCompany: (id: string, input: CompanyInput) => void;
  removeCompany: (id: string) => void;
};

const CompanyManagementContext = createContext<CompanyManagementContextValue | null>(null);

export function CompanyManagementProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);

  const value = useMemo<CompanyManagementContextValue>(
    () => ({
      companies,
      addCompany: (input) => {
        const created: Company = { id: `c${Date.now()}`, ...input };
        setCompanies((prev) => [...prev, created]);
        return created;
      },
      updateCompany: (id, input) => {
        setCompanies((prev) =>
          prev.map((company) => (company.id === id ? { ...company, ...input } : company))
        );
      },
      removeCompany: (id) => {
        setCompanies((prev) => prev.filter((company) => company.id !== id));
      },
    }),
    [companies]
  );

  return (
    <CompanyManagementContext.Provider value={value}>{children}</CompanyManagementContext.Provider>
  );
}

export function CompanyManagementProviderOutlet() {
  return (
    <CompanyManagementProvider>
      <Outlet />
    </CompanyManagementProvider>
  );
}

export function useCompanyManagement() {
  const ctx = useContext(CompanyManagementContext);
  if (!ctx) throw new Error("useCompanyManagement must be used within CompanyManagementProvider");
  return ctx;
}
