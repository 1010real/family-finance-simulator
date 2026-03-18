import type { ItemType, ItemConfig } from "@/types/itemConfig";
import type { AnyCalculator, CalculatorContext } from "./types";
import type { MonthlyDataPoint } from "@/types/simulation";

const registry = new Map<ItemType, AnyCalculator>();

export function registerCalculator(calculator: AnyCalculator): void {
  registry.set(calculator.type, calculator);
}

export function getCalculator(type: ItemType): AnyCalculator {
  const calc = registry.get(type);
  if (!calc) throw new Error(`No calculator registered for type: ${type}`);
  return calc;
}

export function calculateItem(
  config: ItemConfig,
  ctx: CalculatorContext
): MonthlyDataPoint[] {
  return getCalculator(config.type).calculate(config, ctx);
}
