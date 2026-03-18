import type { ItemConfig } from "@/types/itemConfig";
import type { SimulationResult } from "@/types/simulation";
import type { CalculatorContext } from "./types";
import { calculateItem } from "./registry";

export function runSimulation(
  items: ItemConfig[],
  ctx: CalculatorContext
): SimulationResult {
  return {
    items: items.map((item) => ({
      itemId: item.id,
      itemName: item.name,
      color: item.color,
      dataPoints: calculateItem(item, ctx),
    })),
    simulatedMonths: ctx.totalMonths,
  };
}
