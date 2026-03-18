import type { OneTimeItemConfig } from "@/types/itemConfig";
import type { MonthlyDataPoint } from "@/types/simulation";
import type { Calculator, CalculatorContext } from "./types";
import { addMonths, parseYearMonth } from "@/lib/dateUtils";

export const oneTimeCalculator: Calculator<OneTimeItemConfig> = {
  type: "one-time",

  calculate(config: OneTimeItemConfig, ctx: CalculatorContext): MonthlyDataPoint[] {
    const result: MonthlyDataPoint[] = [];
    const base = { year: ctx.startYear, month: ctx.startMonth };
    const targetDate = parseYearMonth(config.date);
    const sign = config.isExpense ? -1 : 1;

    for (let i = 0; i < ctx.totalMonths; i++) {
      const current = addMonths(base, i);
      const isTarget =
        current.year === targetDate.year && current.month === targetDate.month;

      result.push({
        year: current.year,
        month: current.month,
        amount: isTarget ? config.amount * sign : 0,
      });
    }

    return result;
  },
};
