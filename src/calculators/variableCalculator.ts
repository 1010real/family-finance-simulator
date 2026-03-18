import type { VariableItemConfig } from "@/types/itemConfig";
import type { MonthlyDataPoint } from "@/types/simulation";
import type { Calculator, CalculatorContext } from "./types";
import { addMonths, compareYm, parseYearMonth, monthDiff } from "@/lib/dateUtils";

export const variableCalculator: Calculator<VariableItemConfig> = {
  type: "variable",

  calculate(config: VariableItemConfig, ctx: CalculatorContext): MonthlyDataPoint[] {
    const result: MonthlyDataPoint[] = [];
    const base = { year: ctx.startYear, month: ctx.startMonth };
    const start = parseYearMonth(config.startDate);
    const end = config.endDate ? parseYearMonth(config.endDate) : null;
    const sign = config.isExpense ? -1 : 1;

    for (let i = 0; i < ctx.totalMonths; i++) {
      const current = addMonths(base, i);

      if (compareYm(current, start) < 0) {
        result.push({ year: current.year, month: current.month, amount: 0 });
        continue;
      }
      if (end !== null && compareYm(current, end) > 0) {
        result.push({ year: current.year, month: current.month, amount: 0 });
        continue;
      }

      // Calculate elapsed years from start to determine amount at this point
      const elapsedMonths = monthDiff(start, current);
      const elapsedYears = elapsedMonths / 12;
      const currentAmount =
        config.initialAmount * Math.pow(1 + config.annualChangeRate, elapsedYears);

      result.push({
        year: current.year,
        month: current.month,
        amount: currentAmount * sign,
      });
    }

    return result;
  },
};
