export type LineFrequency = "daily" | "weekly" | "monthly" | "yearly";

export type CleaningPoint = {
  id: string;
  location: string;
  items: string[];
};

export type Line = {
  id: string;
  name: string;
  frequency: LineFrequency;
  displayFrom?: string;
  displayTo?: string;
  cleaningPoints: CleaningPoint[];
};

export type ScheduleEntry = {
  dateKey: string;
  lineIds: string[];
};
