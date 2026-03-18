export interface MonthlyDataPoint {
  year: number;
  month: number; // 1-12
  amount: number; // positive = income/asset, negative = expense/liability
}

export interface ItemSimulationResult {
  itemId: string;
  itemName: string;
  color: string;
  dataPoints: MonthlyDataPoint[];
}

export interface SimulationResult {
  items: ItemSimulationResult[];
  simulatedMonths: number;
}

/** Aggregated chart data point (one per time label on X axis) */
export interface ChartDataPoint {
  label: string; // "2025-01" or "2025"
  [itemId: string]: number | string;
}
