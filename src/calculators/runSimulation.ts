import type { ItemConfig } from "@/types/itemConfig";
import type { SimulationResult } from "@/types/simulation";
import type { CalculatorContext } from "./types";
import { calculateItem } from "./registry";

function balanceLabelFor(item: ItemConfig): string {
  if (item.type === "loan") return "残債";
  if (item.type === "investment") return "残高";
  return "残高";
}

export function runSimulation(
  items: ItemConfig[],
  ctx: CalculatorContext
): SimulationResult {
  return {
    items: items.map((item) => ({
      itemId: item.id,
      itemName: item.name,
      color: item.color,
      isBalanceItem: item.type === "investment" || item.type === "loan",
      balanceLabel: balanceLabelFor(item),
      dataPoints: calculateItem(item, ctx),
    })),
    simulatedMonths: ctx.totalMonths,
  };
}
