import type { InvestmentItemConfig } from "@/types/itemConfig";
import type { MonthlyDataPoint } from "@/types/simulation";
import type { Calculator, CalculatorContext } from "./types";
import { addMonths, compareYm, parseYearMonth } from "@/lib/dateUtils";

export const investmentCalculator: Calculator<InvestmentItemConfig> = {
  type: "investment",

  calculate(config: InvestmentItemConfig, ctx: CalculatorContext): MonthlyDataPoint[] {
    const result: MonthlyDataPoint[] = [];
    const base = { year: ctx.startYear, month: ctx.startMonth };
    const investStart = parseYearMonth(config.startDate);
    const monthlyRate = config.annualInterestRate / 12;

    let balance = 0;

    for (let i = 0; i < ctx.totalMonths; i++) {
      const current = addMonths(base, i);

      if (compareYm(current, investStart) < 0) {
        result.push({ year: current.year, month: current.month, amount: 0 });
        continue;
      }

      const prevBalance = balance;

      if (current.year === investStart.year && current.month === investStart.month) {
        // First month: add initial amount + first contribution (no interest yet)
        balance = config.initialAmount + config.monthlyContribution;
      } else {
        // Subsequent months: apply interest then add contribution
        balance = balance * (1 + monthlyRate) + config.monthlyContribution;
      }

      // Return the monthly delta (wealth gained this month), not the cumulative balance.
      // This keeps investment data on the same scale as other monthly cash-flow items.
      result.push({
        year: current.year,
        month: current.month,
        amount: balance - prevBalance,
      });
    }

    return result;
  },
};
