import type { ItemConfig } from "./itemConfig";

export interface ItemSet {
  id: string;
  name: string;
  items: ItemConfig[];
  createdAt: string; // ISO datetime
  updatedAt: string;
}

export interface ItemSetSummary {
  id: string;
  name: string;
  updatedAt: string;
}

export type ViewMode = "monthly" | "yearly";
export type YearsToDisplay = 1 | 3 | 5 | 10 | 20 | 30;

export interface ViewSettings {
  viewMode: ViewMode;
  yearsToDisplay: YearsToDisplay;
  simulationStartYear: number;
}
