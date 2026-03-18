import type { FixedItemConfig } from "@/types/itemConfig";
import type { MonthlyDataPoint } from "@/types/simulation";
import type { Calculator, CalculatorContext } from "./types";
import { addMonths, compareYm, parseYearMonth } from "@/lib/dateUtils";

export const fixedCalculator: Calculator<FixedItemConfig> = {
  type: "fixed",

  calculate(config: FixedItemConfig, ctx: CalculatorContext): MonthlyDataPoint[] {
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

      let amount = 0;
      if (config.frequency === "monthly") {
        amount = config.amount * sign;
      } else {
        // Annual: emit only in the same month as startDate
        if (current.month === start.month) {
          amount = config.amount * sign;
        }
      }

      result.push({ year: current.year, month: current.month, amount });
    }

    return result;
  },
};
