export interface MonthlyDataPoint {
  year: number;
  month: number; // 1-12
  amount: number;   // monthly cash flow: positive = income, negative = expense/outflow
  balance?: number; // cumulative balance (investment items only)
}

export interface ItemSimulationResult {
  itemId: string;
  itemName: string;
  color: string;
  isBalanceItem: boolean; // true for investment/loan items — also shows background area
  balanceLabel: string;   // label shown in tooltip for the background area (e.g. "残高", "残債")
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
