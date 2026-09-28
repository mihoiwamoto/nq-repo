export type FactoryRecord = {
  id: string;
  name: string;
  address: string;
  companyId: string;
  loginId: string;
  hasPassword: boolean;
  closedDays: string[];
  ledgerSlugs: string[];
};

export type FactoryRecordInput = Omit<FactoryRecord, "id" | "hasPassword"> & {
  password?: string;
};
