export type LineFrequency = "daily" | "weekly" | "monthly" | "yearly";

export type InspectionPoint = {
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
  inspectionPoints: InspectionPoint[];
};

export type ScheduleEntry = {
  dateKey: string;
  lineIds: string[];
};

export type ChecklistItem = {
  id: string;
  text: string;
};
