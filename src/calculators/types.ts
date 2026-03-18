import type { ItemConfig } from "@/types/itemConfig";
import type { MonthlyDataPoint } from "@/types/simulation";

export interface CalculatorContext {
  startYear: number;
  startMonth: number; // 1-12
  totalMonths: number;
}

export interface Calculator<T extends ItemConfig> {
  readonly type: T["type"];
  calculate(config: T, ctx: CalculatorContext): MonthlyDataPoint[];
}

// Type-erased calculator handle used in the registry
export type AnyCalculator = Calculator<ItemConfig>;
